import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { QuestionType } from '../enums/question-type.enum';
import { QuestionContent } from '../types/question-content.type';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsOptional()
  @IsObject()
  content?: QuestionContent;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultPoints?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultNegativeMarks?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  allowPartialMarking?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;
}
