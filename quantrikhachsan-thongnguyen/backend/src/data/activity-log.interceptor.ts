import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { mergeMap, Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.dto';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const method = request.method.toUpperCase();
    if (!user || !['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const path = request.originalUrl.split('?')[0];
    const module = path.split('/').filter(Boolean)[0]?.slice(0, 50) ?? 'unknown';
    const action = `${method} ${path}`.slice(0, 100);

    return next.handle().pipe(
      mergeMap(async (result) => {
        await this.prisma.activity_logs.create({
          data: {
            user_id: user.sub,
            action,
            module,
            description: `${user.username} performed ${method} ${path}`,
          },
        });
        return result;
      }),
    );
  }
}
