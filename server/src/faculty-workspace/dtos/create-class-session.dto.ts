import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { ClassSessionStatus } from '../enums/class-session-status.enum';

export class CreateClassSessionDto {
  @IsInt()
  @Type(() => Number)
  batchId!: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 180)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  meetingUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  reminderBeforeMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  reminderOffsetsMinutes?: number[];

  @IsOptional()
  @IsBoolean()
  allowRecordingAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  bbbRecord?: boolean;
}
