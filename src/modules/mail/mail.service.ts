import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../../entities/user.entity';

@Injectable()
export class MailService {

  constructor(private readonly mailerService: MailerService) { }

  // private async setTransport() {
  //   const OAuth2 = google.auth.OAuth2;
  //   const oauth2Client = new OAuth2(
  //     process.env.CLIENT_ID,
  //     process.env.CLIENT_SECRET,
  //     'https://developers.google.com/oauthplayground',
  //   );

  //   oauth2Client.setCredentials({
  //     refresh_token: process.env.REFRESH_TOKEN,
  //   });

  //   const accessToken: string = await new Promise((resolve, reject) => {
  //     oauth2Client.getAccessToken((err, token) => {
  //       if (err) {
  //         reject('Failed to create access token');
  //       }
  //       resolve(token);
  //     });
  //   });

  //   const config: Options = {
  //     service: 'gmail',
  //     auth: {
  //       type: 'OAuth2',
  //       user: process.env.EMAIL,
  //       clientId: process.env.CLIENT_ID,
  //       clientSecret: process.env.CLIENT_SECRET,
  //       accessToken,
  //     },

  //   };
  //   this.mailerService.addTransporter('hello', config);
  // }

  async sendMail(user: User) {
    try {
      // await this.setTransport()
      await this.mailerService.sendMail({
        to: user.email,
        from: '"Support Team" <Support@Postbet.com>', // override default from
        subject: 'Welcome to Postbet App! Confirm your Email',
        template: './welcome.ejs',
        context: { // filling <%= %> brackets with content
          name: user.email,
          otp: user.otp,
        },
      });
    } catch (e) {
      console.log(e);

    }
  }

  async forgetPasswordMail(email, otp) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Support Team" <Support@Postbet.com>',
        subject: 'Account OTP',
        template: './reset-password.ejs',
        context: {
          email: email,
          otp: otp,
        },
      })
    } catch (e) {
      console.log(e);

    }

  }
}
