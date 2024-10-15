import { Injectable } from '@nestjs/common';
import {
  UbigeoDepartment,
  UbigeoDistrict,
  UbigeoProvince,
} from '@prisma/client';
import { UbigeoRepository } from './ubigeo.repository';

@Injectable()
export class UbigeoService {
  constructor(private repository: UbigeoRepository) {}

  public async getDepartments(): Promise<UbigeoDepartment[]> {
    return this.repository.getDepartments({});
  }

  public async getProvinces(departmentId: string): Promise<UbigeoProvince[]> {
    return this.repository.getProvinces(departmentId);
  }

  public async getDistricts(
    departmentId: string,
    provinceId: string,
  ): Promise<UbigeoDistrict[]> {
    return this.repository.getDistricts(departmentId, provinceId);
  }
}
