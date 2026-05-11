import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AutomationJob } from './automation-job.entity';
import { AutomationRunStatus } from './enums/automation-run-status.enum';

@Entity()
export class AutomationRunLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AutomationJob, (job) => job.logs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  job!: AutomationJob;

  @Column({
    type: 'enum',
    enum: AutomationRunStatus,
    default: AutomationRunStatus.Success,
  })
  status!: AutomationRunStatus;

  @Column({ type: 'varchar', length: 240, nullable: true })
  summary?: string | null;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finishedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
