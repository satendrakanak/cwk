import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AddBatchStudentDto {
  @IsInt()
  @Type(() => Number)
  userId!: number;
}
