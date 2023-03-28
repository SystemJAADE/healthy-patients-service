import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountsService],
  exports: [AccountsService],
  controllers: [AccountsController],
})
export class AccountsModule {}
