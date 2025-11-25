import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guard';
import { RequiredUserGuard } from 'src/guards/required-user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Post('register')
  // async register(@Body() dto: CreateUserDto) {
  //   return this.usersService.create(dto);
  // }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RequiredUserGuard)
  async get(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
