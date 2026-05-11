import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationBroadcastDto } from './create-notification-broadcast.dto';

export class UpdateNotificationBroadcastDto extends PartialType(
  CreateNotificationBroadcastDto,
) {}
