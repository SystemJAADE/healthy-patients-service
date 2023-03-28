import { Injectable, Req } from '@nestjs/common';
import { checkPassword, passwordToHash } from 'src/helpers/password.helper';
import { IJwtPayload } from 'src/credentials/credential.entity';
import { DataSource, DeepPartial, EntityManager } from 'typeorm';
import { RecoveryKey } from './recovery-key/recovery-key.entity';
import { RefreshToken } from './refresh-token/refresh-token.entity';
import { Algorithm, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { Request } from 'express';
import { validateDTO } from 'src/helpers/validate.helper';
import { SignInByPasswordDto } from './dto/sign-in-by-password.dto';
import { SignInByRefreshTokenDto } from './dto/sign-in-by-refresh-token.dto';
import { Account } from 'src/accounts/account.entity';
import {
  access_token_expired_signature,
  account_blocked,
  authorization_failed,
  bad_request,
  refresh_token_expired_signature,
} from 'src/errors';
export interface IJWTToken {
  iat: number;
  exp: number;
  jti: string;
}

export interface IAccessToken extends IJWTToken {
  current_user: IJwtPayload;
  token_type: 'access';
}

export interface IRefreshToken extends IJWTToken {
  current_user: { id: string };
  token_type: 'refresh';
}

@Injectable()
export class OauthService {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  public async registration(username: string, password: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const existUser = await entityManager.getRepository(Account).findOne({
        where: {
          credential: {
            identifier: username.trim().toLowerCase(),
          },
        },
      });

      if (existUser) {
        bad_request({ raise: true, msg: 'LOGIN_ALREADY_EXISTS' });
      }

      const userObj: DeepPartial<Account> = {
        credential: {
          identifier: username,
          secret: passwordToHash(password),
        },
      };

      const insertedUser = await entityManager
        .getRepository(Account)
        .insert(userObj);

      return await this.regenerateRecoveryKeys(
        entityManager,
        insertedUser.identifiers[0].id,
      );
    });
  }

  public async token(@Req() req: Request) {
    if (Object.keys(req.query).length) {
      switch (req.query.grand_type) {
        case 'password':
          const signInByPasswordDto = {
            login: req.query.username as string,
            password: req.query.password as string,
          };

          validateDTO(SignInByPasswordDto, signInByPasswordDto);

          return await this.signInByPassword(
            signInByPasswordDto.login,
            signInByPasswordDto.password,
          );
        case 'refresh_token':
          const signInByRefreshTokenDto = {
            refresh_token: req.query.refresh_token as string,
          };

          validateDTO(SignInByRefreshTokenDto, signInByRefreshTokenDto);

          return await this.signInByRefreshToken(
            signInByRefreshTokenDto.refresh_token,
          );
      }
    }
  }

  public async signInByPassword(username: string, password: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const user = await entityManager.getRepository(Account).findOne({
        where: {
          credential: {
            identifier: username.trim().toLowerCase(),
          },
        },
      });

      if (!user || !checkPassword(user.credential.secret, password)) {
        authorization_failed({ raise: true });
      }

      if (user.is_blocked) {
        account_blocked({ raise: true });
      }

      return await this.generateJWT(entityManager, user);
    });
  }

  public async signInByRefreshToken(refresh_token: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const { current_user, token_type, jti } = this.verifyToken<IRefreshToken>(
        refresh_token,
        false,
      );

      if (!token_type || token_type !== 'refresh') {
        authorization_failed({ raise: true });
      }

      const deleted_token = await entityManager
        .getRepository(RefreshToken)
        .delete({ id: jti, account_id: current_user.id });

      if (!deleted_token.affected) {
        authorization_failed({ raise: true });
      }

      const user = await entityManager
        .getRepository(Account)
        .findOne({ where: { id: current_user.id } });

      if (!user) {
        authorization_failed({ raise: true });
      }

      if (user.is_blocked) {
        account_blocked({ raise: true });
      }

      return await this.generateJWT(entityManager, user);
    });
  }

  public async changePassword(recovery_key: string, new_password: string) {
    return await this.dataSource.transaction(async (entityManager) => {
      const recovery_key_entity = await entityManager
        .getRepository(RecoveryKey)
        .findOne({ where: { id: recovery_key } });

      if (!recovery_key_entity) {
        authorization_failed({ raise: true });
      }

      await entityManager
        .getRepository(Account)
        .update(recovery_key_entity.account_id, {
          credential: {
            secret: passwordToHash(new_password),
          },
        });

      await entityManager.getRepository(RecoveryKey).delete(recovery_key);

      return { message: 'OK' };
    });
  }

  private async generateJWT(entityManager: EntityManager, user: Account) {
    const refresh = await entityManager
      .getRepository(RefreshToken)
      .save({ account_id: user.id });

    const access_token = sign(
      { current_user: user.credential.jsonForJWT(), token_type: 'access' },
      this.configService.get('JWT_SECRET_KEY'),
      {
        jwtid: v4(),
        expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')}m`,
        algorithm: this.configService.get('JWT_ALGORITHM') as Algorithm,
      },
    );

    const refresh_token = sign(
      { current_user: { id: user.id }, token_type: 'refresh' },
      this.configService.get('JWT_SECRET_KEY'),
      {
        jwtid: refresh.id,
        expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')}m`,
        algorithm: this.configService.get('JWT_ALGORITHM') as Algorithm,
      },
    );

    return {
      access_token,
      access_token_expires_at: new Date(
        new Date().setMinutes(
          new Date().getMinutes() +
            this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        ),
      ).toISOString(),
      refresh_token,
      refresh_token_expires_at: new Date(
        new Date().setMinutes(
          new Date().getMinutes() +
            this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        ),
      ).toISOString(),
    };
  }

  public async regenerateRecoveryKeys(
    entityManager: EntityManager,
    userID: string,
  ) {
    await entityManager
      .getRepository(RecoveryKey)
      .delete({ account_id: userID });

    const keys = [];

    for (let i = 0; i < 5; i++) {
      keys.push({ user_id: userID });
    }

    return (await entityManager.getRepository(RecoveryKey).save(keys)).map(
      (recoveryKey: RecoveryKey) => recoveryKey.id,
    );
  }

  public verifyToken<T>(jwt_token: string, is_access_token = true) {
    try {
      return verify(jwt_token, this.configService.get('JWT_SECRET_KEY')) as T;
    } catch (error) {
      if (is_access_token) {
        access_token_expired_signature({ raise: true });
      } else {
        refresh_token_expired_signature({ raise: true });
      }
    }
  }
}
