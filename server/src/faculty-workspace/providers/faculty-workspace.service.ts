import { randomBytes, randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { Course } from 'src/courses/course.entity';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { ExamAttempt } from 'src/exams/exam-attempt.entity';
import { Exam } from 'src/exams/exam.entity';
import { ExamAttemptStatus } from 'src/exams/enums/exam-attempt-status.enum';
import { ExamStatus } from 'src/exams/enums/exam-status.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { FileTypes } from 'src/uploads/enums/file-types.enum';
import { UploadStatus } from 'src/uploads/enums/upload-status.enum';
import { UploadsService } from 'src/uploads/providers/uploads.service';
import { S3Provider } from 'src/uploads/providers/s3.provider';
import { Upload } from 'src/uploads/upload.entity';
import { User } from 'src/users/user.entity';
import { Brackets, Repository } from 'typeorm';
import { AddBatchStudentDto } from '../dtos/add-batch-student.dto';
import { CreateClassSessionDto } from '../dtos/create-class-session.dto';
import { CreateCourseBatchDto } from '../dtos/create-course-batch.dto';
import { GradeExamAttemptDto } from '../dtos/grade-exam-attempt.dto';
import { UpdateClassSessionDto } from '../dtos/update-class-session.dto';
import { UpdateCourseBatchDto } from '../dtos/update-course-batch.dto';
import { BatchStudent } from '../batch-student.entity';
import { ClassAttendance } from '../class-attendance.entity';
import { ClassRecording } from '../class-recording.entity';
import { ClassSession } from '../class-session.entity';
import { CourseBatch } from '../course-batch.entity';
import { ClassRecordingStatus } from '../enums/class-recording-status.enum';
import { BatchStudentStatus } from '../enums/batch-student-status.enum';
import { ClassSessionStatus } from '../enums/class-session-status.enum';
import { CourseBatchStatus } from '../enums/course-batch-status.enum';
import { BigBlueButtonProvider } from './bigbluebutton.provider';

const FACULTY_CLASS_START_EARLY_MINUTES = 30;
const LEARNER_CLASS_JOIN_EARLY_MINUTES = 10;
const CLASS_JOIN_GRACE_MINUTES = 15;

@Injectable()
export class FacultyWorkspaceService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepository: Repository<ExamAttempt>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(CourseBatch)
    private readonly courseBatchRepository: Repository<CourseBatch>,

    @InjectRepository(BatchStudent)
    private readonly batchStudentRepository: Repository<BatchStudent>,

    @InjectRepository(ClassAttendance)
    private readonly classAttendanceRepository: Repository<ClassAttendance>,

    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,

    @InjectRepository(ClassRecording)
    private readonly classRecordingRepository: Repository<ClassRecording>,

    @InjectRepository(Upload)
    private readonly uploadRepository: Repository<Upload>,

    private readonly bigBlueButtonProvider: BigBlueButtonProvider,
    private readonly s3Provider: S3Provider,
    private readonly uploadsService: UploadsService,
    private readonly mediaFileMappingService: MediaFileMappingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getWorkspace(user: ActiveUserData) {
    this.assertFaculty(user);
    await this.markPastSessionsCompleted(new Date());

    const facultyId = user.sub;
    const courses = await this.getAssignedCourses(facultyId);
    const courseIds = courses.map((course) => course.id);
    const [studentsCount, exams, recentAttempts, upcomingSessions, batches] =
      await Promise.all([
        this.getStudentsCount(courseIds),
        this.getAssignedExams(facultyId, courseIds),
        this.getRecentAttempts(courseIds),
        this.getUpcomingSessions(facultyId),
        this.getDashboardBatches(facultyId),
      ]);
    const reminderCount = upcomingSessions.reduce(
      (total, session) =>
        total + this.getPendingReminderOffsets(session).length,
      0,
    );

    return {
      summary: {
        assignedCourses: courses.length,
        publishedCourses: courses.filter((course) => course.isPublished).length,
        selfLearningCourses: courses.filter(
          (course) => !course.mode || course.mode === 'self_learning',
        ).length,
        facultyLedCourses: courses.filter(
          (course) => course.mode === 'faculty_led',
        ).length,
        hybridCourses: courses.filter((course) => course.mode === 'hybrid')
          .length,
        activeStudents: studentsCount,
        assignedExams: exams.length,
        pendingManualReviews: recentAttempts.filter(
          (attempt) =>
            attempt.status === ExamAttemptStatus.PendingManualGrading,
        ).length,
        upcomingClasses: upcomingSessions.length,
        activeBatches: batches.filter(
          (batch) => this.getBatchLifecycle(batch) === 'active',
        ).length,
        upcomingBatches: batches.filter(
          (batch) => this.getBatchLifecycle(batch) === 'upcoming',
        ).length,
        pendingReminders: reminderCount,
      },
      courses: courses.slice(0, 6).map((course) => ({
        id: course.id,
        title: course.title,
        slug: course.slug,
        isPublished: course.isPublished,
        mode: course.mode,
        duration: course.duration,
        studentsCount:
          course.enrollments?.filter((item) => item.isActive).length ?? 0,
      })),
      exams: exams.slice(0, 6).map((exam) => ({
        id: exam.id,
        title: exam.title,
        slug: exam.slug,
        status: exam.status,
        courses:
          exam.courses?.map((course) => ({
            id: course.id,
            title: course.title,
            slug: course.slug,
          })) ?? [],
        attemptsCount:
          exam.attempts?.filter(
            (attempt) => attempt.status !== ExamAttemptStatus.InProgress,
          ).length ?? 0,
      })),
      recentAttempts: recentAttempts.slice(0, 8).map((attempt) => ({
        id: attempt.id,
        learnerName:
          [attempt.user?.firstName, attempt.user?.lastName]
            .filter(Boolean)
            .join(' ') ||
          attempt.user?.email ||
          'Learner',
        courseTitle: attempt.course?.title || 'Course',
        examTitle: attempt.exam?.title || 'Exam',
        percentage: Number(attempt.percentage || 0),
        passed: attempt.passed,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
      })),
      upcomingSessions: upcomingSessions.slice(0, 6).map((session) => ({
        id: session.id,
        title: session.title,
        batchName: session.batch.name,
        courseTitle: session.course.title,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        status: session.status,
        meetingUrl: session.meetingUrl,
        hasBbbMeeting: Boolean(session.bbbMeetingId),
        reminderOffsetsMinutes: this.getReminderOffsets(session),
        sentReminderOffsetsMinutes: session.sentReminderOffsetsMinutes ?? [],
      })),
      batches: batches.slice(0, 6).map((batch) => ({
        id: batch.id,
        name: batch.name,
        status: this.getBatchLifecycle(batch),
        rawStatus: batch.status,
        courseTitle: batch.course.title,
        startDate: batch.startDate,
        endDate: batch.endDate,
        studentsCount:
          batch.students?.filter(
            (student) => student.status === BatchStudentStatus.Active,
          ).length ?? 0,
        sessionsCount: batch.sessions?.length ?? 0,
      })),
    };
  }

  async getBatches(user: ActiveUserData) {
    this.assertFaculty(user);

    return this.courseBatchRepository.find({
      where: this.isAdmin(user) ? {} : { faculty: { id: user.sub } },
      relations: [
        'course',
        'faculty',
        'students',
        'students.student',
        'sessions',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getCourses(user: ActiveUserData) {
    this.assertFaculty(user);
    const courses = await this.getAssignedCourses(user.sub);

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      isPublished: course.isPublished,
      mode: course.mode,
      duration: course.duration,
      studentsCount:
        course.enrollments?.filter((item) => item.isActive).length ?? 0,
    }));
  }

  async getCourseStudents(courseId: number, user: ActiveUserData) {
    await this.getCourseForFaculty(courseId, user);

    const enrollments = await this.enrollmentRepository.find({
      where: {
        course: { id: courseId },
        isActive: true,
      },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });

    return enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      user: {
        id: enrollment.user.id,
        firstName: enrollment.user.firstName,
        lastName: enrollment.user.lastName,
        email: enrollment.user.email,
      },
    }));
  }

  async getLearnerSessions(user: ActiveUserData) {
    const sessions = await this.classSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.batch', 'batch')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.faculty', 'faculty')
      .leftJoinAndSelect(
        'session.attendances',
        'attendance',
        'attendance.userId = :userId AND attendance.role = :learnerRole',
        { userId: user.sub, learnerRole: 'learner' },
      )
      .leftJoinAndSelect('attendance.user', 'attendanceUser')
      .leftJoin('batch.students', 'batchStudent')
      .leftJoin('batchStudent.student', 'student')
      .where('student.id = :userId', { userId: user.sub })
      .andWhere('batchStudent.status = :studentStatus', {
        studentStatus: BatchStudentStatus.Active,
      })
      .andWhere('session.status != :cancelled', {
        cancelled: ClassSessionStatus.Cancelled,
      })
      .orderBy('session.startsAt', 'ASC')
      .getMany();

    return Promise.all(
      sessions.map((session) => this.mapClassSessionWithBbbState(session)),
    );
  }

  async getLearnerRecordings(user: ActiveUserData) {
    const recordings = await this.classRecordingRepository
      .createQueryBuilder('recording')
      .leftJoinAndSelect('recording.session', 'session')
      .leftJoin(
        'session.attendances',
        'learnerAttendance',
        'learnerAttendance.role = :learnerRole',
      )
      .leftJoin(
        'learnerAttendance.user',
        'attendanceUser',
        'attendanceUser.id = :userId',
      )
      .leftJoinAndSelect('recording.course', 'course')
      .leftJoinAndSelect('recording.batch', 'batch')
      .leftJoinAndSelect('recording.faculty', 'faculty')
      .leftJoinAndSelect('recording.upload', 'upload')
      .leftJoin('batch.students', 'batchStudent')
      .leftJoin('batchStudent.student', 'student')
      .where('student.id = :userId', { userId: user.sub })
      .setParameter('learnerRole', 'learner')
      .andWhere('batchStudent.status = :studentStatus', {
        studentStatus: BatchStudentStatus.Active,
      })
      .andWhere('session.allowRecordingAccess = true')
      .andWhere('session.status != :cancelled', {
        cancelled: ClassSessionStatus.Cancelled,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('attendanceUser.id = :userId').orWhere(
            `NOT EXISTS (
              SELECT 1 FROM class_attendance attendance_check
              WHERE attendance_check."sessionId" = session.id
              AND attendance_check.role = :learnerRole
            )`,
          );
        }),
      )
      .andWhere('recording.status IN (:...statuses)', {
        statuses: [
          ClassRecordingStatus.Available,
          ClassRecordingStatus.Archived,
        ],
      })
      .orderBy('recording.recordedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('recording.createdAt', 'DESC')
      .getMany();

    return recordings.map((recording) => this.mapClassRecording(recording));
  }

  async createBatch(user: ActiveUserData, dto: CreateCourseBatchDto) {
    this.assertFaculty(user);

    const course = await this.getCourseForFaculty(dto.courseId, user);
    const facultyId = this.isAdmin(user) ? dto.facultyId || user.sub : user.sub;
    const faculty = await this.userRepository.findOne({
      where: { id: facultyId },
      relations: ['roles'],
    });

    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const batch = this.courseBatchRepository.create({
      name: dto.name,
      code: dto.code || null,
      description: dto.description || null,
      course,
      faculty,
      status: dto.status ?? CourseBatchStatus.Draft,
      startDate: dto.startDate || null,
      endDate: dto.endDate || null,
      capacity: dto.capacity ?? null,
    });

    return this.courseBatchRepository.save(batch);
  }

  async updateBatch(
    id: number,
    user: ActiveUserData,
    dto: UpdateCourseBatchDto,
  ) {
    const batch = await this.getBatchForFaculty(id, user);

    if (dto.courseId) {
      batch.course = await this.getCourseForFaculty(dto.courseId, user);
    }

    if (dto.facultyId && this.isAdmin(user)) {
      const faculty = await this.userRepository.findOne({
        where: { id: dto.facultyId },
      });

      if (!faculty) {
        throw new NotFoundException('Faculty not found');
      }

      batch.faculty = faculty;
    }

    if (dto.name !== undefined) batch.name = dto.name;
    if (dto.code !== undefined) batch.code = dto.code || null;
    if (dto.description !== undefined)
      batch.description = dto.description || null;
    if (dto.status !== undefined) batch.status = dto.status;
    if (dto.startDate !== undefined) batch.startDate = dto.startDate || null;
    if (dto.endDate !== undefined) batch.endDate = dto.endDate || null;
    if (dto.capacity !== undefined) batch.capacity = dto.capacity ?? null;

    return this.courseBatchRepository.save(batch);
  }

  async deleteBatch(id: number, user: ActiveUserData) {
    await this.getBatchForFaculty(id, user);
    await this.courseBatchRepository.softDelete(id);

    return { message: 'Batch deleted successfully' };
  }

  async addBatchStudent(
    batchId: number,
    user: ActiveUserData,
    dto: AddBatchStudentDto,
  ) {
    const batch = await this.getBatchForFaculty(batchId, user);
    this.assertBatchCanManageStudents(batch);

    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        course: { id: batch.course.id },
        user: { id: dto.userId },
        isActive: true,
      },
      relations: ['course', 'user'],
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student must be actively enrolled in this course before joining the batch',
      );
    }

    const existing = await this.batchStudentRepository.findOne({
      where: { batch: { id: batch.id }, student: { id: dto.userId } },
      relations: ['batch', 'student', 'enrollment'],
    });

    if (existing) {
      existing.status = BatchStudentStatus.Active;
      existing.enrollment = enrollment;
      return this.batchStudentRepository.save(existing);
    }

    if (batch.capacity) {
      const activeCount = await this.batchStudentRepository.count({
        where: {
          batch: { id: batch.id },
          status: BatchStudentStatus.Active,
        },
      });

      if (activeCount >= batch.capacity) {
        throw new BadRequestException('Batch capacity is full');
      }
    }

    return this.batchStudentRepository.save(
      this.batchStudentRepository.create({
        batch,
        student: enrollment.user,
        enrollment,
        status: BatchStudentStatus.Active,
      }),
    );
  }

  async removeBatchStudent(
    batchId: number,
    studentId: number,
    user: ActiveUserData,
  ) {
    const batch = await this.getBatchForFaculty(batchId, user);
    this.assertBatchCanManageStudents(batch);

    const student = await this.batchStudentRepository.findOne({
      where: { batch: { id: batchId }, student: { id: studentId } },
      relations: ['batch', 'student'],
    });

    if (!student) {
      throw new NotFoundException('Batch student not found');
    }

    student.status = BatchStudentStatus.Removed;
    return this.batchStudentRepository.save(student);
  }

  async getSessions(user: ActiveUserData) {
    this.assertFaculty(user);
    await this.markPastSessionsCompleted(new Date());

    const sessions = await this.classSessionRepository.find({
      where: this.isAdmin(user) ? {} : { faculty: { id: user.sub } },
      relations: [
        'batch',
        'course',
        'faculty',
        'recordings',
        'recordings.upload',
      ],
      order: { startsAt: 'ASC' },
    });

    return sessions.map((session) => this.mapClassSession(session));
  }

  async getRecordings(user: ActiveUserData) {
    this.assertFaculty(user);

    const query = this.classRecordingRepository
      .createQueryBuilder('recording')
      .leftJoinAndSelect('recording.session', 'session')
      .leftJoinAndSelect('recording.course', 'course')
      .leftJoinAndSelect('recording.batch', 'batch')
      .leftJoinAndSelect(
        'session.attendances',
        'recordingAttendance',
        'recordingAttendance.role = :learnerAttendanceRole',
        { learnerAttendanceRole: 'learner' },
      )
      .leftJoinAndSelect('recordingAttendance.user', 'recordingLearner')
      .leftJoinAndSelect('recording.faculty', 'faculty')
      .leftJoinAndSelect('recording.upload', 'upload')
      .orderBy('recording.recordedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('recording.createdAt', 'DESC');

    if (!this.isAdmin(user)) {
      query.where('faculty.id = :facultyId', { facultyId: user.sub });
    }

    const recordings = await query.getMany();

    return recordings.map((recording) => this.mapClassRecording(recording));
  }

  async deleteRecording(id: number, user: ActiveUserData) {
    this.assertFaculty(user);

    const recording = await this.classRecordingRepository.findOne({
      where: { id },
      relations: ['faculty', 'upload'],
    });

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    if (!this.isAdmin(user) && recording.faculty?.id !== user.sub) {
      throw new ForbiddenException('You cannot delete this recording');
    }

    const uploadId = recording.upload?.id;

    if (uploadId) {
      await this.uploadsService.delete(uploadId);
    }

    await this.classRecordingRepository.delete(id);

    return { message: 'Recording deleted successfully' };
  }

  async getExamAttempts(user: ActiveUserData) {
    this.assertFaculty(user);
    const courses = await this.getAssignedCourses(user.sub);
    const courseIds = courses.map((course) => course.id);

    if (!courseIds.length) {
      return [];
    }

    const attempts = await this.examAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.exam', 'exam')
      .leftJoinAndSelect('attempt.course', 'course')
      .leftJoinAndSelect('attempt.user', 'user')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('attempt.status != :inProgress', {
        inProgress: ExamAttemptStatus.InProgress,
      })
      .orderBy('attempt.submittedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('attempt.createdAt', 'DESC')
      .getMany();

    return attempts.map((attempt) => this.mapFacultyAttempt(attempt));
  }

  async getExamAttempt(id: number, user: ActiveUserData) {
    const attempt = await this.getExamAttemptForFaculty(id, user);
    return {
      ...this.mapFacultyAttempt(attempt),
      answers: attempt.answers,
      questionResults: attempt.questionResults,
    };
  }

  async gradeExamAttempt(
    id: number,
    user: ActiveUserData,
    dto: GradeExamAttemptDto,
  ) {
    const attempt = await this.getExamAttemptForFaculty(id, user);

    if (attempt.status === ExamAttemptStatus.InProgress) {
      throw new BadRequestException('Attempt is still in progress');
    }

    const resultMap = new Map(
      dto.questionResults.map((result) => [result.questionId, result]),
    );
    const questionResults = attempt.questionResults.map((result) => {
      const manual = resultMap.get(result.questionId);
      if (!manual) {
        return result;
      }

      const score = Math.min(
        Math.max(manual.score, 0),
        Number(result.maxScore || 0),
      );

      return {
        ...result,
        score,
        isCorrect: manual.isCorrect ?? score >= Number(result.maxScore || 0),
        needsManualGrading: false,
        feedback: manual.feedback ?? result.feedback,
      };
    });
    const score = questionResults.reduce(
      (total, result) => total + Number(result.score || 0),
      0,
    );
    const maxScore = questionResults.reduce(
      (total, result) => total + Number(result.maxScore || 0),
      0,
    );
    const percentage =
      dto.percentageOverride ?? (maxScore ? (score / maxScore) * 100 : 0);

    attempt.questionResults = questionResults;
    attempt.score = this.toDecimal(score);
    attempt.maxScore = this.toDecimal(maxScore);
    attempt.percentage = this.toDecimal(percentage);
    attempt.passed = percentage >= Number(attempt.exam.passingPercentage || 0);
    attempt.needsManualGrading = false;
    attempt.status = ExamAttemptStatus.Graded;
    attempt.manualGradedAt = new Date();
    attempt.manualGradedBy = { id: user.sub } as User;

    const saved = await this.examAttemptRepository.save(attempt);
    return this.getExamAttempt(saved.id, user);
  }

  async createSession(user: ActiveUserData, dto: CreateClassSessionDto) {
    const batch = await this.getBatchForFaculty(dto.batchId, user);
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    this.assertBatchCanScheduleClass(batch);
    this.assertValidSessionWindow(startsAt, endsAt);
    await this.assertCourseMonthlyClassLimit(batch.course, startsAt);

    const session = await this.classSessionRepository.save(
      this.classSessionRepository.create({
        batch,
        course: batch.course,
        faculty: batch.faculty,
        title: dto.title,
        description: dto.description || null,
        startsAt,
        endsAt,
        timezone: dto.timezone || 'Asia/Kolkata',
        meetingUrl: dto.meetingUrl || null,
        location: dto.location || null,
        status: dto.status ?? ClassSessionStatus.Scheduled,
        reminderBeforeMinutes: dto.reminderBeforeMinutes ?? 60,
        reminderOffsetsMinutes: this.normalizeReminderOffsets(dto),
        bbbRecord: dto.bbbRecord ?? true,
        allowRecordingAccess: dto.allowRecordingAccess ?? false,
      }),
    );

    this.notifyStudentsAboutSessionSafely(session, 'scheduled');

    return session;
  }

  async updateSession(
    id: number,
    user: ActiveUserData,
    dto: UpdateClassSessionDto,
  ) {
    const session = await this.getSessionForFaculty(id, user);

    if (dto.batchId && dto.batchId !== session.batch.id) {
      const batch = await this.getBatchForFaculty(dto.batchId, user);
      this.assertBatchCanScheduleClass(batch);
      session.batch = batch;
      session.course = batch.course;
      session.faculty = batch.faculty;
    }

    if (
      dto.batchId === undefined &&
      (dto.startsAt !== undefined ||
        dto.endsAt !== undefined ||
        dto.status === ClassSessionStatus.Scheduled)
    ) {
      this.assertBatchCanScheduleClass(session.batch);
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : session.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : session.endsAt;
    this.assertValidSessionWindow(startsAt, endsAt);
    if (dto.startsAt !== undefined || dto.batchId !== undefined) {
      await this.assertCourseMonthlyClassLimit(session.course, startsAt, session.id);
    }

    if (dto.title !== undefined) session.title = dto.title;
    if (dto.description !== undefined)
      session.description = dto.description || null;
    session.startsAt = startsAt;
    session.endsAt = endsAt;
    if (dto.timezone !== undefined)
      session.timezone = dto.timezone || 'Asia/Kolkata';
    if (dto.meetingUrl !== undefined)
      session.meetingUrl = dto.meetingUrl || null;
    if (dto.location !== undefined) session.location = dto.location || null;
    if (dto.status !== undefined) session.status = dto.status;
    if (dto.reminderBeforeMinutes !== undefined) {
      session.reminderBeforeMinutes = dto.reminderBeforeMinutes;
    }
    if (
      dto.reminderOffsetsMinutes !== undefined ||
      dto.reminderBeforeMinutes !== undefined
    ) {
      session.reminderOffsetsMinutes = this.normalizeReminderOffsets(dto);
      session.reminderBeforeMinutes = session.reminderOffsetsMinutes[0] ?? 60;
    }
    if (
      dto.startsAt !== undefined ||
      dto.reminderOffsetsMinutes !== undefined ||
      dto.reminderBeforeMinutes !== undefined ||
      dto.status === ClassSessionStatus.Scheduled
    ) {
      session.sentReminderOffsetsMinutes = null;
      session.reminderSentAt = null;
    }
    if (dto.allowRecordingAccess !== undefined) {
      session.allowRecordingAccess = dto.allowRecordingAccess;
    }
    if (dto.bbbRecord !== undefined) {
      session.bbbRecord = dto.bbbRecord;
    }

    const savedSession = await this.classSessionRepository.save(session);

    if (dto.startsAt !== undefined || dto.endsAt !== undefined) {
      this.notifyStudentsAboutSessionSafely(savedSession, 'updated');
    }

    return savedSession;
  }

  async startBbbSession(id: number, user: ActiveUserData) {
    const session = await this.getSessionForFaculty(id, user);
    this.assertSessionCanStart(session);
    if (session.status === ClassSessionStatus.Completed) {
      session.status = ClassSessionStatus.Scheduled;
    }

    const prepared = await this.ensureBbbMeeting(session);
    const joinUrl = await this.bigBlueButtonProvider.getJoinUrl({
      meetingID: prepared.bbbMeetingId!,
      fullName: this.getUserDisplayName(session.faculty),
      role: 'MODERATOR',
      password: prepared.bbbModeratorPassword!,
      userID: `faculty-${session.faculty.id}`,
    });
    await this.trackClassAttendance(session, session.faculty, 'faculty');

    return { joinUrl };
  }

  async joinBbbSession(id: number, user: ActiveUserData) {
    const session = await this.getSessionForLearner(id, user);
    await this.assertSessionCanJoin(session);

    const learner = await this.userRepository.findOne({
      where: { id: user.sub },
    });

    const joinUrl = await this.bigBlueButtonProvider.getJoinUrl({
      meetingID: session.bbbMeetingId!,
      fullName: this.getUserDisplayName(learner),
      role: 'VIEWER',
      password: session.bbbAttendeePassword!,
      userID: `learner-${user.sub}`,
    });
    await this.trackClassAttendance(session, learner, 'learner');

    return { joinUrl };
  }

  async getFacultyBbbSessionStatus(id: number, user: ActiveUserData) {
    const session = await this.getSessionForFaculty(id, user);
    return this.getBbbSessionStatus(session);
  }

  async getLearnerBbbSessionStatus(id: number, user: ActiveUserData) {
    const session = await this.getSessionForLearner(id, user, {
      requireScheduled: false,
    });
    return this.getBbbSessionStatus(session);
  }

  async getSessionRecordings(id: number, user: ActiveUserData) {
    const session = await this.getSessionForFaculty(id, user, [
      'batch',
      'batch.students',
      'batch.students.student',
      'course',
      'faculty',
      'attendances',
      'attendances.user',
      'recordings',
      'recordings.upload',
    ]);

    return (session.recordings ?? []).map((recording) =>
      this.mapClassRecording({ ...recording, session }),
    );
  }

  async syncSessionRecordings(id: number, user: ActiveUserData) {
    const session = await this.getSessionForFaculty(id, user, [
      'batch',
      'batch.students',
      'batch.students.student',
      'course',
      'faculty',
      'attendances',
      'attendances.user',
      'recordings',
      'recordings.upload',
    ]);

    if (!session.bbbMeetingId) {
      throw new BadRequestException(
        'Start this BBB class before syncing recordings',
      );
    }

    const bbbRecordings = await this.bigBlueButtonProvider.getRecordings(
      session.bbbMeetingId,
    );

    for (const bbbRecording of bbbRecordings) {
      const existing = await this.classRecordingRepository.findOne({
        where: { bbbRecordId: bbbRecording.recordID },
        relations: ['session', 'upload'],
      });
      const recording =
        existing ??
        this.classRecordingRepository.create({
          session,
          course: session.course,
          batch: session.batch,
          faculty: session.faculty,
          bbbRecordId: bbbRecording.recordID,
        });

      recording.name = bbbRecording.name || session.title;
      recording.format = bbbRecording.playback?.type || 'presentation';
      recording.playbackUrl = bbbRecording.playback?.url ?? null;
      recording.durationSeconds = bbbRecording.playback?.lengthSeconds ?? null;
      recording.participants = bbbRecording.participants;
      recording.recordedAt = bbbRecording.startTime;
      recording.syncedAt = new Date();
      recording.status = bbbRecording.playback
        ? ClassRecordingStatus.Available
        : ClassRecordingStatus.Processing;
      recording.archiveError = null;

      if (bbbRecording.playback?.url && !recording.upload) {
        try {
          recording.upload = await this.archiveRecordingToS3(
            session,
            bbbRecording.recordID,
            bbbRecording.playback.url,
            bbbRecording.playback.type,
          );
          recording.status = ClassRecordingStatus.Archived;
        } catch (error) {
          recording.status = ClassRecordingStatus.Failed;
          recording.archiveError =
            error instanceof Error ? error.message : 'Recording archive failed';
        }
      }

      await this.classRecordingRepository.save(recording);
    }

    const recordings = await this.classRecordingRepository.find({
      where: { session: { id: session.id } },
      relations: [
        'session',
        'session.attendances',
        'session.attendances.user',
        'course',
        'batch',
        'faculty',
        'upload',
      ],
      order: { recordedAt: 'DESC', createdAt: 'DESC' },
    });

    return recordings.map((recording) => this.mapClassRecording(recording));
  }

  async deleteSession(id: number, user: ActiveUserData) {
    await this.getSessionForFaculty(id, user);
    await this.classSessionRepository.softDelete(id);

    return { message: 'Session deleted successfully' };
  }

  private assertFaculty(user: ActiveUserData) {
    if (
      !this.isAdmin(user) &&
      !user?.roles?.includes('faculty') &&
      !user?.permissions?.includes('view_faculty_workspace')
    ) {
      throw new ForbiddenException('Faculty access required');
    }
  }

  private isAdmin(user: ActiveUserData) {
    return user.roles?.includes('admin');
  }

  private getAssignedCourses(facultyId: number) {
    return this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.faculties', 'faculty')
      .leftJoinAndSelect('course.enrollments', 'enrollments')
      .where('faculty.id = :facultyId', { facultyId })
      .orderBy('course.updatedAt', 'DESC')
      .getMany();
  }

  private async getStudentsCount(courseIds: number[]) {
    if (!courseIds.length) return 0;

    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.course', 'course')
      .leftJoin('enrollment.user', 'student')
      .select('COUNT(DISTINCT student.id)', 'count')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('enrollment.isActive = true')
      .getRawOne<{ count: string }>();

    return Number(result?.count || 0);
  }

  private getAssignedExams(facultyId: number, courseIds: number[]) {
    const query = this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.courses', 'courses')
      .leftJoinAndSelect('exam.faculties', 'faculties')
      .leftJoinAndSelect('exam.attempts', 'attempts')
      .where(
        new Brackets((qb) => {
          qb.where('faculties.id = :facultyId', { facultyId });

          if (courseIds.length) {
            qb.orWhere('courses.id IN (:...courseIds)', { courseIds });
          }
        }),
      );

    return query
      .andWhere('exam.status != :archived', { archived: ExamStatus.Archived })
      .orderBy('exam.updatedAt', 'DESC')
      .getMany();
  }

  private getRecentAttempts(courseIds: number[]) {
    if (!courseIds.length) return Promise.resolve([]);

    return this.examAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.exam', 'exam')
      .leftJoinAndSelect('attempt.course', 'course')
      .leftJoinAndSelect('attempt.user', 'user')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('attempt.status != :status', {
        status: ExamAttemptStatus.InProgress,
      })
      .orderBy('attempt.submittedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('attempt.createdAt', 'DESC')
      .take(12)
      .getMany();
  }

  private getUpcomingSessions(facultyId: number) {
    return this.classSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.batch', 'batch')
      .leftJoinAndSelect('session.course', 'course')
      .leftJoinAndSelect('session.faculty', 'faculty')
      .where('faculty.id = :facultyId', { facultyId })
      .andWhere('session.status = :status', {
        status: ClassSessionStatus.Scheduled,
      })
      .andWhere('session.startsAt >= :now', { now: new Date() })
      .orderBy('session.startsAt', 'ASC')
      .take(8)
      .getMany();
  }

  private async markPastSessionsCompleted(now: Date) {
    await this.classSessionRepository
      .createQueryBuilder()
      .update(ClassSession)
      .set({ status: ClassSessionStatus.Completed })
      .where('status = :status', { status: ClassSessionStatus.Scheduled })
      .andWhere('"endsAt" <= :now', { now })
      .execute();
  }

  private async ensureBbbMeeting(session: ClassSession) {
    if (session.bbbMeetingId && session.bbbModeratorPassword) {
      try {
        const meetingInfo = await this.bigBlueButtonProvider.getMeetingInfo(
          session.bbbMeetingId,
          session.bbbModeratorPassword,
        );

        if (!meetingInfo.isRunning || meetingInfo.moderatorCount < 1) {
          this.resetBbbMeetingCredentials(session);
        }
      } catch {
        this.resetBbbMeetingCredentials(session);
      }
    } else {
      this.resetBbbMeetingCredentials(session);
    }

    if (
      !session.bbbMeetingId ||
      !session.bbbAttendeePassword ||
      !session.bbbModeratorPassword
    ) {
      this.resetBbbMeetingCredentials(session);
    }

    const response = await this.bigBlueButtonProvider.createMeeting({
      meetingID: session.bbbMeetingId!,
      name: session.title,
      attendeePW: session.bbbAttendeePassword!,
      moderatorPW: session.bbbModeratorPassword!,
      record: session.bbbRecord,
      welcome: session.description,
    });

    session.bbbCreateTime =
      response.createTime ?? session.bbbCreateTime ?? null;
    session.meetingUrl = null;

    return this.classSessionRepository.save(session);
  }

  private resetBbbMeetingCredentials(session: ClassSession) {
    session.bbbMeetingId = `session-${session.id}-${randomUUID()}`;
    session.bbbModeratorPassword = this.generateMeetingPassword();
    session.bbbAttendeePassword = this.generateMeetingPassword();
    session.bbbCreateTime = null;
  }

  private generateMeetingPassword() {
    return randomBytes(12).toString('hex');
  }

  private assertSessionCanStart(session: ClassSession) {
    if (session.status === ClassSessionStatus.Cancelled) {
      throw new BadRequestException('Cancelled classes cannot be started');
    }

    if (
      session.status === ClassSessionStatus.Completed &&
      Date.now() > session.endsAt.getTime() + CLASS_JOIN_GRACE_MINUTES * 60 * 1000
    ) {
      throw new BadRequestException('Only scheduled classes can be started');
    }

    const now = Date.now();
    const startsAt = session.startsAt.getTime();
    const endsAt = session.endsAt.getTime();
    const earliestStart =
      startsAt - FACULTY_CLASS_START_EARLY_MINUTES * 60 * 1000;
    const latestStart = endsAt + CLASS_JOIN_GRACE_MINUTES * 60 * 1000;

    if (now < earliestStart) {
      throw new BadRequestException(
        `This class can be started ${FACULTY_CLASS_START_EARLY_MINUTES} minutes before its scheduled time`,
      );
    }

    if (now > latestStart) {
      throw new BadRequestException('This class time window has ended');
    }
  }

  private async assertSessionCanJoin(session: ClassSession) {
    if (
      !session.bbbMeetingId ||
      !session.bbbAttendeePassword ||
      !session.bbbModeratorPassword
    ) {
      throw new BadRequestException(
        'Faculty has not started this class yet. Please wait for the class to begin.',
      );
    }

    const now = Date.now();
    const startsAt = session.startsAt.getTime();
    const endsAt = session.endsAt.getTime();
    const earliestJoin =
      startsAt - LEARNER_CLASS_JOIN_EARLY_MINUTES * 60 * 1000;
    const latestJoin = endsAt + CLASS_JOIN_GRACE_MINUTES * 60 * 1000;

    if (now < earliestJoin) {
      throw new BadRequestException(
        `You can join this class ${LEARNER_CLASS_JOIN_EARLY_MINUTES} minutes before it starts`,
      );
    }

    if (now > latestJoin) {
      throw new BadRequestException('This class is no longer available to join');
    }

    const meetingInfo = await this.bigBlueButtonProvider.getMeetingInfo(
      session.bbbMeetingId,
      session.bbbModeratorPassword,
    );

    if (!meetingInfo.isRunning || meetingInfo.moderatorCount < 1) {
      throw new BadRequestException(
        'Faculty has not started this class yet. Please wait for the class to begin.',
      );
    }
  }

  private getUserDisplayName(user?: User | null) {
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

    return name || user?.email || 'Participant';
  }

  private getDashboardBatches(facultyId: number) {
    return this.courseBatchRepository.find({
      where: { faculty: { id: facultyId } },
      relations: ['course', 'students', 'sessions'],
      order: { updatedAt: 'DESC' },
      take: 8,
    });
  }

  private async getCourseForFaculty(courseId: number, user: ActiveUserData) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['faculties'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (
      !this.isAdmin(user) &&
      !course.faculties?.some((faculty) => faculty.id === user.sub)
    ) {
      throw new ForbiddenException('You can only manage assigned courses');
    }

    return course;
  }

  private async getBatchForFaculty(id: number, user: ActiveUserData) {
    this.assertFaculty(user);

    const batch = await this.courseBatchRepository.findOne({
      where: { id },
      relations: [
        'course',
        'faculty',
        'students',
        'students.student',
        'sessions',
      ],
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    if (!this.isAdmin(user) && batch.faculty.id !== user.sub) {
      throw new ForbiddenException('You can only manage your own batches');
    }

    return batch;
  }

  private async getSessionForFaculty(
    id: number,
    user: ActiveUserData,
    relations = ['batch', 'course', 'faculty'],
  ) {
    this.assertFaculty(user);

    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations,
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (!this.isAdmin(user) && session.faculty.id !== user.sub) {
      throw new ForbiddenException('You can only manage your own sessions');
    }

    return session;
  }

  private async getSessionForLearner(
    id: number,
    user: ActiveUserData,
    options: { requireScheduled?: boolean } = { requireScheduled: true },
  ) {
    const session = await this.classSessionRepository.findOne({
      where: { id },
      relations: [
        'batch',
        'batch.students',
        'batch.students.student',
        'course',
        'faculty',
      ],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (
      options.requireScheduled !== false &&
      session.status !== ClassSessionStatus.Scheduled
    ) {
      throw new BadRequestException('Only scheduled classes can be joined');
    }

    const isAssignedStudent = session.batch.students?.some(
      (student) =>
        student.status === BatchStudentStatus.Active &&
        student.student.id === user.sub,
    );

    if (!isAssignedStudent) {
      throw new ForbiddenException('You can only join your assigned classes');
    }

    return session;
  }

  private async getBbbSessionStatus(session: ClassSession) {
    if (!session.bbbMeetingId || !session.bbbModeratorPassword) {
      return {
        isRunning: false,
        isEnded: session.status === ClassSessionStatus.Completed,
        participantCount: 0,
        moderatorCount: 0,
        status: session.status,
      };
    }

    const meetingInfo = await this.bigBlueButtonProvider.getMeetingInfo(
      session.bbbMeetingId,
      session.bbbModeratorPassword,
    );

    if (
      !meetingInfo.isRunning &&
      session.status === ClassSessionStatus.Scheduled &&
      Date.now() >= session.endsAt.getTime()
    ) {
      session.status = ClassSessionStatus.Completed;
      await this.classSessionRepository.save(session);
    }

    return {
      isRunning: meetingInfo.isRunning,
      isEnded:
        !meetingInfo.isRunning ||
        session.status === ClassSessionStatus.Completed,
      participantCount: meetingInfo.participantCount,
      moderatorCount: meetingInfo.moderatorCount,
      status: session.status,
    };
  }

  private async getExamAttemptForFaculty(id: number, user: ActiveUserData) {
    this.assertFaculty(user);

    const attempt = await this.examAttemptRepository.findOne({
      where: { id },
      relations: ['exam', 'course', 'user', 'manualGradedBy'],
    });

    if (!attempt) {
      throw new NotFoundException('Exam attempt not found');
    }

    if (!this.isAdmin(user)) {
      if (!attempt.course) {
        throw new ForbiddenException('Attempt is not linked to a course');
      }

      await this.getCourseForFaculty(attempt.course.id, user);
    }

    return attempt;
  }

  private mapFacultyAttempt(attempt: ExamAttempt) {
    return {
      id: attempt.id,
      status: attempt.status,
      learnerName:
        [attempt.user?.firstName, attempt.user?.lastName]
          .filter(Boolean)
          .join(' ') ||
        attempt.user?.email ||
        'Learner',
      learnerEmail: attempt.user?.email,
      examTitle: attempt.exam?.title || 'Exam',
      courseTitle: attempt.course?.title || 'Course',
      courseSlug: attempt.course?.slug,
      score: Number(attempt.score || 0),
      maxScore: Number(attempt.maxScore || 0),
      percentage: Number(attempt.percentage || 0),
      passed: attempt.passed,
      needsManualGrading: attempt.needsManualGrading,
      submittedAt: attempt.submittedAt,
      manualGradedAt: attempt.manualGradedAt,
    };
  }

  private mapClassSession(session: ClassSession) {
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      timezone: session.timezone,
      meetingUrl: session.meetingUrl,
      hasBbbMeeting: Boolean(session.bbbMeetingId),
      bbbIsRunning: false,
      bbbParticipantCount: 0,
      bbbModeratorCount: 0,
      bbbRecord: session.bbbRecord,
      allowRecordingAccess: session.allowRecordingAccess,
      location: session.location,
      status: session.status,
      attendance: {
        attended: Boolean(
          session.attendances?.some(
            (attendance) => attendance.role === 'learner',
          ),
        ),
        joinedAt:
          session.attendances?.find(
            (attendance) => attendance.role === 'learner',
          )?.joinedAt ?? null,
      },
      reminderBeforeMinutes: session.reminderBeforeMinutes,
      reminderOffsetsMinutes: this.getReminderOffsets(session),
      sentReminderOffsetsMinutes: session.sentReminderOffsetsMinutes ?? [],
      recordings: (session.recordings ?? []).map((recording) =>
        this.mapClassRecording(recording),
      ),
      batch: {
        id: session.batch.id,
        name: session.batch.name,
      },
      course: {
        id: session.course.id,
        title: session.course.title,
        slug: session.course.slug,
      },
      faculty: {
        id: session.faculty.id,
        firstName: session.faculty.firstName,
        lastName: session.faculty.lastName,
      },
    };
  }

  private async mapClassSessionWithBbbState(session: ClassSession) {
    const mapped = this.mapClassSession(session);

    if (!session.bbbMeetingId || !session.bbbModeratorPassword) {
      return mapped;
    }

    const now = Date.now();
    const shouldCheckBbb =
      session.status !== ClassSessionStatus.Cancelled &&
      now <= session.endsAt.getTime() + CLASS_JOIN_GRACE_MINUTES * 60 * 1000;

    if (!shouldCheckBbb) {
      return mapped;
    }

    try {
      const meetingInfo = await this.bigBlueButtonProvider.getMeetingInfo(
        session.bbbMeetingId,
        session.bbbModeratorPassword,
      );

      return {
        ...mapped,
        bbbIsRunning: meetingInfo.isRunning,
        bbbParticipantCount: meetingInfo.participantCount,
        bbbModeratorCount: meetingInfo.moderatorCount,
      };
    } catch {
      return mapped;
    }
  }

  private mapClassRecording(recording: ClassRecording) {
    const learnerAccessAllowed = Boolean(
      recording.session?.allowRecordingAccess,
    );
    const isReadyForLearners = [
      ClassRecordingStatus.Available,
      ClassRecordingStatus.Archived,
    ].includes(recording.status);
    const learnerAttendances =
      recording.session?.attendances?.filter(
        (attendance) => attendance.role === 'learner' && attendance.user,
      ) ?? [];
    const learnerVisibilityReasons = [
      learnerAccessAllowed
        ? null
        : 'Learner recording access is turned off for this class.',
      isReadyForLearners ? null : 'Recording is not available for learners yet.',
      learnerAttendances.length
        ? null
        : 'No learner attendance has been recorded for this class yet.',
    ].filter((reason): reason is string => Boolean(reason));

    return {
      id: recording.id,
      bbbRecordId: recording.bbbRecordId,
      name: recording.name,
      format: recording.format,
      playbackUrl: recording.playbackUrl,
      durationSeconds: recording.durationSeconds,
      participants: recording.participants,
      status: recording.status,
      archiveError: recording.archiveError,
      recordedAt: recording.recordedAt,
      syncedAt: recording.syncedAt,
      file: recording.upload
        ? this.mediaFileMappingService.mapFile(recording.upload)
        : null,
      session: recording.session
        ? {
            id: recording.session.id,
            title: recording.session.title,
            startsAt: recording.session.startsAt,
            endsAt: recording.session.endsAt,
            status: recording.session.status,
            allowRecordingAccess: recording.session.allowRecordingAccess,
          }
        : null,
      course: recording.course
        ? {
            id: recording.course.id,
            title: recording.course.title,
            slug: recording.course.slug,
          }
        : null,
      batch: recording.batch
        ? {
            id: recording.batch.id,
            name: recording.batch.name,
          }
        : null,
      faculty: recording.faculty
        ? {
            id: recording.faculty.id,
            firstName: recording.faculty.firstName,
            lastName: recording.faculty.lastName,
            email: recording.faculty.email,
          }
        : null,
      access: {
        learnerAccessAllowed,
        learnerVisible:
          learnerAccessAllowed &&
          isReadyForLearners &&
          learnerAttendances.length > 0,
        readyForLearners: isReadyForLearners,
        attendeeCount: learnerAttendances.length,
        reasons: learnerVisibilityReasons,
      },
      attendees: learnerAttendances.map((attendance) => ({
        id: attendance.user.id,
        firstName: attendance.user.firstName,
        lastName: attendance.user.lastName,
        email: attendance.user.email,
        role: attendance.role,
        joinedAt: attendance.joinedAt,
        lastSeenAt: attendance.lastSeenAt,
      })),
    };
  }

  private async trackClassAttendance(
    session: ClassSession,
    user: User | null,
    role: 'faculty' | 'learner',
  ) {
    if (!user) return;

    const now = new Date();
    const existing = await this.classAttendanceRepository.findOne({
      where: {
        session: { id: session.id },
        user: { id: user.id },
        role,
      },
    });

    if (existing) {
      existing.lastSeenAt = now;
      await this.classAttendanceRepository.save(existing);
      return;
    }

    await this.classAttendanceRepository.save(
      this.classAttendanceRepository.create({
        session,
        user,
        role,
        joinedAt: now,
        lastSeenAt: now,
      }),
    );
  }

  private async assertCourseMonthlyClassLimit(
    course: Course,
    startsAt: Date,
    ignoreSessionId?: number,
  ) {
    const limit = course.monthlyLiveClassLimit;

    if (!limit || limit < 1) {
      return;
    }

    const monthStart = new Date(
      startsAt.getFullYear(),
      startsAt.getMonth(),
      1,
    );
    const nextMonthStart = new Date(
      startsAt.getFullYear(),
      startsAt.getMonth() + 1,
      1,
    );
    const query = this.classSessionRepository
      .createQueryBuilder('session')
      .where('session.courseId = :courseId', { courseId: course.id })
      .andWhere('session.startsAt >= :monthStart', { monthStart })
      .andWhere('session.startsAt < :nextMonthStart', { nextMonthStart })
      .andWhere('session.status != :cancelled', {
        cancelled: ClassSessionStatus.Cancelled,
      });

    if (ignoreSessionId) {
      query.andWhere('session.id != :ignoreSessionId', { ignoreSessionId });
    }

    const existingCount = await query.getCount();

    if (existingCount >= limit) {
      throw new BadRequestException(
        `This course allows only ${limit} live classes in this month`,
      );
    }
  }

  private async archiveRecordingToS3(
    session: ClassSession,
    recordID: string,
    playbackUrl: string,
    format: string,
  ) {
    const response = await fetch(playbackUrl);

    if (!response.ok) {
      throw new Error(`BBB playback URL returned ${response.status}`);
    }

    const contentType =
      response.headers.get('content-type') || this.getRecordingMime(format);
    const body = Buffer.from(await response.arrayBuffer());
    const extension = this.getRecordingExtension(contentType, format);
    const safeRecordId = recordID.replace(/[^a-zA-Z0-9_-]/g, '-');
    const key = [
      'recordings',
      `course-${session.course.id}`,
      `batch-${session.batch.id}`,
      `session-${session.id}`,
      `${safeRecordId}.${extension}`,
    ].join('/');
    const s3Client = await this.s3Provider.getClient();
    const bucket = await this.s3Provider.getBucket();

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return this.uploadRepository.save(
      this.uploadRepository.create({
        name: `${session.title}-${safeRecordId}.${extension}`,
        path: key,
        type: contentType.startsWith('video/')
          ? FileTypes.VIDEO
          : FileTypes.DOC,
        mime: contentType,
        size: body.length,
        status: UploadStatus.COMPLETED,
      }),
    );
  }

  private getRecordingMime(format: string) {
    if (format === 'video' || format === 'podcast') return 'video/mp4';
    return 'text/html; charset=utf-8';
  }

  private getRecordingExtension(contentType: string, format: string) {
    if (contentType.includes('video/mp4')) return 'mp4';
    if (contentType.includes('video/webm')) return 'webm';
    if (contentType.includes('application/zip')) return 'zip';
    if (format === 'podcast') return 'mp4';
    return 'html';
  }

  private assertValidSessionWindow(startsAt: Date, endsAt: Date) {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid session date');
    }

    if (endsAt <= startsAt) {
      throw new BadRequestException(
        'Session end time must be after start time',
      );
    }
  }

  private assertBatchCanScheduleClass(batch: CourseBatch) {
    const lifecycle = this.getBatchLifecycle(batch);

    if (lifecycle !== 'active' && lifecycle !== 'upcoming') {
      throw new BadRequestException(
        'Classes can only be scheduled for active or upcoming batches',
      );
    }
  }

  private assertBatchCanManageStudents(batch: CourseBatch) {
    const lifecycle = this.getBatchLifecycle(batch);

    if (lifecycle !== 'active' && lifecycle !== 'upcoming') {
      throw new BadRequestException(
        'Students can only be changed for active or upcoming batches',
      );
    }
  }

  private getBatchLifecycle(batch: CourseBatch) {
    if (batch.status === CourseBatchStatus.Cancelled) return 'cancelled';
    if (batch.status === CourseBatchStatus.Completed) return 'recent';
    if (batch.status === CourseBatchStatus.Draft) return 'draft';

    const startDate = this.getDateOnlyKey(batch.startDate);
    const endDate = this.getDateOnlyKey(batch.endDate);
    const todayKey = this.getTodayDateKey();

    if (endDate && endDate < todayKey) return 'recent';
    if (startDate && startDate > todayKey) return 'upcoming';

    return 'active';
  }

  private getTodayDateKey() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value ?? '';
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = parts.find((part) => part.type === 'day')?.value ?? '';

    return `${year}-${month}-${day}`;
  }

  private getDateOnlyKey(value?: string | Date | null) {
    if (!value) return null;

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    return value.slice(0, 10);
  }

  private toDecimal(value: number) {
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
  }

  private normalizeReminderOffsets(dto: {
    reminderBeforeMinutes?: number;
    reminderOffsetsMinutes?: number[];
  }) {
    const offsets = dto.reminderOffsetsMinutes?.length
      ? dto.reminderOffsetsMinutes
      : [dto.reminderBeforeMinutes ?? 60];

    return [...new Set(offsets.map(Number))]
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => b - a);
  }

  private getReminderOffsets(session: ClassSession) {
    return session.reminderOffsetsMinutes?.length
      ? session.reminderOffsetsMinutes
      : [session.reminderBeforeMinutes ?? 60];
  }

  private getPendingReminderOffsets(session: ClassSession) {
    const sent = new Set(session.sentReminderOffsetsMinutes ?? []);

    return this.getReminderOffsets(session).filter(
      (offset) => !sent.has(offset),
    );
  }

  private notifyStudentsAboutSessionSafely(
    session: ClassSession,
    action: 'scheduled' | 'updated',
  ) {
    const students = session.batch?.students ?? [];
    const startsAt = session.startsAt.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: session.timezone || 'Asia/Kolkata',
    });

    void this.notificationsService
      .createMany(
        students
          .filter(
            (student) =>
              student.status === BatchStudentStatus.Active &&
              Boolean(student.student?.id),
          )
          .map((student) => ({
            recipientId: student.student.id,
            actorId: session.faculty?.id ?? null,
            title:
              action === 'scheduled'
                ? 'New live class scheduled'
                : 'Live class schedule updated',
            message: `${session.title} for ${session.course.title} is ${action === 'scheduled' ? 'scheduled' : 'updated'} for ${startsAt}.`,
            href: '/classes',
            type: NotificationType.Class,
            metadata: {
              sessionId: session.id,
              courseId: session.course.id,
              batchId: session.batch.id,
              startsAt: session.startsAt,
            },
          })),
      )
      .catch(() => undefined);
  }
}
