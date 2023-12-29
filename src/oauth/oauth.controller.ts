import { Body, Controller, Post, Req } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RegistrationDto } from './dto/registration.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { validateDTO } from 'src/helpers/validate.helper';
import { SignInByPasswordDto } from './dto/sign-in-by-password.dto';
import { SignInByRefreshTokenDto } from './dto/sign-in-by-refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { authorization_failed } from 'src/errors';

@ApiTags('oauth')
@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @ApiOperation({
    summary: 'Registro de usuario',
  })
  @ApiBody({
    type: RegistrationDto,
    required: true,
  })
  @ApiOkResponse({
    isArray: true,
    type: String,
  })
  @Post('registration')
  public async registration(@Body() body: RegistrationDto) {
    return await this.oauthService.registration(body);
  }

  @ApiOperation({
    summary: 'Autorización de usuario',
  })
  @ApiQuery({
    name: 'grand_type',
    description: 'Tipo de concesión (Grand type)',
    enum: ['password', 'refresh_token'],
    required: true,
  })
  @ApiQuery({
    name: 'username',
    description: 'Nombre de usuario, solo si grand_type = password',
    required: false,
  })
  @ApiQuery({
    name: 'password',
    description: 'Contraseña, solo si grand_type = password',
    required: false,
  })
  @ApiQuery({
    name: 'refresh_token',
    description: 'Refresh token, solo si grand_type = refresh_token',
    required: false,
  })
  @ApiOkResponse({
    type: SignInResponseDto,
    isArray: false,
  })
  @Post('token')
  public async token(@Req() req: Request) {
    if (Object.keys(req.query).length) {
      switch (req.query.grand_type) {
        case 'password':
          const signInByPasswordDto = {
            login: req.query.username as string,
            password: req.query.password as string,
          };

          validateDTO(SignInByPasswordDto, signInByPasswordDto);

          return await this.oauthService.signInByPassword(
            signInByPasswordDto.login,
            signInByPasswordDto.password,
          );
        case 'refresh_token':
          const signInByRefreshTokenDto = {
            refresh_token: req.query.refresh_token as string,
          };

          validateDTO(SignInByRefreshTokenDto, signInByRefreshTokenDto);

          return await this.oauthService.signInByRefreshToken(
            signInByRefreshTokenDto.refresh_token,
          );
      }
    }

    authorization_failed({ raise: true });
  }

  @ApiOperation({
    summary: 'Recuperación de contraseña',
  })
  @ApiBody({
    type: ChangePasswordDto,
    required: true,
  })
  @Post('change_password')
  public async changePassword(@Body() body: ChangePasswordDto) {
    return await this.oauthService.changePassword(
      body.recovery_key,
      body.new_password,
    );
  }
}
