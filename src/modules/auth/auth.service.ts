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
import { ChangeForgetPasswordDto, VerifyOtpDto, ResendOtpDto } from '../../dtos/auth.dto';
import { SUtils } from '../../shared/utils';
import { PostingService } from '../posting/posting.service';
import { UserProgramSubscription } from 'src/entities/subscription.entity';


@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        public userService: UserService,
        private emailService: MailService,
        public postingService: PostingService
    ) { }

    sign(user: User): any {
        return {
            ...user,
            token: this.jwtService.sign({
                id: user.id,
                email: user.email,
                userType: user.userType,
            }),
        };
    }

    async verifyAccountOnSignUp(body: verifyOtpDto) {
        const user = await User.findOneBy({ email: body.email });


        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }

        if (user.otp !== body.otp) {
            throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
        }
        const now = new Date();
        const timeDifference = Math.abs(now.getTime() - user.otpRequestDate.getTime()) / (1000 * 60);



        // if (timeDifference > 5) {   //////// minutes
        //     await User.update({ email: body.email }, { verifiedOtp: false, otp: null, otpRequestDate: null })
        //     throw new HttpException('OTP expired', HttpStatus.BAD_REQUEST);
        // }

        let profileData

        const profileKey = (await User.findOne({ where: { email: body.email } })).profileKey
        if (!profileKey) {
            profileData = await this.postingService.createUserProfile(user)
        }

        // Mark user as verified and save the record
        // user.verified = true;
        user.haveAccount = true;
        user.isActive = true;
        user.firstTime = false;
        user.otp = null
        user.verifiedOtp = true
        user.otpRequestDate = null
        user.refId = profileData.refId
        user.profileKey = profileData.profileKey
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
            .addSelect('user.facebookUrl')
            .addSelect('user.twitterUrl')
            .addSelect('user.instagramUrl')
            .addSelect('user.youtubeUrl')
            .addSelect('user.tiktokUrl')
            .addSelect('user.snapchatUrl')
            .leftJoin('user.userProgramSubscriptions', 'Subscriptions')
            .addSelect('Subscriptions.id')
            .addSelect('Subscriptions.paymentStatus')
            .addSelect('Subscriptions.startDayPlanSubscription')
            .addSelect('Subscriptions.planUsedCounter')
            .orderBy('Subscriptions.id', 'ASC')
            .leftJoin('Subscriptions.plan', 'plan')
            .addSelect('plan.id')
            .addSelect('plan.name')
            .addSelect('plan.Facebook')
            .addSelect('plan.Instagram')
            .addSelect('plan.LinkedIn')
            .addSelect('plan.Twitter')
            .addSelect('plan.Telegram')
            .addSelect('plan.TikTok')
            .addSelect('plan.Pinterest')
            .addSelect('plan.Reddit')
            .addSelect('plan.YouTube')
            .addSelect('plan.GoogleBusiness')
            .where('user.email = :email', { email })
            .getOne();


        if (!user) {
            throw new HttpException('Check your credentials', HttpStatus.BAD_REQUEST)
        }

        if (user.suspended === true) {
            // CUstom Status Code for mobile
            throw new HttpException('User is suspended', 440)
        }

        if (user.isActive == false) {
            throw new HttpException("The User is not active", HttpStatus.BAD_REQUEST)
        }

        if (user.password !== body.password) {
            throw new HttpException('Check your credentials', HttpStatus.BAD_REQUEST)
        }

        if (user.firstTime == true) {
            throw new HttpException('Verify Your Email First', HttpStatus.BAD_REQUEST)
        }

        // const subscriptions = await UserProgramSubscription.find({
        //     where: { user: user },
        //   });


        user.lastLoginTime = new Date();
        // Update user
        await this.userService.repository
            .createQueryBuilder()
            .update()
            .set({ lastLoginTime: user.lastLoginTime })
            .where('id = :id', { id: user.id })
            .execute();

        delete user.password

        return this.sign(user,
            // subscriptions
        );
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
        let otp = SUtils.generateOtp(4)

        otp = speakeasy.totp({
            secret: process.env.optSecret,
            encoding: "base32",
            digits: 4,
            step: 60,
            window: 10
        });

        user.otp = otp
        user.otpRequestDate = new Date()

        let newUser = await User.save(user)

        // let newUser = await this.userService.create(user)

        await this.emailService.sendMail(newUser)

        setTimeout(async () => {
            const userToDelete = await User.findOne({ where: { email: body.email, firstTime: true } });
            if (userToDelete) {
                await User.remove(userToDelete);
                console.log(`Deleted user ${userToDelete.email} due to incomplete signup`);
            }
        }, 6 * 60 * 1000); // 10 minutes

        return ('Check your mail')
    }

    async checkEmailExists(email: string) {
        return { "exist": await this.userService.count({ email: email }) > 0 }
    }


    async changePassword(req, body: ChangePasswordDto) {
        let userDb = await User.findOne(
            {
                where: { id: req.user.id },
                select: { id: true, password: true }
            }
        );

        if (userDb.password === body.newPassword) {
            throw new HttpException("This password is used before", HttpStatus.BAD_REQUEST);
        }

        if (userDb.password === body.oldPassword) {
            let userStored = await this.userService.update(userDb.id, { password: body.newPassword });
            delete userStored.password;
            // return this.sign(userStored);
            return "Password Updated Successfully";
        }
        throw new HttpException("Old Password is not correct", HttpStatus.BAD_REQUEST);
    }


    async veriftOtp(body: VerifyOtpDto) {
        let user = await User.findOne({ where: { otp: body.otp } })

        if (!user) {
            throw new HttpException("Incorrect OTP", 400)
        }

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
        const userCheck = await User.findOne({ where: { email: body.email } })
        if (!userCheck) {
            throw new NotFoundException('No User found by this email address')
        }
        var otp = speakeasy.totp({
            secret: process.env.optSecret,
            encoding: "base32",
            digits: 4,
            step: Math.floor(Math.random() * 100),
            window: Math.floor(Math.random() * 15)
        });
        const now = new Date();
        await User.update({ email: body.email }, { otp: otp, otpRequestDate: now, verifiedOtp: false, })

        // let user = await User.findOneBy({ email: body.email })
        if (forget) {
            await this.emailService.forgetPasswordMail(
                body.email,
                otp
            )
        } else {
            await this.emailService.sendMail(
                userCheck
            )
        }
    }

    async resendOtp(body: ResendOtpDto) {
        // Step 1: Check if the user exists
        let user = await User
            .createQueryBuilder('user')
            .where('user.email = :email', { email: body.email })
            .getOne();

        if (!user) {
            throw new HttpException('User with this email does not exist', HttpStatus.BAD_REQUEST);
        }



        // Step 3: Generate a new OTP
        let otp = SUtils.generateOtp(4); // Optionally you can continue using speakeasy
        otp = speakeasy.totp({
            secret: process.env.optSecret,
            encoding: "base32",
            digits: 4,
            step: 60,
            window: 10
        });

        // Step 4: Update the user with the new OTP and request date
        user.otp = otp;
        user.otpRequestDate = new Date();

        await User.save(user);

        // Step 5: Send the new OTP to the user's email
        await this.emailService.sendMail(user);

        return { message: 'A new OTP has been sent to your email' };
    }

}
