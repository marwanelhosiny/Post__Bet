import { ExecutionContext, Injectable } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Observable } from "rxjs";
import { User } from "src/entities/user.entity";

/// This Guard is to make sure that the same user who wants to make request
@Injectable()
export class UserMatchingGuard extends JwtAuthGuard{
    async canActivate(context: ExecutionContext): Promise<boolean> {
        let isValidToken = await super.canActivate(context);

        if(!isValidToken){
            return false
        }

        const request = context.switchToHttp().getRequest<any>()
        const user = request.user as User
        const userIdFromToken = user.id
        const resourceUserId = +request.params.id
        
        return userIdFromToken === resourceUserId

    }
}