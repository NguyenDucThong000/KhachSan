import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

    const sslAccept = url.searchParams.get('sslaccept')?.toLowerCase();
    if (sslAccept && sslAccept !== 'strict') {
      throw new Error('DATABASE_URL sslaccept must be strict when provided');
    }

    const sslMode = url.searchParams.get('ssl-mode')?.toUpperCase();
    if (sslMode && sslMode !== 'REQUIRED') {
      throw new Error('DATABASE_URL ssl-mode must be REQUIRED when provided');
    }

    const caPath = process.env.DATABASE_CA_CERT_PATH;
    const ca = caPath ? readFileSync(resolve(caPath)) : undefined;
    const useTls = sslAccept === 'strict' || sslMode === 'REQUIRED';
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      ...(useTls
        ? { ssl: { rejectUnauthorized: true, ...(ca ? { ca } : {}) } }
        : {}),
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
