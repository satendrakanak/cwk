import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class ValidateLicenseDto {
  @IsOptional()
  @IsIn(['kasa', 'envato'])
  activationMode?: 'kasa' | 'envato';

  @IsOptional()
  @IsString()
  @MinLength(8)
  licenseKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  envatoPurchaseCode?: string;

  @IsOptional()
  @IsString()
  envatoBuyerName?: string;

  @IsOptional()
  @IsEmail()
  envatoBuyerEmail?: string;
}
