import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
        private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'changeme',
    });
  }

  async validate(payload: any) {
    // Attach useful fields to req.user

    let user
    if (payload.sub) {
        user = await this.userService.findById(payload.sub)
    }

    if (!user.refreshToken) {
        throw new UnauthorizedException('User has no valid session');
    }
    
    return { ...user,sub: payload.sub, username: payload.username, role: payload.role, permissions: payload.permissions };
  }
}
