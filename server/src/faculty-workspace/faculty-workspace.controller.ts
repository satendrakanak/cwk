import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { AddBatchStudentDto } from './dtos/add-batch-student.dto';
import { CreateClassSessionDto } from './dtos/create-class-session.dto';
import { CreateCourseBatchDto } from './dtos/create-course-batch.dto';
import { GradeExamAttemptDto } from './dtos/grade-exam-attempt.dto';
import { UpdateClassSessionDto } from './dtos/update-class-session.dto';
import { UpdateCourseBatchDto } from './dtos/update-course-batch.dto';
import { FacultySessionReminderScheduler } from './providers/faculty-session-reminder.scheduler';
import { FacultyWorkspaceService } from './providers/faculty-workspace.service';

@Controller('faculty')
export class FacultyWorkspaceController {
  constructor(
    private readonly facultyWorkspaceService: FacultyWorkspaceService,
    private readonly facultySessionReminderScheduler: FacultySessionReminderScheduler,
  ) {
    this.facultySessionReminderScheduler.start();
  }

  @Get('workspace')
  getWorkspace(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getWorkspace(user);
  }

  @Get('batches')
  getBatches(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getBatches(user);
  }

  @Get('courses')
  getCourses(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getCourses(user);
  }

  @Get('courses/:courseId/students')
  getCourseStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getCourseStudents(courseId, user);
  }

  @Post('batches')
  createBatch(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateCourseBatchDto,
  ) {
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.createBatch(user, dto);
  }

  @Patch('batches/:id')
  updateBatch(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpdateCourseBatchDto,
  ) {
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.updateBatch(id, user, dto);
  }

  @Delete('batches/:id')
  deleteBatch(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.deleteBatch(id, user);
  }

  @Post('batches/:id/students')
  addBatchStudent(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: AddBatchStudentDto,
  ) {
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.addBatchStudent(id, user, dto);
  }

  @Delete('batches/:batchId/students/:studentId')
  removeBatchStudent(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.removeBatchStudent(
      batchId,
      studentId,
      user,
    );
  }

  @Get('sessions')
  getSessions(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getSessions(user);
  }

  @Get('recordings')
  getRecordings(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getRecordings(user);
  }

  @Delete('recordings/:id')
  deleteRecording(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.deleteRecording(id, user);
  }

  @Get('exam-attempts')
  getExamAttempts(@ActiveUser() user: ActiveUserData) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getExamAttempts(user);
  }

  @Get('exam-attempts/:id')
  getExamAttempt(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getExamAttempt(id, user);
  }

  @Patch('exam-attempts/:id/grade')
  gradeExamAttempt(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: GradeExamAttemptDto,
  ) {
    this.assertPermission(user, 'grade_exam_attempt');
    return this.facultyWorkspaceService.gradeExamAttempt(id, user, dto);
  }

  @Post('sessions')
  createSession(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateClassSessionDto,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.createSession(user, dto);
  }

  @Patch('sessions/:id')
  updateSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpdateClassSessionDto,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.updateSession(id, user, dto);
  }

  @Delete('sessions/:id')
  deleteSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.deleteSession(id, user);
  }

  @Post('sessions/:id/bbb/start')
  startBbbSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.startBbbSession(id, user);
  }

  @Get('sessions/:id/bbb/status')
  getBbbSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getFacultyBbbSessionStatus(id, user);
  }

  @Get('sessions/:id/recordings')
  getSessionRecordings(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getSessionRecordings(id, user);
  }

  @Post('sessions/:id/recordings/sync')
  syncSessionRecordings(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.syncSessionRecordings(id, user);
  }

  private isAdmin(user?: ActiveUserData) {
    return Boolean(user?.roles?.includes('admin'));
  }

  private assertPermission(
    user: ActiveUserData | undefined,
    permission: string,
  ) {
    if (this.isAdmin(user) || user?.permissions?.includes(permission)) {
      return;
    }

    throw new ForbiddenException(`Missing permission: ${permission}`);
  }
}
