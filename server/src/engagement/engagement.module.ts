import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { MailModule } from 'src/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Notification } from 'src/notifications/notification.entity';
import { User } from 'src/users/user.entity';
import { AutomationJob } from './automation-job.entity';
import { AutomationRunLog } from './automation-run-log.entity';
import { EngagementController } from './engagement.controller';
import { NotificationBroadcast } from './notification-broadcast.entity';
import { NotificationRule } from './notification-rule.entity';
import { EngagementService } from './providers/engagement.service';

@Module({
  imports: [
    EmailTemplatesModule,
    MailModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      AutomationJob,
      AutomationRunLog,
      NotificationBroadcast,
      NotificationRule,
      Notification,
      User,
      Enrollment,
    ]),
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
