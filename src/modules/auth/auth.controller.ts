import { Body, Controller, Post, Req, UseGuards, HttpStatus, UsePipes, ValidationPipe, Get, Render } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginEmailDto, SignUpDto, verifyOtpDto } from '../../dtos/user.dto';
import { ChangePasswordDto } from '../../dtos/change-password.dto';
import { MailService } from '../mail/mail.service';
import { ChangeForgetPasswordDto, ForgetPasswordEmailDto, VerifyOtpDto } from '../../dtos/auth.dto';
import { UserGuard } from '../../guards/user.guard';
import { Admin_UserGuard } from 'src/guards/admin-user.guard';

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

  @UsePipes(ValidationPipe)
  @Post('/signUp')
  signUp(@Body() user: SignUpDto) {
    return this.authService.signUp(user);
  }

  @Post('/verifyAccount')
  async verifyOtp(@Body() user: verifyOtpDto) {
    return await this.authService.verifyAccountOnSignUp(user);
  }

  // @UseGuards(UserGuard)
  @UseGuards(Admin_UserGuard)
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
