import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from 'joi';
import { CredentialsModule } from './credentials/credentials.module';
import { AccountsModule } from './accounts/accounts.module';
import { OauthModule } from './oauth/oauth.module';
import { OAuthMiddleware } from './oauth/oauth.middleware';
import { RatelimitModule } from './ratelimit/ratelimit.module';
import { TriagesModule } from './triages/triages.module';
import { UbigeoModule } from './ubigeo/ubigeo.module';
import { PatientsModule } from './patients/patients.module';

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
        ASSETS_URL: Joi.string().required(),
      }),
    }),
    RatelimitModule,
    PrismaModule,
    CredentialsModule,
    AccountsModule,
    OauthModule,
    TriagesModule,
    UbigeoModule,
    PatientsModule,
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
        { path: 'ubigeo/departments', method: RequestMethod.GET },
        { path: 'ubigeo/provinces/:departmentId', method: RequestMethod.GET },
        {
          path: 'ubigeo/districts/:departmentId/:provinceId',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('*');
  }
}
