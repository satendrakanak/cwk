import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { CourseBatchStatus } from '../enums/course-batch-status.enum';

export class CreateCourseBatchDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 160)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Type(() => Number)
  courseId!: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  facultyId?: number;

  @IsOptional()
  @IsEnum(CourseBatchStatus)
  status?: CourseBatchStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;
}
