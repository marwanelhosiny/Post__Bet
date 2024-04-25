import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/user/user.service';

// @Injectable()
// export class RolesGuard implements CanActivate {
//     constructor(private reflector: Reflector, private jwtService: JwtService,
//         private userservice: UserService
//     ) { }

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const roles = this.reflector.get<string[]>('roles', context.getHandler());
//         if (!roles) {
//             return true;
//         }

//         const request = context.switchToHttp().getRequest();
//         const authHeader: string = request.headers.authorization;
//         const Token = authHeader?.substring(7);
//         const user: any = this.jwtService.decode(Token);
//         // call function getUserById(user.id)
//         const userId = await this.userservice.findOneBy({ id: user.id });
//         // userType = user.role.name
//         const userRole = userId.role.name

//         return matchRoles(roles, userRole);
//     }
// }

// function matchRoles(roles: string[], userRole: string) {
//     const role = roles.find((roles) => roles === userRole);
//     if (!role) {
//         throw new UnauthorizedException('you are not authorized to view this request');
//     }

//     return true;
// }