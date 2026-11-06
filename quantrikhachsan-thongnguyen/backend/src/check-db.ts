import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client'; // Đường dẫn quan trọng
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Cấu hình adapter với các trường riêng lẻ thay vì 'url'
const adapter = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '142857', // Mật khẩu của bạn
  database: 'hotel_management',
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG!');
  } catch (error) {
    console.error('❌ KẾT NỐI THẤT BẠI:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();