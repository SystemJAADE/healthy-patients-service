import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { Account } from '@prisma/client';
import { AccountDto } from './dto/account.dto';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AccountsService {
  constructor(private repository: AccountsRepository) {}

  public async findByCredentialIdentifier(identifier: string): Promise<any> {
    const account = await this.repository.getAccountByCredentialIdentifier(
      identifier,
    );
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  public async findCurrentUser(
    authorization: string,
  ): Promise<Omit<Account, 'roleId' | 'subroleId'>> {
    const accessToken = authorization.split(' ')[1];
    const decodedToken = jwt.decode(accessToken) as JwtPayloadDto;
    const identifier = decodedToken.current_account.identifier;
    return this.findByCredentialIdentifier(identifier);
  }

  public async update(id: string, data: AccountDto): Promise<Account> {
    return await this.repository.updateAccount({
      data,
      where: { id },
    });
  }
}
