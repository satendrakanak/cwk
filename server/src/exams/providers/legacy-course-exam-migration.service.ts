import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from 'src/courses/course.entity';
import { generateSlug } from 'src/common/utils/slug.util';
import { Repository } from 'typeorm';
import { ExamQuestionRule } from '../exam-question-rule.entity';
import { Exam } from '../exam.entity';
import { ExamQuestionRuleType } from '../enums/exam-question-rule-type.enum';
import { ExamStatus } from '../enums/exam-status.enum';
import { QuestionType } from '../enums/question-type.enum';
import { Question } from '../question.entity';
import { QuestionBankCategory } from '../question-bank-category.entity';
import { QuestionContent } from '../types/question-content.type';

type LegacyCourseExamQuestion = {
  id: string;
  prompt: string;
  type: 'single' | 'multiple' | 'true_false' | 'short_text' | 'drag_drop';
  points: number;
  explanation?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  acceptedAnswers?: string[];
};

type LegacyCourseExam = {
  title: string;
  description?: string;
  instructions?: string;
  passingPercentage: number;
  maxAttempts: number;
  timeLimitMinutes?: number | null;
  showResultImmediately: boolean;
  isPublished: boolean;
  questions: LegacyCourseExamQuestion[];
};

@Injectable()
export class LegacyCourseExamMigrationService implements OnModuleInit {
  private readonly logger = new Logger(LegacyCourseExamMigrationService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,

    @InjectRepository(QuestionBankCategory)
    private readonly categoryRepository: Repository<QuestionBankCategory>,

    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(ExamQuestionRule)
    private readonly ruleRepository: Repository<ExamQuestionRule>,
  ) {}

  async onModuleInit() {
    await this.migrateLegacyCourseExams();
  }

  async migrateLegacyCourseExams(): Promise<{
    migrated: number;
    skipped: number;
  }> {
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.faculties', 'faculty')
      .leftJoinAndSelect('course.createdBy', 'createdBy')
      .where('course.exam IS NOT NULL')
      .getMany();

    let migrated = 0;
    let skipped = 0;

    for (const course of courses) {
      const legacyExam = course.exam as LegacyCourseExam | null;

      if (!legacyExam?.questions?.length) {
        skipped += 1;
        continue;
      }

      const alreadyMigrated = await this.examRepository.findOne({
        where: { legacyCourseId: course.id },
      });

      if (alreadyMigrated) {
        skipped += 1;
        continue;
      }

      await this.migrateCourseExam(course, legacyExam);
      migrated += 1;
    }

    if (migrated || skipped) {
      this.logger.log(
        `Legacy course exam migration completed: ${migrated} migrated, ${skipped} skipped`,
      );
    }

    return { migrated, skipped };
  }

  private async migrateCourseExam(
    course: Course,
    legacyExam: LegacyCourseExam,
  ) {
    const category = await this.categoryRepository.save(
      this.categoryRepository.create({
        name: `${course.title} Question Bank`,
        slug: await this.createUniqueSlug(
          this.categoryRepository,
          `${course.slug}-question-bank`,
        ),
        description: `Migrated question pool for ${course.title}.`,
        createdBy: course.createdBy,
      }),
    );

    const exam = await this.examRepository.save(
      this.examRepository.create({
        title: legacyExam.title || `${course.title} Final Exam`,
        slug: await this.createUniqueSlug(
          this.examRepository,
          `${course.slug}-final-exam`,
        ),
        legacyCourseId: course.id,
        description: legacyExam.description,
        instructions: legacyExam.instructions,
        status: legacyExam.isPublished
          ? ExamStatus.Published
          : ExamStatus.Draft,
        passingPercentage: this.toDecimal(legacyExam.passingPercentage || 40),
        durationMinutes: legacyExam.timeLimitMinutes ?? null,
        attemptLimit: legacyExam.maxAttempts || null,
        randomizeQuestions: false,
        shuffleOptions: true,
        adaptiveMode: false,
        retryPenaltyPercentage: this.toDecimal(0),
        partialMarking: true,
        fullscreenRequired: false,
        serverTimerEnabled: Boolean(legacyExam.timeLimitMinutes),
        autoSubmitEnabled: Boolean(legacyExam.timeLimitMinutes),
        perQuestionFeedbackEnabled: legacyExam.showResultImmediately,
        courses: [course],
        faculties: course.faculties ?? [],
        createdBy: course.createdBy,
        updatedBy: course.createdBy,
      }),
    );

    const questions = await Promise.all(
      legacyExam.questions.map((legacyQuestion, index) =>
        this.questionRepository.save(
          this.questionRepository.create({
            title: this.createQuestionTitle(legacyQuestion, index),
            prompt: legacyQuestion.prompt,
            type: this.mapQuestionType(legacyQuestion.type),
            content: this.mapQuestionContent(legacyQuestion),
            defaultPoints: this.toDecimal(legacyQuestion.points || 1),
            defaultNegativeMarks: this.toDecimal(0),
            allowPartialMarking: true,
            isActive: true,
            explanation: legacyQuestion.explanation,
            category,
            createdBy: course.createdBy,
            updatedBy: course.createdBy,
          }),
        ),
      ),
    );

    await this.ruleRepository.save(
      questions.map((question, index) =>
        this.ruleRepository.create({
          exam,
          question,
          ruleType: ExamQuestionRuleType.FixedQuestion,
          order: index,
          pointsOverride: question.defaultPoints,
          negativeMarksOverride: question.defaultNegativeMarks,
          weight: this.toDecimal(1),
          isRequired: true,
        }),
      ),
    );
  }

  private mapQuestionType(
    type: LegacyCourseExamQuestion['type'],
  ): QuestionType {
    const map: Record<LegacyCourseExamQuestion['type'], QuestionType> = {
      single: QuestionType.McqSingle,
      multiple: QuestionType.McqMultiple,
      true_false: QuestionType.TrueFalse,
      short_text: QuestionType.ShortAnswer,
      drag_drop: QuestionType.Matching,
    };

    return map[type];
  }

  private mapQuestionContent(
    question: LegacyCourseExamQuestion,
  ): QuestionContent {
    if (question.type === 'short_text') {
      return {
        acceptedAnswers: question.acceptedAnswers ?? [],
      };
    }

    return {
      options: question.options.map((option) => ({
        id: option.id,
        text: option.text,
        isCorrect: option.isCorrect,
      })),
      acceptedAnswers: question.acceptedAnswers ?? [],
    };
  }

  private createQuestionTitle(
    question: LegacyCourseExamQuestion,
    index: number,
  ): string {
    const prompt = question.prompt.trim();

    if (prompt.length <= 80) {
      return prompt || `Question ${index + 1}`;
    }

    return `${prompt.slice(0, 77)}...`;
  }

  private async createUniqueSlug<T extends { id: number; slug: string }>(
    repository: Repository<T>,
    value: string,
  ): Promise<string> {
    const baseSlug = generateSlug(value);
    let slug = baseSlug;
    let suffix = 1;

    while (
      await repository
        .createQueryBuilder('entity')
        .where('entity.slug = :slug', { slug })
        .getExists()
    ) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return slug;
  }

  private toDecimal(value: number): string {
    return value.toFixed(2);
  }
}
