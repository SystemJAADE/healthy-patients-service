import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UbigeoDepartment,
  UbigeoDistrict,
  UbigeoProvince,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UbigeoRepository {
  constructor(private prisma: PrismaService) {}

  async getDepartments(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UbigeoDepartmentWhereUniqueInput;
    where?: Prisma.UbigeoDepartmentWhereInput;
    orderBy?: Prisma.UbigeoDepartmentOrderByWithRelationInput;
  }): Promise<UbigeoDepartment[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.ubigeoDepartment.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getProvinces(departmentId: string): Promise<UbigeoProvince[]> {
    return this.prisma.ubigeoProvince.findMany({
      where: {
        departmentId: departmentId,
      },
      select: {
        id: true,
        name: true,
        departmentId: true,
      },
    });
  }

  async getDistricts(
    departmentId: string,
    provinceId: string,
  ): Promise<UbigeoDistrict[]> {
    return this.prisma.ubigeoDistrict.findMany({
      where: {
        provinceId: provinceId,
        departmentId: departmentId,
      },
      select: {
        id: true,
        name: true,
        provinceId: true,
        departmentId: true,
      },
    });
  }
}
