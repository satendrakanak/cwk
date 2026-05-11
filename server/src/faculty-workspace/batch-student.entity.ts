import { Enrollment } from 'src/enrollments/enrollment.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseBatch } from './course-batch.entity';
import { BatchStudentStatus } from './enums/batch-student-status.enum';

@Entity()
@Index(['batch', 'student'], { unique: true })
export class BatchStudent {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CourseBatch, (batch) => batch.students, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  batch!: CourseBatch;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  student!: User;

  @ManyToOne(() => Enrollment, { nullable: true, onDelete: 'SET NULL' })
  enrollment?: Enrollment | null;

  @Column({
    type: 'enum',
    enum: BatchStudentStatus,
    default: BatchStudentStatus.Active,
  })
  status!: BatchStudentStatus;

  @CreateDateColumn()
  joinedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
