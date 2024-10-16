import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../guards/jwt.strategy';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtSecrets } from '../../shared/constants';
import { MailModule } from '../mail/mail.module';
import { PostingService } from '../posting/posting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/entities/banner.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtSecrets.secret,
      signOptions: { algorithm: 'HS256', expiresIn: jwtSecrets.expiresIn },
    }),
    // import modules
    UserModule,
    MailModule,
    TypeOrmModule.forFeature([Banner])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PostingService],
  exports: [AuthService, JwtStrategy]
})
export class AuthModule { }
