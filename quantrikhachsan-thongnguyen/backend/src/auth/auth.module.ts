import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 28800);
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
if (!Number.isSafeInteger(jwtExpiresIn) || jwtExpiresIn <= 0) {
  throw new Error('JWT_EXPIRES_IN_SECONDS must be a positive integer');
}

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
