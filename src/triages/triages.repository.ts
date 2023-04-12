import { Injectable } from '@nestjs/common';
import { Prisma, Triage } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TriagesRepository {
  constructor(private prisma: PrismaService) {}

  async getTriage(where: Prisma.TriageWhereUniqueInput): Promise<Triage> {
    return this.prisma.triage.findUnique({ where });
  }

  async getTriages(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TriageWhereUniqueInput;
    where?: Prisma.TriageWhereInput;
    orderBy?: Prisma.TriageOrderByWithRelationInput;
  }): Promise<Triage[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.triage.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createTriage(data: Prisma.TriageCreateInput): Promise<Triage> {
    return this.prisma.triage.create({ data });
  }

  async updateTriage(params: {
    where: Prisma.TriageWhereUniqueInput;
    data: Prisma.TriageUpdateInput;
  }): Promise<Triage> {
    const { where, data } = params;
    return this.prisma.triage.update({
      data,
      where,
    });
  }

  async deleteTriage(where: Prisma.TriageWhereUniqueInput): Promise<Triage> {
    return this.prisma.triage.delete({ where });
  }
}
