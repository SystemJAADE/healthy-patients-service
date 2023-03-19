import { AuditFields } from 'src/helpers/audit-fields.helper';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken extends AuditFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
