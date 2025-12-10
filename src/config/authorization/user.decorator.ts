import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';

export interface User {
  user: string;
  scope: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isStaffManager: boolean;
  isStaff: boolean;
  isCounsellor: boolean;
  counsellor: string;
}

export const User = createParamDecorator(
  (data: string, context: ExecutionContext): User => {
    const req = context.switchToHttp().getRequest();
    const { sub, permissions, counsellor } = req?.auth || {
      sub: null,
      permissions: [],
      counsellor: '',
    };

    const roleMap: Record<string, keyof User> = {
      Super_Admin: 'isSuperAdmin',
      Admin: 'isAdmin',
      Staff_Manager: 'isStaffManager',
      Staff: 'isStaff',
      Counsellor: 'isCounsellor',
    };

    const user: User = {
      user: sub,
      counsellor: counsellor,
      scope: permissions,
      isSuperAdmin: false,
      isAdmin: false,
      isStaffManager: false,
      isStaff: false,
      isCounsellor: false,
    };

    permissions.forEach((permission) => {
      if (roleMap[permission]) {
        user[roleMap[permission]] = true as never;
      }
    });

    Logger.debug(`CONFIG USER ${user.user}`);
    return user;
  },
);
