import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './auth.decorators';
import { AuthenticatedUser } from './auth.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & { user?: AuthenticatedUser }
    >();
    const allowedRoles = roles.map((role) => role.toLowerCase());
    if (!request.user || !allowedRoles.includes(request.user.role.toLowerCase())) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    return true;
  }
}
