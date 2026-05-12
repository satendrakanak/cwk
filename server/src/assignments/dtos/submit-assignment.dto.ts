import { IsArray, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class SubmitAssignmentDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  link?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  attachmentIds?: number[];
}
