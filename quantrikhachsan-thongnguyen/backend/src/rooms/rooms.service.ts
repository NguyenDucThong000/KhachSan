import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rooms.findMany({
      include: { room_types: true },
      orderBy: { room_number: 'asc' },
    });
  }
}