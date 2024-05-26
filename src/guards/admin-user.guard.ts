import { ExecutionContext, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "../entities/user.entity";
import { UserType } from "src/enums/user-type.enum";

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

        const userUser = await User.findOne({where: {id: userIdFromPathParam}})
        // if (!userCheck) {
        //     throw new NotFoundException("User not found.");
        // }

        if (userIdFromToken !== userIdFromPathParam) {
            // throw new UnauthorizedException("You are not authorized to update another user.");
            if (userIdFromToken !== 1 && userUser.userType !== UserType.USER) {
                throw new HttpException('You are not authorized to update another user', HttpStatus.BAD_REQUEST);
            }
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
