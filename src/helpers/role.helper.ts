import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IJWTPayload } from '../oauth/oauth.service';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const SUBROLES_KEY = 'subroles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Subroles = (...subroles: string[]) =>
  SetMetadata(SUBROLES_KEY, subroles);

export const RoleGuard = (): Type<CanActivate> => {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { account?: IJWTPayload }>();
      const account = request.account;

      const requiredRoles =
        this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) ||
        this.reflector.get<string[]>(ROLES_KEY, context.getClass());
      const hasRole = requiredRoles.some((role) => role === account.role.name);

      const requiredSubroles =
        this.reflector.get<string[]>(SUBROLES_KEY, context.getHandler()) ||
        this.reflector.get<string[]>(SUBROLES_KEY, context.getClass());

      const hasSubrole = requiredSubroles
        ? requiredSubroles.some((subrole) => subrole === account.subrole.name)
        : true;

      return hasRole && hasSubrole;
    }
  }
  return mixin(RoleGuardMixin);
};
