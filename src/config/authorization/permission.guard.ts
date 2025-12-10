import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 *  one benefit using the express middleware is that is will add all JWT claims to a user object on the requst
 */

@Injectable()
export class PermissionGuard implements CanActivate {
  // giving access to the permission to the metadata set in the controller
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // grab the permissions from the access token
    const [req] = context.getArgs();
    // get the request from card's context and check if there are any permission added to its user objects if there are none use an empty array
    const userPermissions = req?.auth?.permissions || [];
    // check which scopes are required to access the endpoint
    const requiredPermissions =
      this.reflector.get('permission', context.getHandler()) || [];
    // check user assigned permissions contain all required permissions
    const hasAllRequiredPermissions = requiredPermissions.every(
      (permission: any) => userPermissions.includes(permission),
    );

    // if there are no required permissions or user has all of the required permissions, return true
    if (requiredPermissions.length === 0 || hasAllRequiredPermissions)
      return true;

    // return a 403 Forbidden error
    throw new ForbiddenException('insufficient permissions');
  }
}
