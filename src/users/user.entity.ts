import { Exclude } from 'class-transformer';
import { AuditFields } from 'src/helpers/audit-fields.helper';
import { RecoveryKey } from 'src/oauth/recovery-key/recovery-key.entity';
import { RefreshToken } from 'src/oauth/refresh-token/refresh-token.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface IJwtPayload {
  id: string;
  username: string;
  role: Role;
  is_blocked: boolean;
}

/**
 * TODO:
 * - Pasar esto a su propio .ts
 * - Almacenarlos como enteros en vez de strings para mas rendimiento
 * - Tal vez convertirlo a un enum bitwise para poder tener varios roles a la vez
 */
export enum Role {
  NOT_FULLY_REGISTERED = 'not_fully_registered',
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

/**
 * TODO:
 * - Pasar esto a su propio .ts
 * - Pasarlos a tablas en vez de enums para mayor flexibilidad
 */
export enum Gender {
  MALE = 1,
  FEMALE = 2,
  NEITHER = 3,
}

@Entity('users')
export class User extends AuditFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 32 })
  @Index({ unique: true })
  username: string;

  @Column({ length: 64 })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.NOT_FULLY_REGISTERED,
  })
  role: Role;

  @Index()
  @Column({
    default: () => 'false',
  })
  is_blocked: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    nullable: true,
  })
  refresh_tokens?: RefreshToken[] | null;

  @OneToMany(() => RecoveryKey, (recovery_key) => recovery_key.user, {
    nullable: true,
  })
  recovery_keys?: RecoveryKey[] | null;

  /**
   * Apellido paterno
   */
  @Column({ length: 64, nullable: true })
  first_surname?: string | null;

  /**
   * Apellido materno
   */
  @Column({ length: 64, nullable: true })
  second_surname?: string | null;

  /**
   * Primer nombre
   */
  @Column({ length: 64, nullable: true })
  first_name?: string | null;

  /**
   * Segundo nombre
   */
  @Column({ length: 64, nullable: true })
  middle_name?: string | null;

  /**
   * Documento de identidad (DNI, Carnet de extranjería, etc.)
   */
  @Column({ length: 32, nullable: true })
  document_identity?: string | null;

  // TODO: Agregar tipo de documento de identidad

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender | null;

  /**
   * Celular
   */
  @Column({ length: 32, nullable: true })
  phone?: string | null;

  /**
   * Teléfono de casa
   */
  @Column({ length: 32, nullable: true })
  home_phone?: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  protected loginToLowercase() {
    this.username = this.username.toLowerCase();
  }

  public jsonForJWT(): IJwtPayload {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      is_blocked: this.is_blocked,
    };
  }
}
