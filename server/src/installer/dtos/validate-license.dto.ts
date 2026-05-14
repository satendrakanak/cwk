import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const emptyStringToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class ValidateLicenseDto {
  @IsOptional()
  @IsIn(['kasa', 'envato'])
  activationMode?: 'kasa' | 'envato';

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Transform(emptyStringToUndefined)
  licenseKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Transform(emptyStringToUndefined)
  envatoPurchaseCode?: string;

  @IsOptional()
  @IsString()
  @Transform(emptyStringToUndefined)
  envatoBuyerName?: string;

  @IsOptional()
  @IsEmail()
  @Transform(emptyStringToUndefined)
  envatoBuyerEmail?: string;
}
