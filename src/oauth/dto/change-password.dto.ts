import { IsUUID, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsUUID()
  recovery_key: string;

  @Length(4, 32)
  new_password: string;
}
