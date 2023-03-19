import { ApiProperty } from '@nestjs/swagger';

import { IsUUID, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    required: true,
    description: 'Código de cambio de contraseña de un solo uso',
  })
  @IsUUID()
  recovery_key: string;

  @ApiProperty({
    required: true,
    description: 'Nueva contraseña',
  })
  @Length(4, 32)
  new_password: string;
}
