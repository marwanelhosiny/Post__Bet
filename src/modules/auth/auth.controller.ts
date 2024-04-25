import { Body, Controller, Post, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginEmailDto, SignUpDto, verifyOtpDto } from '../../dtos/user.dto';
import { ChangePasswordDto } from '../../dtos/change-password.dto';
import { MailService } from '../mail/mail.service';
import { ChangeForgetPasswordDto, ForgetPasswordEmailDto, VerifyOtpDto } from '../../dtos/auth.dto';
import { UserGuard } from '../../guards/user.guard';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
  ) { }

  @Post('/login')
  // @Role(['Admin'])
  //@UseGuards(RolesGuard, )
  login(@Body() user: LoginDto) {
    return this.authService.login(user);
  }

  @Post('/signUp')
  signUp(@Body() user: SignUpDto) {
    return this.authService.signUp(user);
  }

  // @Post('/loginByPhone')
  // async userLogin(@Body() user: LoginEmailDto) {
  //   const loginResult = await this.authService.LoginByMobile(user);

  //   return {
  //     ...loginResult,
  //   };
  // }

  // @Post('/verifyAccount')
  // async verifyOtp(@Body() user: verifyOtpDto) {
  //   return await this.authService.verifyAccountOnSignUp(user);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Post('/loginByToken')
  // public signInUsingToken(@Req() req) {
  //   return this.authService.signInUsingToken(req.user)
  // }

  @UseGuards(UserGuard)
  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(req, body);
  }

  @Post('forget-password')
  async forget(@Body() body: ForgetPasswordEmailDto) {
    await this.authService.sendOtp(body, true)
  }

  @Post('verify-otp')
  async veriftOtp(@Body() body: VerifyOtpDto) {
    return await this.authService.veriftOtp(body)
  }

  @Post('change-forget-password')
  async changeForgetPassword(@Body() body: ChangeForgetPasswordDto) {
    return this.authService.changeForgetPassword(body)
  }
}

///////////plans module
///////////promocode module
///////////payment integration
//////////ayshare integration
//////////find way to post on snapchat
//////////contact us message and respond



/////////// signup --->> add client token
///////////forget user by email --->> remove token and add email
