import { Gender } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegistrationDto {
  @IsString()
  @Length(4, 32)
  username: string;

  @Length(4, 32)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  firstSurname: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  secondSurname: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 64)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  documentIdentity: string;

  @IsEnum(Gender, { each: true })
  gender: Gender;

  @Length(9)
  cellPhone?: string;

  @Length(7)
  homePhone: string;

  address: string;

  ubigeoDepartmentId: string;

  ubigeoProvinceId: string;

  ubigeoDistrictId: string;
}
