import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { CorrectAnswerVisibility } from '../enums/correct-answer-visibility.enum';
import { ExamStatus } from '../enums/exam-status.enum';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  passingPercentage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  attemptLimit?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  randomizeQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  shuffleOptions?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  adaptiveMode?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  retryPenaltyPercentage?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  partialMarking?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  fullscreenRequired?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIpRanges?: string[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  serverTimerEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSubmitEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  reminderBeforeMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  cleanupExpiredAttemptsAfterDays?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  perQuestionFeedbackEnabled?: boolean;

  @IsOptional()
  @IsString()
  overallFeedback?: string;

  @IsOptional()
  @IsEnum(CorrectAnswerVisibility)
  correctAnswerVisibility?: CorrectAnswerVisibility;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  courseIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  facultyIds?: number[];
}
