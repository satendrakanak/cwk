import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AssignmentSubmissionStatus } from '../enums/assignment-submission-status.enum';

export class ReviewAssignmentSubmissionDto {
  @IsEnum(AssignmentSubmissionStatus)
  status!: AssignmentSubmissionStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
