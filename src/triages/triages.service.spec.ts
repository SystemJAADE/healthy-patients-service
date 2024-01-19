import { Test, TestingModule } from '@nestjs/testing';
import { TriagesService } from './triages.service';
import { TriagesRepository } from './triages.repository';
import { Triage, TriageType } from '@prisma/client';
import { TriagesModule } from './triages.module';
import { HttpException, HttpStatus } from '@nestjs/common';

const triagesArray: Triage[] = [
  {
    id: 1,
    triageType: TriageType.NEW,
    medicalRecordNumber: 10,
    time: new Date('2021-01-01T00:00:00.000Z'),
    bloodPressure: '120/80',
    pulse: 80,
    height: 170,
    weight: 70,
    bloodOxygen: 95,
    temperature: 36.5,
    respiratoryRate: 15,
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
  },
  {
    id: 2,
    triageType: TriageType.NEW,
    medicalRecordNumber: 23,
    time: new Date('2021-01-02T00:00:00.000Z'),
    bloodPressure: '130/90',
    pulse: 85,
    height: 165,
    weight: 63,
    bloodOxygen: 98,
    temperature: 36.8,
    respiratoryRate: 16,
    createdAt: new Date('2021-01-02T00:00:00.000Z'),
    updatedAt: new Date('2021-01-02T00:00:00.000Z'),
  },
  {
    id: 3,
    triageType: TriageType.NEW,
    medicalRecordNumber: 345,
    time: new Date('2021-01-03T00:00:00.000Z'),
    bloodPressure: '121/81',
    pulse: 91,
    height: 176,
    weight: 83,
    bloodOxygen: 97,
    temperature: 37.1,
    respiratoryRate: 13,
    createdAt: new Date('2021-01-03T00:00:00.000Z'),
    updatedAt: new Date('2021-01-03T00:00:00.000Z'),
  },
];

const oneTriage = triagesArray[0];

describe('TriagesService', () => {
  let service: TriagesService;
  let repository: TriagesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TriagesModule],
      providers: [
        TriagesService,
        {
          provide: TriagesRepository,
          useValue: {
            getTriages: jest.fn(),
            getTriage: jest.fn(),
            createTriage: jest.fn(),
            updateTriage: jest.fn(),
            deleteTriage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TriagesService>(TriagesService);
    repository = module.get<TriagesRepository>(TriagesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of triages', async () => {
      jest.spyOn(repository, 'getTriages').mockResolvedValueOnce(triagesArray);

      expect(await service.findAll()).toBe(triagesArray);
    });
  });

  describe('findByID', () => {
    it('should return a triage by ID', async () => {
      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(oneTriage);

      expect(await service.findByID(1)).toEqual(oneTriage);
    });

    it('should throw HttpException if triage not found', async () => {
      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(null);

      // Triage with ID 727 doesn't exist in the test data so we expect it to throw an error
      await expect(service.findByID(727)).rejects.toThrowError(
        new HttpException('Triage not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('should create a new triage', async () => {
      jest.spyOn(repository, 'createTriage').mockResolvedValueOnce(oneTriage);

      expect(await service.create(oneTriage)).toEqual(oneTriage);
    });
  });

  describe('update', () => {
    it('should update a triage', async () => {
      // Modify the pulse value of oneTriage to 110 for this test
      oneTriage.bloodOxygen = 110;

      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(oneTriage);
      jest.spyOn(repository, 'updateTriage').mockResolvedValueOnce(oneTriage);

      expect(await service.update(oneTriage.id, oneTriage)).toEqual(oneTriage);
    });

    it('should throw HttpException if triage not found during update', async () => {
      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(null);

      // Triage with ID 99 doesn't exist in the test data so we expect it to throw an error
      try {
        await service.update(99, {} as Triage);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Triage not found');
      }
    });
  });

  describe('delete', () => {
    it('should delete a triage', async () => {
      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(oneTriage);
      jest.spyOn(repository, 'deleteTriage').mockResolvedValueOnce(oneTriage);

      // Triage with ID 1 exists in the test data so we expect it to be deleted
      expect(await service.delete(1)).toEqual(oneTriage);
    });

    it('should throw HttpException if triage not found during delete', async () => {
      jest.spyOn(repository, 'getTriage').mockResolvedValueOnce(null);

      // Triage with ID 99 doesn't exist in the test data so we expect it to throw an error
      try {
        await service.delete(99);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Triage not found');
      }
    });
  });
});
