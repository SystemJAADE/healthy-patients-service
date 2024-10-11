export interface SubroleDto {
  id: number;
  name: string;
  roleId: number;
  roleName: string;
}

export interface RoleDto {
  id: number;
  name: string;
  subroles: SubroleDto[];
}

export interface PermissionDto {
  subroles: SubroleDto[];
}

export interface CurrentAccountDto {
  id: string;
  identifier: string;
  permissions: PermissionDto[];
  is_blocked: boolean;
}

export interface JwtPayloadDto {
  current_account: CurrentAccountDto;
  token_type: string;
  iat: number;
  exp: number;
  jti: string;
}
