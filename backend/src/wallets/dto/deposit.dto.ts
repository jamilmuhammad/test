import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {

  @ApiProperty({ example: 'Deposit for project X', description: 'Description of the deposit' })
  @IsOptional()
  @IsString()
  description!: string;

  @ApiProperty({ example: 100.50, description: 'Amount to deposit into the wallet' })
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'unique-key-123', description: 'Idempotency key to prevent duplicate deposits' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
