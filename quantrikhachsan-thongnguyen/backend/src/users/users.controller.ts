import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../auth/auth.decorators';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Controller('users')
@Roles('Admin')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        created_at: true,
        roles: { select: { role_name: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    const password = await bcrypt.hash(body.password, 12);
    return this.prisma.users.create({
      data: {
        username: body.username,
        password,
        email: body.email,
        role_id: body.role_id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    const data = {
      username: body.username,
      email: body.email,
      role_id: body.role_id,
      is_active: body.is_active,
      ...(body.password ? { password: await bcrypt.hash(body.password, 12) } : {}),
    };

    return this.prisma.users.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        created_at: true,
      },
    });
  }

  @Delete(':id')
  async disable(@Param('id', ParseIntPipe) id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.users.update({
      where: { id },
      data: { is_active: false },
      select: { id: true, username: true, is_active: true },
    });
  }
}
