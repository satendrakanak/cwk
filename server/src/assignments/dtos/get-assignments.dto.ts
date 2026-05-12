import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AssignmentStatus } from '../enums/assignment-status.enum';

export class GetAssignmentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  facultyId?: number;
}
