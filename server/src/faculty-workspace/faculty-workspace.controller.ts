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
import { LicensesService } from 'src/licenses/providers/licenses.service';
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
    private readonly licensesService: LicensesService,
  ) {
    this.facultySessionReminderScheduler.start();
  }

  @Get('workspace')
  async getWorkspace(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getWorkspace(user);
  }

  @Get('batches')
  async getBatches(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getBatches(user);
  }

  @Get('courses')
  async getCourses(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getCourses(user);
  }

  @Get('courses/:courseId/students')
  async getCourseStudents(
    @Param('courseId', ParseIntPipe) courseId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getCourseStudents(courseId, user);
  }

  @Post('batches')
  async createBatch(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateCourseBatchDto,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.createBatch(user, dto);
  }

  @Patch('batches/:id')
  async updateBatch(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpdateCourseBatchDto,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.updateBatch(id, user, dto);
  }

  @Delete('batches/:id')
  async deleteBatch(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.deleteBatch(id, user);
  }

  @Post('batches/:id/students')
  async addBatchStudent(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: AddBatchStudentDto,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.addBatchStudent(id, user, dto);
  }

  @Delete('batches/:batchId/students/:studentId')
  async removeBatchStudent(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Param('studentId', ParseIntPipe) studentId: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('faculty');
    this.assertPermission(user, 'manage_faculty_batches');
    return this.facultyWorkspaceService.removeBatchStudent(
      batchId,
      studentId,
      user,
    );
  }

  @Get('sessions')
  async getSessions(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getSessions(user);
  }

  @Get('recordings')
  async getRecordings(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getRecordings(user);
  }

  @Delete('recordings/:id')
  async deleteRecording(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.deleteRecording(id, user);
  }

  @Get('exam-attempts')
  async getExamAttempts(@ActiveUser() user: ActiveUserData) {
    await this.assertFeature('exams');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getExamAttempts(user);
  }

  @Get('exam-attempts/:id')
  async getExamAttempt(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('exams');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getExamAttempt(id, user);
  }

  @Patch('exam-attempts/:id/grade')
  async gradeExamAttempt(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: GradeExamAttemptDto,
  ) {
    await this.assertFeature('exams');
    this.assertPermission(user, 'grade_exam_attempt');
    return this.facultyWorkspaceService.gradeExamAttempt(id, user, dto);
  }

  @Post('sessions')
  async createSession(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateClassSessionDto,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.createSession(user, dto);
  }

  @Patch('sessions/:id')
  async updateSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpdateClassSessionDto,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.updateSession(id, user, dto);
  }

  @Delete('sessions/:id')
  async deleteSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.deleteSession(id, user);
  }

  @Post('sessions/:id/bbb/start')
  async startBbbSession(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.startBbbSession(id, user);
  }

  @Get('sessions/:id/bbb/status')
  async getBbbSessionStatus(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getFacultyBbbSessionStatus(id, user);
  }

  @Get('sessions/:id/recordings')
  async getSessionRecordings(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'view_faculty_workspace');
    return this.facultyWorkspaceService.getSessionRecordings(id, user);
  }

  @Post('sessions/:id/recordings/sync')
  async syncSessionRecordings(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.assertFeature('liveClasses');
    this.assertPermission(user, 'manage_faculty_calendar');
    return this.facultyWorkspaceService.syncSessionRecordings(id, user);
  }

  private isAdmin(user?: ActiveUserData) {
    return Boolean(
      user?.roles?.includes('admin') || user?.roles?.includes('super_admin'),
    );
  }

  private isFaculty(user?: ActiveUserData) {
    return Boolean(user?.roles?.includes('faculty'));
  }

  private async assertFeature(
    feature: 'faculty' | 'liveClasses' | 'exams',
  ) {
    await this.licensesService.assertFeature(feature);
  }

  private assertPermission(
    user: ActiveUserData | undefined,
    permission: string,
  ) {
    if (
      this.isAdmin(user) ||
      this.isFaculty(user) ||
      user?.permissions?.includes(permission)
    ) {
      return;
    }

    throw new ForbiddenException(`Missing permission: ${permission}`);
  }
}
