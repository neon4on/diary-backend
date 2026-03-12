import { SetMetadata } from '@nestjs/common';
import { DiaryRole } from '../enums/diary-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: DiaryRole[]) =>
  SetMetadata(ROLES_KEY, roles);