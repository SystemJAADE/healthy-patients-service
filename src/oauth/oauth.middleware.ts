import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { IJwtPayload } from 'src/credentials/credential.entity';
import { verify } from 'jsonwebtoken';
import { IAccessToken } from './oauth.service';
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
    req: Request & { user?: IJwtPayload },
    _res: Response,
    next: NextFunction,
  ) {
    const jwt_token: string =
      req.headers.authorization || (req.cookies as { JWT: string }).JWT;

    if (jwt_token) {
      try {
        const { current_user, token_type } = verify(
          jwt_token,
          this.configService.get('JWT_SECRET_KEY'),
        ) as IAccessToken;

        if (token_type !== 'access') {
          return next(authorization_failed({ raise: false }));
        }

        if (current_user) {
          if (current_user.is_blocked) {
            return next(account_blocked({ raise: false }));
          }

          req.user = current_user;

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
