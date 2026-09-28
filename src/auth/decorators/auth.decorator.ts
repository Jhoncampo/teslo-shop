import { applyDecorators, UseGuards } from '@nestjs/common';
import { validRoles } from '../interfaces/valid-roles';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

// Nota: cuando es un decorador de nest se coloca con parentesis y cuando es uno personalizado no le colocamos parentesis
export const Auth = (...roles: validRoles[]) => {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
  );
};
