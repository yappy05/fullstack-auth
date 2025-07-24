import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import { Observable } from 'rxjs';
import {Reflector} from "@nestjs/core";
import {$Enums} from "@prisma/__generated__";
import UserRole = $Enums.UserRole;
import {ROLES_KEY} from "@/auth/decorators/roles.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    public constructor(private readonly  reflector: Reflector) {
    }
    canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        const request = context.switchToHttp().getRequest();
        if (!roles) return Promise.resolve(true)
        if (!roles.includes(request.user.role)) throw new ForbiddenException('Недостаточно прав')
        return Promise.resolve(true)
    }
}