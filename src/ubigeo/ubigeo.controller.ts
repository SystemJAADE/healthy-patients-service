import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UbigeoService } from './ubigeo.service';

@Controller('ubigeo')
@ApiTags('ubigeo')
export class UbigeoController {
  constructor(private readonly ubigeoService: UbigeoService) {}

  @Get('departments')
  public getDepartments() {
    return this.ubigeoService.getDepartments();
  }

  @Get('provinces/:departmentId')
  public getProvinces(@Param('departmentId') departmentId: string) {
    return this.ubigeoService.getProvinces(departmentId);
  }

  @Get('districts/:departmentId/:provinceId')
  public getDistricts(
    @Param('departmentId') departmentId: string,
    @Param('provinceId') provinceId: string,
  ) {
    return this.ubigeoService.getDistricts(departmentId, provinceId);
  }
}
