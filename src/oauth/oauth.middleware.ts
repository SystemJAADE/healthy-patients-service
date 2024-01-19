import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { IAccessToken, IJWTPayload } from './oauth.service';
import { ConfigService } from '@nestjs/config';
import {
  account_blocked,
  access_token_expired_signature,
  unauthorized,
  authorization_failed,
} from '../errors';
@Injectable()
export class OAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  public async use(
    req: Request & { account?: IJWTPayload },
    _res: Response,
    next: NextFunction,
  ) {
    const jwt_token: string = req.headers.authorization
      ? req.headers.authorization.replace('Bearer ', '')
      : '' || (req.cookies as { JWT?: string })?.JWT;

    if (jwt_token) {
      try {
        const { current_account: current_account, token_type } = verify(
          jwt_token,
          this.configService.get('JWT_SECRET_KEY'),
        ) as IAccessToken;

        if (token_type !== 'access') {
          return next(authorization_failed({ raise: false }));
        }

        if (current_account) {
          if (current_account.is_blocked) {
            return next(account_blocked({ raise: false }));
          }

          req.account = current_account;

          return next();
        }
      } catch (error) {
        console.log(error);
        return next(access_token_expired_signature({ raise: false }));
      }
    }

    return next(unauthorized({ raise: false }));
  }
}
