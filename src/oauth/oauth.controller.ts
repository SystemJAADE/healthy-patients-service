import { Body, Controller, Post } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RegistrationDto } from './dto/registration.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignInResponseDto } from './dto/sign-in-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignInDto } from './dto/sign-in.dto';

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
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({
    type: SignInResponseDto,
    isArray: false,
  })
  @Post('token')
  public async token(@Body() signInDto: SignInDto) {
    return await this.oauthService.token(signInDto);
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
