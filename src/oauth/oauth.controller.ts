import { Body, Controller, Post } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { RegistrationDto } from './dto/registration.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('registration')
  public async registration(@Body() body: RegistrationDto) {
    return await this.oauthService.registration(body);
  }

  @Post('token')
  public async token(@Body() signInDto: SignInDto) {
    return await this.oauthService.token(signInDto);
  }

  @Post('change_password')
  public async changePassword(@Body() body: ChangePasswordDto) {
    return await this.oauthService.changePassword(
      body.recovery_key,
      body.new_password,
    );
  }
}
