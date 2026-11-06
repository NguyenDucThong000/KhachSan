import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomsService', () => {
  let service: RoomsService;
  const prisma = {
    rooms: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns rooms with their room types ordered by room number', async () => {
    await service.findAll();
    expect(prisma.rooms.findMany).toHaveBeenCalledWith({
      include: { room_types: true },
      orderBy: { room_number: 'asc' },
    });
  });
});
