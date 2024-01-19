import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CredentialsRepository } from './credentials.repository';

@Module({
  imports: [PrismaModule],
  providers: [CredentialsService, CredentialsRepository],
  exports: [CredentialsService, CredentialsRepository],
  controllers: [CredentialsController],
})
export class CredentialsModule {}
