import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertBbbSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsUrl({ require_tld: false })
  apiUrl?: string;

  @IsOptional()
  @IsString()
  sharedSecret?: string;

  @IsOptional()
  @IsBoolean()
  defaultRecord?: boolean;

  @IsOptional()
  @IsBoolean()
  autoStartRecording?: boolean;

  @IsOptional()
  @IsBoolean()
  allowStartStopRecording?: boolean;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Type(() => Number)
  meetingExpireIfNoUserJoinedInMinutes?: number;
}
