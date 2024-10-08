import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';

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

  @Put(':id')
  public update(@Param('id') id: string, @Body() data: AccountDto) {
    return this.accountsService.update(id, data);
  }
}
