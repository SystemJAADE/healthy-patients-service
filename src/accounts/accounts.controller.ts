import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { RoleGuard, Roles } from '../helpers/role.helper';
import { AccountsService } from './accounts.service';
import { AccountDto } from './dto/account.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedImageDto } from './dto/buffered-image.dto';

@Controller('accounts')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(RoleGuard())
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('/me')
  @Roles('Admin', 'Doctor', 'Patient', 'Not fully registered')
  public findCurrentUser(@Headers('authorization') authorization: string) {
    return this.accountsService.findCurrentUser(authorization);
  }

  @Get(':username')
  @Roles('Admin', 'Doctor')
  public findByUsername(@Param('username') username: string) {
    return this.accountsService.findByCredentialIdentifier(username);
  }

  @Put(':id')
  @Roles('Admin', 'Doctor')
  public update(@Param('id') id: string, @Body() data: AccountDto) {
    return this.accountsService.update(id, data);
  }

  @Get(':id/avatar')
  async getAvatar(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const avatar = await this.accountsService.getAvatar(id);
    res.header('Content-Type', 'image/png');
    return new StreamableFile(avatar);
  }

  @Post(':id/avatar/upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() image: BufferedImageDto,
  ) {
    return await this.accountsService.uploadAvatar(id, image);
  }
}
