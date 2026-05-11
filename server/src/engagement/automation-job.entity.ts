import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AutomationJobStatus } from './enums/automation-job-status.enum';
import { AutomationTriggerType } from './enums/automation-trigger-type.enum';
import { AutomationRunLog } from './automation-run-log.entity';

@Entity()
export class AutomationJob {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'enum',
    enum: AutomationJobStatus,
    default: AutomationJobStatus.Paused,
  })
  status!: AutomationJobStatus;

  @Column({
    type: 'enum',
    enum: AutomationTriggerType,
    default: AutomationTriggerType.Cron,
  })
  triggerType!: AutomationTriggerType;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cronExpression?: string | null;

  @Column({ type: 'varchar', length: 80, default: 'Asia/Kolkata' })
  timezone!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  eventKey?: string | null;

  @Column({ type: 'varchar', length: 80, default: 'notification_broadcast' })
  actionType!: string;

  @Column({ type: 'simple-json', nullable: true })
  actionPayload?: Record<string, unknown> | null;

  @Column({ type: 'simple-json', nullable: true })
  conditions?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastRunAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  nextRunAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  runCount!: number;

  @Column({ type: 'int', default: 0 })
  failureCount!: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @OneToMany(() => AutomationRunLog, (log) => log.job)
  logs!: AutomationRunLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
