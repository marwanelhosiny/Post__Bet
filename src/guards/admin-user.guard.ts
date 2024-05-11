import { ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "../entities/user.entity";

@Injectable()
export class Admin_UserGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let isValidToken = await super.canActivate(context);

        if (!isValidToken) {
            return false;
        }

        const request = context.switchToHttp().getRequest<any>();
        const user = request.user as User;
        const userIdFromToken = user.id;

        // Check if path parameter exists
        const params = context.switchToHttp().getRequest().params;
        if (!params || !params.id) {
            // No path parameter, skip the user ID check
            return true;
        }

        const userIdFromPathParam = +params.id;

        const userCheck = await User.findOne({ where: { id: userIdFromToken } });
        if (!userCheck) {
            throw new NotFoundException("User not found.");
        }

        if (userIdFromToken !== userIdFromPathParam) {
            throw new UnauthorizedException("You are not authorized to update another user.");
        }

        if (userCheck.firstTime === false && userCheck.isActive === false) {
            // throw new HttpException("User is not active", 440);
            throw new HttpException('This User is not Active', HttpStatus.BAD_REQUEST);

        }

        if (userCheck.isActive === true && userCheck.suspended === true) {
            throw new HttpException('User is suspended', 440);
        }

        return true;
    }
}
