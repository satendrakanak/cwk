import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { UpsertExamQuestionRuleDto } from './upsert-exam-question-rule.dto';

export class ReplaceExamQuestionRulesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpsertExamQuestionRuleDto)
  rules!: UpsertExamQuestionRuleDto[];
}
