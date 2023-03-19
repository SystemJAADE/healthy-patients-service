import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { UsersModule } from 'src/users/users.module';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { RecoveryKeyModule } from './recovery-key/recovery-key.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, RefreshTokenModule, RecoveryKeyModule, ConfigModule],
  providers: [OauthService],
  controllers: [OauthController],
  exports: [UsersModule, RefreshTokenModule, RecoveryKeyModule],
})
export class OauthModule {}
