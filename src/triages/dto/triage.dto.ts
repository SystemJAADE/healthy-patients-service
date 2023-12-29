import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    required: true,
    description: 'Tipo de triaje',
    example: TriageType.NEW,
  })
  @IsEnum(TriageType, { each: true })
  triageType: TriageType;

  @ApiProperty({
    required: true,
    description: 'Número de historia clínica',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  medicalRecordNumber: number;

  @ApiProperty({
    required: false,
    description: 'Fecha y hora de atención',
    example: '2021-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  time?: Date | string | null;

  @ApiProperty({
    required: true,
    description: 'Presión arterial',
    example: '120/80',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,3}\/\d{1,3}$/, {
    message:
      'bloodPressure must be in the format of number/number (e.g. 120/80)',
  })
  bloodPressure: string;

  @ApiProperty({
    required: true,
    description: 'Pulso',
    example: 80,
  })
  @IsNumber()
  @IsNotEmpty()
  pulse: number;

  @ApiProperty({
    required: true,
    description: 'Estatura (cm)',
    example: 170,
  })
  @IsNumber()
  @IsNotEmpty()
  height: number;

  @ApiProperty({
    required: true,
    description: 'Peso (kg)',
    example: 70,
  })
  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({
    required: true,
    description: 'Oxígeno en la sangre',
    example: 95,
  })
  @IsNumber()
  @IsNotEmpty()
  bloodOxygen: number;

  @ApiProperty({
    required: true,
    description: 'Temperatura (°C)',
    example: 36.5,
  })
  @IsNumber()
  @IsNotEmpty()
  // TODO: Add regex to validate temperature (Decimal(3,1))
  temperature: number;

  @ApiProperty({
    required: true,
    description: 'Frecuencia respiratoria',
    example: 15,
  })
  @IsNumber()
  @IsNotEmpty()
  respiratoryRate: number;
}
