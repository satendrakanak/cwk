import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationChannel } from './enums/notification-channel.enum';
import { NotificationType } from './enums/notification-type.enum';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  recipient!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  actor?: User | null;

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
    enum: NotificationChannel,
    default: NotificationChannel.InApp,
  })
  channel!: NotificationChannel;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  clickedAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
