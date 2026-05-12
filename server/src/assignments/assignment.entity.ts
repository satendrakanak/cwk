import { Chapter } from 'src/chapters/chapter.entity';
import { Course } from 'src/courses/course.entity';
import { CourseBatch } from 'src/faculty-workspace/course-batch.entity';
import { Lecture } from 'src/lectures/lecture.entity';
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
import { AssignmentSubmission } from './assignment-submission.entity';
import { AssignmentStatus } from './enums/assignment-status.enum';
import { AssignmentSubmissionType } from './enums/assignment-submission-type.enum';

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  instructions?: string | null;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course!: Course;

  @ManyToOne(() => Chapter, { nullable: true, onDelete: 'SET NULL' })
  chapter?: Chapter | null;

  @ManyToOne(() => Lecture, { nullable: true, onDelete: 'SET NULL' })
  lecture?: Lecture | null;

  @ManyToOne(() => CourseBatch, { nullable: true, onDelete: 'SET NULL' })
  batch?: CourseBatch | null;

  @ManyToMany(() => User)
  @JoinTable()
  faculties?: User[];

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.Draft,
  })
  status!: AssignmentStatus;

  @Column({
    type: 'enum',
    enum: AssignmentSubmissionType,
    default: AssignmentSubmissionType.Mixed,
  })
  submissionType!: AssignmentSubmissionType;

  @Column({ type: 'timestamptz', nullable: true })
  dueAt?: Date | null;

  @Column({ type: 'int', nullable: true })
  points?: number | null;

  @Column({ type: 'boolean', default: true })
  allowResubmission!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  resourceIds!: number[];

  @OneToMany(() => AssignmentSubmission, (submission) => submission.assignment)
  submissions?: AssignmentSubmission[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  updatedBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
