import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { EngagementAudience } from '../enums/engagement-audience.enum';

export class CreateNotificationBroadcastDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  href?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string | null;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsEnum(EngagementAudience)
  audience!: EngagementAudience;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @IsOptional()
  @IsObject()
  audienceFilters?: Record<string, unknown> | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;

  @IsOptional()
  @IsBoolean()
  sendNow?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  selectedUserIds?: number[];
}
