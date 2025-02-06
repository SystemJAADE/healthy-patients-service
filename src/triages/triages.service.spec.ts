import { Test, TestingModule } from '@nestjs/testing';
import { TriagesService } from './triages.service';
import { Patient, Triage, TriageType } from '@prisma/client';
import { TriagesModule } from './triages.module';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OauthService } from '../oauth/oauth.service';
import { OauthModule } from '../oauth/oauth.module';
import { ConfigModule } from '@nestjs/config';
import { RegistrationDto } from 'src/oauth/dto/registration.dto';

const triagesArray: Triage[] = [
  {
    id: 1,
    triageType: TriageType.NEW,
    medicalRecordNumber: 0,
    time: new Date(),
    bloodPressure: '120/80',
    pulse: 80,
    height: 170,
    weight: 70,
    bloodOxygen: 95,
    temperature: 36.5,
    respiratoryRate: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    triageType: TriageType.NEW,
    medicalRecordNumber: 0,
    time: new Date(),
    bloodPressure: '130/90',
    pulse: 85,
    height: 165,
    weight: 63,
    bloodOxygen: 98,
    temperature: 36.8,
    respiratoryRate: 16,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('TriagesService', () => {
  let triagesService: TriagesService;
  let oauthService: OauthService;
  let prisma: PrismaService;

  // We need an account and a patient registered in the database in order to create a triage
  let patient: Patient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TriagesModule,
        OauthModule,
        PrismaModule,
      ],
      providers: [TriagesService, OauthService],
    }).compile();

    triagesService = module.get<TriagesService>(TriagesService);
    oauthService = module.get<OauthService>(OauthService);
    prisma = module.get<PrismaService>(PrismaService);

    const account = {
      username: 'usuario',
      password: 'clave123',
      firstSurname: 'Perez',
      secondSurname: 'Perez',
      firstName: 'Sanchez',
      middleName: 'Diego',
      documentIdentity: '12345678',
      gender: 'MALE',
      cellPhone: '987654321',
      homePhone: '5432100',
      address: 'Av. Los Alamos #123',
      ubigeoDepartmentId: '01',
      ubigeoDistrictId: '010101',
      ubigeoProvinceId: '0101',
    } as RegistrationDto;

    await oauthService.registration(account);

    // TODO: Use repositories instead of prisma directly
    const registeredAccount = await prisma.account.findFirst({
      where: {
        credential: {
          identifier: account.username,
        },
      },
    });

    // TODO: Use repositories instead of prisma directly
    patient = await prisma.patient.create({
      data: {
        account: {
          connect: {
            id: registeredAccount.id,
          },
        },
      },
    });

    // Update the medical record number of all triages
    triagesArray.forEach((triage) => {
      triage.medicalRecordNumber = patient.medicalRecordNumber;
    });
  });

  afterAll(async () => {
    // TODO: Use repositories instead of prisma directly
    await prisma.triage.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.recoveryKey.deleteMany();
    await prisma.credential.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.account.deleteMany();
  });

  it('should be defined', () => {
    expect(triagesService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new triage', async () => {
      const result = await triagesService.create(triagesArray[0]);
      expect(result.id).toBeDefined();
      expect(result.triageType).toEqual(TriageType.NEW);
      expect(result.time).toBeDefined();
      expect(result.medicalRecordNumber).toEqual(patient.medicalRecordNumber);
      expect(result.bloodPressure).toEqual(triagesArray[0].bloodPressure);
      expect(result.pulse).toEqual(triagesArray[0].pulse);
      expect(result.height).toEqual(triagesArray[0].height);
      expect(result.weight).toEqual(triagesArray[0].weight);
      expect(result.bloodOxygen).toEqual(triagesArray[0].bloodOxygen);
      expect(result.temperature).toEqual(triagesArray[0].temperature);
      expect(result.respiratoryRate).toEqual(triagesArray[0].respiratoryRate);
    });

    it('should create another triage', async () => {
      const result = await triagesService.create(triagesArray[1]);
      expect(result.id).toBeDefined();
      expect(result.triageType).toEqual(TriageType.NEW);
      expect(result.time).toBeDefined();
      expect(result.medicalRecordNumber).toEqual(patient.medicalRecordNumber);
      expect(result.bloodPressure).toEqual(triagesArray[1].bloodPressure);
      expect(result.pulse).toEqual(triagesArray[1].pulse);
      expect(result.height).toEqual(triagesArray[1].height);
      expect(result.weight).toEqual(triagesArray[1].weight);
      expect(result.bloodOxygen).toEqual(triagesArray[1].bloodOxygen);
      expect(result.temperature).toEqual(triagesArray[1].temperature);
      expect(result.respiratoryRate).toEqual(triagesArray[1].respiratoryRate);
    });
  });

  describe('findAll', () => {
    it('should return an array of triages', async () => {
      const triages = await triagesService.findAll();
      expect(triages).toHaveLength(triagesArray.length);
      expect(triages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            triageType: expect.any(String),
            time: expect.any(Date),
            medicalRecordNumber: expect.any(Number),
            bloodPressure: expect.any(String),
            pulse: expect.any(Number),
            height: expect.any(Number),
            weight: expect.any(Number),
            bloodOxygen: expect.any(Number),
            temperature: expect.any(Number),
            respiratoryRate: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
      );
    });
  });

  describe('findByID', () => {
    it('should return a triage by ID', async () => {
      const foundTriage = await triagesService.findByID(triagesArray[0].id);
      expect(foundTriage.id).toBeDefined();
      expect(foundTriage.triageType).toEqual(TriageType.NEW);
      expect(foundTriage.time).toBeDefined();
      expect(foundTriage.medicalRecordNumber).toEqual(
        patient.medicalRecordNumber,
      );
      expect(foundTriage.bloodPressure).toEqual(triagesArray[0].bloodPressure);
      expect(foundTriage.pulse).toEqual(triagesArray[0].pulse);
      expect(foundTriage.height).toEqual(triagesArray[0].height);
      expect(foundTriage.weight).toEqual(triagesArray[0].weight);
      expect(foundTriage.bloodOxygen).toEqual(triagesArray[0].bloodOxygen);
      expect(foundTriage.temperature).toEqual(triagesArray[0].temperature);
      expect(foundTriage.respiratoryRate).toEqual(
        triagesArray[0].respiratoryRate,
      );
    });

    it('should throw HttpException if triage not found', async () => {
      await expect(triagesService.findByID(9999)).rejects.toThrow(
        new HttpException('Triage not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a triage', async () => {
      const updatedTriage = await triagesService.update(triagesArray[0].id, {
        ...triagesArray[0],
        bloodPressure: '110/70',
      });
      expect(updatedTriage.id).toEqual(triagesArray[0].id);
      expect(updatedTriage.id).toBeDefined();
      expect(updatedTriage.triageType).toEqual(TriageType.NEW);
      expect(updatedTriage.time).toBeDefined();
      expect(updatedTriage.medicalRecordNumber).toEqual(
        patient.medicalRecordNumber,
      );
      expect(updatedTriage.pulse).toEqual(triagesArray[0].pulse);
      expect(updatedTriage.height).toEqual(triagesArray[0].height);
      expect(updatedTriage.weight).toEqual(triagesArray[0].weight);
      expect(updatedTriage.bloodOxygen).toEqual(triagesArray[0].bloodOxygen);
      expect(updatedTriage.temperature).toEqual(triagesArray[0].temperature);
      expect(updatedTriage.respiratoryRate).toEqual(
        triagesArray[0].respiratoryRate,
      );
      expect(updatedTriage.bloodPressure).toEqual('110/70');
    });

    it('should throw HttpException if triage not found', async () => {
      await expect(
        triagesService.update(9999, triagesArray[0]),
      ).rejects.toThrow(
        new HttpException('Triage not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('delete', () => {
    it('should delete a triage', async () => {
      const deletedTriage = await triagesService.delete(triagesArray[0].id);
      expect(deletedTriage.id).toEqual(triagesArray[0].id);

      await expect(triagesService.findByID(triagesArray[0].id)).rejects.toThrow(
        new HttpException('Triage not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
