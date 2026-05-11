import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AutomationJobStatus } from '../enums/automation-job-status.enum';
import { AutomationTriggerType } from '../enums/automation-trigger-type.enum';

export class CreateAutomationJobDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(AutomationJobStatus)
  status?: AutomationJobStatus;

  @IsOptional()
  @IsEnum(AutomationTriggerType)
  triggerType?: AutomationTriggerType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  cronExpression?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  eventKey?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  actionType?: string;

  @IsOptional()
  @IsObject()
  actionPayload?: Record<string, unknown> | null;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown> | null;
}
