import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đánh dấu Global để không cần import lại ở các module khác
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}