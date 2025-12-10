import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from './authorization.guard';
import { PermissionGuard } from './permission.guard';

export function Auth(permission: string) {
  return applyDecorators(
    UseGuards(AuthorizationGuard, PermissionGuard),
    SetMetadata('permission', [permission]),
  );
}
