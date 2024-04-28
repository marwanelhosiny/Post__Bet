import { ExecutionContext, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Observable } from "rxjs";
import { User } from "../entities/user.entity";
import { UserType } from "src/enums/user-type.enum";

@Injectable()
export class UserGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let isValidToken = await super.canActivate(context);

        if (!isValidToken) {
            throw new UnauthorizedException('Unauthorized');
        }

        const request = context.switchToHttp().getRequest<any>();
        const user = request.user as User;
        const userIdFromToken = user.id;

        const userCheck = await User.findOne({ where: { id: userIdFromToken } });

        if (!userCheck) {
            throw new HttpException('This User does not exist', HttpStatus.BAD_REQUEST);
        }

        if(!(userCheck.userType == UserType.USER)) {
            throw new HttpException('Admin not authorized to do this action', HttpStatus.BAD_REQUEST);
        }

        if (userCheck.suspended) {
            throw new HttpException('User is suspended', HttpStatus.FORBIDDEN);
        }

        return true;
    }
}
