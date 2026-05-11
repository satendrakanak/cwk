import { Course } from 'src/courses/course.entity';
import { Upload } from 'src/uploads/upload.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassSession } from './class-session.entity';
import { CourseBatch } from './course-batch.entity';
import { ClassRecordingStatus } from './enums/class-recording-status.enum';

@Entity()
export class ClassRecording {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ClassSession, (session) => session.recordings, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  session!: ClassSession;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course!: Course;

  @ManyToOne(() => CourseBatch, { nullable: false, onDelete: 'CASCADE' })
  batch!: CourseBatch;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  faculty!: User;

  @ManyToOne(() => Upload, { nullable: true, onDelete: 'SET NULL' })
  upload?: Upload | null;

  @Column({ type: 'varchar', length: 255 })
  bbbRecordId!: string;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'varchar', length: 80, default: 'presentation' })
  format!: string;

  @Column({ type: 'text', nullable: true })
  playbackUrl?: string | null;

  @Column({ type: 'int', nullable: true })
  durationSeconds?: number | null;

  @Column({ type: 'int', nullable: true })
  participants?: number | null;

  @Column({
    type: 'enum',
    enum: ClassRecordingStatus,
    default: ClassRecordingStatus.Processing,
  })
  status!: ClassRecordingStatus;

  @Column({ type: 'text', nullable: true })
  archiveError?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  recordedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  syncedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
