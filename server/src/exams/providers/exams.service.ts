import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { CourseExamAccessOverride } from 'src/course-exams/course-exam-access-override.entity';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';
import { generateSlug } from 'src/common/utils/slug.util';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { Lecture } from 'src/lectures/lecture.entity';
import { UserProgres } from 'src/user-progress/user-progres.entity';
import { User } from 'src/users/user.entity';
import { In, LessThan, Not, Repository } from 'typeorm';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { CreateExamDto } from '../dtos/create-exam.dto';
import { CreateQuestionBankCategoryDto } from '../dtos/create-question-bank-category.dto';
import { CreateQuestionDto } from '../dtos/create-question.dto';
import { GetExamsDto } from '../dtos/get-exams.dto';
import { GetQuestionBankCategoriesDto } from '../dtos/get-question-bank-categories.dto';
import { GetQuestionsDto } from '../dtos/get-questions.dto';
import { ReplaceExamQuestionRulesDto } from '../dtos/replace-exam-question-rules.dto';
import { SubmitExamAttemptDto } from '../dtos/submit-exam-attempt.dto';
import { UpdateExamDto } from '../dtos/update-exam.dto';
import { UpdateQuestionBankCategoryDto } from '../dtos/update-question-bank-category.dto';
import { UpdateQuestionDto } from '../dtos/update-question.dto';
import { UpsertExamQuestionRuleDto } from '../dtos/upsert-exam-question-rule.dto';
import { ExamAttempt } from '../exam-attempt.entity';
import { Exam } from '../exam.entity';
import { ExamQuestionRule } from '../exam-question-rule.entity';
import { ExamAttemptStatus } from '../enums/exam-attempt-status.enum';
import { ExamQuestionRuleType } from '../enums/exam-question-rule-type.enum';
import { ExamStatus } from '../enums/exam-status.enum';
import { QuestionType } from '../enums/question-type.enum';
import { CorrectAnswerVisibility } from '../enums/correct-answer-visibility.enum';
import { Question } from '../question.entity';
import { QuestionBankCategory } from '../question-bank-category.entity';
import {
  ExamAnswerPayload,
  ExamAttemptQuestionConfigPayload,
  ExamQuestionResultPayload,
  QuestionContent,
} from '../types/question-content.type';
import { ExamEmailProvider } from './exam-email.provider';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(QuestionBankCategory)
    private readonly categoryRepository: Repository<QuestionBankCategory>,

    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(ExamQuestionRule)
    private readonly examQuestionRuleRepository: Repository<ExamQuestionRule>,

    @InjectRepository(ExamAttempt)
    private readonly examAttemptRepository: Repository<ExamAttempt>,

    @InjectRepository(CourseExamAccessOverride)
    private readonly courseExamAccessOverrideRepository: Repository<CourseExamAccessOverride>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,

    @InjectRepository(Lecture)
    private readonly lectureRepository: Repository<Lecture>,

    @InjectRepository(UserProgres)
    private readonly userProgressRepository: Repository<UserProgres>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly paginationProvider: PaginationProvider,
    private readonly examEmailProvider: ExamEmailProvider,
  ) {}

  async findCategories(query: GetQuestionBankCategoriesDto) {
    const categoryQuery = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .loadRelationCountAndMap('category.questionsCount', 'category.questions')
      .orderBy('category.createdAt', 'DESC');

    if (query.search?.trim()) {
      categoryQuery.andWhere('LOWER(category.name) LIKE :search', {
        search: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    if (query.parentId) {
      categoryQuery.andWhere('parent.id = :parentId', {
        parentId: query.parentId,
      });
    }

    return this.paginationProvider.paginateQueryBuilder(
      { page: query.page ?? 1, limit: query.limit ?? 10 },
      categoryQuery,
    );
  }

  async createCategory(
    dto: CreateQuestionBankCategoryDto,
    userId?: number,
  ): Promise<QuestionBankCategory> {
    const category = this.categoryRepository.create({
      name: dto.name,
      slug: await this.createUniqueSlug(this.categoryRepository, dto.name),
      description: dto.description,
      createdBy: userId ? ({ id: userId } as User) : null,
    });

    if (dto.parentId) {
      category.parent = await this.getCategoryOrFail(dto.parentId);
    }

    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: number,
    dto: UpdateQuestionBankCategoryDto,
  ): Promise<QuestionBankCategory> {
    const category = await this.getCategoryOrFail(id);

    if (dto.name) {
      category.name = dto.name;
      category.slug = await this.createUniqueSlug(
        this.categoryRepository,
        dto.name,
        id,
      );
    }

    if (dto.description !== undefined) {
      category.description = dto.description;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId) {
        await this.ensureCategoryCanUseParent(id, dto.parentId);
      }
      category.parent = dto.parentId
        ? await this.getCategoryOrFail(dto.parentId)
        : null;
    }

    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: number): Promise<{ deleted: boolean; id: number }> {
    const category = await this.getCategoryOrFail(id);
    const childCount = await this.categoryRepository.count({
      where: { parent: { id } },
    });

    if (childCount > 0) {
      throw new BadRequestException(
        'Delete or move child categories before deleting this category',
      );
    }

    await this.questionRepository.update(
      { category: { id } },
      { category: null },
    );
    await this.categoryRepository.softRemove(category);

    return { deleted: true, id };
  }

  async findQuestions(query: GetQuestionsDto) {
    const questionQuery = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .orderBy('question.createdAt', 'DESC');

    if (query.search?.trim()) {
      questionQuery.andWhere(
        '(LOWER(question.title) LIKE :search OR LOWER(question.prompt) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    if (query.type) {
      questionQuery.andWhere('question.type = :type', { type: query.type });
    }

    if (query.categoryId) {
      questionQuery.andWhere('category.id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.isActive !== undefined) {
      questionQuery.andWhere('question.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    return this.paginationProvider.paginateQueryBuilder(
      { page: query.page ?? 1, limit: query.limit ?? 10 },
      questionQuery,
    );
  }

  async createQuestion(
    dto: CreateQuestionDto,
    userId?: number,
  ): Promise<Question> {
    const question = this.questionRepository.create({
      title: dto.title,
      prompt: dto.prompt,
      type: dto.type,
      content: dto.content ?? {},
      defaultPoints: this.toDecimal(dto.defaultPoints ?? 1),
      defaultNegativeMarks: this.toDecimal(dto.defaultNegativeMarks ?? 0),
      allowPartialMarking: dto.allowPartialMarking ?? true,
      isActive: dto.isActive ?? true,
      explanation: dto.explanation,
      createdBy: userId ? ({ id: userId } as User) : null,
      updatedBy: userId ? ({ id: userId } as User) : null,
    });

    if (dto.categoryId) {
      question.category = await this.getCategoryOrFail(dto.categoryId);
    }

    return this.questionRepository.save(question);
  }

  async updateQuestion(
    id: number,
    dto: UpdateQuestionDto,
    userId?: number,
  ): Promise<Question> {
    const question = await this.getQuestionOrFail(id);

    Object.assign(question, {
      title: dto.title ?? question.title,
      prompt: dto.prompt ?? question.prompt,
      type: dto.type ?? question.type,
      content: dto.content ?? question.content,
      defaultPoints:
        dto.defaultPoints !== undefined
          ? this.toDecimal(dto.defaultPoints)
          : question.defaultPoints,
      defaultNegativeMarks:
        dto.defaultNegativeMarks !== undefined
          ? this.toDecimal(dto.defaultNegativeMarks)
          : question.defaultNegativeMarks,
      allowPartialMarking:
        dto.allowPartialMarking ?? question.allowPartialMarking,
      isActive: dto.isActive ?? question.isActive,
      explanation:
        dto.explanation !== undefined ? dto.explanation : question.explanation,
      updatedBy: userId ? ({ id: userId } as User) : question.updatedBy,
    });

    if (dto.categoryId !== undefined) {
      question.category = dto.categoryId
        ? await this.getCategoryOrFail(dto.categoryId)
        : null;
    }

    return this.questionRepository.save(question);
  }

  async deleteQuestion(id: number): Promise<{ deleted: boolean; id: number }> {
    const question = await this.getQuestionOrFail(id);
    const usedInRules = await this.examQuestionRuleRepository.count({
      where: { question: { id } },
    });

    if (usedInRules > 0) {
      throw new BadRequestException(
        'This question is used in exams. Remove it from exam rules before deleting.',
      );
    }

    await this.questionRepository.softRemove(question);
    return { deleted: true, id };
  }

  async findExams(query: GetExamsDto) {
    const examQuery = this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.courses', 'course')
      .leftJoinAndSelect('exam.faculties', 'faculty')
      .loadRelationCountAndMap('exam.questionsCount', 'exam.questionRules')
      .loadRelationCountAndMap('exam.attemptsCount', 'exam.attempts')
      .orderBy('exam.createdAt', 'DESC');

    if (query.search?.trim()) {
      examQuery.andWhere('LOWER(exam.title) LIKE :search', {
        search: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    if (query.status) {
      examQuery.andWhere('exam.status = :status', { status: query.status });
    }

    if (query.courseId) {
      examQuery.andWhere('course.id = :courseId', { courseId: query.courseId });
    }

    if (query.facultyId) {
      examQuery.andWhere('faculty.id = :facultyId', {
        facultyId: query.facultyId,
      });
    }

    return this.paginationProvider.paginateQueryBuilder(
      { page: query.page ?? 1, limit: query.limit ?? 10 },
      examQuery,
    );
  }

  async findExamById(id: number): Promise<Exam> {
    const exam = await this.examRepository.findOne({
      where: { id },
      relations: {
        courses: true,
        faculties: true,
        questionRules: {
          question: { category: true },
          category: true,
        },
      },
      order: {
        questionRules: {
          order: 'ASC',
          id: 'ASC',
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  async findExamByIdForUser(id: number, user: ActiveUserData): Promise<Exam> {
    await this.assertCanManageExam(id, user);
    return this.findExamById(id);
  }

  async assertCanManageExam(id: number, user: ActiveUserData): Promise<void> {
    if (user.roles?.includes('admin')) {
      return;
    }

    const hasExamPermission = user.permissions?.some((permission) =>
      [
        'view_exam',
        'create_exam',
        'update_exam',
        'delete_exam',
        'manage_exam_rules',
        'grade_exam_attempt',
      ].includes(permission),
    );

    if (!user.roles?.includes('faculty') && !hasExamPermission) {
      throw new ForbiddenException('Only assigned faculty can manage this exam');
    }

    const exam = await this.examRepository.findOne({
      where: { id },
      relations: {
        faculties: true,
        courses: {
          faculties: true,
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const assignedDirectly = exam.faculties?.some(
      (faculty) => faculty.id === user.sub,
    );
    const assignedByCourse = exam.courses?.some((course) =>
      course.faculties?.some((faculty) => faculty.id === user.sub),
    );

    if (!assignedDirectly && !assignedByCourse) {
      throw new ForbiddenException('You can only manage assigned exams');
    }
  }

  async getCourseExamForLearner(courseId: number, userId: number) {
    await this.ensureActiveEnrollment(courseId, userId);
    const unlockState = await this.getCourseCompletionState(courseId, userId);
    const exam = await this.getPublishedExamForCourse(courseId);

    if (!exam) {
      return null;
    }

    await this.autoSubmitExpiredAttempts(exam, courseId, userId);

    const attempts = await this.examAttemptRepository.find({
      where: {
        exam: { id: exam.id },
        user: { id: userId },
        course: { id: courseId },
      },
      order: { createdAt: 'DESC' },
    });

    const attemptLimit = await this.getEffectiveAttemptLimit(
      courseId,
      userId,
      exam.attemptLimit ?? null,
    );
    const passedAttempt = attempts.find((attempt) => attempt.passed) ?? null;
    const activeAttempt =
      attempts.find(
        (attempt) => attempt.status === ExamAttemptStatus.InProgress,
      ) ?? null;
    const attemptsUsed = attempts.filter(
      (attempt) => attempt.status !== ExamAttemptStatus.InProgress,
    ).length;
    const canAttempt =
      unlockState.isUnlocked &&
      !passedAttempt &&
      !activeAttempt &&
      (attemptLimit === null || attemptsUsed < attemptLimit);

    return {
      exam: this.sanitizeExamForLearner(exam, false),
      activeAttempt: activeAttempt
        ? await this.mapAttemptForLearner(activeAttempt, false)
        : null,
      attempts: attempts.map((attempt) => this.mapAttemptSummary(attempt)),
      attemptsUsed,
      extraAttempts: await this.getExtraAttempts(courseId, userId),
      effectiveAttemptLimit: attemptLimit,
      attemptsRemaining:
        attemptLimit === null ? null : Math.max(attemptLimit - attemptsUsed, 0),
      canAttempt,
      isPassed: Boolean(passedAttempt),
      isUnlocked: unlockState.isUnlocked,
      unlockProgress: unlockState.progress,
      unlockMessage: unlockState.message,
    };
  }

  async startCourseExamAttempt(
    courseId: number,
    userId: number,
    ipAddress?: string,
    userAgent?: string | string[],
  ) {
    await this.ensureActiveEnrollment(courseId, userId);
    const unlockState = await this.getCourseCompletionState(courseId, userId);

    if (!unlockState.isUnlocked) {
      throw new ForbiddenException(unlockState.message);
    }

    const exam = await this.getPublishedExamForCourse(courseId);

    if (!exam) {
      throw new NotFoundException('Exam not found for this course');
    }

    const learnerState = await this.getCourseExamForLearner(courseId, userId);

    if (!learnerState?.canAttempt) {
      throw new BadRequestException('No exam attempts available');
    }

    this.ensureIpAllowed(exam, ipAddress);
    const questionConfigs = await this.resolveExamQuestionConfigs(exam);
    const questionIds = questionConfigs.map((config) => config.questionId);
    const shuffledQuestionIds = exam.randomizeQuestions
      ? this.shuffle(questionIds)
      : questionIds;
    const configMap = new Map(
      questionConfigs.map((config) => [config.questionId, config]),
    );
    const orderedConfigs = shuffledQuestionIds
      .map((questionId) => configMap.get(questionId))
      .filter(Boolean) as ExamAttemptQuestionConfigPayload[];
    const questions = await this.questionRepository.find({
      where: { id: In(shuffledQuestionIds) },
      relations: { category: true },
    });
    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );
    const shuffledOptionMap = this.buildShuffledOptionMap(
      shuffledQuestionIds
        .map((questionId) => questionMap.get(questionId))
        .filter(Boolean) as Question[],
      exam.shuffleOptions,
    );
    const startedAt = new Date();
    const expiresAt = exam.serverTimerEnabled && exam.durationMinutes
      ? new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000)
      : null;

    const attempt = await this.examAttemptRepository.save(
      this.examAttemptRepository.create({
        exam,
        user: { id: userId } as User,
        course: { id: courseId } as Course,
        status: ExamAttemptStatus.InProgress,
        startedAt,
        expiresAt,
        ipAddress,
        userAgent: Array.isArray(userAgent) ? userAgent.join(', ') : userAgent,
        randomizedQuestionIds: shuffledQuestionIds,
        questionConfigs: orderedConfigs,
        shuffledOptionMap,
      }),
    );

    return this.mapAttemptForLearner(attempt, false);
  }

  async submitExamAttempt(
    attemptId: number,
    userId: number,
    dto: SubmitExamAttemptDto,
  ) {
    const attempt = await this.examAttemptRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: {
        exam: {
          questionRules: {
            question: true,
            category: true,
          },
        },
        course: true,
        user: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status !== ExamAttemptStatus.InProgress) {
      throw new BadRequestException('Attempt is already submitted');
    }

    const now = new Date();
    const isExpired = attempt.expiresAt ? now > attempt.expiresAt : false;
    const questions = await this.getAttemptQuestions(attempt);
    const previousFailedAttempts = await this.examAttemptRepository.count({
      where: {
        exam: { id: attempt.exam.id },
        user: { id: userId },
        course: attempt.course ? { id: attempt.course.id } : undefined,
        passed: false,
        status: Not(ExamAttemptStatus.InProgress),
      },
    });
    const result = this.gradeAttempt(
      questions,
      attempt.questionConfigs,
      dto.answers,
      attempt.exam.adaptiveMode ? previousFailedAttempts : 0,
      Number(attempt.exam.retryPenaltyPercentage || 0),
    );

    attempt.answers = dto.answers as ExamAnswerPayload[];
    attempt.questionResults = result.questionResults;
    attempt.score = this.toDecimal(result.score);
    attempt.maxScore = this.toDecimal(result.maxScore);
    attempt.percentage = this.toDecimal(result.percentage);
    attempt.passed =
      result.percentage >= Number(attempt.exam.passingPercentage);
    attempt.needsManualGrading = result.needsManualGrading;
    attempt.submittedAt = now;
    const autoSubmitted = dto.autoSubmitted || isExpired;
    attempt.autoSubmittedAt = autoSubmitted ? now : null;
    attempt.status = result.needsManualGrading
      ? ExamAttemptStatus.PendingManualGrading
      : autoSubmitted
        ? ExamAttemptStatus.AutoSubmitted
        : ExamAttemptStatus.Graded;

    const savedAttempt = await this.examAttemptRepository.save(attempt);
    this.examEmailProvider.sendAttemptSubmittedSafely(savedAttempt);
    return this.mapAttemptForLearner(
      savedAttempt,
      true,
      this.canShowCorrectAnswers(savedAttempt.exam, savedAttempt),
    );
  }

  async createExam(dto: CreateExamDto, userId?: number): Promise<Exam> {
    const exam = this.examRepository.create({
      ...this.mapExamDto(dto),
      title: dto.title,
      slug: await this.createUniqueSlug(this.examRepository, dto.title),
      createdBy: userId ? ({ id: userId } as User) : null,
      updatedBy: userId ? ({ id: userId } as User) : null,
    });

    await this.assignExamRelations(exam, dto.courseIds, dto.facultyIds);

    if (exam.status === ExamStatus.Published) {
      this.ensureExamReadyToPublish(exam);
    }

    return this.examRepository.save(exam);
  }

  async updateExam(
    id: number,
    dto: UpdateExamDto,
    userId?: number,
  ): Promise<Exam> {
    const exam = await this.findExamById(id);

    Object.assign(exam, this.mapExamDto(dto));

    if (dto.title) {
      exam.title = dto.title;
      exam.slug = await this.createUniqueSlug(
        this.examRepository,
        dto.title,
        id,
      );
    }

    exam.updatedBy = userId ? ({ id: userId } as User) : exam.updatedBy;

    await this.assignExamRelations(exam, dto.courseIds, dto.facultyIds);

    if (exam.status === ExamStatus.Published) {
      this.ensureExamReadyToPublish(exam);
    }

    return this.examRepository.save(exam);
  }

  async replaceQuestionRules(
    examId: number,
    dto: ReplaceExamQuestionRulesDto,
  ): Promise<Exam> {
    const exam = await this.findExamById(examId);
    await this.examQuestionRuleRepository.delete({ exam: { id: examId } });

    const rules = await Promise.all(
      dto.rules.map((rule, index) =>
        this.createQuestionRuleEntity(exam, rule, index),
      ),
    );

    await this.examQuestionRuleRepository.save(rules);
    return this.findExamById(examId);
  }

  async deleteExam(id: number): Promise<{ deleted: boolean; id: number }> {
    const exam = await this.findExamById(id);
    await this.examRepository.softRemove(exam);
    return { deleted: true, id };
  }

  private async getPublishedExamForCourse(
    courseId: number,
  ): Promise<Exam | null> {
    return this.examRepository
      .createQueryBuilder('exam')
      .leftJoinAndSelect('exam.courses', 'course')
      .leftJoinAndSelect('exam.questionRules', 'rule')
      .leftJoinAndSelect('rule.question', 'question')
      .leftJoinAndSelect('rule.category', 'category')
      .where('course.id = :courseId', { courseId })
      .andWhere('exam.status = :status', { status: ExamStatus.Published })
      .orderBy('exam.createdAt', 'DESC')
      .addOrderBy('rule.order', 'ASC')
      .getOne();
  }

  private async ensureActiveEnrollment(courseId: number, userId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        course: { id: courseId },
        user: { id: userId },
        isActive: true,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }
  }

  private async resolveExamQuestionConfigs(
    exam: Exam,
  ): Promise<ExamAttemptQuestionConfigPayload[]> {
    const configs: ExamAttemptQuestionConfigPayload[] = [];

    for (const rule of exam.questionRules ?? []) {
      if (
        rule.ruleType === ExamQuestionRuleType.FixedQuestion &&
        rule.question
      ) {
        configs.push(this.createQuestionConfig(rule.question, rule));
        continue;
      }

      if (
        rule.ruleType === ExamQuestionRuleType.RandomFromCategory &&
        rule.category
      ) {
        const questions = await this.questionRepository.find({
          where: {
            category: { id: rule.category.id },
            isActive: true,
          },
        });
        const selected = this.shuffle(questions).slice(
          0,
          rule.randomQuestionCount ?? 1,
        );
        configs.push(
          ...selected.map((question) =>
            this.createQuestionConfig(question, rule),
          ),
        );
      }
    }

    const seen = new Set<number>();
    return configs.filter((config) => {
      if (seen.has(config.questionId)) {
        return false;
      }
      seen.add(config.questionId);
      return true;
    });
  }

  private async getAttemptQuestions(attempt: ExamAttempt): Promise<Question[]> {
    const questions = await this.questionRepository.find({
      where: { id: In(attempt.randomizedQuestionIds) },
    });
    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );
    return attempt.randomizedQuestionIds
      .map((questionId) => questionMap.get(questionId))
      .filter(Boolean) as Question[];
  }

  private gradeAttempt(
    questions: Question[],
    questionConfigs: ExamAttemptQuestionConfigPayload[],
    answers: ExamAnswerPayload[],
    failedAttemptCount: number,
    retryPenaltyPercentage: number,
  ): {
    score: number;
    maxScore: number;
    percentage: number;
    needsManualGrading: boolean;
    questionResults: ExamQuestionResultPayload[];
  } {
    const answerMap = new Map(
      answers.map((answer) => [answer.questionId, answer]),
    );
    const configMap = new Map(
      questionConfigs.map((config) => [config.questionId, config]),
    );
    let score = 0;
    let maxScore = 0;
    let needsManualGrading = false;
    const questionResults: ExamQuestionResultPayload[] = [];

    for (const question of questions) {
      const config = configMap.get(question.id);
      const maxQuestionScore =
        (config?.points ?? Number(question.defaultPoints || 0)) *
        (config?.weight ?? 1);
      maxScore += maxQuestionScore;
      const answer = answerMap.get(question.id)?.answer ?? null;
      const graded = this.gradeQuestion(question, answer, config);
      score += graded.score;
      needsManualGrading = needsManualGrading || graded.needsManualGrading;
      questionResults.push({
        questionId: question.id,
        score: graded.score,
        maxScore: maxQuestionScore,
        isCorrect: graded.isCorrect,
        needsManualGrading: graded.needsManualGrading,
        feedback: graded.feedback,
      });
    }

    const penaltyMultiplier = Math.max(
      0,
      1 - (failedAttemptCount * retryPenaltyPercentage) / 100,
    );
    const finalScore = Math.max(score * penaltyMultiplier, 0);
    const percentage = maxScore ? (finalScore / maxScore) * 100 : 0;
    return {
      score: finalScore,
      maxScore,
      percentage,
      needsManualGrading,
      questionResults,
    };
  }

  private gradeQuestion(
    question: Question,
    answer: ExamAnswerPayload['answer'],
    config?: ExamAttemptQuestionConfigPayload,
  ): {
    score: number;
    isCorrect?: boolean;
    needsManualGrading: boolean;
    feedback?: string;
  } {
    const weight = config?.weight ?? 1;
    const points =
      (config?.points ?? Number(question.defaultPoints || 0)) * weight;
    const negativeMarks =
      (config?.negativeMarks ?? Number(question.defaultNegativeMarks || 0)) *
      weight;
    const content = question.content ?? {};

    if (question.type === QuestionType.Essay) {
      return {
        score: 0,
        needsManualGrading: true,
        feedback: 'Pending manual grading',
      };
    }

    if (question.type === QuestionType.ShortAnswer) {
      const normalizedAnswer = this.toScalarAnswerString(answer)
        .trim()
        .toLowerCase();
      const isCorrect = (content.acceptedAnswers ?? []).some(
        (acceptedAnswer) =>
          acceptedAnswer.trim().toLowerCase() === normalizedAnswer,
      );
      return {
        score: isCorrect ? points : -negativeMarks,
        isCorrect,
        needsManualGrading: false,
      };
    }

    if (question.type === QuestionType.Numerical) {
      const value = Number(this.toScalarAnswerString(answer));
      const isCorrect = (content.numericalAnswers ?? []).some((item) => {
        const tolerance = item.tolerance ?? 0;
        return Math.abs(value - item.value) <= tolerance;
      });
      return {
        score: isCorrect ? points : -negativeMarks,
        isCorrect,
        needsManualGrading: false,
      };
    }

    const correctOptionIds = (content.options ?? [])
      .filter((option) => option.isCorrect)
      .map((option) => option.id);
    const answerIds = Array.isArray(answer)
      ? answer.map((item) => this.toScalarAnswerString(item))
      : answer
        ? [this.toScalarAnswerString(answer)]
        : [];

    if (
      question.type === QuestionType.McqMultiple &&
      question.allowPartialMarking
    ) {
      const correctSelected = answerIds.filter((id) =>
        correctOptionIds.includes(id),
      ).length;
      const incorrectSelected = answerIds.filter(
        (id) => !correctOptionIds.includes(id),
      ).length;
      const partialScore = correctOptionIds.length
        ? (correctSelected / correctOptionIds.length) * points
        : 0;
      const finalScore = Math.max(
        partialScore - incorrectSelected * negativeMarks,
        0,
      );
      return {
        score: finalScore,
        isCorrect:
          correctSelected === correctOptionIds.length &&
          incorrectSelected === 0,
        needsManualGrading: false,
      };
    }

    const isCorrect =
      answerIds.length === correctOptionIds.length &&
      answerIds.every((id) => correctOptionIds.includes(id));

    return {
      score: isCorrect ? points : -negativeMarks,
      isCorrect,
      needsManualGrading: false,
    };
  }

  private sanitizeExamForLearner(exam: Exam, includeQuestions: boolean) {
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      instructions: exam.instructions,
      passingPercentage: Number(exam.passingPercentage),
      durationMinutes: exam.durationMinutes,
      attemptLimit: exam.attemptLimit,
      randomizeQuestions: exam.randomizeQuestions,
      shuffleOptions: exam.shuffleOptions,
      fullscreenRequired: exam.fullscreenRequired,
      serverTimerEnabled: exam.serverTimerEnabled,
      autoSubmitEnabled: exam.autoSubmitEnabled,
      perQuestionFeedbackEnabled: exam.perQuestionFeedbackEnabled,
      overallFeedback: exam.overallFeedback,
      correctAnswerVisibility: exam.correctAnswerVisibility,
      questions: includeQuestions ? [] : undefined,
    };
  }

  private async mapAttemptForLearner(
    attempt: ExamAttempt,
    includeResults: boolean,
    includeCorrectAnswers = false,
  ) {
    const questions = await this.getAttemptQuestions(attempt);

    return {
      ...this.mapAttemptSummary(attempt),
      questions: questions.map((question) =>
        this.sanitizeQuestionForLearner(
          question,
          attempt.shuffledOptionMap[String(question.id)] ?? [],
          attempt.questionConfigs.find(
            (config) => config.questionId === question.id,
          ),
          includeCorrectAnswers,
        ),
      ),
      answers: includeResults ? attempt.answers : undefined,
      questionResults: includeResults ? attempt.questionResults : undefined,
    };
  }

  private mapAttemptSummary(attempt: ExamAttempt) {
    return {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      submittedAt: attempt.submittedAt,
      score: Number(attempt.score),
      maxScore: Number(attempt.maxScore),
      percentage: Number(attempt.percentage),
      passed: attempt.passed,
      needsManualGrading: attempt.needsManualGrading,
    };
  }

  private sanitizeQuestionForLearner(
    question: Question,
    optionOrder: string[],
    config?: ExamAttemptQuestionConfigPayload,
    includeCorrectAnswers = false,
  ) {
    const content = question.content ?? {};
    const orderedOptions = this.orderOptions(content, optionOrder).map(
      (option) => ({
        id: option.id,
        text: option.text,
        matchKey: option.matchKey,
        isCorrect: includeCorrectAnswers ? option.isCorrect : undefined,
      }),
    );

    return {
      id: question.id,
      title: question.title,
      prompt: question.prompt,
      type: question.type,
      points:
        (config?.points ?? Number(question.defaultPoints)) *
        (config?.weight ?? 1),
      allowPartialMarking: question.allowPartialMarking,
      options: orderedOptions,
      matchingPairs: content.matchingPairs ?? [],
      acceptedAnswers: includeCorrectAnswers
        ? content.acceptedAnswers
        : undefined,
      numericalAnswers: includeCorrectAnswers
        ? content.numericalAnswers
        : undefined,
      explanation: includeCorrectAnswers ? question.explanation : undefined,
    };
  }

  private orderOptions(content: QuestionContent, optionOrder: string[]) {
    const options = content.options ?? [];
    const optionMap = new Map(options.map((option) => [option.id, option]));

    if (!optionOrder.length) {
      return options;
    }

    return optionOrder
      .map((optionId) => optionMap.get(optionId))
      .filter(Boolean) as NonNullable<QuestionContent['options']>;
  }

  private buildShuffledOptionMap(
    questions: Question[],
    shuffleOptions: boolean,
  ) {
    return Object.fromEntries(
      questions.map((question) => {
        const optionIds = (question.content?.options ?? []).map(
          (option) => option.id,
        );
        return [
          String(question.id),
          shuffleOptions ? this.shuffle(optionIds) : optionIds,
        ];
      }),
    );
  }

  private createQuestionConfig(
    question: Question,
    rule: ExamQuestionRule,
  ): ExamAttemptQuestionConfigPayload {
    const points = rule.pointsOverride
      ? Number(rule.pointsOverride)
      : Number(question.defaultPoints || 0);
    const negativeMarks = rule.negativeMarksOverride
      ? Number(rule.negativeMarksOverride)
      : Number(question.defaultNegativeMarks || 0);

    return {
      questionId: question.id,
      points,
      negativeMarks,
      weight: Number(rule.weight || 1),
      ruleId: rule.id,
    };
  }

  private async getEffectiveAttemptLimit(
    courseId: number,
    userId: number,
    baseAttemptLimit: number | null,
  ): Promise<number | null> {
    if (baseAttemptLimit === null) {
      return null;
    }

    return baseAttemptLimit + (await this.getExtraAttempts(courseId, userId));
  }

  private async getExtraAttempts(
    courseId: number,
    userId: number,
  ): Promise<number> {
    const override = await this.courseExamAccessOverrideRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    return Number(override?.extraAttempts || 0);
  }

  private canShowCorrectAnswers(exam: Exam, attempt: ExamAttempt): boolean {
    if (exam.correctAnswerVisibility === CorrectAnswerVisibility.Never) {
      return false;
    }

    if (
      exam.correctAnswerVisibility === CorrectAnswerVisibility.AfterPassing
    ) {
      return attempt.passed;
    }

    return (
      exam.correctAnswerVisibility === CorrectAnswerVisibility.AfterSubmit ||
      exam.correctAnswerVisibility === CorrectAnswerVisibility.AfterExamClose
    );
  }

  private async autoSubmitExpiredAttempts(
    exam: Exam,
    courseId: number,
    userId: number,
  ) {
    if (!exam.autoSubmitEnabled) {
      return;
    }

    const expiredAttempts = await this.examAttemptRepository.find({
      where: {
        exam: { id: exam.id },
        course: { id: courseId },
        user: { id: userId },
        status: ExamAttemptStatus.InProgress,
        expiresAt: LessThan(new Date()),
      },
      relations: { exam: true, course: true, user: true },
    });

    for (const attempt of expiredAttempts) {
      const questions = await this.getAttemptQuestions(attempt);
      const result = this.gradeAttempt(
        questions,
        attempt.questionConfigs,
        [],
        0,
        Number(exam.retryPenaltyPercentage || 0),
      );
      const now = new Date();

      attempt.answers = [];
      attempt.questionResults = result.questionResults;
      attempt.score = this.toDecimal(result.score);
      attempt.maxScore = this.toDecimal(result.maxScore);
      attempt.percentage = this.toDecimal(result.percentage);
      attempt.passed = result.percentage >= Number(exam.passingPercentage);
      attempt.needsManualGrading = result.needsManualGrading;
      attempt.submittedAt = now;
      attempt.autoSubmittedAt = now;
      attempt.status = result.needsManualGrading
        ? ExamAttemptStatus.PendingManualGrading
        : ExamAttemptStatus.AutoSubmitted;

      await this.examAttemptRepository.save(attempt);
      this.examEmailProvider.sendAttemptSubmittedSafely(attempt);
    }
  }

  private async getCourseCompletionState(courseId: number, userId: number) {
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
        isUnlocked: false,
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
      isUnlocked: completedLectures >= totalLectures,
      progress,
      message:
        completedLectures >= totalLectures
          ? 'Final exam is now unlocked.'
          : `Complete all course lectures before attempting the final exam. Current progress: ${progress}%.`,
    };
  }

  private ensureIpAllowed(exam: Exam, ipAddress?: string) {
    const ranges = exam.allowedIpRanges?.filter(Boolean) ?? [];

    if (!ranges.length) {
      return;
    }

    if (!ipAddress) {
      throw new ForbiddenException('Exam is restricted to allowed locations');
    }

    const normalizedIp = ipAddress.replace('::ffff:', '');
    const isAllowed = ranges.some((range) =>
      this.isIpAllowed(normalizedIp, range.trim()),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Exam is restricted to allowed locations');
    }
  }

  private isIpAllowed(ipAddress: string, range: string): boolean {
    if (range === ipAddress) {
      return true;
    }

    if (range.endsWith('*')) {
      return ipAddress.startsWith(range.slice(0, -1));
    }

    if (!range.includes('/')) {
      return false;
    }

    const [baseIp, bitsText] = range.split('/');
    const bits = Number(bitsText);

    if (!Number.isInteger(bits) || bits < 0 || bits > 32) {
      return false;
    }

    const ipNumber = this.ipv4ToNumber(ipAddress);
    const baseNumber = this.ipv4ToNumber(baseIp);

    if (ipNumber === null || baseNumber === null) {
      return false;
    }

    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return (ipNumber & mask) === (baseNumber & mask);
  }

  private ipv4ToNumber(ipAddress: string): number | null {
    const parts = ipAddress.split('.').map(Number);

    if (
      parts.length !== 4 ||
      parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
    ) {
      return null;
    }

    return (
      ((parts[0] << 24) >>> 0) +
      ((parts[1] << 16) >>> 0) +
      ((parts[2] << 8) >>> 0) +
      parts[3]
    );
  }

  private toScalarAnswerString(value: unknown): string {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    return '';
  }

  private shuffle<T>(items: T[]): T[] {
    const next = [...items];

    for (let index = next.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
    }

    return next;
  }

  private async createQuestionRuleEntity(
    exam: Exam,
    dto: UpsertExamQuestionRuleDto,
    index: number,
  ): Promise<ExamQuestionRule> {
    const rule = this.examQuestionRuleRepository.create({
      exam,
      ruleType: dto.ruleType,
      order: dto.order ?? index,
      randomQuestionCount: dto.randomQuestionCount,
      pointsOverride:
        dto.pointsOverride !== undefined
          ? this.toDecimal(dto.pointsOverride)
          : null,
      negativeMarksOverride:
        dto.negativeMarksOverride !== undefined
          ? this.toDecimal(dto.negativeMarksOverride)
          : null,
      weight: this.toDecimal(dto.weight ?? 1),
      isRequired: dto.isRequired ?? true,
    });

    if (dto.ruleType === ExamQuestionRuleType.FixedQuestion) {
      if (!dto.questionId) {
        throw new BadRequestException('questionId is required');
      }
      rule.question = await this.getQuestionOrFail(dto.questionId);
      return rule;
    }

    if (!dto.categoryId) {
      throw new BadRequestException('categoryId is required');
    }
    rule.category = await this.getCategoryOrFail(dto.categoryId);
    return rule;
  }

  private async assignExamRelations(
    exam: Exam,
    courseIds?: number[],
    facultyIds?: number[],
  ): Promise<void> {
    if (courseIds !== undefined) {
      exam.courses = courseIds.length
        ? await this.courseRepository.findBy({ id: In(courseIds) })
        : [];
    }

    if (facultyIds !== undefined) {
      exam.faculties = facultyIds.length
        ? await this.userRepository.findBy({ id: In(facultyIds) })
        : [];
    }
  }

  private ensureExamReadyToPublish(exam: Exam) {
    if (!exam.courses?.length) {
      throw new BadRequestException(
        'Assign at least one course before publishing',
      );
    }

    if (!exam.questionRules?.length) {
      throw new BadRequestException('Add question rules before publishing');
    }
  }

  private async getCategoryOrFail(id: number): Promise<QuestionBankCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException('Question bank category not found');
    }

    return category;
  }

  private async ensureCategoryCanUseParent(
    categoryId: number,
    parentId: number,
  ) {
    let currentParentId: number | undefined = parentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        throw new BadRequestException(
          'Category cannot be moved under its own child category',
        );
      }

      const current = await this.categoryRepository.findOne({
        where: { id: currentParentId },
        relations: { parent: true },
      });

      currentParentId = current?.parent?.id;
    }
  }

  private async getQuestionOrFail(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  private mapExamDto(dto: Partial<CreateExamDto>) {
    return {
      description: dto.description,
      instructions: dto.instructions,
      status: dto.status,
      passingPercentage:
        dto.passingPercentage !== undefined
          ? this.toDecimal(dto.passingPercentage)
          : undefined,
      durationMinutes: dto.durationMinutes,
      attemptLimit: dto.attemptLimit,
      randomizeQuestions: dto.randomizeQuestions,
      shuffleOptions: dto.shuffleOptions,
      adaptiveMode: dto.adaptiveMode,
      retryPenaltyPercentage:
        dto.retryPenaltyPercentage !== undefined
          ? this.toDecimal(dto.retryPenaltyPercentage)
          : undefined,
      partialMarking: dto.partialMarking,
      fullscreenRequired: dto.fullscreenRequired,
      allowedIpRanges: dto.allowedIpRanges,
      serverTimerEnabled: dto.serverTimerEnabled,
      autoSubmitEnabled: dto.autoSubmitEnabled,
      reminderBeforeMinutes: dto.reminderBeforeMinutes,
      cleanupExpiredAttemptsAfterDays: dto.cleanupExpiredAttemptsAfterDays,
      perQuestionFeedbackEnabled: dto.perQuestionFeedbackEnabled,
      overallFeedback: dto.overallFeedback,
      correctAnswerVisibility: dto.correctAnswerVisibility,
    };
  }

  private async createUniqueSlug<T extends { id: number; slug: string }>(
    repository: Repository<T>,
    value: string,
    ignoreId?: number,
  ): Promise<string> {
    const baseSlug = generateSlug(value);
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const query = repository
        .createQueryBuilder('entity')
        .where('entity.slug = :slug', { slug });

      if (ignoreId) {
        query.andWhere('entity.id != :ignoreId', { ignoreId });
      }

      const exists = await query.getExists();

      if (!exists) {
        return slug;
      }

      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
  }

  private toDecimal(value: number): string {
    return value.toFixed(2);
  }
}
