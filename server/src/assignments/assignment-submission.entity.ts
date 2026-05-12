import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Assignment } from './assignment.entity';
import { AssignmentSubmissionStatus } from './enums/assignment-submission-status.enum';

@Entity()
export class AssignmentSubmission {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  assignment!: Assignment;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  learner!: User;

  @Column({
    type: 'enum',
    enum: AssignmentSubmissionStatus,
    default: AssignmentSubmissionStatus.Submitted,
  })
  status!: AssignmentSubmissionStatus;

  @Column({ type: 'text', nullable: true })
  text?: string | null;

  @Column({ type: 'text', nullable: true })
  link?: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  attachmentIds!: number[];

  @Column({ type: 'int', nullable: true })
  score?: number | null;

  @Column({ type: 'text', nullable: true })
  feedback?: string | null;

  @Column({ type: 'timestamptz' })
  submittedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  reviewedBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
