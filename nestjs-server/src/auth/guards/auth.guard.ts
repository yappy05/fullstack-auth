import {Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException} from '@nestjs/common';
import { Observable } from 'rxjs';
import {Reflector} from "@nestjs/core";
import {$Enums} from "@prisma/__generated__";
import UserRole = $Enums.UserRole;
import {ROLES_KEY} from "@/auth/decorators/roles.decorator";
import {Request} from "express";
import {UserService} from "@/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(private readonly  userService: UserService) {
    }
    public async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        
        const request = context.switchToHttp().getRequest();
        
        if (typeof request.session.userId === 'undefined') throw new UnauthorizedException('Пользователь не авторизован')

        const user = await this.userService.findById(request.session.userId)

        request.user = user

        return true
    }
}