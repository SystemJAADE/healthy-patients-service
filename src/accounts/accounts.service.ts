import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from '@prisma/client';
import * as FormData from 'form-data';
import * as jwt from 'jsonwebtoken';
import { firstValueFrom } from 'rxjs';
import { AccountsRepository } from './accounts.repository';
import { AccountDto } from './dto/account.dto';
import { BufferedImageDto } from './dto/buffered-image.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AccountsService {
  constructor(
    private repository: AccountsRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async findByCredentialIdentifier(identifier: string): Promise<any> {
    const account =
      await this.repository.getAccountByCredentialIdentifier(identifier);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  public async findCurrentUser(authorization: string): Promise<Account> {
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

  public async updatePermissions(
    id: string,
    subroleIds: number[],
  ): Promise<{ message: string }> {
    return this.repository.updatePermissions({
      subroleIds,
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
