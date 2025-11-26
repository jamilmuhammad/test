import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(dto: any) {
    // usersService.create will hash password
    const user = await this.usersService.create(dto);
    // remove sensitive fields
    delete (user as any).password;
    return user;
  }

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.password) return null;
    const ok = await compare(pass, user.password);
    if (ok) {
      const { password, refreshToken, ...rest } = user as any;
      return rest;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, username: user.username, role: user.role, permissions: user.permissions };
    const accessToken = this.jwtService.sign(payload as any, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any });
    const refreshToken = this.jwtService.sign(payload as any, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any });

    const hashed = await hash(refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashed as any);

    const freshUser = await this.usersService.findById(user.id);
    let safeUser: any = null;
    if (freshUser) {
      const { password, refreshToken: rt, ...rest } = freshUser as any;
      safeUser = rest;
    }

    return { accessToken, refreshToken, user: safeUser };
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token');
    const match = await compare(refreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException('Invalid refresh token');

  const payload = { sub: user.id, username: user.username, role: user.role, permissions: user.permissions };
  const accessToken = await this.jwtService.signAsync(payload as any, { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any });
  const newRefreshToken = await this.jwtService.signAsync(payload as any, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any });

    const hashed = await hash(newRefreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashed as any);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
