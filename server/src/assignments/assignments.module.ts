import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from 'src/chapters/chapter.entity';
import { Course } from 'src/courses/course.entity';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { CourseBatch } from 'src/faculty-workspace/course-batch.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { User } from 'src/users/user.entity';
import { AssignmentSubmission } from './assignment-submission.entity';
import { Assignment } from './assignment.entity';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './providers/assignments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assignment,
      AssignmentSubmission,
      Course,
      Chapter,
      Lecture,
      CourseBatch,
      User,
      Enrollment,
    ]),
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService, TypeOrmModule],
})
export class AssignmentsModule {}
