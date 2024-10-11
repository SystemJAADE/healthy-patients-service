import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { CredentialsService } from './credentials.service';

@Controller('credentials')
@UseInterceptors(ClassSerializerInterceptor)
export class CredentialsController {
  constructor(private readonly credentialService: CredentialsService) {}

  @Get()
  @Roles('Admin')
  @UseGuards(RoleGuard())
  public findAll() {
    return this.credentialService.findAll();
  }
}
