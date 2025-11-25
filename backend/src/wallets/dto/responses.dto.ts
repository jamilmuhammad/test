import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;
}

export class WalletResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  createdAt: Date;
}

export class RegisterResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty()
  wallet: WalletResponseDto;
}

export class BalanceResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  walletId: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  currency: string;
}

export class TransactionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fromUserId: string | null;

  @ApiProperty()
  toUserId: string | null;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  fee: string;

  @ApiProperty({ enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class TopUserStatsDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  totalVolume: string;

  @ApiProperty()
  transactionCount: number;
}