import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LicensePlan } from './enums/license-plan.enum';
import { LicenseStatus } from './enums/license-status.enum';

@Entity()
export class License {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 128, unique: true })
  key!: string;

  @Column({ type: 'varchar', length: 32 })
  plan!: LicensePlan;

  @Column({ type: 'varchar', length: 32, default: LicenseStatus.ACTIVE })
  status!: LicenseStatus;

  @Column({ type: 'varchar', length: 128, nullable: true })
  purchaserEmail?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt?: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
