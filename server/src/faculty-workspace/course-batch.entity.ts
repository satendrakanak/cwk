import { Course } from 'src/courses/course.entity';
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
import { BatchStudent } from './batch-student.entity';
import { ClassSession } from './class-session.entity';
import { CourseBatchStatus } from './enums/course-batch-status.enum';

@Entity()
export class CourseBatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course!: Course;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  faculty!: User;

  @Column({
    type: 'enum',
    enum: CourseBatchStatus,
    default: CourseBatchStatus.Draft,
  })
  status!: CourseBatchStatus;

  @Column({ type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ type: 'int', nullable: true })
  capacity?: number | null;

  @OneToMany(() => BatchStudent, (student) => student.batch)
  students!: BatchStudent[];

  @OneToMany(() => ClassSession, (session) => session.batch)
  sessions!: ClassSession[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
