import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { IJwtPayload } from 'src/credentials/credential.entity';
/**
 * TODO:
 * - Almacenarlos como enteros en vez de strings para mas rendimiento
 * - Tal vez convertirlo a un enum bitwise para poder tener varios roles a la vez
 */
export enum Role {
  NOT_FULLY_REGISTERED = 'not_fully_registered',
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

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
