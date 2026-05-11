import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { EngagementAudience } from '../enums/engagement-audience.enum';

export class UpsertNotificationRuleDto {
  @IsString()
  @MaxLength(120)
  eventKey!: string;

  @IsString()
  @MaxLength(160)
  label!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsEnum(EngagementAudience)
  audience!: EngagementAudience;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsString()
  @MaxLength(180)
  titleTemplate!: string;

  @IsString()
  messageTemplate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  hrefTemplate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string | null;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown> | null;
}
