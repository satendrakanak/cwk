import { PartialType } from '@nestjs/swagger';
import { CreateQuestionBankCategoryDto } from './create-question-bank-category.dto';

export class UpdateQuestionBankCategoryDto extends PartialType(
  CreateQuestionBankCategoryDto,
) {}
