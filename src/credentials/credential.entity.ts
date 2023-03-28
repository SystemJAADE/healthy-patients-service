import { Exclude } from 'class-transformer';
import { Account } from 'src/accounts/account.entity';
import { Role } from 'src/helpers/role.helper';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface IJwtPayload {
  id: string;
  identifier: string;
  role: Role;
  is_blocked: boolean;
}
@Entity('credentials')
export class Credential extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 32 })
  @Index({ unique: true })
  identifier: string;

  @Column({ length: 64 })
  @Exclude()
  secret: string;

  @OneToOne(() => Account, (account) => account.credential)
  account?: Account | null;

  @BeforeInsert()
  @BeforeUpdate()
  protected loginToLowercase() {
    this.identifier = this.identifier.toLowerCase();
  }

  public jsonForJWT(): IJwtPayload {
    return {
      id: this.id,
      identifier: this.identifier,
      role: this.account.role,
      is_blocked: this.account.is_blocked,
    };
  }
}
