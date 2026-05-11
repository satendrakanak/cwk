import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from 'src/settings/settings.module';
import { User } from 'src/users/user.entity';
import { Notification } from './notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushSubscription } from './push-subscription.entity';

@Module({
  imports: [
    SettingsModule,
    TypeOrmModule.forFeature([Notification, PushSubscription, User]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
