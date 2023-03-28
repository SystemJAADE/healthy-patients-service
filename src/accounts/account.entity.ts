import { AuditFields } from 'src/helpers/audit-fields.helper';
import { Role } from 'src/helpers/role.helper';
import { RecoveryKey } from 'src/oauth/recovery-key/recovery-key.entity';
import { RefreshToken } from 'src/oauth/refresh-token/refresh-token.entity';
import { Credential } from 'src/credentials/credential.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

@Entity('accounts')
export class Account extends AuditFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  /**
   * Genero (Masculino, Femenino, Otro)
   */
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
  cell_phone?: string | null;

  /**
   * Teléfono de casa
   */
  @Column({ length: 32, nullable: true })
  home_phone?: string | null;

  /**
   * Credenciales de acceso (En este caso son usuario y contraseña)
   */
  @OneToOne(
    () => Credential,
    (credential) => credential.account /*{
    cascade: true,
  }*/,
  )
  @JoinColumn({ name: 'credential_id' })
  credential?: Credential | null;

  /**
   * Tokens de refresco
   */
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.account, {
    nullable: true,
  })
  refresh_tokens?: RefreshToken[] | null;

  /**
   * Tokens de recuperación de contraseña
   */
  @OneToMany(() => RecoveryKey, (recovery_key) => recovery_key.account, {
    nullable: true,
  })
  recovery_keys?: RecoveryKey[] | null;
}
