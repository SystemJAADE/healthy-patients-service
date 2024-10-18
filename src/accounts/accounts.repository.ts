import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccountDto } from './dto/account.dto';

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async getAccountByCredentialIdentifier(identifier: string): Promise<any> {
    const account = await this.prisma.account.findFirst({
      where: {
        credential: {
          identifier: identifier,
        },
      },
      include: {
        permission: {
          include: {
            subrole: {
              include: {
                role: {
                  include: {
                    subroles: true,
                  },
                },
              },
            },
          },
        },
        patient: true,
        doctor: true,
        admin: true,
      },
    });

    if (account && account.permission) {
      const permissionsMap = new Map<
        number,
        {
          roleId: number;
          name: string;
          subroles: { id: number; name: string }[];
        }
      >();

      account.permission.forEach((perm) => {
        const role = perm.subrole.role;

        if (permissionsMap.has(role.id)) {
          const existingPermission = permissionsMap.get(role.id);
          if (existingPermission) {
            const existingSubroleIds = new Set(
              existingPermission.subroles.map((sub) => sub.id),
            );
            if (!existingSubroleIds.has(perm.subrole.id)) {
              existingPermission.subroles.push({
                id: perm.subrole.id,
                name: perm.subrole.name,
              });
            }
          }
        } else {
          permissionsMap.set(role.id, {
            roleId: role.id,
            name: role.name,
            subroles: [
              {
                id: perm.subrole.id,
                name: perm.subrole.name,
              },
            ],
          });
        }
      });

      const permissionsArray = Array.from(permissionsMap.values());

      const filteredAccount = {
        ...account,
        permission: permissionsArray,
      };

      if (!account.patient) {
        delete filteredAccount.patient;
      }
      if (!account.doctor) {
        delete filteredAccount.doctor;
      }
      if (!account.admin) {
        delete filteredAccount.admin;
      }

      return filteredAccount;
    }

    return account;
  }

  async updateAccount(params: {
    where: Prisma.AccountWhereUniqueInput;
    data: AccountDto;
  }): Promise<Omit<Account, 'roleId' | 'subroleId'>> {
    const { where, data } = params;

    return this.prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where,
        data: {
          isBlocked: data.isBlocked,
          firstSurname: data.firstSurname,
          secondSurname: data.secondSurname,
          firstName: data.firstName,
          middleName: data.middleName,
          documentType: data.documentType,
          documentIdentity: data.documentIdentity,
          gender: data.gender,
          cellPhone: data.cellPhone,
          address: data.address,
          ubigeoDepartment: {
            connect: {
              id: data.ubigeoDepartmentId,
            },
          },
          ubigeoProvince: {
            connect: {
              id: data.ubigeoProvinceId,
            },
          },
          ubigeoDistrict: {
            connect: {
              id: data.ubigeoDistrictId,
            },
          },
          emailAddress: data.emailAddress,
        },
      });

      if (data.roleIds && data.subroleIds) {
        await tx.permission.deleteMany({
          where: {
            accountId: updatedAccount.id,
          },
        });

        const permissionsData = data.roleIds
          .map((roleId) =>
            data.subroleIds.map((subroleId) => ({
              accountId: updatedAccount.id,
              roleId: roleId,
              subroleId: subroleId,
            })),
          )
          .flat();

        await tx.permission.createMany({
          data: permissionsData,
        });
      }

      const accountWithPermissions = await tx.account.findFirst({
        where: {
          id: updatedAccount.id,
        },
        include: {
          permission: {
            include: {
              subrole: {
                include: {
                  role: {
                    include: {
                      subroles: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (accountWithPermissions && accountWithPermissions.permission) {
        accountWithPermissions.permission.forEach((perm) => {
          const role = perm.subrole.role;
          if (role) {
            role.subroles = role.subroles.filter(
              (subrole) => subrole.id === perm.subroleId,
            );
          }
        });
      }

      return accountWithPermissions;
    });
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
