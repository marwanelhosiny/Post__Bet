import { ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Observable } from "rxjs";
import { User } from "../entities/user.entity";

@Injectable()
export class UserGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let isValidToken = await super.canActivate(context);

        if (!isValidToken) {
            return false
        }

        const request = context.switchToHttp().getRequest<any>()
        const user = request.user as User
        const userIdFromToken = user.id
        const userCeheck = await User.findOne({ where: { id: userIdFromToken } })
        if (userCeheck.suspended == true) {
            throw new HttpException('User is suspended', 440)
        }

        return true

    }
}