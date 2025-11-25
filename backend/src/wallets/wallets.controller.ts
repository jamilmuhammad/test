import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequiredUserGuard } from 'src/guards/required-user.guard';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guard';

@ApiTags('Wallets')
@ApiBearerAuth('bearer')
@Controller('v1/wallets')
export class WalletsController {
  constructor(private svc: WalletsService) {}

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Get('balance')
  async balance(@Req() req: any) {
    return this.svc.getBalanceByUserId(req.user.sub || req.user.id || req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Post('deposit')
  async deposit(@Req() req: any, @Body() dto: DepositDto) {
    return this.svc.deposit(req.user.sub || req.user.id || req.user.userId, dto.amount);
  }

  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  @Post('transfer')
  async transfer(@Req() req: any, @Body() dto: TransferDto) {
    return this.svc.transfer(req.user.sub || req.user.id || req.user.userId, dto.toUserId, Number(dto.amount));
  }
}
