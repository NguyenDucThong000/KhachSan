import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL must be set to connect to MariaDB');
    }

    const url = new URL(databaseUrl);
    if (url.protocol !== 'mysql:') {
      throw new Error('DATABASE_URL must use the mysql:// protocol');
    }

    const database = decodeURIComponent(url.pathname.slice(1));
    if (!database) {
      throw new Error('DATABASE_URL must include a database name');
    }

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Đã kết nối Database qua PrismaService');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}