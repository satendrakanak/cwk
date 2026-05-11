import { PartialType } from '@nestjs/mapped-types';
import { CreateAutomationJobDto } from './create-automation-job.dto';

export class UpdateAutomationJobDto extends PartialType(CreateAutomationJobDto) {}
