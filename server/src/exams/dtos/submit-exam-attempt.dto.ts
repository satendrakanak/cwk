import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class SubmitExamAnswerDto {
  @IsInt()
  @Type(() => Number)
  questionId!: number;

  @IsNotEmpty()
  answer!: string | number | boolean | string[] | Record<string, string> | null;
}

export class SubmitExamAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitExamAnswerDto)
  answers!: SubmitExamAnswerDto[];

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoSubmitted?: boolean;
}
