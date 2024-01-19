import { Injectable } from '@nestjs/common';
import { Credential, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma//prisma.service';

@Injectable()
export class CredentialsRepository {
  constructor(private prisma: PrismaService) {}

  async getCredential(
    where: Prisma.CredentialWhereUniqueInput,
  ): Promise<Credential> {
    return this.prisma.credential.findUnique({ where });
  }

  async getCredentials(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CredentialWhereUniqueInput;
    where?: Prisma.CredentialWhereInput;
    orderBy?: Prisma.CredentialOrderByWithRelationInput;
  }): Promise<Credential[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.credential.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }
}
