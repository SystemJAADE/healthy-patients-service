import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class SignInByRefreshTokenDto {
  @ApiProperty({
    required: true,
    description: 'JWT token',
  })
  @IsJWT()
  refresh_token: string;
}
