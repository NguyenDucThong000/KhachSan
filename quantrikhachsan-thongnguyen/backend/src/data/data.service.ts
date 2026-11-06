import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.dto';

type ResourceDefinition = {
  table: string;
  fields: readonly string[];
  primaryKey: readonly string[];
  readOnly?: boolean;
  adminOnly?: boolean;
  dedicatedOnly?: boolean;
};

const resources: Record<string, ResourceDefinition> = {
  'activity-logs': {
    table: 'activity_logs',
    fields: ['id', 'user_id', 'action', 'module', 'description', 'created_at'],
    primaryKey: ['id'],
    readOnly: true,
    adminOnly: true,
  },
  'booking-details': {
    table: 'booking_details',
    fields: ['id', 'booking_id', 'room_id', 'price_at_booking'],
    primaryKey: ['id'],
    readOnly: true,
  },
  bookings: {
    table: 'bookings',
    fields: [
      'id',
      'customer_id',
      'booking_date',
      'expected_checkin',
      'expected_checkout',
      'deposit',
      'status',
    ],
    primaryKey: ['id'],
    readOnly: true,
  },
  checkin: {
    table: 'checkin_checkout',
    fields: ['id', 'booking_id', 'actual_checkin', 'actual_checkout', 'receptionist_id'],
    primaryKey: ['id'],
    readOnly: true,
  },
  customers: {
    table: 'customers',
    fields: ['id', 'user_id', 'full_name', 'phone', 'cccd_passport', 'email'],
    primaryKey: ['id'],
  },
  'employee-shifts': {
    table: 'employee_shifts',
    fields: ['id', 'employee_id', 'shift_id', 'work_date'],
    primaryKey: ['id'],
  },
  employees: {
    table: 'employees',
    fields: ['id', 'user_id', 'full_name', 'phone', 'cccd', 'address'],
    primaryKey: ['id'],
  },
  'housekeeping-tasks': {
    table: 'housekeeping_tasks',
    fields: ['id', 'room_id', 'assigned_to', 'status', 'notes', 'created_at', 'completed_at'],
    primaryKey: ['id'],
  },
  'invoice-promotions': {
    table: 'invoice_promotions',
    fields: ['invoice_id', 'promotion_id'],
    primaryKey: ['invoice_id', 'promotion_id'],
  },
  invoices: {
    table: 'invoices',
    fields: [
      'id',
      'checkin_id',
      'employee_id',
      'room_charge',
      'service_charge',
      'discount',
      'total_amount',
      'created_at',
      'status',
    ],
    primaryKey: ['id'],
    readOnly: true,
  },
  'leave-requests': {
    table: 'leave_requests',
    fields: [
      'id',
      'employee_id',
      'start_date',
      'end_date',
      'reason',
      'status',
      'approved_by',
      'created_at',
    ],
    primaryKey: ['id'],
  },
  'maintenance-requests': {
    table: 'maintenance_requests',
    fields: [
      'id',
      'room_id',
      'reported_by',
      'assigned_to',
      'issue_description',
      'status',
      'created_at',
      'resolved_at',
    ],
    primaryKey: ['id'],
    readOnly: true,
  },
  notifications: {
    table: 'notifications',
    fields: ['id', 'user_id', 'title', 'message', 'is_read', 'created_at'],
    primaryKey: ['id'],
    readOnly: true,
    dedicatedOnly: true,
  },
  payments: {
    table: 'payments',
    fields: ['id', 'invoice_id', 'payment_method', 'amount_paid', 'payment_time'],
    primaryKey: ['id'],
    readOnly: true,
  },
  promotions: {
    table: 'promotions',
    fields: [
      'id',
      'code',
      'discount_type',
      'discount_value',
      'start_date',
      'end_date',
      'is_active',
    ],
    primaryKey: ['id'],
  },
  refunds: {
    table: 'refunds',
    fields: ['id', 'invoice_id', 'amount', 'reason', 'refunded_by', 'created_at'],
    primaryKey: ['id'],
    readOnly: true,
  },
  reviews: {
    table: 'reviews',
    fields: ['id', 'customer_id', 'booking_id', 'rating', 'comment', 'created_at'],
    primaryKey: ['id'],
    readOnly: true,
    dedicatedOnly: true,
  },
  roles: {
    table: 'roles',
    fields: ['id', 'role_name', 'description'],
    primaryKey: ['id'],
    adminOnly: true,
  },
  'room-types': {
    table: 'room_types',
    fields: ['id', 'type_name', 'base_price', 'capacity', 'description'],
    primaryKey: ['id'],
  },
  rooms: {
    table: 'rooms',
    fields: [
      'id',
      'room_number',
      'room_type_id',
      'operational_status',
      'cleaning_status',
      'technical_status',
    ],
    primaryKey: ['id'],
  },
  'service-orders': {
    table: 'service_orders',
    fields: ['id', 'checkin_id', 'service_id', 'quantity', 'total_price', 'order_time'],
    primaryKey: ['id'],
    readOnly: true,
  },
  services: {
    table: 'services',
    fields: ['id', 'service_name', 'price', 'unit'],
    primaryKey: ['id'],
  },
  shifts: {
    table: 'shifts',
    fields: ['id', 'shift_name', 'start_time', 'end_time'],
    primaryKey: ['id'],
  },
  'system-configurations': {
    table: 'system_configurations',
    fields: ['id', 'config_key', 'config_value', 'description'],
    primaryKey: ['id'],
    adminOnly: true,
  },
};

const identifier = (value: string) => `\`${value}\``;
const sqlIdentifier = (value: string) => Prisma.raw(identifier(value));

@Injectable()
export class DataService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    resourceName: string,
    user: AuthenticatedUser,
    limitValue?: string,
    offsetValue?: string,
    search?: string,
  ) {
    const resource = this.getResource(resourceName, user, 'read');
    const limit = this.parsePagination(limitValue, 50, 100);
    const offset = this.parsePagination(offsetValue, 0, 1000000);
    const fields = Prisma.raw(resource.fields.map(identifier).join(', '));
    const primaryKey = Prisma.raw(resource.primaryKey.map(identifier).join(', '));

    if (search !== undefined && resourceName !== 'customers') {
      throw new BadRequestException('Search is only supported for customers');
    }
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      return this.prisma.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`SELECT ${fields} FROM ${sqlIdentifier(resource.table)} WHERE full_name LIKE ${term} OR phone LIKE ${term} OR cccd_passport LIKE ${term} OR email LIKE ${term} ORDER BY ${primaryKey} LIMIT ${limit} OFFSET ${offset}`,
      );
    }
    return this.prisma.$queryRaw<Record<string, unknown>[]>(
      Prisma.sql`SELECT ${fields} FROM ${sqlIdentifier(resource.table)} ORDER BY ${primaryKey} LIMIT ${limit} OFFSET ${offset}`,
    );
  }

  async findOne(
    resourceName: string,
    id: string,
    user: AuthenticatedUser,
    secondaryId?: string,
  ) {
    const resource = this.getResource(resourceName, user, 'read');
    const keyValues = this.parseKeyValues(resource, id, secondaryId);
    const where = this.where(resource, keyValues);
    const fields = Prisma.raw(resource.fields.map(identifier).join(', '));
    const rows = await this.prisma.$queryRaw<Record<string, unknown>[]>(
      Prisma.sql`SELECT ${fields} FROM ${sqlIdentifier(resource.table)} WHERE ${where} LIMIT 1`,
    );
    if (!rows[0]) {
      throw new NotFoundException(`${resourceName} record not found`);
    }
    return rows[0];
  }

  async create(resourceName: string, body: unknown, user: AuthenticatedUser) {
    const resource = this.getResource(resourceName, user, 'write');
    const data = this.parseBody(resource, body, false);
    const entries = Object.entries(data);
    if (entries.length === 0) {
      throw new BadRequestException('At least one writable field is required');
    }

    const columns = Prisma.raw(entries.map(([key]) => identifier(key)).join(', '));
    const values = Prisma.join(entries.map(([, value]) => Prisma.sql`${value}`));
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw(
        Prisma.sql`INSERT INTO ${sqlIdentifier(resource.table)} (${columns}) VALUES (${values})`,
      );
      let keyValues: Record<string, unknown>;
      if (resource.primaryKey.length === 1 && resource.primaryKey[0] === 'id') {
        const inserted = await transaction.$queryRaw<{ id: number }[]>(
          Prisma.sql`SELECT LAST_INSERT_ID() AS id`,
        );
        const insertedId = Number(inserted[0]?.id);
        if (!Number.isSafeInteger(insertedId) || insertedId <= 0) {
          throw new InternalServerErrorException('Could not resolve the created record identifier');
        }
        keyValues = { id: insertedId };
      } else {
        keyValues = Object.fromEntries(
          resource.primaryKey.map((key) => [key, data[key]]),
        );
      }
      const where = this.where(resource, keyValues);
      const fields = Prisma.raw(resource.fields.map(identifier).join(', '));
      const rows = await transaction.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`SELECT ${fields} FROM ${sqlIdentifier(resource.table)} WHERE ${where} LIMIT 1`,
      );
      return rows[0];
    });
  }

  async update(
    resourceName: string,
    id: string,
    body: unknown,
    user: AuthenticatedUser,
    secondaryId?: string,
  ) {
    const resource = this.getResource(resourceName, user, 'write');
    const keyValues = this.parseKeyValues(resource, id, secondaryId);
    const data = this.parseBody(resource, body, true);
    const entries = Object.entries(data);
    if (entries.length === 0) {
      throw new BadRequestException('At least one writable field is required');
    }

    const assignments = Prisma.join(
      entries.map(
        ([key, value]) => Prisma.sql`${sqlIdentifier(key)} = ${value}`,
      ),
    );
    const where = this.where(resource, keyValues);
    return this.prisma.$transaction(async (transaction) => {
      const count = await transaction.$executeRaw(
        Prisma.sql`UPDATE ${sqlIdentifier(resource.table)} SET ${assignments} WHERE ${where}`,
      );
      if (count === 0) {
        throw new NotFoundException(`${resourceName} record not found`);
      }
      const fields = Prisma.raw(resource.fields.map(identifier).join(', '));
      const rows = await transaction.$queryRaw<Record<string, unknown>[]>(
        Prisma.sql`SELECT ${fields} FROM ${sqlIdentifier(resource.table)} WHERE ${where} LIMIT 1`,
      );
      return rows[0];
    });
  }

  async remove(
    resourceName: string,
    id: string,
    user: AuthenticatedUser,
    secondaryId?: string,
  ) {
    const resource = this.getResource(resourceName, user, 'write');
    const keyValues = this.parseKeyValues(resource, id, secondaryId);
    const where = this.where(resource, keyValues);
    return this.prisma.$transaction(async (transaction) => {
      const count = await transaction.$executeRaw(
        Prisma.sql`DELETE FROM ${sqlIdentifier(resource.table)} WHERE ${where}`,
      );
      if (count === 0) {
        throw new NotFoundException(`${resourceName} record not found`);
      }
      return { deleted: true };
    });
  }

  private getResource(
    resourceName: string,
    user: AuthenticatedUser,
    operation: 'read' | 'write',
  ): ResourceDefinition {
    if (resourceName === 'users') {
      throw new NotFoundException('Resource not found');
    }
    const resource = resources[resourceName];
    if (!resource) {
      throw new NotFoundException(`Unknown resource: ${resourceName}`);
    }
    if (resource.dedicatedOnly) {
      throw new NotFoundException('Use the dedicated endpoint for this resource');
    }
    const role = user.role.toLowerCase();
    if (resource.adminOnly && role !== 'admin') {
      throw new ForbiddenException('Admin role required');
    }
    if (
      operation === 'read' &&
      role === 'customer' &&
      !['rooms', 'room-types', 'services', 'promotions'].includes(resourceName)
    ) {
      throw new ForbiddenException('Customers may only access public catalog data');
    }
    if (operation === 'write') {
      if (resource.readOnly) {
        throw new ForbiddenException('This resource is read-only');
      }
      const receptionistResources = [
        'customers',
        'housekeeping-tasks',
        'maintenance-requests',
        'rooms',
        'service-orders',
      ];
      if (
        role !== 'admin' &&
        role !== 'manager' &&
        !(role === 'receptionist' && receptionistResources.includes(resourceName))
      ) {
        throw new ForbiddenException('You do not have permission to change this resource');
      }
    }
    return resource;
  }

  private parsePagination(value: string | undefined, fallback: number, maximum: number) {
    if (value === undefined) {
      return fallback;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > maximum) {
      throw new BadRequestException(`Pagination value must be between 0 and ${maximum}`);
    }
    return parsed;
  }

  private parseKeyValues(
    resource: ResourceDefinition,
    id: string,
    secondaryId?: string,
  ): Record<string, number> {
    if (resource.primaryKey.length > 1 && !secondaryId) {
      throw new BadRequestException('A second primary key value is required');
    }
    const values = resource.primaryKey.map((_, index) =>
      Number(index === 0 ? id : secondaryId),
    );
    if (values.some((value) => !Number.isSafeInteger(value) || value <= 0)) {
      throw new BadRequestException('Resource identifiers must be positive integers');
    }
    return Object.fromEntries(
      resource.primaryKey.map((key, index) => [key, values[index]]),
    );
  }

  private where(resource: ResourceDefinition, values: Record<string, unknown>) {
    return Prisma.join(
      resource.primaryKey.map((key) => {
        const value = values[key];
        if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
          throw new BadRequestException(`Missing valid primary key: ${key}`);
        }
        return Prisma.sql`${sqlIdentifier(key)} = ${value}`;
      }),
      ' AND ',
    );
  }

  private parseBody(
    resource: ResourceDefinition,
    body: unknown,
    isUpdate: boolean,
  ): Record<string, string | number | boolean | null> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const values = body as Record<string, unknown>;
    const writableFields = resource.fields.filter(
      (field) =>
        !['id', 'created_at', 'booking_date', 'payment_time', 'order_time'].includes(field) &&
        !(isUpdate && resource.primaryKey.includes(field)),
    );
    const unknownFields = Object.keys(values).filter(
      (field) => !writableFields.includes(field),
    );
    if (unknownFields.length > 0) {
      throw new BadRequestException(`Fields cannot be written: ${unknownFields.join(', ')}`);
    }

    const result: Record<string, string | number | boolean | null> = {};
    for (const [field, value] of Object.entries(values)) {
      if (
        value !== null &&
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      ) {
        throw new BadRequestException(`Field "${field}" must be a scalar value`);
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new BadRequestException(`Field "${field}" must be a finite number`);
      }
      result[field] = value as string | number | boolean | null;
    }
    return result;
  }

}
