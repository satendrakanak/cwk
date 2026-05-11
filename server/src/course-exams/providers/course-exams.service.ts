import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from 'src/certificates/certificate.entity';
import {
  hasLiveClasses,
  hasRecordedLearning,
} from 'src/courses/constants/course-delivery-mode';
import { Course } from 'src/courses/course.entity';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { ClassAttendance } from 'src/faculty-workspace/class-attendance.entity';
import { ClassSession } from 'src/faculty-workspace/class-session.entity';
import { ClassSessionStatus } from 'src/faculty-workspace/enums/class-session-status.enum';
import { UserProgres } from 'src/user-progress/user-progres.entity';
import { User } from 'src/users/user.entity';
import { Not, Repository } from 'typeorm';
import { DateRangeQueryDto } from 'src/common/dtos/date-range-query.dto';
import { ExamAttempt } from 'src/exams/exam-attempt.entity';
import { Exam } from 'src/exams/exam.entity';
import { ExamAttemptStatus } from 'src/exams/enums/exam-attempt-status.enum';
import { ExamStatus } from 'src/exams/enums/exam-status.enum';
import { CourseExamAccessOverride } from '../course-exam-access-override.entity';
import { CourseExamEmailProvider } from './course-exam-email.provider';
import { UpsertCourseExamAccessOverrideDto } from '../dtos/upsert-course-exam-access-override.dto';
import { SubmitCourseExamAttemptDto } from '../dtos/submit-course-exam-attempt.dto';
import {
  CourseExamAttempt,
  CourseExamAttemptAnswer,
  CourseExamAttemptQuestionResult,
  CourseExamAttemptSnapshot,
} from '../course-exam-attempt.entity';

@Injectable()
export class CourseExamsService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,
    @InjectRepository(UserProgres)
    private readonly userProgressRepository: Repository<UserProgres>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(CourseExamAccessOverride)
    private readonly courseExamAccessOverrideRepository: Repository<CourseExamAccessOverride>,
    @InjectRepository(CourseExamAttempt)
    private readonly courseExamAttemptRepository: Repository<CourseExamAttempt>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepository: Repository<ExamAttempt>,
    @InjectRepository(ClassSession)
    private readonly classSessionRepository: Repository<ClassSession>,
    @InjectRepository(ClassAttendance)
    private readonly classAttendanceRepository: Repository<ClassAttendance>,
    private readonly courseExamEmailProvider: CourseExamEmailProvider,
  ) {}

  async getMyHistory(userId: number, query?: DateRangeQueryDto) {
    const attemptsQuery = this.courseExamAttemptRepository
      .createQueryBuilder('attempt')
      .leftJoinAndSelect('attempt.course', 'course')
      .leftJoin('attempt.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('attempt.submittedAt', 'DESC')
      .addOrderBy('attempt.createdAt', 'DESC');

    if (query?.startDate) {
      attemptsQuery.andWhere(
        'COALESCE(attempt.submittedAt, attempt.createdAt) >= :startDate',
        {
          startDate: query.startDate,
        },
      );
    }

    if (query?.endDate) {
      attemptsQuery.andWhere(
        'COALESCE(attempt.submittedAt, attempt.createdAt) <= :endDate',
        {
          endDate: query.endDate,
        },
      );
    }

    const attempts = await attemptsQuery.getMany();

    const grouped = new Map<
      number,
      {
        course: { id: number; title: string; slug: string };
        attemptsCount: number;
        bestScore: number;
        latestScore: number;
        latestMaxScore: number;
        latestPercentage: number;
        passed: boolean;
        lastAttemptedAt: Date | null;
      }
    >();

    for (const attempt of attempts) {
      const existing = grouped.get(attempt.course.id);
      const percentage = Number(attempt.percentage);

      if (!existing) {
        grouped.set(attempt.course.id, {
          course: {
            id: attempt.course.id,
            title: attempt.course.title,
            slug: attempt.course.slug,
          },
          attemptsCount: 1,
          bestScore: percentage,
          latestScore: attempt.score,
          latestMaxScore: attempt.maxScore,
          latestPercentage: percentage,
          passed: attempt.passed,
          lastAttemptedAt: attempt.submittedAt || attempt.createdAt,
        });
        continue;
      }

      existing.attemptsCount += 1;
      existing.bestScore = Math.max(existing.bestScore, percentage);
      existing.passed = existing.passed || attempt.passed;
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const left = new Date(a.lastAttemptedAt || 0).getTime();
      const right = new Date(b.lastAttemptedAt || 0).getTime();
      return right - left;
    });
  }

  async getAdminOverview() {
    const [attempts, advancedAttempts, certificatesIssued] = await Promise.all([
      this.courseExamAttemptRepository.find({
        relations: ['course', 'user'],
        order: { submittedAt: 'DESC', createdAt: 'DESC' },
      }),
      this.examAttemptRepository.find({
        where: { status: Not(ExamAttemptStatus.InProgress) },
        relations: ['course', 'user'],
        order: { submittedAt: 'DESC', createdAt: 'DESC' },
      }),
      this.certificateRepository.count(),
    ]);

    const normalizedAttempts = [
      ...attempts.map((attempt) => ({
        id: attempt.id,
        source: 'legacy',
        learnerName:
          `${attempt.user?.firstName || ''} ${attempt.user?.lastName || ''}`.trim() ||
          attempt.user?.email ||
          'Learner',
        courseId: attempt.course.id,
        courseTitle: attempt.course?.title || 'Course',
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: Number(attempt.percentage || 0),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        createdAt: attempt.createdAt,
      })),
      ...advancedAttempts.map((attempt) => ({
        id: attempt.id,
        source: 'advanced',
        learnerName:
          `${attempt.user?.firstName || ''} ${attempt.user?.lastName || ''}`.trim() ||
          attempt.user?.email ||
          'Learner',
        courseId: attempt.course?.id ?? 0,
        courseTitle: attempt.course?.title || 'Course',
        score: Number(attempt.score),
        maxScore: Number(attempt.maxScore),
        percentage: Number(attempt.percentage || 0),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        createdAt: attempt.createdAt,
      })),
    ].sort((left, right) => {
      const leftDate = new Date(left.submittedAt || left.createdAt || 0).getTime();
      const rightDate = new Date(right.submittedAt || right.createdAt || 0).getTime();
      return rightDate - leftDate;
    });

    const totalAttempts = normalizedAttempts.length;
    const uniqueLearners = new Set(
      [...attempts, ...advancedAttempts]
        .map((attempt) => attempt.user?.id)
        .filter(Boolean),
    ).size;
    const passedAttempts = normalizedAttempts.filter((attempt) => attempt.passed).length;
    const averageScore = totalAttempts
      ? Math.round(
          normalizedAttempts.reduce(
            (sum, attempt) => sum + Number(attempt.percentage || 0),
            0,
          ) / totalAttempts,
        )
      : 0;
    const passRate = totalAttempts
      ? Math.round((passedAttempts / totalAttempts) * 100)
      : 0;

    const courseMap = new Map<
      number,
      {
        courseId: number;
        courseTitle: string;
        attempts: number;
        passCount: number;
        totalPercentage: number;
      }
    >();

    for (const attempt of normalizedAttempts) {
      if (!attempt.courseId) continue;
      const existing = courseMap.get(attempt.courseId) || {
        courseId: attempt.courseId,
        courseTitle: attempt.courseTitle,
        attempts: 0,
        passCount: 0,
        totalPercentage: 0,
      };

      existing.attempts += 1;
      existing.passCount += attempt.passed ? 1 : 0;
      existing.totalPercentage += Number(attempt.percentage || 0);
      courseMap.set(attempt.courseId, existing);
    }

    return {
      totalAttempts,
      uniqueLearners,
      passedAttempts,
      certificatesIssued,
      averageScore,
      passRate,
      recentAttempts: normalizedAttempts.slice(0, 6).map((attempt) => ({
        id: attempt.id,
        source: attempt.source,
        learnerName: attempt.learnerName,
        courseTitle: attempt.courseTitle,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: Number(attempt.percentage || 0),
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
      })),
      topCourses: Array.from(courseMap.values())
        .map((item) => ({
          courseId: item.courseId,
          courseTitle: item.courseTitle,
          attempts: item.attempts,
          passCount: item.passCount,
          averageScore: Math.round(item.totalPercentage / item.attempts),
        }))
        .sort((a, b) => b.attempts - a.attempts || b.averageScore - a.averageScore)
        .slice(0, 6),
    };
  }

  async getUserAccessOverview(userId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });

    const overrides = await this.courseExamAccessOverrideRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
    });

    const overrideMap = new Map(
      overrides.map((override) => [override.course.id, override]),
    );

    const courseIds = enrollments
      .map((enrollment) => enrollment.course?.id)
      .filter(Boolean) as number[];
    const advancedExamMap = await this.getPublishedAdvancedExamMap(courseIds);

    const rows = await Promise.all(
      enrollments
        .filter((enrollment) => {
          const course = enrollment.course;
          return (
            Boolean(course?.exam?.questions?.length) ||
            advancedExamMap.has(course.id)
          );
        })
        .map(async (enrollment) => {
          const course = enrollment.course;
          const override = overrideMap.get(course.id);
          const advancedExam = advancedExamMap.get(course.id);
          const attemptsUsed = advancedExam
            ? await this.examAttemptRepository.count({
                where: {
                  user: { id: userId },
                  course: { id: course.id },
                  exam: { id: advancedExam.id },
                  status: Not(ExamAttemptStatus.InProgress),
                },
              })
            : await this.courseExamAttemptRepository.count({
                where: {
                  user: { id: userId },
                  course: { id: course.id },
                },
              });
          const passed = advancedExam
            ? await this.examAttemptRepository.exists({
                where: {
                  user: { id: userId },
                  course: { id: course.id },
                  exam: { id: advancedExam.id },
                  passed: true,
                },
              })
            : await this.courseExamAttemptRepository.exists({
                where: {
                  user: { id: userId },
                  course: { id: course.id },
                  passed: true,
                },
              });
          const baseAttempts = advancedExam
            ? advancedExam.attemptLimit === null
              ? null
              : Number(advancedExam.attemptLimit || 0)
            : Number(course.exam?.maxAttempts || 0);
          const extraAttempts = Number(override?.extraAttempts || 0);
          const effectiveAttempts =
            baseAttempts === null ? null : baseAttempts + extraAttempts;

          return {
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            examMode: advancedExam ? 'advanced' : 'legacy',
            baseAttempts,
            extraAttempts,
            effectiveAttempts,
            attemptsUsed,
            remainingAttempts:
              effectiveAttempts === null
                ? null
                : Math.max(effectiveAttempts - attemptsUsed, 0),
            passed,
            bypassAttendanceRequirement: Boolean(
              override?.bypassAttendanceRequirement,
            ),
            note: override?.note || '',
          };
        }),
    );

    return rows;
  }

  async upsertUserAccessOverride(
    userId: number,
    dto: UpsertCourseExamAccessOverrideDto,
  ) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const hasAdvancedExam = await this.hasPublishedAdvancedExam(dto.courseId);

    if (!course.exam?.questions?.length && !hasAdvancedExam) {
      throw new BadRequestException('Selected course does not have a final exam');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { user: { id: userId }, course: { id: dto.courseId }, isActive: true },
    });

    if (!enrollment) {
      throw new BadRequestException('User is not actively enrolled in this course');
    }

    let override = await this.courseExamAccessOverrideRepository.findOne({
      where: { user: { id: userId }, course: { id: dto.courseId } },
      relations: ['course', 'user'],
    });

    if (!override) {
      override = this.courseExamAccessOverrideRepository.create({
        user: { id: userId } as User,
        course: { id: dto.courseId } as Course,
      });
    }

    override.extraAttempts = dto.extraAttempts;
    override.bypassAttendanceRequirement = Boolean(
      dto.bypassAttendanceRequirement,
    );
    override.note = dto.note?.trim() || null;

    await this.courseExamAccessOverrideRepository.save(override);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      this.courseExamEmailProvider.sendAttemptsExtendedSafely(
        user,
        course,
        dto.extraAttempts,
      );
    }
    return this.getUserAccessOverview(userId);
  }

  private async getPublishedAdvancedExamMap(courseIds: number[]) {
    if (!courseIds.length) {
      return new Map<number, Exam>();
    }

    const exams = await this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.courses', 'course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('exam.status = :status', { status: ExamStatus.Published })
      .orderBy('exam.createdAt', 'DESC')
      .getMany();

    const map = new Map<number, Exam>();
    for (const exam of exams) {
      for (const course of exam.courses ?? []) {
        if (!map.has(course.id)) {
          map.set(course.id, exam);
        }
      }
    }

    return map;
  }

  async hasPublishedAdvancedExam(courseId: number) {
    return this.examRepository
      .createQueryBuilder('exam')
      .leftJoin('exam.courses', 'course')
      .where('course.id = :courseId', { courseId })
      .andWhere('exam.status = :status', { status: ExamStatus.Published })
      .getExists();
  }

  async getForLearner(courseId: number, userId: number) {
    const course = await this.ensureCourseWithExam(courseId);
    await this.ensureEnrolled(courseId, userId);

    const attempts = await this.courseExamAttemptRepository.find({
      where: { course: { id: courseId }, user: { id: userId } },
      order: { attemptNumber: 'DESC', createdAt: 'DESC' },
    });
    const unlockState = await this.getUnlockState(course, userId);

    const exam = course.exam!;
    const latestAttempt = attempts[0] ? this.mapAttempt(attempts[0]) : null;
    const passedAttempt = attempts.find((attempt) => attempt.passed) || null;
    const attemptsUsed = attempts.length;
    const attemptLimit = await this.getEffectiveAttemptLimit(courseId, userId, exam);
    const canAttempt =
      exam.isPublished &&
      unlockState.isUnlocked &&
      (attemptLimit === null || attemptsUsed < attemptLimit) &&
      !passedAttempt;

    return {
      exam: this.sanitizeExam(exam),
      attempts: attempts.map((attempt) => this.mapAttempt(attempt)),
      latestAttempt,
      passedAttempt: passedAttempt ? this.mapAttempt(passedAttempt) : null,
      attemptsUsed,
      attemptsRemaining:
        attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0),
      canAttempt,
      isPassed: !!passedAttempt,
      isUnlocked: unlockState.isUnlocked,
      unlockProgress: unlockState.progress,
      unlockMessage: unlockState.message,
    };
  }

  async submitAttempt(
    courseId: number,
    userId: number,
    dto: SubmitCourseExamAttemptDto,
  ) {
    const course = await this.ensureCourseWithExam(courseId);
    await this.ensureEnrolled(courseId, userId);

    const exam = course.exam!;
    const unlockState = await this.getUnlockState(course, userId);

    if (!exam.isPublished) {
      throw new ForbiddenException('Exam is not published yet');
    }

    if (!unlockState.isUnlocked) {
      throw new ForbiddenException(unlockState.message);
    }

    const existingAttempts = await this.courseExamAttemptRepository.find({
      where: { course: { id: courseId }, user: { id: userId } },
      order: { attemptNumber: 'DESC' },
    });

    if (existingAttempts.some((attempt) => attempt.passed)) {
      throw new BadRequestException('You have already passed this exam');
    }

    const attemptLimit = await this.getEffectiveAttemptLimit(courseId, userId, exam);

    if (attemptLimit !== null && existingAttempts.length >= attemptLimit) {
      throw new BadRequestException('Maximum attempts reached for this exam');
    }

    const answerMap = new Map<string, string[]>();
    const answerTextMap = new Map<string, string>();
    for (const answer of dto.answers) {
      answerMap.set(answer.questionId, [...new Set(answer.selectedOptionIds)]);
      answerTextMap.set(answer.questionId, answer.answerText?.trim() || '');
    }

    const snapshot: CourseExamAttemptSnapshot = {
      title: exam.title,
      passingPercentage: exam.passingPercentage,
      questions: exam.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        type: question.type,
        explanation: question.explanation,
        points: question.points,
        acceptedAnswers: question.acceptedAnswers,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      })),
    };

    const answers: CourseExamAttemptAnswer[] = [];
    const questionResults: CourseExamAttemptQuestionResult[] = [];
    let score = 0;
    let maxScore = 0;

    for (const question of exam.questions) {
      const selectedOptionIds = answerMap.get(question.id) || [];
      const answerText = answerTextMap.get(question.id) || '';
      const correctOptionIds =
        question.type === 'drag_drop'
          ? question.options.map((option) => option.id)
          : question.options
              .filter((option) => option.isCorrect)
              .map((option) => option.id)
              .sort();
      const normalizedSelected = [...selectedOptionIds].sort();
      const acceptedAnswers = (question.acceptedAnswers || [])
        .map((answer) => answer.trim().toLowerCase())
        .filter(Boolean);
      let isCorrect = false;

      if (question.type === 'short_text') {
        isCorrect = acceptedAnswers.includes(answerText.trim().toLowerCase());
      } else if (question.type === 'drag_drop') {
        isCorrect =
          selectedOptionIds.length === question.options.length &&
          selectedOptionIds.every(
            (optionId, index) => optionId === question.options[index]?.id,
          );
      } else {
        isCorrect =
          normalizedSelected.length === correctOptionIds.length &&
          normalizedSelected.every(
            (optionId, index) => optionId === correctOptionIds[index],
          );
      }
      const earnedPoints = isCorrect ? question.points : 0;

      answers.push({
        questionId: question.id,
        selectedOptionIds,
        answerText,
      });

      questionResults.push({
        questionId: question.id,
        prompt: question.prompt,
        selectedOptionIds,
        correctOptionIds,
        answerText,
        acceptedAnswers: question.type === 'short_text' ? acceptedAnswers : undefined,
        isCorrect,
        earnedPoints,
        totalPoints: question.points,
        explanation: question.explanation,
      });

      score += earnedPoints;
      maxScore += question.points;
    }

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= exam.passingPercentage;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const attempt = await this.courseExamAttemptRepository.save(
      this.courseExamAttemptRepository.create({
        course,
        user,
        attemptNumber: existingAttempts.length + 1,
        answers,
        questionResults,
        examSnapshot: snapshot,
        score,
        maxScore,
        percentage: percentage.toFixed(2),
        passed,
        submittedAt: new Date(),
      }),
    );

    this.courseExamEmailProvider.sendLegacyAttemptSubmittedSafely(attempt);

    return this.mapAttempt(attempt);
  }

  async hasPassedExam(userId: number, courseId: number) {
    const legacyAttempt = await this.courseExamAttemptRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        passed: true,
      },
      order: { attemptNumber: 'DESC' },
    });

    if (legacyAttempt) {
      return true;
    }

    return this.examAttemptRepository.exists({
      where: {
        user: { id: userId },
        course: { id: courseId },
        passed: true,
      },
    });
  }

  private async ensureCourseWithExam(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!course.exam?.questions?.length) {
      throw new NotFoundException('Exam not configured for this course');
    }

    return course;
  }

  private async ensureEnrolled(courseId: number, userId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId }, isActive: true },
    });

    if (!enrollment) {
      throw new ForbiddenException('Only enrolled learners can access this exam');
    }

    return enrollment;
  }

  private sanitizeExam(exam: NonNullable<Course['exam']>) {
    return {
      ...exam,
      questions: exam.questions.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        type: question.type,
        points: question.points,
        explanation: question.explanation,
        acceptedAnswers:
          question.type === 'short_text' ? question.acceptedAnswers : undefined,
        options: question.options.map((option) => ({
          id: option.id,
          text: option.text,
        })),
      })),
    };
  }

  private async getUnlockState(course: Course, userId: number) {
    const override = await this.courseExamAccessOverrideRepository.findOne({
      where: { user: { id: userId }, course: { id: course.id } },
    });
    const checks: Array<{
      unlocked: boolean;
      progress: number;
      message: string;
    }> = [];

    if (hasRecordedLearning(course.mode)) {
      checks.push(await this.getLectureUnlockState(course.id, userId));
    }

    if (hasLiveClasses(course.mode)) {
      checks.push(
        await this.getLiveClassUnlockState(
          course,
          userId,
          Boolean(override?.bypassAttendanceRequirement),
        ),
      );
    }

    if (!checks.length) {
      checks.push(await this.getLectureUnlockState(course.id, userId));
    }

    const lockedCheck = checks.find((check) => !check.unlocked);

    return {
      isUnlocked: !lockedCheck,
      progress: Math.min(...checks.map((check) => check.progress)),
      message: lockedCheck?.message ?? 'Final exam is now unlocked.',
    };
  }

  private async getLectureUnlockState(courseId: number, userId: number) {
    const totalLectures = await this.lectureRepository.count({
      where: {
        isPublished: true,
        chapter: {
          course: { id: courseId },
        },
      },
      relations: ['chapter', 'chapter.course'],
    });

    if (!totalLectures) {
      return {
        unlocked: false,
        progress: 0,
        message: 'Final exam will unlock once course lectures are published.',
      };
    }

    const completedLectures = await this.userProgressRepository
      .createQueryBuilder('progress')
      .innerJoin('progress.lecture', 'lecture')
      .innerJoin('lecture.chapter', 'chapter')
      .where('progress.userId = :userId', { userId })
      .andWhere('chapter.courseId = :courseId', { courseId })
      .andWhere('progress.isCompleted = true')
      .andWhere('lecture.isPublished = true')
      .getCount();

    const progress = Math.min(
      100,
      Math.round((completedLectures / totalLectures) * 100),
    );

    return {
      unlocked: completedLectures >= totalLectures,
      progress,
      message:
        completedLectures >= totalLectures
          ? 'Recorded course content is complete.'
          : `Complete all course lectures before attempting the final exam. Current progress: ${progress}%.`,
    };
  }

  private async getLiveClassUnlockState(
    course: Course,
    userId: number,
    bypassAttendanceRequirement = false,
  ) {
    if (bypassAttendanceRequirement) {
      return {
        unlocked: true,
        progress: 100,
        message: 'Live class attendance requirement was waived for this learner.',
      };
    }

    const requirementType =
      course.liveClassAttendanceRequirementType || 'percentage';
    const requirementValue =
      Number(course.liveClassAttendanceRequirementValue || 0) ||
      (requirementType === 'percentage' ? 75 : 1);

    if (requirementType === 'none') {
      return {
        unlocked: true,
        progress: 100,
        message: 'Live class attendance is not required for this exam.',
      };
    }

    const courseId = course.id;
    const completedSessions = await this.classSessionRepository
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
      })
      .andWhere('session.endsAt <= :now', { now: new Date() })
      .getCount();

    if (!completedSessions) {
      return {
        unlocked: false,
        progress: 0,
        message:
          'Final exam will unlock once your faculty-led classes are completed and attendance is recorded.',
      };
    }

    const attendedSessions = await this.classAttendanceRepository
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
      .andWhere('session.endsAt <= :now', { now: new Date() })
      .getCount();

    const requiredAttendance =
      requirementType === 'all'
        ? completedSessions
        : requirementType === 'fixed'
          ? requirementValue
          : Math.ceil((completedSessions * requirementValue) / 100);
    const progressDenominator =
      requirementType === 'fixed' ? requiredAttendance : completedSessions;
    const progress = Math.min(
      100,
      Math.round((attendedSessions / Math.max(progressDenominator, 1)) * 100),
    );
    const remaining = Math.max(requiredAttendance - attendedSessions, 0);
    const attendancePercent = Math.round(
      (attendedSessions / completedSessions) * 100,
    );
    const policyMessage =
      requirementType === 'all'
        ? 'all completed live classes'
        : requirementType === 'fixed'
          ? `${requiredAttendance} live class${requiredAttendance === 1 ? '' : 'es'}`
          : `${requirementValue}% live class attendance`;

    return {
      unlocked: remaining === 0,
      progress,
      message:
        remaining === 0
          ? 'Live class attendance requirement is complete.'
          : `Attend ${remaining} more live class${remaining === 1 ? '' : 'es'} before attempting the final exam. Required: ${policyMessage}. Current: ${attendedSessions}/${completedSessions} completed classes attended (${attendancePercent}%).`,
    };
  }

  private async getEffectiveAttemptLimit(
    courseId: number,
    userId: number,
    exam: NonNullable<Course['exam']>,
  ) {
    const override = await this.courseExamAccessOverrideRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    const baseAttempts = Number(exam.maxAttempts || 0);
    const extraAttempts = Number(override?.extraAttempts || 0);

    return baseAttempts > 0 ? baseAttempts + extraAttempts : null;
  }

  private mapAttempt(attempt: CourseExamAttempt) {
    return {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: Number(attempt.percentage),
      passed: attempt.passed,
      submittedAt: attempt.submittedAt,
      createdAt: attempt.createdAt,
      questionResults: attempt.questionResults,
    };
  }
}
