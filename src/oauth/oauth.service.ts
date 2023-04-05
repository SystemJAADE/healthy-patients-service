import { Injectable, Req } from '@nestjs/common';
import { checkPassword, passwordToHash } from 'src/helpers/password.helper';
import { Algorithm, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { Request } from 'express';
import { validateDTO } from 'src/helpers/validate.helper';
import { SignInByPasswordDto } from './dto/sign-in-by-password.dto';
import { SignInByRefreshTokenDto } from './dto/sign-in-by-refresh-token.dto';
import {
  access_token_expired_signature,
  account_blocked,
  authorization_failed,
  bad_request,
  refresh_token_expired_signature,
} from 'src/errors';
import { Account, Credential, RecoveryKey, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export interface IJWTToken {
  iat: number;
  exp: number;
  jti: string;
}

export interface IJWTPayload {
  id: string;
  identifier: string;
  role: Role;
  is_blocked: boolean;
}

export interface IAccessToken extends IJWTToken {
  current_account: IJWTPayload;
  token_type: 'access';
}

export interface IRefreshToken extends IJWTToken {
  current_account: { id: string };
  token_type: 'refresh';
}

@Injectable()
export class OauthService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  public async registration(username: string, password: string) {
    return await this.prisma.$transaction(async (tx) => {
      const existingAccount = await tx.account.findMany({
        where: {
          credential: {
            identifier: username.trim().toLowerCase(),
          },
        },
      });

      if (existingAccount[0]) {
        bad_request({ raise: true, msg: 'LOGIN_ALREADY_EXISTS' });
      }

      const insertedAccount = await tx.account.create({
        data: {
          isBlocked: false,
          credential: {
            create: {
              identifier: username,
              secret: passwordToHash(password),
            },
          },
        },
      });

      return await this.regenerateRecoveryKeys(tx, insertedAccount.id);
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
    return await this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findMany({
        where: {
          credential: {
            identifier: username.trim().toLowerCase(),
          },
        },
        include: {
          credential: true,
        },
      });

      if (
        !account[0] ||
        !checkPassword(account[0].credential.secret, password)
      ) {
        authorization_failed({ raise: true });
      }

      if (account[0].isBlocked) {
        account_blocked({ raise: true });
      }

      return await this.generateJWT(account[0]);
    });
  }

  public async signInByRefreshToken(refresh_token: string) {
    return await this.prisma.$transaction(async (tx) => {
      const {
        current_account: current_account,
        token_type,
        jti,
      } = this.verifyToken<IRefreshToken>(refresh_token, false);

      if (!token_type || token_type !== 'refresh') {
        authorization_failed({ raise: true });
      }

      const deleted_token = await tx.refreshToken.deleteMany({
        where: {
          id: jti,
          accountId: current_account.id,
        },
      });

      if (deleted_token.count === 0) {
        authorization_failed({ raise: true });
      }

      const account = await tx.account.findUnique({
        where: {
          id: current_account.id,
        },
        include: {
          credential: true,
        },
      });

      if (!account) {
        authorization_failed({ raise: true });
      }

      if (account.isBlocked) {
        account_blocked({ raise: true });
      }

      return await this.generateJWT(account);
    });
  }

  public async changePassword(recovery_key: string, new_password: string) {
    return await this.prisma.$transaction(async (tx) => {
      const recovery_key_entity = await tx.recoveryKey.findUnique({
        where: {
          id: recovery_key,
        },
      });

      if (!recovery_key_entity) {
        authorization_failed({ raise: true });
      }

      await tx.account.update({
        where: {
          id: recovery_key_entity.accountId,
        },
        data: {
          credential: {
            update: {
              secret: passwordToHash(new_password),
            },
          },
        },
      });

      await tx.recoveryKey.delete({
        where: {
          id: recovery_key,
        },
      });

      return { message: 'OK' };
    });
  }

  private async generateJWT(
    account: Account & {
      credential: Credential;
    },
  ) {
    const refresh = await this.prisma.refreshToken.create({
      data: {
        accountId: account.id,
      },
      include: {
        account: true,
      },
    });

    const access_token = sign(
      { current_account: this.jsonForJWT(account), token_type: 'access' },
      this.configService.get('JWT_SECRET_KEY'),
      {
        jwtid: v4(),
        expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')}m`,
        algorithm: this.configService.get('JWT_ALGORITHM') as Algorithm,
      },
    );

    const refresh_token = sign(
      { current_account: { id: account.id }, token_type: 'refresh' },
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
    prisma: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
    accountID: string,
  ) {
    await prisma.recoveryKey.deleteMany({
      where: {
        accountId: accountID,
      },
    });

    const output = [];

    for (let i = 0; i < 5; i++) {
      const insertedValues = await prisma.recoveryKey.create({
        data: {
          accountId: accountID,
        },
      });
      output.push(insertedValues);
    }

    return output.map((recoveryKey: RecoveryKey) => recoveryKey.id);
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

  public jsonForJWT(
    account: Account & {
      credential: Credential;
    },
  ): IJWTPayload {
    return {
      id: account.id,
      identifier: account.credential.identifier,
      role: account.role,
      is_blocked: account.isBlocked,
    };
  }
}
