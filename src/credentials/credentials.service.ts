import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CredentialsRepository } from './credentials.repository';
import { Credential } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(private repository: CredentialsRepository) {}

  public async findAll(): Promise<Credential[]> {
    return this.repository.getCredentials({});
  }

  public async findByID(id: string): Promise<Credential> {
    const credential = await this.repository.getCredential({ id });
    if (!credential) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return credential;
  }
}
