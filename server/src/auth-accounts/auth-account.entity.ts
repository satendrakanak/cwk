import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from 'src/users/user.entity';

export enum AuthAccountProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  META = 'meta',
}

@Entity({ name: 'auth_accounts' })
@Index(['provider', 'providerUserId'], { unique: true })
export class AuthAccount {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.authAccounts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: AuthAccountProvider,
  })
  provider!: AuthAccountProvider;

  @Column({ type: 'varchar', length: 255 })
  providerUserId!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
