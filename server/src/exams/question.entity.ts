import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionType } from './enums/question-type.enum';
import { QuestionContent } from './types/question-content.type';
import { ExamQuestionRule } from './exam-question-rule.entity';
import { QuestionBankCategory } from './question-bank-category.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  prompt!: string;

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  content!: QuestionContent;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 1 })
  defaultPoints!: string;

  @Column({ type: 'numeric', precision: 8, scale: 2, default: 0 })
  defaultNegativeMarks!: string;

  @Column({ type: 'boolean', default: true })
  allowPartialMarking!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  explanation?: string | null;

  @ManyToOne(() => QuestionBankCategory, (category) => category.questions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: QuestionBankCategory | null;

  @OneToMany(() => ExamQuestionRule, (rule) => rule.question)
  examRules?: ExamQuestionRule[];

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
