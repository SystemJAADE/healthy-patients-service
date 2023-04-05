import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IJWTPayload } from 'src/oauth/oauth.service';
/**
 * TODO:
 * - Almacenarlos como enteros en vez de strings para mas rendimiento
 * - Tal vez convertirlo a un enum bitwise para poder tener varios roles a la vez
 */

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context
        .switchToHttp()
        .getRequest<Request & { account?: IJWTPayload }>();
      return request.account.role === role;
    }
  }
  return mixin(RoleGuardMixin);
};
