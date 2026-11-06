import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Thêm PrismaModule vào imports
  controllers: [],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
