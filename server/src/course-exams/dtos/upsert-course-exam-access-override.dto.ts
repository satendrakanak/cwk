import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertCourseExamAccessOverrideDto {
  @Type(() => Number)
  @IsInt()
  courseId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  extraAttempts!: number;

  @IsOptional()
  @IsBoolean()
  bypassAttendanceRequirement?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
