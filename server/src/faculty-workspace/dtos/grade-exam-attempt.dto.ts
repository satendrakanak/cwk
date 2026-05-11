import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class GradeQuestionResultDto {
  @IsInt()
  @Type(() => Number)
  questionId!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  score!: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class GradeExamAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeQuestionResultDto)
  questionResults!: GradeQuestionResultDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  percentageOverride?: number;
}
