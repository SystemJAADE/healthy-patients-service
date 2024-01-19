import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RoleGuard } from '../helpers/role.helper';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@ApiTags('accounts')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  public findAll() {
    return this.accountsService.findAll();
  }
}
