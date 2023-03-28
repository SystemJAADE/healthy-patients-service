import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  public async findAll(): Promise<Account[]> {
    return this.accountsRepository.find();
  }

  public async findByID(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOneBy({ id });
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }
}
