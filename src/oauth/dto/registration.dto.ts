import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegistrationDto {
  @ApiProperty({
    required: true,
    description: 'Nombre de usuario',
    example: 'usuario',
  })
  @IsString()
  @Length(4, 32)
  username: string;

  @ApiProperty({
    required: true,
    description: 'Contraseña',
    example: 'clave123',
  })
  @Length(4, 32)
  password: string;

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
}
