import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsService } from './rooms/rooms.service';

describe('AppController', () => {
  let appController: AppController;

  // Giả lập (Mock) RoomsService
  const mockRoomsService = {
    findAll: jest.fn().mockResolvedValue([
      {
        id: 1,
        room_number: '101',
        operational_status: 'AVAILABLE',
        cleaning_status: 'CLEAN',
        technical_status: 'NORMAL',
      },
      {
        id: 2,
        room_number: '102',
        operational_status: 'OCCUPIED',
        cleaning_status: 'DIRTY',
        technical_status: 'NORMAL',
      },
      {
        id: 3,
        room_number: '103',
        operational_status: 'RESERVED',
        cleaning_status: 'CLEANING',
        technical_status: 'MAINTENANCE',
      },
    ]),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RoomsService, // Khi AppService gọi RoomsService, nó sẽ dùng mock này
          useValue: mockRoomsService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return rooms with their statuses', async () => {
      const result = await appController.getHello();

      expect(result).toContain('Tổng số phòng: 3');
      expect(result).toContain('<td>101</td>');
      expect(result).toContain('<td>Trống</td>');
      expect(result).toContain('<td>Đang sử dụng</td>');
      expect(result).toContain('<td>Đang bảo trì</td>');
      expect(mockRoomsService.findAll).toHaveBeenCalled();
    });
  });
});