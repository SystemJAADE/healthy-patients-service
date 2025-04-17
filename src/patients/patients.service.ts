import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Account, Patient } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(
    createPatientDto: CreatePatientDto,
  ): Promise<{ account: Account; patient: Patient }> {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const existingAccount = await prisma.account.findFirst({
          where: {
            documentIdentity: createPatientDto.documentIdentity,
          },
          include: {
            permission: true,
          },
        });

        if (!existingAccount) {
          throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
        }

        const notFullyRegisteredPermission = existingAccount.permission.find(
          (p) => p.subroleId === 19,
        );

        if (notFullyRegisteredPermission) {
          const patientSubrole = await prisma.subrole.findFirst({
            where: {
              name: 'Patient',
            },
          });

          console.log(patientSubrole);

          // Update the permission to Patient role
          await prisma.permission.updateMany({
            where: {
              accountId: existingAccount.id,
            },
            data: {
              subroleId: patientSubrole.id,
            },
          });
        }

        // Update the existing account
        const account = await prisma.account.update({
          where: {
            id: existingAccount.id,
          },
          data: {
            firstName: createPatientDto.firstName,
            middleName: createPatientDto.middleName,
            firstSurname: createPatientDto.firstSurname,
            secondSurname: createPatientDto.secondSurname,
            documentType: createPatientDto.documentType,
            gender: createPatientDto.gender,
            cellPhone: createPatientDto.cellPhone,
            address: createPatientDto.address,
            ubigeoDepartmentId: createPatientDto.ubigeoDepartmentId,
            ubigeoProvinceId: createPatientDto.ubigeoProvinceId,
            ubigeoDistrictId: createPatientDto.ubigeoDistrictId,
            emailAddress: createPatientDto.emailAddress,
          },
        });

        // Check if patient already exists
        const existingPatient = await prisma.patient.findUnique({
          where: {
            accountId: account.id,
          },
        });

        let patient: Patient;
        if (existingPatient) {
          // Update existing patient
          patient = await prisma.patient.update({
            where: {
              accountId: account.id,
            },
            data: {
              bloodType: createPatientDto.bloodType,
              allergies: createPatientDto.allergies,
              personalPathologicalHistory:
                createPatientDto.personalPathologicalHistory,
              familyPathologicalHistory:
                createPatientDto.familyPathologicalHistory,
            },
          });
        } else {
          // Create new patient
          patient = await prisma.patient.create({
            data: {
              accountId: account.id,
              bloodType: createPatientDto.bloodType,
              allergies: createPatientDto.allergies,
              personalPathologicalHistory:
                createPatientDto.personalPathologicalHistory,
              familyPathologicalHistory:
                createPatientDto.familyPathologicalHistory,
            },
          });
        }

        return { account, patient };
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating patient account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
