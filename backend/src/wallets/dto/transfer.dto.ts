import { IsString, IsNotEmpty, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsNotEmpty()
  @IsString()
  toUserId: string;

  @ApiProperty({ example: 50.0, description: 'Amount to transfer between wallets' })
  @IsNumber()
  @IsPositive()
  @Min(0.00000001)
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'Payment for services', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
