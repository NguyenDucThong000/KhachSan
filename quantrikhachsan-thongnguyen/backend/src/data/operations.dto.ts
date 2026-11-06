import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { payments_payment_method } from '../generated/prisma/enums';

export class BookingRoomDto {
  @IsInt()
  room_id: number;
}

export class CreateBookingDto {
  @IsInt()
  customer_id: number;

  @IsDateString()
  expected_checkin: string;

  @IsDateString()
  expected_checkout: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingRoomDto)
  rooms: BookingRoomDto[];
}

export class CheckInDto {
  @IsInt()
  booking_id: number;

  @IsOptional()
  @IsInt()
  receptionist_id?: number;
}

export class CheckOutDto {
  @IsInt()
  checkin_id: number;
}

export class PaymentDto {
  @IsInt()
  invoice_id: number;

  @IsNumber()
  @Min(0.01)
  amount_paid: number;

  @IsEnum(payments_payment_method)
  payment_method: payments_payment_method;
}

export class CreateServiceOrderDto {
  @IsInt()
  checkin_id: number;

  @IsInt()
  service_id: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateRefundDto {
  @IsInt()
  invoice_id: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsInt()
  refunded_by?: number;
}

export class CreateHousekeepingTaskDto {
  @IsInt()
  room_id: number;

  @IsOptional()
  @IsInt()
  assigned_to?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMaintenanceRequestDto {
  @IsInt()
  room_id: number;

  @IsString()
  @MinLength(5)
  issue_description: string;

  @IsOptional()
  @IsInt()
  assigned_to?: number;
}

export class UpdateMaintenanceRequestDto {
  @IsOptional()
  @IsIn(['Pending', 'In_Progress', 'Resolved'])
  status?: string;

  @IsOptional()
  @IsInt()
  assigned_to?: number;
}

export class CreateReviewDto {
  @IsInt()
  booking_id: number;

  @IsInt()
  @Min(1)
  @IsIn([1, 2, 3, 4, 5])
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateNotificationDto {
  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

export class ApplyPromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RoomStatusDto {
  @IsOptional()
  @IsIn(['AVAILABLE', 'RESERVED', 'OCCUPIED'])
  operational_status?: string;

  @IsOptional()
  @IsIn(['CLEAN', 'DIRTY', 'CLEANING'])
  cleaning_status?: string;

  @IsOptional()
  @IsIn(['NORMAL', 'MAINTENANCE', 'OUT_OF_SERVICE'])
  technical_status?: string;
}
