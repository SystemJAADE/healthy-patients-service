import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { Account } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private repository: AccountsRepository) {}

  public async findAll(): Promise<Account[]> {
    return this.repository.getAccounts({});
  }

  public async findByID(id: string): Promise<Account> {
    const account = await this.repository.getAccount({ id });
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }
}
