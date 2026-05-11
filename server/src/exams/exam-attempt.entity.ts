import { Course } from 'src/courses/course.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { ExamAttemptStatus } from './enums/exam-attempt-status.enum';
import {
  ExamAnswerPayload,
  ExamAttemptQuestionConfigPayload,
  ExamQuestionResultPayload,
} from './types/question-content.type';

@Entity()
export class ExamAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Exam, (exam) => exam.attempts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exam!: Exam;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Course, { nullable: true, onDelete: 'SET NULL' })
  course?: Course | null;

  @Column({
    type: 'enum',
    enum: ExamAttemptStatus,
    default: ExamAttemptStatus.InProgress,
  })
  status!: ExamAttemptStatus;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  autoSubmittedAt?: Date | null;

  @Column({ type: 'varchar', length: 96, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ type: 'boolean', default: false })
  browserFullscreenConfirmed!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  randomizedQuestionIds!: number[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  questionConfigs!: ExamAttemptQuestionConfigPayload[];

  @Column({ type: 'jsonb', default: () => "'{}'" })
  shuffledOptionMap!: Record<string, string[]>;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  answers!: ExamAnswerPayload[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  questionResults!: ExamQuestionResultPayload[];

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  score!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  maxScore!: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  percentage!: string;

  @Column({ type: 'boolean', default: false })
  passed!: boolean;

  @Column({ type: 'boolean', default: false })
  needsManualGrading!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  manualGradedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  manualGradedBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
