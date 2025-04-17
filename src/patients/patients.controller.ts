import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Controller('patients')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard())
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('register')
  @Roles('Admin', 'Doctor')
  public register(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.register(createPatientDto);
  }
}
