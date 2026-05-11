import { IsString, MinLength } from 'class-validator';

export class ValidateLicenseDto {
  @IsString()
  @MinLength(8)
  licenseKey!: string;
}
