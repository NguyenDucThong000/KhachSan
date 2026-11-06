import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async revenue(from?: string, to?: string) {
    const fromDate = this.parseDate(from, 'from');
    const toDate = this.parseDate(to, 'to');
    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('"from" must not be after "to"');
    }

    let rows: { date: string; revenue: Prisma.Decimal }[];
    if (fromDate && toDate) {
      rows = await this.prisma.$queryRaw<{ date: string; revenue: Prisma.Decimal }[]>(
        Prisma.sql`SELECT DATE_FORMAT(payment_time, '%Y-%m-%d') AS date, SUM(amount_paid) AS revenue FROM payments WHERE payment_time >= ${fromDate} AND payment_time < ${this.addDay(toDate)} GROUP BY DATE_FORMAT(payment_time, '%Y-%m-%d') ORDER BY DATE_FORMAT(payment_time, '%Y-%m-%d')`,
      );
    } else if (fromDate) {
      rows = await this.prisma.$queryRaw<{ date: string; revenue: Prisma.Decimal }[]>(
        Prisma.sql`SELECT DATE_FORMAT(payment_time, '%Y-%m-%d') AS date, SUM(amount_paid) AS revenue FROM payments WHERE payment_time >= ${fromDate} GROUP BY DATE_FORMAT(payment_time, '%Y-%m-%d') ORDER BY DATE_FORMAT(payment_time, '%Y-%m-%d')`,
      );
    } else if (toDate) {
      rows = await this.prisma.$queryRaw<{ date: string; revenue: Prisma.Decimal }[]>(
        Prisma.sql`SELECT DATE_FORMAT(payment_time, '%Y-%m-%d') AS date, SUM(amount_paid) AS revenue FROM payments WHERE payment_time < ${this.addDay(toDate)} GROUP BY DATE_FORMAT(payment_time, '%Y-%m-%d') ORDER BY DATE_FORMAT(payment_time, '%Y-%m-%d')`,
      );
    } else {
      rows = await this.prisma.$queryRaw<{ date: string; revenue: Prisma.Decimal }[]>(
        Prisma.sql`SELECT DATE_FORMAT(payment_time, '%Y-%m-%d') AS date, SUM(amount_paid) AS revenue FROM payments GROUP BY DATE_FORMAT(payment_time, '%Y-%m-%d') ORDER BY DATE_FORMAT(payment_time, '%Y-%m-%d')`,
      );
    }

    return {
      total: rows.reduce((total, row) => total + Number(row.revenue), 0),
      daily: rows.map((row) => ({ date: row.date, revenue: Number(row.revenue) })),
    };
  }

  async occupancy() {
    const [total, operational, technical] = await Promise.all([
      this.prisma.rooms.count(),
      this.prisma.rooms.groupBy({
        by: ['operational_status'],
        _count: { _all: true },
      }),
      this.prisma.rooms.groupBy({
        by: ['technical_status'],
        _count: { _all: true },
      }),
    ]);

    return {
      total,
      operational: operational.map((entry) => ({
        status: entry.operational_status,
        count: entry._count._all,
      })),
      technical: technical.map((entry) => ({
        status: entry.technical_status,
        count: entry._count._all,
      })),
    };
  }

  private parseDate(value: string | undefined, field: string): Date | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`"${field}" must use YYYY-MM-DD format`);
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
      throw new BadRequestException(`"${field}" is not a valid date`);
    }
    return date;
  }

  private addDay(date: Date): Date {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 1);
    return end;
  }
}
