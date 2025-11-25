import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RequiredUserGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req?.user;

        // Helpful debug log when running in development
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('RequiredUserGuard - user:', user);
        }

        if (!user) {
            throw new UnauthorizedException('Missing authentication');
        }

        const id = user.id ?? user.sub ?? user.userId;
        if (!id) {
            throw new UnauthorizedException('Invalid user session');
        }

        // allow access
        return true;
    }
}