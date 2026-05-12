import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { AssignmentStatus } from '../enums/assignment-status.enum';
import { AssignmentSubmissionType } from '../enums/assignment-submission-type.enum';

export class CreateAssignmentDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsInt()
  courseId!: number;

  @IsOptional()
  @IsInt()
  chapterId?: number;

  @IsOptional()
  @IsInt()
  lectureId?: number;

  @IsOptional()
  @IsInt()
  batchId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  facultyIds?: number[];

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsEnum(AssignmentSubmissionType)
  submissionType?: AssignmentSubmissionType;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsBoolean()
  allowResubmission?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  resourceIds?: number[];
}
