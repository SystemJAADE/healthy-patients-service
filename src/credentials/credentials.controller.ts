import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/helpers/role.helper';
import { CredentialsService } from './credentials.service';
import { Role } from '@prisma/client';

@Controller('credentials')
@ApiTags('credentials')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class CredentialsController {
  constructor(private readonly credentialService: CredentialsService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  public findAll() {
    return this.credentialService.findAll();
  }
}
