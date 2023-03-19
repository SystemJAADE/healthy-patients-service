import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({
    required: true,
    description: 'JWT token',
  })
  token: string;

  @ApiProperty({
    required: true,
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    required: true,
    description: 'JWT Token que expira en (DateTime)',
  })
  token_expires_at: string;

  @ApiProperty({
    required: true,
    description: 'Refresh token',
  })
  refresh_token: string;

  @ApiProperty({
    required: true,
    description: 'Refresh Token que expira en (DateTime)',
  })
  refresh_token_expires_at: string;
}
