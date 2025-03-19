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
  }): Promise<Account> {
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
        // Crear un Map para agrupar por roleId
        const roleMap = new Map();

        // Agrupar permisos por rol
        accountWithPermissions.permission.forEach((perm) => {
          const role = perm.subrole.role;
          if (!roleMap.has(role.id)) {
            roleMap.set(role.id, {
              role: {
                id: role.id,
                name: role.name,
                subroles: [],
              },
            });
          }

          // Añadir subrole si no existe ya
          const existingRole = roleMap.get(role.id);
          const subroleExists = existingRole.role.subroles.some(
            (sr) => sr.id === perm.subrole.id,
          );

          if (!subroleExists) {
            existingRole.role.subroles.push({
              id: perm.subrole.id,
              name: perm.subrole.name,
            });
          }
        });

        // Convertir el Map a array y asignar al objeto account
        const formattedPermissions = Array.from(roleMap.values());

        // Crear un nuevo objeto con la estructura deseada
        const formattedAccount = {
          ...accountWithPermissions,
          permissions: formattedPermissions,
          permission: undefined, // Eliminar el campo original de permission
        };

        return formattedAccount;
      }

      return accountWithPermissions;
    });
  }

  async updatePermissions(params: {
    where: Prisma.AccountWhereUniqueInput;
    subroleIds: number[];
  }): Promise<{ message: string }> {
    const { where, subroleIds } = params;

    return this.prisma.$transaction(async (tx) => {
      // Primero verificamos que la cuenta existe
      const account = await tx.account.findUnique({
        where,
        include: {
          permission: true,
        },
      });

      if (!account) {
        throw new Error('Account not found');
      }

      // Eliminamos los permisos existentes
      await tx.permission.deleteMany({
        where: {
          accountId: account.id,
        },
      });

      // Creamos los nuevos permisos
      await tx.permission.createMany({
        data: subroleIds.map((subroleId) => ({
          accountId: account.id,
          subroleId: subroleId,
        })),
      });

      return { message: 'Permissions updated successfully' };
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
