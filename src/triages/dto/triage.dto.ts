import { TriageType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class TriageDto {
  @IsEnum(TriageType, { each: true })
  triageType: TriageType;

  @IsNumber()
  @IsNotEmpty()
  medicalRecordNumber: number;

  @IsDateString()
  @IsOptional()
  time?: Date | string | null;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,3}\/\d{1,3}$/, {
    message:
      'bloodPressure must be in the format of number/number (e.g. 120/80)',
  })
  bloodPressure: string;

  @IsNumber()
  @IsNotEmpty()
  pulse: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @IsNotEmpty()
  bloodOxygen: number;

  @IsNumber()
  @IsNotEmpty()
  temperature: number;

  @IsNumber()
  @IsNotEmpty()
  respiratoryRate: number;

  @IsString()
  @IsNotEmpty()
  companion: string;
}
