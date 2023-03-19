import { User } from 'src/users/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RecoveryKey extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
