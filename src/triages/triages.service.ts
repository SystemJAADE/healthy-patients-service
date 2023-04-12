import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TriagesRepository } from './triages.repository';
import { Triage } from '@prisma/client';
import { TriageDto } from './dto/triage.dto';

@Injectable()
export class TriagesService {
  constructor(private repository: TriagesRepository) {}

  public async findAll(): Promise<Triage[]> {
    return this.repository.getTriages({});
  }

  public async findByID(id: number): Promise<Triage> {
    const triage = await this.repository.getTriage({ id });
    if (!triage) {
      throw new HttpException('Triage not found', HttpStatus.NOT_FOUND);
    }
    return triage;
  }

  public async create(data: TriageDto): Promise<Triage> {
    return this.repository.createTriage(data);
  }

  public async update(id: number, data: TriageDto): Promise<Triage> {
    await this.findByID(id);
    return this.repository.updateTriage({ data, where: { id } });
  }

  public async delete(id: number): Promise<Triage> {
    await this.findByID(id);
    return this.repository.deleteTriage({ id });
  }
}
