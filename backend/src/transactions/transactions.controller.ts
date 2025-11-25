import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from 'src/guards/jwtAuth.guard';
import { RequiredUserGuard } from 'src/guards/required-user.guard';
import { RoleTypeGuard } from 'src/common/decorators/role-type.guard';
import { Role } from 'src/common/decorators/roles.enum';
import { RoleTypes } from 'src/common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth('bearer')
@Controller('v1/transactions')
export class TransactionsController {
  constructor(private svc: TransactionsService) {}

  @Get('user/:userId/top/:n')
  @UseGuards(JwtAuthGuard, RequiredUserGuard, RoleTypeGuard)
  @RoleTypes(Role.SuperAdmin)
  async topForUser(@Param('userId') userId: string, @Param('n', ParseIntPipe) n: number) {
    return this.svc.topTransactionsForUser(userId, n);
  }

  @Get('top-users/:n')
  @UseGuards(JwtAuthGuard, RequiredUserGuard, RoleTypeGuard)
  @RoleTypes(Role.SuperAdmin)
  async topUsers(@Param('n', ParseIntPipe) n: number) {
    return this.svc.topTransactingUsers(n);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RequiredUserGuard, RoleTypeGuard)
  @RoleTypes(Role.SuperAdmin)
  async listUsers() {
    return this.svc.listUsersForSelection();
  }
}
