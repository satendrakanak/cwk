import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CompleteSocialAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
