import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AccountDto {
  @ApiProperty({
    required: true,
    description: 'Estado de bloqueo',
    example: false,
  })
  isBlocked: boolean;

  @ApiProperty({
    required: true,
    description: 'Primer apellido',
    example: 'Perez',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  firstSurname: string;

  @ApiProperty({
    required: true,
    description: 'Segundo apellido',
    example: 'Perez',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  secondSurname: string;

  @ApiProperty({
    required: true,
    description: 'Primer nombre',
    example: 'Sanchez',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  firstName: string;

  @ApiProperty({
    required: false,
    description: 'Segundo nombre',
    example: 'Diego',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  middleName?: string;

  @ApiProperty({
    required: true,
    description: 'Documento de identidad',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  documentIdentity: string;

  @ApiProperty({
    required: true,
    description: 'Género',
    example: Gender.MALE,
  })
  @IsEnum(Gender, { each: true })
  gender: Gender;

  @ApiProperty({
    required: false,
    description: 'Celular',
    example: '987654321',
  })
  @Length(9)
  cellPhone?: string;

  @ApiProperty({
    required: true,
    description: 'Teléfono fijo',
    example: '5432100',
  })
  @Length(7)
  homePhone: string;

  @ApiProperty({
    required: true,
    description: 'Dirección',
    example: 'Av. Los Alamos #123',
  })
  address: string;

  @ApiProperty({
    required: true,
    description: 'Departamento',
    example: '01',
  })
  ubigeoDepartmentId: string;

  @ApiProperty({
    required: true,
    description: 'Distrito',
    example: '010101',
  })
  ubigeoDistrictId: string;

  @ApiProperty({
    required: true,
    description: 'Provincia',
    example: '0101',
  })
  ubigeoProvinceId: string;

  @ApiProperty({
    required: true,
    description: 'IDs de Roles',
    example: [1],
  })
  @IsArray()
  @IsNotEmpty()
  roleIds: number[];

  @ApiProperty({
    required: true,
    description: 'IDs de Subroles',
    example: [1],
  })
  @IsArray()
  @IsOptional()
  subroleIds?: number[];
}