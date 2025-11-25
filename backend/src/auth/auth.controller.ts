import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guard';
import { RequiredUserGuard } from 'src/guards/required-user.guard';

@ApiTags('Auth')
@ApiBearerAuth('bearer')
@Controller('v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) return { status: 401, message: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Post('refresh')
  async refresh(@Req() req: any, @Body() dto: RefreshDto) {
    return this.authService.refreshTokens(req.user.sub || req.user.id || req.user.userId, dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.sub || req.user.id || req.user.userId);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
