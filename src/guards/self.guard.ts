import { CanActivate, ExecutionContext } from '@nestjs/common';

export class SelfGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (user.roles.includes('superadmin')) {
      return true;
    }
    const { id } = context.switchToHttp().getRequest().params;
    console.log(user, id);
    return user.sub === +id;
  }
}
