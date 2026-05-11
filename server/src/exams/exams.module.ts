import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { CourseExamAccessOverride } from 'src/course-exams/course-exam-access-override.entity';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { EmailTemplatesModule } from 'src/email-templates/email-templates.module';
import { Lecture } from 'src/lectures/lecture.entity';
import { UserProgres } from 'src/user-progress/user-progres.entity';
import { User } from 'src/users/user.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamQuestionRule } from './exam-question-rule.entity';
import { Exam } from './exam.entity';
import { ExamsController } from './exams.controller';
import { ExamEmailProvider } from './providers/exam-email.provider';
import { ExamsService } from './providers/exams.service';
import { LegacyCourseExamMigrationService } from './providers/legacy-course-exam-migration.service';
import { Question } from './question.entity';
import { QuestionBankCategory } from './question-bank-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exam,
      ExamAttempt,
      ExamQuestionRule,
      Question,
      QuestionBankCategory,
      Course,
      CourseExamAccessOverride,
      Enrollment,
      Lecture,
      UserProgres,
      User,
    ]),
    PaginationModule,
    EmailTemplatesModule,
  ],
  controllers: [ExamsController],
  providers: [ExamsService, LegacyCourseExamMigrationService, ExamEmailProvider],
  exports: [ExamsService, TypeOrmModule],
})
export class ExamsModule {}
