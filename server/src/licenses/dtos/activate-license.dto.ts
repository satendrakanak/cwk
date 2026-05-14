import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ActivateLicenseDto {
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  key!: string;

  @IsEmail()
  @IsOptional()
  purchaserEmail?: string;
}
