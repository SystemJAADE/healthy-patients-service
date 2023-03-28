import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import * as Joi from 'joi';
import { CredentialsModule } from './credentials/credentials.module';
import { AccountsModule } from './accounts/accounts.module';
import { OauthModule } from './oauth/oauth.module';
import { OAuthMiddleware } from './oauth/oauth.middleware';
import { RatelimitModule } from './ratelimit/ratelimit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_HOST: Joi.string(),
        APP_PORT: Joi.number(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        RATELIMIT_TTL: Joi.number().required(),
        RATELIMIT_LIMIT: Joi.number().required(),
      }),
    }),
    RatelimitModule,
    DatabaseModule,
    CredentialsModule,
    AccountsModule,
    OauthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void | MiddlewareConsumer {
    consumer
      .apply(OAuthMiddleware)
      .exclude(
        { path: 'oauth/token', method: RequestMethod.ALL },
        { path: 'oauth/registration', method: RequestMethod.ALL },
        { path: 'oauth/change_password', method: RequestMethod.ALL },
        { path: 'swagger', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
