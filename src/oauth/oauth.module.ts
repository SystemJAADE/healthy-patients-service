import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { CredentialsModule } from 'src/credentials/credentials.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { RecoveryKeyModule } from './recovery-key/recovery-key.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CredentialsModule,
    RefreshTokenModule,
    RecoveryKeyModule,
    ConfigModule,
  ],
  providers: [OauthService],
  controllers: [OauthController],
  exports: [CredentialsModule, RefreshTokenModule, RecoveryKeyModule],
})
export class OauthModule {}
