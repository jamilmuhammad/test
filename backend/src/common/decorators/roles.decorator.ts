import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const ROLES_KEY = 'roles-type';
export const RoleTypes = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
