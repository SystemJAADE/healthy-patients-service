import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { IJwtPayload, Role } from './user.entity';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user?: IJwtPayload }>();
      return request.user.role === role;
    }
  }
  return mixin(RoleGuardMixin);
};
