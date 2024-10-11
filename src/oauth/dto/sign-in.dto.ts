import { IsString, Length } from 'class-validator';

export class SignInDto {
  @IsString()
  @Length(4, 32)
  username: string;

  @Length(4, 32)
  password: string;

  grand_type: string;

  refresh_token?: string | null;
}
