import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { ExamQuestionRuleType } from './enums/exam-question-rule-type.enum';
import { Question } from './question.entity';
import { QuestionBankCategory } from './question-bank-category.entity';

@Entity()
export class ExamQuestionRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Exam, (exam) => exam.questionRules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  exam!: Exam;

  @Column({
    type: 'enum',
    enum: ExamQuestionRuleType,
    default: ExamQuestionRuleType.FixedQuestion,
  })
  ruleType!: ExamQuestionRuleType;

  @ManyToOne(() => Question, (question) => question.examRules, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  question?: Question | null;

  @ManyToOne(() => QuestionBankCategory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: QuestionBankCategory | null;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'int', nullable: true })
  randomQuestionCount?: number | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  pointsOverride?: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  negativeMarksOverride?: string | null;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 1 })
  weight!: string;

  @Column({ type: 'boolean', default: true })
  isRequired!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
