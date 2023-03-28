import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, RoleGuard } from 'src/helpers/role.helper';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@ApiTags('accounts')
@UseInterceptors(ClassSerializerInterceptor)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  public findAll() {
    return this.accountsService.findAll();
  }
}
