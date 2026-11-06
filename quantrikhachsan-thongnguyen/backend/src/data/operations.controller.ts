import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles, CurrentUser, Public } from '../auth/auth.decorators';
import type { AuthenticatedUser } from '../auth/auth.dto';
import {
  housekeeping_tasks_status,
  maintenance_requests_status,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { DataService } from './data.service';
import {
  CheckInDto,
  CheckOutDto,
  CreateHousekeepingTaskDto,
  CreateMaintenanceRequestDto,
  CreateNotificationDto,
  CreateReviewDto,
  CreateBookingDto,
  CreateRefundDto,
  CreateServiceOrderDto,
  PaymentDto,
  RoomStatusDto,
  UpdateMaintenanceRequestDto,
  ApplyPromotionDto,
} from './operations.dto';
import { OperationsService } from './operations.service';

@Controller()
export class OperationsController {
  constructor(
    private readonly operations: OperationsService,
    private readonly data: DataService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('bookings')
  @Roles('Admin', 'Manager', 'Receptionist', 'Customer')
  createBooking(
    @Body() body: CreateBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operations.createBooking(body, user);
  }

  @Patch('bookings/:id/confirm')
  @Roles('Admin', 'Manager', 'Receptionist')
  confirmBooking(@Param('id', ParseIntPipe) id: number) {
    return this.operations.confirmBooking(id);
  }

  @Patch('bookings/:id/cancel')
  @Roles('Admin', 'Manager', 'Receptionist', 'Customer')
  cancelBooking(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operations.cancelBooking(id, user);
  }

  @Get('rooms/availability')
  @Roles('Admin', 'Manager', 'Receptionist', 'Customer')
  findAvailableRooms(
    @Query('checkin') checkin: string,
    @Query('checkout') checkout: string,
    @Query('capacity') capacity?: string,
  ) {
    return this.operations.findAvailableRooms(checkin, checkout, capacity);
  }

  @Get('public/room-types')
  @Public()
  findPublicRoomTypes() {
    return this.prisma.room_types.findMany({
      select: {
        id: true,
        type_name: true,
        base_price: true,
        capacity: true,
        description: true,
      },
      orderBy: { base_price: 'asc' },
    });
  }

  @Get('public/rooms/availability')
  @Public()
  async findPublicAvailableRooms(
    @Query('checkin') checkin: string,
    @Query('checkout') checkout: string,
    @Query('capacity') capacity?: string,
  ) {
    const rooms = await this.operations.findAvailableRooms(checkin, checkout, capacity);
    return rooms.map((room) => ({
      id: room.id,
      room_number: room.room_number,
      room_types: room.room_types
        ? {
            type_name: room.room_types.type_name,
            base_price: room.room_types.base_price,
            capacity: room.room_types.capacity,
          }
        : null,
    }));
  }

  @Post('checkin')
  @Roles('Admin', 'Manager', 'Receptionist')
  checkIn(@Body() body: CheckInDto) {
    return this.operations.checkIn(body);
  }

  @Post('checkout')
  @Roles('Admin', 'Manager', 'Receptionist')
  checkOut(@Body() body: CheckOutDto) {
    return this.operations.checkOut(body);
  }

  @Post('payments')
  @Roles('Admin', 'Manager', 'Receptionist')
  createPayment(@Body() body: PaymentDto) {
    return this.operations.createPayment(body);
  }

  @Post('service-orders')
  @Roles('Admin', 'Manager', 'Receptionist')
  createServiceOrder(@Body() body: CreateServiceOrderDto) {
    return this.operations.createServiceOrder(body);
  }

  @Post('refunds')
  @Roles('Admin', 'Manager')
  createRefund(@Body() body: CreateRefundDto) {
    return this.operations.createRefund(body);
  }

  @Post('invoices/:id/promotions')
  @Roles('Admin', 'Manager', 'Receptionist')
  applyPromotion(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ApplyPromotionDto,
  ) {
    return this.operations.applyPromotion(id, body);
  }

  @Get('housekeeping-tasks')
  @Roles('Admin', 'Manager', 'Receptionist')
  findHousekeepingTasks(@Query('status') status?: string) {
    const parsedStatus = this.parseStatus(
      status,
      Object.values(housekeeping_tasks_status),
    ) as housekeeping_tasks_status | undefined;
    return this.prisma.housekeeping_tasks.findMany({
      where: parsedStatus ? { status: parsedStatus } : {},
      include: { rooms: true, employees: { select: { id: true, full_name: true } } },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  @Post('housekeeping-tasks')
  @Roles('Admin', 'Manager', 'Receptionist')
  createHousekeepingTask(@Body() body: CreateHousekeepingTaskDto) {
    return this.operations.createHousekeepingTask(body);
  }

  @Patch('housekeeping-tasks/:id/complete')
  @Roles('Admin', 'Manager', 'Receptionist')
  completeHousekeepingTask(@Param('id', ParseIntPipe) id: number) {
    return this.operations.completeHousekeepingTask(id);
  }

  @Post('maintenance-requests')
  @Roles('Admin', 'Manager', 'Receptionist')
  createMaintenanceRequest(
    @Body() body: CreateMaintenanceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operations.createMaintenanceRequest(body, user);
  }

  @Patch('maintenance-requests/:id')
  @Roles('Admin', 'Manager')
  updateMaintenanceRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMaintenanceRequestDto,
  ) {
    return this.operations.updateMaintenanceRequest(id, body);
  }

  @Get('maintenance-requests')
  @Roles('Admin', 'Manager', 'Receptionist')
  findMaintenanceRequests(@Query('status') status?: string) {
    const parsedStatus = this.parseStatus(
      status,
      Object.values(maintenance_requests_status),
    ) as maintenance_requests_status | undefined;
    return this.prisma.maintenance_requests.findMany({
      where: parsedStatus ? { status: parsedStatus } : {},
      include: {
        rooms: true,
        employees_maintenance_requests_reported_byToemployees: {
          select: { id: true, full_name: true },
        },
        employees_maintenance_requests_assigned_toToemployees: {
          select: { id: true, full_name: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  @Get('reviews')
  @Roles('Admin', 'Manager', 'Receptionist', 'Customer')
  findReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.operations.findReviews(user);
  }

  @Post('reviews')
  @Roles('Customer')
  createReview(
    @Body() body: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operations.createReview(body, user);
  }

  @Get('notifications')
  findNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.operations.findNotifications(user.sub);
  }

  @Post('notifications')
  @Roles('Admin', 'Manager', 'Receptionist')
  createNotification(@Body() body: CreateNotificationDto) {
    return this.operations.createNotification(body);
  }

  @Patch('notifications/read-all')
  markAllNotificationsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.operations.markAllNotificationsRead(user.sub);
  }

  @Patch('notifications/:id/read')
  markNotificationRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.operations.markNotificationRead(id, user);
  }

  @Get('rooms')
  findRooms() {
    return this.prisma.rooms.findMany({
      include: { room_types: true },
      orderBy: { room_number: 'asc' },
    });
  }

  @Get('bookings')
  @Roles('Admin', 'Manager', 'Receptionist')
  findBookings(
    @Query('limit') limitValue?: string,
    @Query('offset') offsetValue?: string,
  ) {
    const limit = this.parsePagination(limitValue, 50, 100);
    const offset = this.parsePagination(offsetValue, 0, 1000000);
    return this.prisma.bookings.findMany({
      include: {
        customers: { select: { id: true, full_name: true, phone: true, email: true } },
        booking_details: {
          include: { rooms: { include: { room_types: true } } },
        },
        checkin_checkout: true,
      },
      orderBy: { booking_date: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  @Get('my/bookings')
  @Roles('Customer')
  findMyBookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limitValue?: string,
    @Query('offset') offsetValue?: string,
  ) {
    const limit = this.parsePagination(limitValue, 50, 100);
    const offset = this.parsePagination(offsetValue, 0, 1000000);
    return this.prisma.bookings.findMany({
      where: { customers: { is: { user_id: user.sub } } },
      include: {
        booking_details: {
          include: { rooms: { include: { room_types: true } } },
        },
        checkin_checkout: true,
      },
      orderBy: { booking_date: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  @Get('bookings/:id')
  @Roles('Admin', 'Manager', 'Receptionist')
  async findBooking(@Param('id', ParseIntPipe) id: number) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id },
      include: {
        customers: true,
        booking_details: {
          include: { rooms: { include: { room_types: true } } },
        },
        checkin_checkout: true,
      },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  @Get('invoices/:id')
  @Roles('Admin', 'Manager', 'Receptionist')
  async findInvoice(@Param('id', ParseIntPipe) id: number) {
    const invoice = await this.prisma.invoices.findUnique({
      where: { id },
      include: {
        payments: true,
        refunds: true,
        invoice_promotions: { include: { promotions: true } },
        checkin_checkout: {
          include: {
            bookings: {
              include: {
                customers: true,
                booking_details: { include: { rooms: true } },
              },
            },
            service_orders: { include: { services: true } },
          },
        },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  @Patch('rooms/:id/status')
  @Roles('Admin', 'Manager', 'Receptionist')
  updateRoomStatus(
    @Param('id') id: string,
    @Body() body: RoomStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.data.update('rooms', id, body, user);
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

  private parseStatus(value: string | undefined, allowed: string[]) {
    if (value !== undefined && !allowed.includes(value)) {
      throw new BadRequestException(`Status must be one of: ${allowed.join(', ')}`);
    }
    return value;
  }

  @Post('rooms')
  @Roles('Admin', 'Manager')
  createRoom(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.data.create('rooms', body, user);
  }

  @Get('customers')
  findCustomers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.data.findAll('customers', user, limit, offset, search);
  }
}
