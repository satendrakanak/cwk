import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class QuestionBankCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 180, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => QuestionBankCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent?: QuestionBankCategory | null;

  @OneToMany(() => QuestionBankCategory, (category) => category.parent)
  children?: QuestionBankCategory[];

  @OneToMany(() => Question, (question) => question.category)
  questions?: Question[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  createdBy?: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
