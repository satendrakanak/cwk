import { Course } from 'src/courses/course.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ClassRecording } from './class-recording.entity';
import { ClassAttendance } from './class-attendance.entity';
import { CourseBatch } from './course-batch.entity';
import { ClassSessionStatus } from './enums/class-session-status.enum';

@Entity()
export class ClassSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => CourseBatch, (batch) => batch.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  batch!: CourseBatch;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course!: Course;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  faculty!: User;

  @OneToMany(() => ClassRecording, (recording) => recording.session)
  recordings?: ClassRecording[];

  @OneToMany(() => ClassAttendance, (attendance) => attendance.session)
  attendances?: ClassAttendance[];

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'timestamptz' })
  startsAt!: Date;

  @Column({ type: 'timestamptz' })
  endsAt!: Date;

  @Column({ type: 'varchar', length: 80, default: 'Asia/Kolkata' })
  timezone!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  meetingUrl?: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  bbbMeetingId?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  bbbModeratorPassword?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  bbbAttendeePassword?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  bbbCreateTime?: string | null;

  @Column({ type: 'boolean', default: false })
  bbbRecord!: boolean;

  @Column({ type: 'boolean', default: false })
  allowRecordingAccess!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string | null;

  @Column({
    type: 'enum',
    enum: ClassSessionStatus,
    default: ClassSessionStatus.Scheduled,
  })
  status!: ClassSessionStatus;

  @Column({ type: 'int', default: 60 })
  reminderBeforeMinutes!: number;

  @Column({ type: 'simple-json', nullable: true })
  reminderOffsetsMinutes?: number[] | null;

  @Column({ type: 'timestamptz', nullable: true })
  reminderSentAt?: Date | null;

  @Column({ type: 'simple-json', nullable: true })
  sentReminderOffsetsMinutes?: number[] | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
