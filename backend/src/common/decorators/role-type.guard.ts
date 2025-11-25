import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "./roles.enum";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RoleTypeGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredUserTypes = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

        if (!requiredUserTypes) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        console.debug('RoleTypeGuard - user role:', user?.role);
        return requiredUserTypes.some((role) => {
            if (role === Role.SuperAdmin)
                return user?.role === Role.SuperAdmin;
            else return false;
        });
    }
}