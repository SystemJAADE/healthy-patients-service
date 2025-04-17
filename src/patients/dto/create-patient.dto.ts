import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { DocumentType, Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsString()
  @Length(1, 64)
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  middleName?: string;

  @IsString()
  @Length(1, 64)
  firstSurname: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  secondSurname?: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  @Length(1, 32)
  documentIdentity: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  cellPhone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  address?: string;

  @IsOptional()
  @IsString()
  ubigeoDepartmentId?: string;

  @IsOptional()
  @IsString()
  ubigeoProvinceId?: string;

  @IsOptional()
  @IsString()
  ubigeoDistrictId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  emailAddress?: string;

  // Patient specific fields
  @IsOptional()
  @IsString()
  @Length(1, 8)
  bloodType?: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  allergies?: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  personalPathologicalHistory?: string;

  @IsOptional()
  @IsString()
  @Length(1, 256)
  familyPathologicalHistory?: string;
}
