import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/helpers/role.helper';
import { CredentialsService } from './credentials.service';
import { Role } from '@prisma/client';

@Controller('credentials')
@ApiTags('credentials')
@UseInterceptors(ClassSerializerInterceptor)
export class CredentialsController {
  constructor(private readonly credentialService: CredentialsService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  public findAll() {
    return this.credentialService.findAll();
  }
}
