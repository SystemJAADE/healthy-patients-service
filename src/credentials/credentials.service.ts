import { Repository } from 'typeorm';
import { Credential } from './credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential)
    private credentialsRepository: Repository<Credential>,
  ) {}

  public async findAll(): Promise<Credential[]> {
    return this.credentialsRepository.find();
  }

  public async findByID(id: string): Promise<Credential> {
    const credential = await this.credentialsRepository.findOneBy({ id });
    if (!credential) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return credential;
  }
}
