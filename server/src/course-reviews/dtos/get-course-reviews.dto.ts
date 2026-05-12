import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsPositive } from 'class-validator';

export class GetCourseReviewsDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number = 5;

  @IsOptional()
  @IsIn(['recent', 'oldest', 'positive', 'average', 'negative'])
  filter?: 'recent' | 'oldest' | 'positive' | 'average' | 'negative' =
    'recent';
}
