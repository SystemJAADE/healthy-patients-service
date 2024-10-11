import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';

@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard())
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('/me')
  @Roles('Admin', 'Doctor', 'Patient', 'Not Fully Registered')
  public findCurrentUser(@Headers('authorization') authorization: string) {
    return this.accountsService.findCurrentUser(authorization);
  }

  @Get(':username')
  @Roles('Admin', 'Doctor')
  public findByUsername(@Param('username') username: string) {
    return this.accountsService.findByCredentialIdentifier(username);
  }

  @Put(':id')
  @Roles('Admin', 'Doctor')
  public update(@Param('id') id: string, @Body() data: AccountDto) {
    return this.accountsService.update(id, data);
  }
}
