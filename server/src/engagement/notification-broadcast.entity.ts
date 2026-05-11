import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { EngagementAudience } from './enums/engagement-audience.enum';
import { BroadcastStatus } from './enums/broadcast-status.enum';

@Entity()
export class NotificationBroadcast {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 180 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  href?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl?: string | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.Info,
  })
  type!: NotificationType;

  @Column({
    type: 'enum',
    enum: EngagementAudience,
    default: EngagementAudience.AllUsers,
  })
  audience!: EngagementAudience;

  @Column({ type: 'simple-array', default: NotificationChannel.InApp })
  channels!: NotificationChannel[];

  @Column({ type: 'simple-json', nullable: true })
  audienceFilters?: Record<string, unknown> | null;

  @Column({
    type: 'enum',
    enum: BroadcastStatus,
    default: BroadcastStatus.Draft,
  })
  status!: BroadcastStatus;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt?: Date | null;

  @Column({ type: 'int', default: 0 })
  recipientCount!: number;

  @Column({ type: 'int', default: 0 })
  deliveredCount!: number;

  @Column({ type: 'text', nullable: true })
  failureReason?: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
