import { Module } from '@nestjs/common';
import { Credential } from './credential.entity';
import { CredentialsService } from './credentials.service';
import { CredentialsController } from './credentials.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [CredentialsService],
  exports: [CredentialsService],
  controllers: [CredentialsController],
})
export class CredentialsModule {}
