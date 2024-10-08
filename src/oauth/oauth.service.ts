import { Injectable } from '@nestjs/common';
import { checkPassword, passwordToHash } from '../helpers/password.helper';
import { Algorithm, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { v4 } from 'uuid';
import { validateDTO } from '../helpers/validate.helper';
import {
  access_token_expired_signature,
  account_blocked,
  authorization_failed,
  bad_request,
  refresh_token_expired_signature,
} from '../errors';
import {
  Account,
  Credential,
  PrismaClient,
  RecoveryKey,
  Subrole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationDto } from './dto/registration.dto';
import { SignInDto } from './dto/sign-in.dto';

export interface IJWTToken {
  iat: number;
  exp: number;
  jti: string;
}

export interface IJWTPayload {
  id: string;
  identifier: string;
  permissions: {
    subroles: {
      id: number;
      name: string;
      roleId: number;
      roleName: string;
    }[];
  }[];
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

  public async registration(account: RegistrationDto) {
    return await this.prisma.$transaction(async (tx) => {
      const existingAccount = await tx.account.findMany({
        where: {
          credential: {
            identifier: account.username.trim().toLowerCase(),
          },
        },
      });

      if (existingAccount[0]) {
        bad_request({ raise: true, msg: 'LOGIN_ALREADY_EXISTS' });
      }

      const insertedAccount = await tx.account.create({
        data: {
          isBlocked: false,
          firstSurname: account.firstSurname,
          secondSurname: account.secondSurname,
          firstName: account.firstName,
          middleName: account.middleName,
          documentIdentity: account.documentIdentity,
          gender: account.gender,
          cellPhone: account.cellPhone,
          homePhone: account.homePhone,
          address: account.address,
          ubigeoDepartment: {
            connect: {
              id: account.ubigeoDepartmentId,
            },
          },
          ubigeoDistrict: {
            connect: {
              id: account.ubigeoDistrictId,
            },
          },
          ubigeoProvince: {
            connect: {
              id: account.ubigeoProvinceId,
            },
          },
          credential: {
            create: {
              identifier: account.username,
              secret: passwordToHash(account.password),
            },
          },
        },
      });

      if (account.subroleIds) {
        const permissionsData = account.subroleIds.map((subroleId) => ({
          accountId: insertedAccount.id,
          subroleId: subroleId,
        }));

        await tx.permission.createMany({
          data: permissionsData,
        });
      }

      return await this.regenerateRecoveryKeys(tx, insertedAccount.id);
    });
  }

  public async token(signInDto: SignInDto) {
    validateDTO(SignInDto, signInDto);

    switch (signInDto.grand_type) {
      case 'password':
        return await this.signInByPassword(
          signInDto.username,
          signInDto.password,
        );
      case 'refresh_token':
        return await this.signInByRefreshToken(signInDto.refresh_token);
    }

    authorization_failed({ raise: true });
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
          permission: {
            include: {
              subrole: {
                include: {
                  role: true,
                },
              },
            },
          },
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
          permission: {
            include: {
              subrole: {
                include: {
                  role: true,
                },
              },
            },
          },
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
      permission: {
        subrole?: (Subrole & { role: { id: number; name: string } }) | null;
      }[];
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
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
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
      permission: {
        subrole?: (Subrole & { role: { id: number; name: string } }) | null; // Incluye el role aquí
      }[];
    },
  ): IJWTPayload {
    return {
      id: account.id,
      identifier: account.credential.identifier,
      permissions: account.permission.map((permission) => ({
        subroles: permission.subrole
          ? [
              {
                id: permission.subrole.id,
                name: permission.subrole.name,
                roleId: permission.subrole.role.id,
                roleName: permission.subrole.role.name,
              },
            ]
          : [],
      })),
      is_blocked: account.isBlocked,
    };
  }
}
