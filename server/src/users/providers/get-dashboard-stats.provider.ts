import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/certificate.entity';
import { CourseExamAttempt } from 'src/course-exams/course-exam-attempt.entity';
import {
  hasLiveClasses,
  hasRecordedLearning,
} from 'src/courses/constants/course-delivery-mode';
import { Course } from 'src/courses/course.entity';
import { EnrollmentsService } from 'src/enrollments/providers/enrollments.service';
import { ExamAttempt } from 'src/exams/exam-attempt.entity';
import { ClassAttendance } from 'src/faculty-workspace/class-attendance.entity';
import { ClassSession } from 'src/faculty-workspace/class-session.entity';
import { ClassSessionStatus } from 'src/faculty-workspace/enums/class-session-status.enum';
import { WeeklyProgress } from 'src/user-progress/interfaces/weekly-progress.interface';
import { UserProgres } from 'src/user-progress/user-progres.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GetDashboardStatsProvider {
  constructor(
    /**
     * Inject enrollmentsService
     */

    private readonly enrollmentsService: EnrollmentsService,

    /**
     * Inject userProgressRepository
     */
    @InjectRepository(UserProgres)
    private readonly userProgressRepository: Repository<UserProgres>,

  @InjectRepository(CourseExamAttempt)
  private readonly courseExamAttemptRepository: Repository<CourseExamAttempt>,

    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepository: Repository<ExamAttempt>,

  @InjectRepository(Certificate)
  private readonly certificateRepository: Repository<Certificate>,

  @InjectRepository(Course)
  private readonly courseRepository: Repository<Course>,

    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,

    @InjectRepository(ClassAttendance)
    private readonly classAttendanceRepository: Repository<ClassAttendance>,
  ) {}

  async getDashboardStats(userId: number) {
    const [
      learningSummary,
      examsTaken,
      examsPassed,
      certificatesEarned,
    ] = await Promise.all([
      this.getLearningSummary(userId),
      this.getExamAttemptsCount(userId),
      this.getPassedExamAttemptsCount(userId),
      this.certificateRepository.count({ where: { user: { id: userId } } }),
    ]);

    return {
      courses: learningSummary.totalCourses,
      completed: learningSummary.completedCourses,
      progress: learningSummary.averageProgress,
      examsTaken,
      examsPassed,
      certificatesEarned,
      learningSummary,
    };
  }

  private async getExamAttemptsCount(userId: number) {
    const [legacyAttempts, advancedAttempts] = await Promise.all([
      this.courseExamAttemptRepository.count({
        where: { user: { id: userId } },
      }),
      this.examAttemptRepository.count({
        where: { user: { id: userId } },
      }),
    ]);

    return legacyAttempts + advancedAttempts;
  }

  private async getPassedExamAttemptsCount(userId: number) {
    const [legacyAttempts, advancedAttempts] = await Promise.all([
      this.courseExamAttemptRepository.count({
        where: { user: { id: userId }, passed: true },
      }),
      this.examAttemptRepository.count({
        where: { user: { id: userId }, passed: true },
      }),
    ]);

    return legacyAttempts + advancedAttempts;
  }

  async getWeeklyProgress(userId: number): Promise<WeeklyProgress[]> {
    const timezone = 'Asia/Kolkata';
    const completionThreshold = 100;

    const result = await this.userProgressRepository
      .createQueryBuilder('progress')
      .select([
        `TO_CHAR(timezone('${timezone}', progress.updatedAt), 'YYYY-MM-DD') as "date"`,
        `COUNT(DISTINCT progress.lectureId) as "completedLectures"`,
      ])
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.progress >= :completionThreshold', {
        completionThreshold,
      })
      .andWhere(
        `timezone('${timezone}', progress.updatedAt)::date >= timezone('${timezone}', NOW())::date - INTERVAL '6 days'`,
      )
      .groupBy('"date"')
      .orderBy('"date"', 'ASC')
      .getRawMany();

    const completedByDate = new Map(
      result.map((item) => [item.date, Number(item.completedLectures) || 0]),
    );

    const totalCompletedThisWeek = result.reduce(
      (sum, item) => sum + Number(item.completedLectures || 0),
      0,
    );

    const days: WeeklyProgress[] = [];
    const today = new Date();

    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      const formattedDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);

      const completedLectures = completedByDate.get(formattedDate) ?? 0;

      days.push({
        day: new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          weekday: 'short',
        }).format(date),

        progress:
          totalCompletedThisWeek === 0
            ? 0
            : Math.round((completedLectures / totalCompletedThisWeek) * 100),
      });
    }

    return days;
  }

  private async getLearningSummary(userId: number) {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .innerJoin(
        'course.enrollments',
        'enrollment',
        'enrollment.userId = :userId AND enrollment.isActive = true',
        { userId },
      )
      .leftJoin('course.chapters', 'chapter')
      .leftJoin('chapter.lectures', 'lecture', 'lecture.isPublished = true')
      .leftJoin('lecture.progress', 'progress', 'progress.userId = :userId', {
        userId,
      })
      .select('course.id', 'courseId')
      .addSelect('course.title', 'title')
      .addSelect('course.slug', 'slug')
      .addSelect('course.mode', 'mode')
      .addSelect('COUNT(DISTINCT lecture.id)', 'totalLectures')
      .addSelect(
        `COUNT(DISTINCT CASE WHEN progress.isCompleted = true THEN lecture.id END)`,
        'completedLectures',
      )
      .where('course.isPublished = true')
      .groupBy('course.id')
      .addGroupBy('course.title')
      .addGroupBy('course.slug')
      .addGroupBy('course.mode')
      .getRawMany();

    const courseSummaries = await Promise.all(
      courses.map(async (course) => {
        const courseId = Number(course.courseId);
        const totalLectures = Number(course.totalLectures) || 0;
        const completedLectures = Number(course.completedLectures) || 0;
        const recordedEnabled = hasRecordedLearning(course.mode);
        const liveEnabled = hasLiveClasses(course.mode);
        const recordedProgress =
          recordedEnabled && totalLectures
            ? Math.round((completedLectures / totalLectures) * 100)
            : recordedEnabled
              ? 0
              : null;
        const liveStats = liveEnabled
          ? await this.getLiveAttendanceStats(courseId, userId)
          : null;
        const progressParts = [
          recordedProgress,
          liveStats?.progress ?? null,
        ].filter((value): value is number => value !== null);
        const overallProgress = progressParts.length
          ? Math.round(
              progressParts.reduce((sum, value) => sum + value, 0) /
                progressParts.length,
            )
          : 0;

        return {
          courseId,
          title: course.title,
          slug: course.slug,
          mode: course.mode || 'self_learning',
          overallProgress,
          recorded: {
            enabled: recordedEnabled,
            totalLectures,
            completedLectures,
            progress: recordedProgress ?? 0,
          },
          live: {
            enabled: liveEnabled,
            completedClasses: liveStats?.completedClasses ?? 0,
            attendedClasses: liveStats?.attendedClasses ?? 0,
            missedClasses: liveStats?.missedClasses ?? 0,
            upcomingClasses: liveStats?.upcomingClasses ?? 0,
            progress: liveStats?.progress ?? 0,
          },
        };
      }),
    );

    const totalCourses = courseSummaries.length;
    const completedCourses = courseSummaries.filter(
      (course) => course.overallProgress >= 100,
    ).length;
    const averageProgress = totalCourses
      ? Math.round(
          courseSummaries.reduce(
            (sum, course) => sum + course.overallProgress,
            0,
          ) / totalCourses,
        )
      : 0;

    return {
      totalCourses,
      completedCourses,
      averageProgress,
      recordedCourses: courseSummaries.filter((course) => course.recorded.enabled)
        .length,
      liveCourses: courseSummaries.filter((course) => course.live.enabled).length,
      upcomingLiveClasses: courseSummaries.reduce(
        (sum, course) => sum + course.live.upcomingClasses,
        0,
      ),
      completedLiveClasses: courseSummaries.reduce(
        (sum, course) => sum + course.live.completedClasses,
        0,
      ),
      attendedLiveClasses: courseSummaries.reduce(
        (sum, course) => sum + course.live.attendedClasses,
        0,
      ),
      missedLiveClasses: courseSummaries.reduce(
        (sum, course) => sum + course.live.missedClasses,
        0,
      ),
      courses: courseSummaries,
    };
  }

  private async getLiveAttendanceStats(courseId: number, userId: number) {
    const baseQuery = this.classSessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.batch', 'batch')
      .innerJoin('batch.students', 'batchStudent')
      .innerJoin('batchStudent.student', 'student')
      .where('session.courseId = :courseId', { courseId })
      .andWhere('student.id = :userId', { userId })
      .andWhere('batchStudent.status = :studentStatus', {
        studentStatus: 'active',
      })
      .andWhere('session.status != :cancelled', {
        cancelled: ClassSessionStatus.Cancelled,
      });

    const now = new Date();
    const [completedClasses, upcomingClasses, attendedClasses] =
      await Promise.all([
        baseQuery
          .clone()
          .andWhere('session.endsAt <= :now', { now })
          .getCount(),
        baseQuery
          .clone()
          .andWhere('session.endsAt > :now', { now })
          .getCount(),
        this.classAttendanceRepository
          .createQueryBuilder('attendance')
          .innerJoin('attendance.session', 'session')
          .innerJoin('session.batch', 'batch')
          .innerJoin('batch.students', 'batchStudent')
          .innerJoin('batchStudent.student', 'student')
          .where('session.courseId = :courseId', { courseId })
          .andWhere('student.id = :userId', { userId })
          .andWhere('attendance.userId = :userId', { userId })
          .andWhere('attendance.role = :role', { role: 'learner' })
          .andWhere('batchStudent.status = :studentStatus', {
            studentStatus: 'active',
          })
          .andWhere('session.status != :cancelled', {
            cancelled: ClassSessionStatus.Cancelled,
          })
          .andWhere('session.endsAt <= :now', { now })
          .getCount(),
      ]);
    const missedClasses = Math.max(completedClasses - attendedClasses, 0);

    return {
      completedClasses,
      upcomingClasses,
      attendedClasses,
      missedClasses,
      progress: completedClasses
        ? Math.round((attendedClasses / completedClasses) * 100)
        : 0,
    };
  }
}
