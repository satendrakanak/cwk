import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseBatchDto } from './create-course-batch.dto';

export class UpdateCourseBatchDto extends PartialType(CreateCourseBatchDto) {}
