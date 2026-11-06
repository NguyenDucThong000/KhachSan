import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDto) {
    const role = await this.prisma.roles.findMany();
    const customerRole = role.find(
      (entry) => entry.role_name.toLowerCase() === 'customer',
    );
    if (!customerRole) {
      throw new ConflictException('Customer role is not configured');
    }

    const existing = await this.prisma.users.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email }],
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Username or email is already registered');
    }
    const existingCustomer = await this.prisma.customers.findFirst({
      where: {
        OR: [{ phone: body.phone }, { cccd_passport: body.cccd_passport }],
      },
      select: { id: true },
    });
    if (existingCustomer) {
      throw new ConflictException('Phone or identity document is already registered');
    }

    const password = await bcrypt.hash(body.password, 12);
    return this.prisma.$transaction(async (transaction) => {
      const user = await transaction.users.create({
        data: {
          username: body.username,
          password,
          email: body.email,
          role_id: customerRole.id,
        },
        select: { id: true, username: true, email: true },
      });
      await transaction.customers.create({
        data: {
          user_id: user.id,
          full_name: body.full_name,
          phone: body.phone,
          cccd_passport: body.cccd_passport,
          email: body.email,
        },
      });
      return user;
    });
  }

  async login(credentials: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { username: credentials.username },
      include: { roles: true },
    });

    if (!user || user.is_active === false || !user.roles) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
    const validPassword = isBcryptHash
      ? await bcrypt.compare(credentials.password, user.password)
      : timingSafeEqual(
          createHash('sha256').update(credentials.password).digest(),
          createHash('sha256').update(user.password).digest(),
        );
    if (!validPassword) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (!isBcryptHash) {
      await this.prisma.users.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(credentials.password, 12) },
      });
    }

    const roleNames: Record<string, string> = {
      admin: 'Admin',
      manager: 'Manager',
      receptionist: 'Receptionist',
      customer: 'Customer',
    };
    const role =
      roleNames[user.roles.role_name.trim().toLowerCase()] ??
      user.roles.role_name;
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role,
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 28800),
      role,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
