import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { Account } from '@prisma/client';
import { AccountDto } from './dto/account.dto';
import * as jwt from 'jsonwebtoken';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BufferedImageDto } from './dto/buffered-image.dto';
import * as FormData from 'form-data';

@Injectable()
export class AccountsService {
  constructor(
    private repository: AccountsRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async findByID(id: string): Promise<Account> {
    const account = await this.repository.getAccount({ id });
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  public async findByCredentialIdentifier(
    identifier: string,
  ): Promise<Omit<Account, 'roleId' | 'subroleId'>> {
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

  public async getAvatar(id: string): Promise<Buffer> {
    const assetsUrl = this.configService.get<string>('ASSETS_URL');

    let data: ArrayBuffer;
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${assetsUrl}/accounts/${id}/avatar/`, {
          responseType: 'arraybuffer',
        }),
      );
      data = response.data;
    } catch (error) {
      throw new HttpException('Avatar not found', HttpStatus.NOT_FOUND);
    }

    return Buffer.from(data);
  }

  public async uploadAvatar(id: string, image: BufferedImageDto) {
    const assetsUrl = this.configService.get<string>('ASSETS_URL');
    const formData = new FormData();

    formData.append('image', image.buffer, {
      filename: image.originalname,
      contentType: image.mimetype,
    });

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${assetsUrl}/accounts/${id}/avatar/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        ),
      );
      return data;
    } catch (error) {
      throw new HttpException('Error uploading avatar', HttpStatus.BAD_REQUEST);
    }
  }
}
