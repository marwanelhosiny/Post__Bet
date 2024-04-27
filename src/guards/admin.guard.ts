import { ExecutionContext, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Observable } from "rxjs";
import { User } from "../entities/user.entity";
import { UserType } from "../enums/user-type.enum";

@Injectable()
export class AdminGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let isValidToken = await super.canActivate(context);

        if (!isValidToken) {
            return false
        }

        const request = context.switchToHttp().getRequest<any>()
        const userFromRequest = request.user as User
        const userIdFromToken = userFromRequest.id
        const user = await User.findOne({ where: { id: userIdFromToken } })

        if (!user) {
            throw new HttpException('This User does not exist', HttpStatus.BAD_REQUEST);
        }

        if (!(user.userType === UserType.ADMIN || user.userType === UserType.SELLER)) {
            throw new HttpException('Admin only can perform this Action', HttpStatus.BAD_REQUEST);
        }
        if (user.isActive == false) {
            throw new UnauthorizedException('Admin is dactivated')
        }

        return true

    }
}