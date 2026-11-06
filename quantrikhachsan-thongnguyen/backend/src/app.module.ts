import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { ActivityLogInterceptor } from './data/activity-log.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module'; // Thêm dòng này
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, RoomsModule, AuthModule, UsersModule, DataModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ActivityLogInterceptor },
  ],
})
export class AppModule {}