import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  bookings_status,
  housekeeping_tasks_status,
  invoices_status,
  maintenance_requests_status,
  rooms_operational_status,
  rooms_cleaning_status,
  promotions_discount_type,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.dto';
import {
  CheckInDto,
  CheckOutDto,
  CreateHousekeepingTaskDto,
  CreateMaintenanceRequestDto,
  CreateNotificationDto,
  CreateReviewDto,
  CreateBookingDto,
  CreateRefundDto,
  ApplyPromotionDto,
  UpdateMaintenanceRequestDto,
  CreateServiceOrderDto,
  PaymentDto,
} from './operations.dto';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailableRooms(checkinValue: string, checkoutValue: string, capacityValue?: string) {
    const checkin = this.parseDate(checkinValue, 'checkin');
    const checkout = this.parseDate(checkoutValue, 'checkout');
    if (checkout <= checkin) {
      throw new BadRequestException('Checkout must be after check-in');
    }

    const capacity = capacityValue === undefined ? undefined : Number(capacityValue);
    if (
      capacity !== undefined &&
      (!Number.isSafeInteger(capacity) || capacity < 1)
    ) {
      throw new BadRequestException('Capacity must be a positive integer');
    }

    const unavailableRooms = await this.prisma.$queryRaw<{ room_id: number }[]>(
      Prisma.sql`SELECT DISTINCT bd.room_id FROM booking_details AS bd INNER JOIN bookings AS b ON b.id = bd.booking_id WHERE bd.room_id IS NOT NULL AND ((b.status IN (${bookings_status.Pending}, ${bookings_status.Confirmed}) AND b.expected_checkin < ${checkout} AND b.expected_checkout > ${checkin}) OR EXISTS (SELECT 1 FROM checkin_checkout AS cc WHERE cc.booking_id = b.id AND cc.actual_checkout IS NULL AND cc.actual_checkin < ${checkout}))`,
    );

    return this.prisma.rooms.findMany({
      where: {
        technical_status: 'NORMAL',
        id: { notIn: unavailableRooms.map(({ room_id }) => room_id) },
        ...(capacity === undefined
          ? {}
          : { room_types: { is: { capacity: { gte: capacity } } } }),
      },
      include: { room_types: true },
      orderBy: { room_number: 'asc' },
    });
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (
      !value ||
      Number.isNaN(date.getTime()) ||
      !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(
        value,
      )
    ) {
      throw new BadRequestException(`${field} must be an ISO 8601 date or datetime`);
    }
    return date;
  }

  async createBooking(body: CreateBookingDto, user: AuthenticatedUser) {
    const checkin = new Date(body.expected_checkin);
    const checkout = new Date(body.expected_checkout);
    if (checkout <= checkin) {
      throw new BadRequestException('Checkout must be after check-in');
    }

    const roomIds = body.rooms.map((room) => room.room_id);
    if (new Set(roomIds).size !== roomIds.length) {
      throw new BadRequestException('A room cannot be listed more than once');
    }

    return this.prisma.$transaction(async (transaction) => {
      const customerId =
        user.role.toLowerCase() === 'customer'
          ? (
              await transaction.customers.findFirst({
                where: { user_id: user.sub },
                select: { id: true },
              })
            )?.id
          : body.customer_id;
      if (
        user.role.toLowerCase() === 'customer' &&
        customerId !== body.customer_id
      ) {
        throw new ConflictException('Customer account does not match the booking');
      }
      if (!customerId) {
        throw new ConflictException('Customer account is not linked to a customer profile');
      }
      const customer = await transaction.customers.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM rooms WHERE id IN (${Prisma.join(roomIds)}) FOR UPDATE`,
      );
      const rooms = await transaction.rooms.findMany({
        where: { id: { in: roomIds } },
        include: { room_types: true },
      });
      if (rooms.length !== roomIds.length) {
        throw new NotFoundException('One or more rooms were not found');
      }
      if (
        rooms.some(
          (room) =>
            room.technical_status !== 'NORMAL',
        )
      ) {
        throw new ConflictException('One or more rooms are not operational');
      }

      const overlapping = await transaction.$queryRaw<{ id: number }[]>(
        Prisma.sql`SELECT b.id FROM bookings AS b INNER JOIN booking_details AS bd ON bd.booking_id = b.id WHERE bd.room_id IN (${Prisma.join(roomIds)}) AND ((b.status IN (${bookings_status.Pending}, ${bookings_status.Confirmed}) AND b.expected_checkin < ${checkout} AND b.expected_checkout > ${checkin}) OR EXISTS (SELECT 1 FROM checkin_checkout AS cc WHERE cc.booking_id = b.id AND cc.actual_checkout IS NULL AND cc.actual_checkin < ${checkout})) FOR UPDATE`,
      );
      if (overlapping.length > 0) {
        throw new ConflictException('One or more rooms are already booked for those dates');
      }

      return transaction.bookings.create({
        data: {
          customer_id: customerId,
          expected_checkin: checkin,
          expected_checkout: checkout,
          deposit: body.deposit ?? 0,
          status: bookings_status.Pending,
          booking_details: {
            create: rooms.map((room) => ({
              room_id: room.id,
              price_at_booking: room.room_types?.base_price ?? 0,
            })),
          },
        },
        include: {
          customers: { select: { id: true, full_name: true, phone: true } },
          booking_details: { include: { rooms: true } },
        },
      });
    });
  }

  async confirmBooking(id: number) {
    return this.prisma.$transaction(async (transaction) => {
      const booking = await transaction.bookings.findUnique({
        where: { id },
        include: { booking_details: { include: { rooms: true } } },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.status !== bookings_status.Pending) {
        throw new ConflictException('Only pending bookings can be confirmed');
      }
      if (booking.booking_details.length === 0) {
        throw new BadRequestException('Booking must contain at least one room');
      }

      const roomIds = booking.booking_details.flatMap((detail) =>
        detail.room_id === null ? [] : [detail.room_id],
      );
      if (roomIds.length === 0 || roomIds.length !== booking.booking_details.length) {
        throw new ConflictException('A booking room reference is missing');
      }

      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM rooms WHERE id IN (${Prisma.join(roomIds)}) FOR UPDATE`,
      );
      const overlapping = await transaction.$queryRaw<{ id: number }[]>(
        Prisma.sql`SELECT b.id FROM bookings AS b INNER JOIN booking_details AS bd ON bd.booking_id = b.id WHERE b.id <> ${id} AND bd.room_id IN (${Prisma.join(roomIds)}) AND ((b.status IN (${bookings_status.Pending}, ${bookings_status.Confirmed}) AND b.expected_checkin < ${booking.expected_checkout} AND b.expected_checkout > ${booking.expected_checkin}) OR EXISTS (SELECT 1 FROM checkin_checkout AS cc WHERE cc.booking_id = b.id AND cc.actual_checkout IS NULL AND cc.actual_checkin < ${booking.expected_checkout})) FOR UPDATE`,
      );
      if (overlapping.length > 0) {
        throw new ConflictException('A room in this booking has a conflicting reservation');
      }

      const rooms = await transaction.rooms.findMany({
        where: { id: { in: roomIds }, technical_status: 'NORMAL' },
        select: { id: true },
      });
      if (rooms.length !== roomIds.length) {
        throw new ConflictException('All rooms must be operational before confirming');
      }

      return transaction.bookings.update({
        where: { id },
        data: { status: bookings_status.Confirmed },
        include: { booking_details: { include: { rooms: true } } },
      });
    });
  }

  async cancelBooking(id: number, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (transaction) => {
      const booking = await transaction.bookings.findUnique({
        where: { id },
        include: { booking_details: true },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (user.role.toLowerCase() === 'customer') {
        const customer = await transaction.customers.findFirst({
          where: { user_id: user.sub },
          select: { id: true },
        });
        if (!customer || booking.customer_id !== customer.id) {
          throw new NotFoundException('Booking not found');
        }
      }
      if (
        booking.status !== bookings_status.Pending &&
        booking.status !== bookings_status.Confirmed
      ) {
        throw new ConflictException('Only pending or confirmed bookings can be cancelled');
      }

      const activeStay = await transaction.checkin_checkout.findFirst({
        where: { booking_id: id, actual_checkout: null },
      });
      if (activeStay) {
        throw new ConflictException('A booking with an active stay cannot be cancelled');
      }

      return transaction.bookings.update({
        where: { id },
        data: { status: bookings_status.Cancelled },
      });
    });
  }

  async checkIn(body: CheckInDto) {
    return this.prisma.$transaction(async (transaction) => {
      const booking = await transaction.bookings.findUnique({
        where: { id: body.booking_id },
        include: { booking_details: { include: { rooms: true } } },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }
      if (booking.status !== bookings_status.Confirmed) {
        throw new ConflictException('Only confirmed bookings can be checked in');
      }
      if (booking.booking_details.length === 0) {
        throw new BadRequestException('Booking has no rooms');
      }

      const activeStay = await transaction.checkin_checkout.findFirst({
        where: { booking_id: body.booking_id, actual_checkout: null },
      });
      if (activeStay) {
        throw new ConflictException('This booking is already checked in');
      }

      const roomIds = booking.booking_details.flatMap((detail) =>
        detail.room_id === null ? [] : [detail.room_id],
      );
      if (roomIds.length === 0 || roomIds.length !== booking.booking_details.length) {
        throw new ConflictException('A booking room reference is missing');
      }
      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM rooms WHERE id IN (${Prisma.join(roomIds)}) FOR UPDATE`,
      );
      const updatedRooms = await transaction.rooms.updateMany({
        where: {
          id: { in: roomIds },
          operational_status: { not: rooms_operational_status.OCCUPIED },
          technical_status: 'NORMAL',
          cleaning_status: rooms_cleaning_status.CLEAN,
        },
        data: { operational_status: rooms_operational_status.OCCUPIED },
      });
      if (updatedRooms.count !== roomIds.length) {
        throw new ConflictException('All booked rooms must be clean and operational');
      }

      return transaction.checkin_checkout.create({
        data: {
          booking_id: body.booking_id,
          receptionist_id: body.receptionist_id,
          actual_checkin: new Date(),
        },
        include: {
          bookings: { include: { booking_details: { include: { rooms: true } } } },
        },
      });
    });
  }

  async checkOut(body: CheckOutDto) {
    return this.prisma.$transaction(async (transaction) => {
      const stay = await transaction.checkin_checkout.findUnique({
        where: { id: body.checkin_id },
        include: {
          bookings: { include: { booking_details: true } },
          service_orders: true,
        },
      });
      if (!stay) {
        throw new NotFoundException('Check-in record not found');
      }
      if (stay.actual_checkout) {
        throw new ConflictException('This stay has already been checked out');
      }
      if (!stay.bookings) {
        throw new ConflictException('Check-in record has no booking');
      }

      const roomIds = stay.bookings.booking_details.flatMap((detail) =>
        detail.room_id === null ? [] : [detail.room_id],
      );
      const nights = Math.max(
        1,
        Math.ceil((Date.now() - stay.actual_checkin.getTime()) / millisecondsPerDay),
      );
      const roomCharge = stay.bookings.booking_details.reduce(
        (total, detail) => total + Number(detail.price_at_booking) * nights,
        0,
      );
      const serviceCharge = stay.service_orders.reduce(
        (total, order) => total + Number(order.total_price),
        0,
      );
      const checkedOutAt = new Date();
      const updatedStay = await transaction.checkin_checkout.update({
        where: { id: body.checkin_id },
        data: { actual_checkout: checkedOutAt },
      });
      await transaction.rooms.updateMany({
        where: { id: { in: roomIds } },
        data: {
          operational_status: rooms_operational_status.AVAILABLE,
          cleaning_status: rooms_cleaning_status.DIRTY,
        },
      });
      const invoice = await transaction.invoices.create({
        data: {
          checkin_id: body.checkin_id,
          employee_id: stay.receptionist_id,
          room_charge: new Prisma.Decimal(roomCharge.toFixed(2)),
          service_charge: new Prisma.Decimal(serviceCharge.toFixed(2)),
          total_amount: new Prisma.Decimal((roomCharge + serviceCharge).toFixed(2)),
          status: invoices_status.UNPAID,
        },
      });
      return { checkin: updatedStay, invoice };
    });
  }

  async createPayment(body: PaymentDto) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM invoices WHERE id = ${body.invoice_id} FOR UPDATE`,
      );
      const invoice = await transaction.invoices.findUnique({
        where: { id: body.invoice_id },
        include: { payments: true, refunds: true },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      if (
        invoice.status === invoices_status.PAID ||
        invoice.status === invoices_status.REFUNDED
      ) {
        throw new ConflictException('This invoice is already settled');
      }

      const paid = invoice.payments.reduce(
        (total, payment) => total + Number(payment.amount_paid),
        0,
      );
      const refunded = invoice.refunds.reduce(
        (total, refund) => total + Number(refund.amount),
        0,
      );
      const outstanding = Number(invoice.total_amount) - paid - refunded;
      if (body.amount_paid > outstanding) {
        throw new BadRequestException('Payment exceeds the outstanding invoice balance');
      }

      const payment = await transaction.payments.create({
        data: {
          invoice_id: body.invoice_id,
          amount_paid: new Prisma.Decimal(body.amount_paid),
          payment_method: body.payment_method,
        },
      });
      const nextStatus =
        paid + body.amount_paid >= Number(invoice.total_amount) - refunded
          ? invoices_status.PAID
          : invoices_status.PARTIALLY_PAID;
      await transaction.invoices.update({
        where: { id: body.invoice_id },
        data: { status: nextStatus },
      });
      return { payment, invoice_status: nextStatus };
    });
  }

  async createServiceOrder(body: CreateServiceOrderDto) {
    const [stay, service] = await Promise.all([
      this.prisma.checkin_checkout.findUnique({ where: { id: body.checkin_id } }),
      this.prisma.services.findUnique({ where: { id: body.service_id } }),
    ]);
    if (!stay || stay.actual_checkout) {
      throw new ConflictException('An active check-in record is required');
    }
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service_orders.create({
      data: {
        checkin_id: body.checkin_id,
        service_id: body.service_id,
        quantity: body.quantity,
        total_price: new Prisma.Decimal(service.price).mul(body.quantity),
      },
      include: { services: true },
    });
  }

  async createRefund(body: CreateRefundDto) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM invoices WHERE id = ${body.invoice_id} FOR UPDATE`,
      );
      const invoice = await transaction.invoices.findUnique({
        where: { id: body.invoice_id },
        include: { payments: true, refunds: true },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const paid = invoice.payments.reduce(
        (total, payment) => total + Number(payment.amount_paid),
        0,
      );
      const refunded = invoice.refunds.reduce(
        (total, refund) => total + Number(refund.amount),
        0,
      );
      if (body.amount > paid - refunded) {
        throw new BadRequestException('Refund exceeds the refundable balance');
      }

      const refund = await transaction.refunds.create({
        data: {
          invoice_id: body.invoice_id,
          amount: new Prisma.Decimal(body.amount),
          reason: body.reason,
          refunded_by: body.refunded_by,
        },
      });
      const nextStatus =
        refunded + body.amount >= paid
          ? invoices_status.REFUNDED
          : invoices_status.PARTIALLY_REFUNDED;
      await transaction.invoices.update({
        where: { id: body.invoice_id },
        data: { status: nextStatus },
      });
      return { refund, invoice_status: nextStatus };
    });
  }

  async applyPromotion(invoiceId: number, body: ApplyPromotionDto) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw(
        Prisma.sql`SELECT id FROM invoices WHERE id = ${invoiceId} FOR UPDATE`,
      );
      const invoice = await transaction.invoices.findUnique({
        where: { id: invoiceId },
        include: { invoice_promotions: true, payments: true },
      });
      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }
      if (invoice.status !== invoices_status.UNPAID || invoice.payments.length > 0) {
        throw new ConflictException('Promotions can only be applied before payment');
      }

      const code = body.code.trim().toUpperCase();
      const promotion = await transaction.promotions.findUnique({ where: { code } });
      if (
        !promotion ||
        promotion.is_active === false ||
        promotion.start_date > new Date() ||
        promotion.end_date < new Date()
      ) {
        throw new BadRequestException('Promotion is invalid, inactive, or outside its dates');
      }
      if (invoice.invoice_promotions.some((entry) => entry.promotion_id === promotion.id)) {
        throw new ConflictException('Promotion is already applied to this invoice');
      }

      const subtotal = Number(invoice.room_charge) + Number(invoice.service_charge);
      const discount =
        promotion.discount_type === promotions_discount_type.Percentage
          ? (subtotal * Number(promotion.discount_value)) / 100
          : Number(promotion.discount_value);
      const nextDiscount = Math.min(
        subtotal,
        Number(invoice.discount ?? 0) + discount,
      );
      const updated = await transaction.invoices.update({
        where: { id: invoiceId },
        data: {
          discount: new Prisma.Decimal(nextDiscount.toFixed(2)),
          total_amount: new Prisma.Decimal((subtotal - nextDiscount).toFixed(2)),
          invoice_promotions: { create: { promotion_id: promotion.id } },
        },
        include: { invoice_promotions: { include: { promotions: true } } },
      });
      return updated;
    });
  }

  async createHousekeepingTask(body: CreateHousekeepingTaskDto) {
    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.rooms.findUnique({ where: { id: body.room_id } });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      if (room.operational_status === rooms_operational_status.OCCUPIED) {
        throw new ConflictException('An occupied room cannot be assigned a cleaning task');
      }
      if (body.assigned_to !== undefined) {
        const employee = await transaction.employees.findUnique({
          where: { id: body.assigned_to },
        });
        if (!employee) {
          throw new NotFoundException('Assigned employee not found');
        }
      }

      const task = await transaction.housekeeping_tasks.create({
        data: {
          room_id: body.room_id,
          assigned_to: body.assigned_to,
          notes: body.notes,
          status: housekeeping_tasks_status.Pending,
        },
      });
      await transaction.rooms.update({
        where: { id: body.room_id },
        data: { cleaning_status: rooms_cleaning_status.CLEANING },
      });
      return task;
    });
  }

  async completeHousekeepingTask(id: number) {
    return this.prisma.$transaction(async (transaction) => {
      const task = await transaction.housekeeping_tasks.findUnique({
        where: { id },
        include: { rooms: true },
      });
      if (!task) {
        throw new NotFoundException('Housekeeping task not found');
      }
      if (task.status === housekeeping_tasks_status.Completed) {
        throw new ConflictException('Housekeeping task is already completed');
      }
      if (!task.rooms || task.rooms.operational_status === rooms_operational_status.OCCUPIED) {
        throw new ConflictException('The room must be unoccupied before cleaning can be completed');
      }

      const completed = await transaction.housekeeping_tasks.update({
        where: { id },
        data: {
          status: housekeeping_tasks_status.Completed,
          completed_at: new Date(),
        },
      });
      await transaction.rooms.update({
        where: { id: task.rooms.id },
        data: { cleaning_status: rooms_cleaning_status.CLEAN },
      });
      return completed;
    });
  }

  async createMaintenanceRequest(body: CreateMaintenanceRequestDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (transaction) => {
      const room = await transaction.rooms.findUnique({ where: { id: body.room_id } });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      const employee = await transaction.employees.findFirst({
        where: { user_id: user.sub },
        select: { id: true },
      });
      if (body.assigned_to !== undefined) {
        const assignee = await transaction.employees.findUnique({
          where: { id: body.assigned_to },
        });
        if (!assignee) {
          throw new NotFoundException('Assigned employee not found');
        }
      }

      const request = await transaction.maintenance_requests.create({
        data: {
          room_id: body.room_id,
          reported_by: employee?.id,
          assigned_to: body.assigned_to,
          issue_description: body.issue_description,
          status: maintenance_requests_status.Pending,
        },
      });
      await transaction.rooms.update({
        where: { id: body.room_id },
        data: { technical_status: 'MAINTENANCE' },
      });
      return request;
    });
  }

  async updateMaintenanceRequest(id: number, body: UpdateMaintenanceRequestDto) {
    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.maintenance_requests.findUnique({
        where: { id },
      });
      if (!request) {
        throw new NotFoundException('Maintenance request not found');
      }
      if (body.assigned_to !== undefined) {
        const assignee = await transaction.employees.findUnique({
          where: { id: body.assigned_to },
        });
        if (!assignee) {
          throw new NotFoundException('Assigned employee not found');
        }
      }

      const status = body.status as maintenance_requests_status | undefined;
      const updated = await transaction.maintenance_requests.update({
        where: { id },
        data: {
          assigned_to: body.assigned_to,
          status,
          ...(status === maintenance_requests_status.Resolved
            ? { resolved_at: new Date() }
            : {}),
        },
      });
      if (
        request.room_id !== null &&
        status !== undefined &&
        status !== maintenance_requests_status.Resolved
      ) {
        await transaction.rooms.update({
          where: { id: request.room_id },
          data: { technical_status: 'MAINTENANCE' },
        });
      } else if (request.room_id !== null && status === maintenance_requests_status.Resolved) {
        const otherOpenRequests = await transaction.maintenance_requests.count({
          where: {
            room_id: request.room_id,
            id: { not: id },
            status: { not: maintenance_requests_status.Resolved },
          },
        });
        if (otherOpenRequests === 0) {
          await transaction.rooms.update({
            where: { id: request.room_id },
            data: { technical_status: 'NORMAL' },
          });
        }
      }
      return updated;
    });
  }

  async createReview(body: CreateReviewDto, user: AuthenticatedUser) {
    const customer = await this.prisma.customers.findFirst({
      where: { user_id: user.sub },
      select: { id: true },
    });
    if (!customer) {
      throw new ConflictException('Customer account is not linked to a customer profile');
    }
    const booking = await this.prisma.bookings.findFirst({
      where: {
        id: body.booking_id,
        customer_id: customer.id,
        checkin_checkout: { some: { actual_checkout: { not: null } } },
      },
    });
    if (!booking) {
      throw new BadRequestException('Only a completed stay belonging to you can be reviewed');
    }
    return this.prisma.reviews.create({
      data: {
        booking_id: body.booking_id,
        customer_id: customer.id,
        rating: body.rating,
        comment: body.comment,
      },
    });
  }

  findReviews(user: AuthenticatedUser) {
    return this.prisma.reviews.findMany({
      where:
        user.role.toLowerCase() === 'customer'
          ? { customers: { is: { user_id: user.sub } } }
          : {},
      include: { customers: { select: { id: true, full_name: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async createNotification(body: CreateNotificationDto) {
    const user = await this.prisma.users.findUnique({
      where: { id: body.user_id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.notifications.create({ data: body });
  }

  findNotifications(userId: number) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async markNotificationRead(id: number, user: AuthenticatedUser) {
    const notification = await this.prisma.notifications.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.user_id !== user.sub) {
      throw new ConflictException('Notification does not belong to this user');
    }
    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllNotificationsRead(userId: number) {
    const result = await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { updated: result.count };
  }
}
