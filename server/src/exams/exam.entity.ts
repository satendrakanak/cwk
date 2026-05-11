import { Course } from 'src/courses/course.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CorrectAnswerVisibility } from './enums/correct-answer-visibility.enum';
import { ExamStatus } from './enums/exam-status.enum';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamQuestionRule } from './exam-question-rule.entity';

@Entity()
export class Exam {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 280, unique: true })
  slug!: string;

  @Column({ type: 'int', nullable: true, unique: true })
  legacyCourseId?: number | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  instructions?: string | null;

  @Column({ type: 'enum', enum: ExamStatus, default: ExamStatus.Draft })
  status!: ExamStatus;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 40 })
  passingPercentage!: string;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number | null;

  @Column({ type: 'int', nullable: true })
  attemptLimit?: number | null;

  @Column({ type: 'boolean', default: true })
  randomizeQuestions!: boolean;

  @Column({ type: 'boolean', default: true })
  shuffleOptions!: boolean;

  @Column({ type: 'boolean', default: false })
  adaptiveMode!: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  retryPenaltyPercentage!: string;

  @Column({ type: 'boolean', default: true })
  partialMarking!: boolean;

  @Column({ type: 'boolean', default: false })
  fullscreenRequired!: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allowedIpRanges?: string[] | null;

  @Column({ type: 'boolean', default: true })
  serverTimerEnabled!: boolean;

  @Column({ type: 'boolean', default: true })
  autoSubmitEnabled!: boolean;

  @Column({ type: 'int', nullable: true })
  reminderBeforeMinutes?: number | null;

  @Column({ type: 'int', nullable: true })
  cleanupExpiredAttemptsAfterDays?: number | null;

  @Column({ type: 'boolean', default: false })
  perQuestionFeedbackEnabled!: boolean;

  @Column({ type: 'text', nullable: true })
  overallFeedback?: string | null;

  @Column({
    type: 'enum',
    enum: CorrectAnswerVisibility,
    default: CorrectAnswerVisibility.AfterSubmit,
  })
  correctAnswerVisibility!: CorrectAnswerVisibility;

  @ManyToMany(() => Course)
  @JoinTable()
  courses?: Course[];

  @ManyToMany(() => User)
  @JoinTable()
  faculties?: User[];

  @OneToMany(() => ExamQuestionRule, (rule) => rule.exam, { cascade: true })
  questionRules?: ExamQuestionRule[];

  @OneToMany(() => ExamAttempt, (attempt) => attempt.exam)
  attempts?: ExamAttempt[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
