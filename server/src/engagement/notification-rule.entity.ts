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

@Entity()
export class NotificationRule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  eventKey!: string;

  @Column({ type: 'varchar', length: 160 })
  label!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false })
  isEnabled!: boolean;

  @Column({
    type: 'enum',
    enum: EngagementAudience,
    default: EngagementAudience.AllUsers,
  })
  audience!: EngagementAudience;

  @Column({ type: 'simple-array', default: NotificationChannel.InApp })
  channels!: NotificationChannel[];

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.Info,
  })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 180 })
  titleTemplate!: string;

  @Column({ type: 'text' })
  messageTemplate!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  hrefTemplate?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'simple-json', nullable: true })
  filters?: Record<string, unknown> | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
