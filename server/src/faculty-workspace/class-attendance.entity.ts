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
import { ClassSession } from './class-session.entity';

@Entity()
@Index(['session', 'user', 'role'], { unique: true })
export class ClassAttendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ClassSession, (session) => session.attendances, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  session!: ClassSession;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'varchar', length: 24 })
  role!: 'faculty' | 'learner';

  @Column({ type: 'timestamptz' })
  joinedAt!: Date;

  @Column({ type: 'timestamptz' })
  lastSeenAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
