import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/certificate.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { Course } from 'src/courses/course.entity';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';
import { UserProgres } from 'src/user-progress/user-progres.entity';
import { User } from 'src/users/user.entity';
import { ExamAttempt } from 'src/exams/exam-attempt.entity';
import { Exam } from 'src/exams/exam.entity';
import { ClassAttendance } from 'src/faculty-workspace/class-attendance.entity';
import { ClassSession } from 'src/faculty-workspace/class-session.entity';
import { CourseExamAccessOverride } from './course-exam-access-override.entity';
import { CourseExamAttempt } from './course-exam-attempt.entity';
import { CourseExamsController } from './course-exams.controller';
import { CourseExamEmailProvider } from './providers/course-exam-email.provider';
import { CourseExamsService } from './providers/course-exams.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Enrollment,
      Lecture,
      UserProgres,
      Certificate,
      CourseExamAccessOverride,
      CourseExamAttempt,
      Exam,
      ExamAttempt,
      ClassAttendance,
      ClassSession,
    ]),
    EmailTemplatesModule,
  ],
  controllers: [CourseExamsController],
  providers: [CourseExamsService, CourseExamEmailProvider],
  exports: [CourseExamsService, TypeOrmModule],
})
export class CourseExamsModule {}
