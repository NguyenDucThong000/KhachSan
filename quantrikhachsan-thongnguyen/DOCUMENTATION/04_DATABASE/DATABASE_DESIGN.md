# Thiết kế cơ sở dữ liệu

## 1. Công nghệ và nguồn chuẩn

- Hệ quản trị: MariaDB/MySQL.
- ORM: Prisma 7 với MariaDB adapter.
- Schema chuẩn triển khai: `backend/prisma/schema.prisma`.
- Backend không dùng TypeORM. DDL SQL thực tế cần được sinh/đối chiếu từ schema
  và database hiện tại; không chạy lại file SQL mẫu để tránh phá dữ liệu.

## 2. Bảng theo nhóm nghiệp vụ

| Nhóm | Bảng |
|---|---|
| Tài khoản và kiểm toán | `roles`, `users`, `activity_logs`, `notifications` |
| Khách hàng và nhân sự | `customers`, `employees`, `employee_shifts`, `shifts`, `leave_requests` |
| Phòng | `room_types`, `rooms`, `housekeeping_tasks`, `maintenance_requests` |
| Đặt phòng/lưu trú | `bookings`, `booking_details`, `checkin_checkout`, `reviews` |
| Dịch vụ | `services`, `service_orders` |
| Tài chính | `invoices`, `payments`, `refunds`, `promotions`, `invoice_promotions` |
| Cấu hình | `system_configurations` |

## 3. Quan hệ chính

- `roles 1—N users`; user có thể liên kết tối đa một hồ sơ customer hoặc employee.
- `room_types 1—N rooms`.
- `customers 1—N bookings`; `bookings 1—N booking_details`; mỗi detail tham chiếu
  một phòng và lưu giá phòng tại thời điểm đặt.
- `bookings 1—N checkin_checkout`; check-in liên kết nhân viên lễ tân.
- `checkin_checkout 1—N service_orders` và `1—N invoices`.
- `invoices 1—N payments`, `1—N refunds`; `invoices N—N promotions` qua
  `invoice_promotions`.
- `rooms 1—N housekeeping_tasks` và `1—N maintenance_requests`.
- `customers 1—N reviews`; review có booking duy nhất để một booking chỉ được đánh giá một lần.
- `users 1—N notifications` và `1—N activity_logs`.
- Nhân viên liên kết lịch ca, nghỉ phép, dọn phòng, bảo trì, hóa đơn và lưu trú.

## 4. Trạng thái phòng và đặt phòng

Không dùng một trạng thái để biểu diễn cả tình trạng vật lý lẫn lịch đặt:

- `rooms.operational_status`: `AVAILABLE`, `RESERVED`, `OCCUPIED` — tình trạng vận hành hiện tại.
- `rooms.cleaning_status`: `CLEAN`, `DIRTY`, `CLEANING`.
- `rooms.technical_status`: `NORMAL`, `MAINTENANCE`, `OUT_OF_SERVICE`.
- `bookings.status`: `Pending`, `Confirmed`, `Cancelled`.

Phòng còn trống trong một khoảng ngày được tính bằng phép giao khoảng:
`booking.expected_checkin < requested_checkout` và
`booking.expected_checkout > requested_checkin`, chỉ tính booking Pending hoặc
Confirmed. Không lọc lịch tương lai dựa trên `operational_status`. Lưu trú thực
tế được ghi tại `checkin_checkout`; hệ thống hiện giữ enum booking hiện có, không
giả lập `Checked-in` hoặc `Completed` bằng trạng thái phòng.

## 5. Ràng buộc dữ liệu quan trọng

- Khóa chính auto-increment ở các bảng thực thể; `invoice_promotions` có khóa kép
  `(invoice_id, promotion_id)`.
- Unique: username/email, role_name, room_number, customer phone/CCCD, promotion code
  và review booking. Hồ sơ employee/customer liên kết tài khoản theo quan hệ 1—1;
  một booking không thể lặp cùng phòng; phân ca không thể trùng nhân viên/ca/ngày;
  tên hạng phòng và ca làm việc là duy nhất.
- Giá/tiền dùng `Decimal(10,2)`; không dùng floating point làm nguồn ghi sổ.
- Các cột trạng thái ánh xạ enum trong Prisma.
- Foreign key nghiệp vụ bắt buộc không nhận `NULL`; check constraint chặn ngày trả
  không sau ngày nhận, số tiền âm, số lượng dịch vụ không hợp lệ, mức giảm phần
  trăm vượt 100 và đánh giá ngoài 1–5.
- Xóa booking, phòng, tài khoản nhân viên, hóa đơn hoặc dữ liệu tham chiếu lịch sử
  bị chặn bằng `RESTRICT`; cần dùng trạng thái hủy/vô hiệu hóa để giữ lịch sử.
  Hồ sơ khách vãng lai vẫn được phép có `user_id = NULL`.
- Chỉ mục tổng hợp booking theo trạng thái và ngày phục vụ truy vấn availability;
  các unique index kép đồng thời phục vụ tra cứu theo cột đầu và tránh index đơn
  dư thừa.

## 6. Triển khai và migration

1. Sao lưu database hiện tại.
2. Cấu hình `DATABASE_URL` trong `backend/.env`.
3. Đối chiếu schema với database hiện tại trước khi migration.
4. Với database đã tồn tại, chạy `DOCUMENTATION/database_normalize_preflight.sql`
   trước; giải quyết mọi bản ghi trùng/thiếu rồi mới áp dụng
   `DOCUMENTATION/database_normalize_upgrade.sql`. Sao lưu và thử trên bản sao;
   các lệnh DDL của MySQL/MariaDB tự commit.
5. Sinh Prisma client sau khi schema thay đổi; kiểm tra build, migration và API.

`hotel_management_Thongbel.sql` là DDL cho database mới;
`hotel_management_Thongbel_dulieumau.sql` là dữ liệu demo phát triển, mật khẩu
đã hash BCrypt nhưng yếu và không được dùng production. `schema.prisma` là nguồn
model của backend; không chạy seed demo lặp lại trên database đang có dữ liệu.
