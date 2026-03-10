import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { DiaryRole } from '../enums/diary-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {

    const requiredRoles =
      this.reflector.getAllAndOverride<DiaryRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.session?.user;

    if (!user || !requiredRoles.includes(user.roleId)) {
      throw new ForbiddenException('INSUFFICIENT_ROLE');
    }

    return true;
  }
}