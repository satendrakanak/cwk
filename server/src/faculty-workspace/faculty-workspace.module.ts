import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { ExamAttempt } from 'src/exams/exam-attempt.entity';
import { Exam } from 'src/exams/exam.entity';
import { SettingsModule } from 'src/settings/settings.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Upload } from 'src/uploads/upload.entity';
import { UploadsModule } from 'src/uploads/uploads.module';
import { User } from 'src/users/user.entity';
import { BatchStudent } from './batch-student.entity';
import { ClassAttendance } from './class-attendance.entity';
import { ClassRecording } from './class-recording.entity';
import { ClassSession } from './class-session.entity';
import { ClassSessionsController } from './class-sessions.controller';
import { CourseBatch } from './course-batch.entity';
import { FacultyWorkspaceController } from './faculty-workspace.controller';
import { BigBlueButtonProvider } from './providers/bigbluebutton.provider';
import { FacultySessionEmailProvider } from './providers/faculty-session-email.provider';
import { FacultySessionReminderScheduler } from './providers/faculty-session-reminder.scheduler';
import { FacultyWorkspaceService } from './providers/faculty-workspace.service';

@Module({
  imports: [
    SettingsModule,
    NotificationsModule,
    UploadsModule,
    EmailTemplatesModule,
    TypeOrmModule.forFeature([
      Course,
      Enrollment,
      Exam,
      ExamAttempt,
      User,
      CourseBatch,
      BatchStudent,
      ClassAttendance,
      ClassSession,
      ClassRecording,
      Upload,
    ]),
  ],
  controllers: [FacultyWorkspaceController, ClassSessionsController],
  providers: [
    FacultyWorkspaceService,
    BigBlueButtonProvider,
    FacultySessionEmailProvider,
    FacultySessionReminderScheduler,
    {
      provide: 'FACULTY_SESSION_REMINDER_SCHEDULER_BOOTSTRAP',
      inject: [FacultySessionReminderScheduler],
      useFactory: (scheduler: FacultySessionReminderScheduler) => {
        scheduler.start();
        return true;
      },
    },
  ],
})
export class FacultyWorkspaceModule {}
