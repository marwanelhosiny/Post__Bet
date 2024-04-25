// auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../modules/auth/auth.service';
import { JwtUser } from 'src/dtos/user.dto';
import { UserService } from 'src/modules/user/user.service';
import { jwtSecrets } from 'src/shared/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: jwtSecrets.secret,
            algorithm: "HS256", 
        });
    }

    // async validate(payload: any) {
    //     return { name: payload.name, email: payload.email, mobile: payload.mobile, username: payload.username };
    // }

    async validate(payload: JwtUser) {
        if (payload.id) {
            try {
                let user = await this.userService.findOneBy({ id: payload.id })
                payload.user = user;
            } catch (error) {

            }
            return payload;
        }
    }
}
