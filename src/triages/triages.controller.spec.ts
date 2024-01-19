import { Test, TestingModule } from '@nestjs/testing';
import { TriagesController } from './triages.controller';
import { TriagesService } from './triages.service';
import { Triage, TriageType } from '@prisma/client';
import { TriagesModule } from './triages.module';

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

describe('TriagesController', () => {
  let controller: TriagesController;
  let service: TriagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TriagesModule],
      controllers: [TriagesController],
      providers: [TriagesService],
    }).compile();

    controller = module.get<TriagesController>(TriagesController);
    service = module.get<TriagesService>(TriagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of triages', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce(triagesArray);

      expect(await controller.findAll()).toBe(triagesArray);
    });
  });

  describe('findByID', () => {
    it('should return a triage', async () => {
      jest.spyOn(service, 'findByID').mockResolvedValueOnce(oneTriage);

      expect(await controller.findByID(1)).toBe(oneTriage);
    });
  });

  describe('create', () => {
    it('should create a new triage', async () => {
      jest.spyOn(service, 'create').mockResolvedValueOnce(oneTriage);

      expect(await controller.create(oneTriage)).toBe(oneTriage);
    });
  });

  describe('update', () => {
    it('should update a triage', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(oneTriage);

      expect(await controller.update(1, oneTriage)).toBe(oneTriage);
    });
  });

  describe('delete', () => {
    it('should delete a triage', async () => {
      jest.spyOn(service, 'delete').mockResolvedValueOnce(oneTriage);

      expect(await controller.delete(1)).toBe(oneTriage);
    });
  });
});
