import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './accounts.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule],
  providers: [AccountsService, AccountsRepository],
  exports: [AccountsService, AccountsRepository],
  controllers: [AccountsController],
})
export class AccountsModule {}
