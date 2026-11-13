import 'dotenv/config';
import { PrismaService } from './prisma/prisma.service';

const prisma = new PrismaService();
async function main() {
  try {
    await prisma.$connect();
    const [database, roomTypeCount, roomsWithImages] = await Promise.all([
      prisma.$queryRaw<Array<{ database_name: string }>>`SELECT DATABASE() AS database_name`,
      prisma.room_types.count(),
      prisma.rooms.count({ where: { image_url: { not: null } } }),
    ]);
    console.log(
      `Kết nối thành công tới ${database[0]?.database_name}; số loại phòng: ${roomTypeCount}; số phòng có ảnh: ${roomsWithImages}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error('Kiểm tra database thất bại:', error);
  process.exitCode = 1;
});