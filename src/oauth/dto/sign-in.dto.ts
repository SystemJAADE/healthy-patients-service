import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    required: true,
    description: 'Nombre de usuario, solo si grand_type = password',
    example: 'usuario',
  })
  @IsString()
  @Length(4, 32)
  username: string;

  @ApiProperty({
    required: true,
    description: 'Contraseña, solo si grand_type = password',
    example: 'clave123',
  })
  @Length(4, 32)
  password: string;

  @ApiProperty({
    required: true,
    description: 'Tipo de concesión (Grand type)',
    enum: ['password', 'refresh_token'],
    example: 'password',
  })
  grand_type: string;

  @ApiProperty({
    required: false,
    description: 'Refresh token, solo si grand_type = refresh_token',
    example: '',
  })
  refresh_token?: string | null;
}
