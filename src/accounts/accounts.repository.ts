import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async getAccount(where: Prisma.AccountWhereUniqueInput): Promise<Account> {
    return this.prisma.account.findUnique({ where });
  }

  async getAccountByCredentialIdentifier(
    identifier: string,
  ): Promise<Omit<Account, 'roleId' | 'subroleId'> | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        credential: {
          identifier: identifier,
        },
      },
      include: {
        permission: {
          include: {
            role: {
              include: {
                subroles: true,
              },
            },
          },
        },
      },
    });

    if (account && account.permission) {
      account.permission.forEach((perm) => {
        perm.role.subroles = perm.role.subroles.filter(
          (subrole) => subrole.id === perm.subroleId,
        );
      });
    }

    return account;
  }

  async getAccounts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AccountWhereUniqueInput;
    where?: Prisma.AccountWhereInput;
    orderBy?: Prisma.AccountOrderByWithRelationInput;
  }): Promise<Account[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.account.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
}
