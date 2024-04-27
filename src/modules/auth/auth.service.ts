import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, JwtUser, LoginDto, LoginEmailDto, SignUpDto, verifyOtpDto } from '../../dtos/user.dto';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
// import { OTPGenerator } from 'otp-generator';
import { ChangePasswordDto } from '../../dtos/change-password.dto';
import axios from 'axios';
import { UserType } from '../../enums/user-type.enum';
import * as speakeasy from 'speakeasy';
import { MailService } from '../mail/mail.service';
import { ChangeForgetPasswordDto, VerifyOtpDto } from '../../dtos/auth.dto';


@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        public userService: UserService,
        private emailService: MailService
    ) { }

    sign(user: User) {
        return {
            ...user,
            token: this.jwtService.sign(
                {
                    id: user.id,
                    email: user.email,
                    userType: user.userType
                },
            ),
        };
    }


    async LoginByMobile(user: LoginEmailDto) {
        const userDb = await this.userService.sendOtp(user);
        if (userDb.suspended == true) {
            throw new UnauthorizedException('This User is Suspended')
        }

        if (userDb.userType != UserType.ADMIN) {
            throw new UnauthorizedException('User only with user type user can login')
        }

        // if (userDb.haveAccount) {
        //     const smsApiUrl = 'https://smsmisr.com/api/SMS/';
        //     const smsApiParams = {
        //         environment: 1,
        //         username: '83ef9cf2675d7bca72ffd9666bfd7192522ec09239405181daa906699f4c54a5',
        //         password: 'bea430dbb8b1aeffa362ecc2e6a85f77250d150d31a0f4016b46abed4d5e7fef',
        //         language: 1,
        //         sender: '43b36aed1e7d3fc32e7dd22ccf9fe943617c52fc7941853eb272577b66d797d8',
        //         mobile: userDb.mobile,
        //         message: `Welcome To um-in, your OTP is: ${userDb.otp}, please use it to login to your account`,
        //     }

        //     const response = await axios.post(smsApiUrl, null, {
        //         params: smsApiParams
        //     });
        // }

        return {
            otp: '0', //////// To Be removed
            haveAccount: userDb.haveAccount
        }
    }


    async verifyAccountOnSignUp(body: verifyOtpDto) {
        const user = await this.userService.findOneBy({ email: body.email });

        if (!user || user.otp !== body.otp) {
            throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
        }
        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - user.otpRequestDate.getTime()) / (1000 * 60);



        if (timeDifference > 1) {   //////// minutes
            await User.update({ email: body.email }, { verifiedOtp: false, otp: null, otpRequestDate: null })
            throw new UnauthorizedException('OTP expired');
        }

        // Mark user as verified and save the record
        // user.verified = true;
        user.haveAccount = true;
        user.isActive = true;
        user.firstTime = false;
        user.otp = null
        user.verifiedOtp = true
        user.otpRequestDate = null
        // user.lastLoginTime = new Date();
        await this.userService.update(user.id, user)
        const signedUser = this.sign(user);
        return signedUser;
    }

    async login(body: LoginDto) {
        let email = body.email

        let user = await this.userService.repository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (!user) {
            throw new HttpException('Check your credentials', HttpStatus.BAD_REQUEST)
        }
        if (user.suspended === true) {
            // CUstom Status Code for mobile
            throw new HttpException('User is suspended', 440)
        }

        // if (user.userType !== body.userType) {
        //     throw new ForbiddenException("Forbidden resource")
        // }

        if (user.password !== body.password) {
            throw new HttpException('Check your credentials', HttpStatus.BAD_REQUEST)
        }

        user.lastLoginTime = new Date();
        // Update user
        await this.userService.repository
            .createQueryBuilder()
            .update()
            .set({ lastLoginTime: user.lastLoginTime })
            .where('id = :id', { id: user.id })
            .execute();

        delete user.password

        return this.sign(user);
    }

    async signUp(body: SignUpDto) {

        let isUserExist = await User
            .createQueryBuilder('user')
            .where('user.email = :email', {
                email: body.email,
            })
            .getOne();

        if (isUserExist) {
            throw new HttpException('User of this Email is Already exist', HttpStatus.BAD_REQUEST)
        }

        let user = Object.assign(new User(), body)
        user.userType = UserType.USER
        user.isActive = false
        user.haveAccount = true
        user.firstTime = true

        // Generate OTP
        // let otp = SUtils.generateOtp(4)

        // var otp = speakeasy.totp({
        //     secret: process.env.optSecret,
        //     encoding: "base32",
        //     digits: 6,
        //     step: 60,
        //     window: 10
        // });

        // user.otp = otp
        // user.otpRequestDate = new Date()

        let newUser = await this.userService.create(user)

        // await this.sendOtp(newUser.email)
        // // Send mail 
        // await this.emailService.sendMail(newUser, "")

        return this.sign(newUser);
    }


    async checkEmailExists(email: string) {
        return { "exist": await this.userService.count({ email: email }) > 0 }
    }

    // async AdminLogin(body: LoginDto) {
    //     let userStored: User;

    //     try {
    //         userStored = await this.userService.findUser(body);
    //         if (userStored.isActive == false) {
    //             throw new UnauthorizedException('This Admin is not Active')
    //         }
    //         if (userStored.userType == UserType.User || userStored.userType == UserType.Organizer) {
    //             throw new UnauthorizedException('Cannot login with user type user or organizer')
    //         }

    //     } catch (error) {
    //         throw new UnauthorizedException(error.message, error.code);
    //     }
    //     return this.sign(userStored);
    // }

    async signInUsingToken(reqUser: JwtUser) {

        // if (reqUser.macAddress) {
        //     return {
        //         ...reqUser,
        //         token: this.requestToken(reqUser.macAddress)
        //     }
        // }
        let user = reqUser.user;

        this.userService.update(user.id, {
            online: true,
        })

        if (!user) { throw new UnauthorizedException('invalid token'); }

        return this.sign(user)
    }

    async changePassword(req, body: ChangePasswordDto) {
        console.log(req.user.id);
        let userDb = await User.findOne(
            {
                where: { id: req.user.id },
                select: { id: true, password: true }
            }
        );

        if (userDb.password === body.newPassword) {
            throw new HttpException("This password is used before", 500);
        }

        if (userDb.password === body.oldPassword) {
            let userStored = await this.userService.update(userDb.id, { password: body.newPassword });
            delete userStored.password;
            return this.sign(userStored);
        }
        throw new HttpException("Incorrect password", 500);
    } 
    

    async veriftOtp(body: VerifyOtpDto) {
        let user = await User.findOne({ where: { otp: body.otp } })

        // if (user.otp != body.otp) {
        //     throw new UnauthorizedException('Invalid otp')
        // }

        //TODO: CheckOTP with speakeasy package

        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - user.otpRequestDate.getTime()) / (1000 * 60);

        if (timeDifference > 60) {   //////// minutes
            await User.update({ otp: body.otp }, { verifiedOtp: false, otp: null, otpRequestDate: null })
            throw new UnauthorizedException('OTP expired');
        }

        await User.update({ otp: body.otp }, { verifiedOtp: true, otp: null, otpRequestDate: null })

        return true

    }

    async changeForgetPassword(body: ChangeForgetPasswordDto) {
        let email = body.email
        let user = await this.userService.repository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (user.verifiedOtp == false) {
            throw new UnauthorizedException('Otp not verified')
        }

        if (user.password === body.newPassword) {
            throw new HttpException("This password is used before", 400)
        }

        await User.update({ email: body.email }, { password: body.newPassword, verifiedOtp: false, otp: null, otpRequestDate: null })
        delete user.password
        return user
    }

    async sendOtp(body, forget: boolean = false) {
        // const userCheck = await User.findOne({ where: { email: email } })
        // if (!userCheck) {
        //     throw new NotFoundException('No User found by this email address')
        // }
        var otp = speakeasy.totp({
            secret: process.env.optSecret,
            encoding: "base32",
            digits: 4,
            step: Math.floor(Math.random() * 100),
            window: Math.floor(Math.random() * 15)
        });
        const now = new Date();
        await User.update({ email: body.email }, { otp: otp, otpRequestDate: now, verifiedOtp: false, })

        let user = await User.findOneBy({ email: body.email })
        if (forget) {
            await this.emailService.forgetPasswordMail(
                body.email,
                otp
            )
        } else {
            await this.emailService.sendMail(
                user
            )
        }
    }
}
