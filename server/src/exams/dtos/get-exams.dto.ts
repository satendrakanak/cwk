import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/pagination/dtos/pagination-query.dto';
import { ExamStatus } from '../enums/exam-status.enum';

export class GetExamsDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  facultyId?: number;
}
