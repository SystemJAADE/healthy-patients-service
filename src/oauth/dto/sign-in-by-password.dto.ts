import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SignInByPasswordDto {
  @ApiProperty({
    required: true,
    description: 'Nombre de usuario',
  })
  @IsString()
  @Length(4, 32)
  username: string;

  @ApiProperty({
    required: true,
    description: 'Contraseña',
  })
  @Length(4, 32)
  password: string;
}
