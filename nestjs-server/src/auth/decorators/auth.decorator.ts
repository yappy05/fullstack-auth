import {$Enums} from "@prisma/__generated__";
import UserRole = $Enums.UserRole;
import {applyDecorators, UseGuards} from "@nestjs/common";
import {ROLES} from "@/auth/decorators/roles.decorator";
import {AuthGuard} from "@/auth/guards/auth.guard";
import {RoleGuard} from "@/auth/guards/roles.guard";

export function Authorization(...roles: UserRole[]) {
    if (roles.length > 0) {
        return applyDecorators(
            ROLES(...roles), UseGuards(AuthGuard, RoleGuard)
        )
    }
    return applyDecorators(UseGuards(AuthGuard))
}