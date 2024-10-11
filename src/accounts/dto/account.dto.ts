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
  isBlocked: boolean;

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

  ubigeoDistrictId: string;

  ubigeoProvinceId: string;

  @IsArray()
  @IsNotEmpty()
  roleIds: number[];

  @IsArray()
  @IsOptional()
  subroleIds?: number[];
}
