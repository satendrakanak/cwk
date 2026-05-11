import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateIf,
} from 'class-validator';
import { ExamQuestionRuleType } from '../enums/exam-question-rule-type.enum';

export class UpsertExamQuestionRuleDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @IsEnum(ExamQuestionRuleType)
  ruleType!: ExamQuestionRuleType;

  @ValidateIf((dto: UpsertExamQuestionRuleDto) => {
    return dto.ruleType === ExamQuestionRuleType.FixedQuestion;
  })
  @IsInt()
  @Type(() => Number)
  questionId?: number;

  @ValidateIf((dto: UpsertExamQuestionRuleDto) => {
    return dto.ruleType === ExamQuestionRuleType.RandomFromCategory;
  })
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  order?: number;

  @ValidateIf((dto: UpsertExamQuestionRuleDto) => {
    return dto.ruleType === ExamQuestionRuleType.RandomFromCategory;
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  randomQuestionCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pointsOverride?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  negativeMarksOverride?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRequired?: boolean;
}
