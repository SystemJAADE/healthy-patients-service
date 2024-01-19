import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { CredentialsModule } from '../credentials/credentials.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [CredentialsModule, ConfigModule],
  providers: [OauthService, PrismaService],
  controllers: [OauthController],
  exports: [CredentialsModule],
})
export class OauthModule {}
