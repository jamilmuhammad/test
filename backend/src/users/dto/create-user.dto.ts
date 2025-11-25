import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Unique username for the user' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'strong-password', description: 'Password for the user' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
