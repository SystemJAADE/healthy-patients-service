import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@ApiTags('accounts')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Roles('Admin', 'Doctor')
@UseGuards(RoleGuard())
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  public findAll() {
    return this.accountsService.findAll();
  }

  @Get(':username')
  public findByUsername(@Param('username') username: string) {
    return this.accountsService.findByCredentialIdentifier(username);
  }
}
