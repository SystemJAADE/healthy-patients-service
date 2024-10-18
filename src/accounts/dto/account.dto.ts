import { DocumentType, Gender } from '@prisma/client';
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

  @IsEnum(DocumentType, { each: true })
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  @Length(8, 32)
  documentIdentity: string;

  @IsEnum(Gender, { each: true })
  gender: Gender;

  @Length(9)
  cellPhone?: string;

  address: string;

  ubigeoDepartmentId: string;

  ubigeoProvinceId: string;

  ubigeoDistrictId: string;

  emailAddress: string;

  @IsArray()
  @IsNotEmpty()
  roleIds: number[];

  @IsArray()
  @IsOptional()
  subroleIds?: number[];
}
