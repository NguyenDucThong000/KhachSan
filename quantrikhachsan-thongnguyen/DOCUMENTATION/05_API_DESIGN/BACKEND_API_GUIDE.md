# Hotel Management Backend API

Base URL: `http://localhost:3000`. Nội dung request/response là JSON. Ngoại trừ
các route được đánh dấu Public, API yêu cầu:

```http
Authorization: Bearer <access_token>
```

Mã lỗi chuẩn: `400` dữ liệu/params không hợp lệ, `401` chưa đăng nhập hoặc
token sai/hết hạn, `403` không đủ quyền, `404` tài nguyên không tồn tại,
`409` xung đột nghiệp vụ. Danh sách tài nguyên hỗ trợ `limit` (mặc định 50,
tối đa 100) và `offset` (mặc định 0).

## 1. Đăng nhập và tài khoản

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| POST | `/auth/register` | Public | Tạo tài khoản Customer và customer profile |
| POST | `/auth/login` | Public | Đăng nhập, trả access token |
| GET/POST/PATCH/DELETE | `/users[/:id]` | Admin | Quản lý tài khoản nội bộ; DELETE vô hiệu hóa |

Đăng ký body có `username`, `password`, `email`, `full_name`, `phone`,
`cccd_passport`. Đăng nhập body: `{"username":"...","password":"..."}`.
Tài khoản mới lưu mật khẩu bcrypt; password hash không được trả qua API.
Các tài nguyên nhân sự hỗ trợ CRUD theo route `/employees`, `/shifts`,
`/employee-shifts`, `/leave-requests`; ghi bởi Admin/Manager.

## 2. Phòng và lịch trống

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/public/room-types` | Public | Danh sách hạng phòng, giá và sức chứa |
| GET | `/public/rooms/availability?checkin=...&checkout=...&capacity=...` | Public | Phòng còn trống; chỉ trả thông tin công khai |
| GET | `/rooms` | Đã đăng nhập | Phòng, loại phòng và các trạng thái |
| GET | `/rooms/:id` | Đã đăng nhập | Chi tiết phòng |
| GET | `/rooms/availability?checkin=...&checkout=...&capacity=...` | Đã đăng nhập | Kiểm tra khả dụng theo ngày |
| POST | `/rooms` | Admin, Manager | Tạo phòng |
| PATCH | `/rooms/:id` | Admin, Manager | Cập nhật thông tin phòng |
| PATCH | `/rooms/:id/status` | Admin, Manager, Receptionist | Cập nhật trạng thái |
| GET/POST/PATCH/DELETE | `/room-types[/:id]` | Đọc: đã đăng nhập; ghi: Admin, Manager | Quản lý loại phòng |

Thời gian ISO 8601. `checkout` phải sau `checkin`; capacity là số nguyên dương.
Availability loại phòng có booking Pending/Confirmed giao khoảng ngày hoặc có
check-in thực tế chưa checkout. Trạng thái phòng độc lập: vận hành
`AVAILABLE/RESERVED/OCCUPIED`, vệ sinh `CLEAN/DIRTY/CLEANING`, kỹ thuật
`NORMAL/MAINTENANCE/OUT_OF_SERVICE`.

## 3. Khách hàng và đặt phòng

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/customers?search=...` | Admin, Manager, Receptionist | Tìm khách |
| POST | `/customers` | Admin, Manager, Receptionist | Tạo hồ sơ khách vãng lai |
| PATCH | `/customers/:id` | Admin, Manager, Receptionist | Sửa hồ sơ |
| GET | `/bookings` | Admin, Manager, Receptionist | Danh sách booking |
| GET | `/bookings/:id` | Admin, Manager, Receptionist | Chi tiết booking |
| GET | `/my/bookings` | Customer | Booking của chính khách |
| POST | `/bookings` | Staff hoặc Customer | Tạo booking Pending |
| PATCH | `/bookings/:id/confirm` | Admin, Manager, Receptionist | Xác nhận Pending |
| PATCH | `/bookings/:id/cancel` | Staff; Customer chỉ đơn mình | Hủy Pending/Confirmed |

Body tạo booking:

```json
{
  "customer_id": 1,
  "expected_checkin": "2026-12-10T14:00:00.000Z",
  "expected_checkout": "2026-12-12T12:00:00.000Z",
  "deposit": 0,
  "rooms": [{"room_id": 1}]
}
```

`rooms` không rỗng; không được lặp phòng; checkout sau checkin. Customer chỉ
đặt cho hồ sơ liên kết của mình. Giá loại phòng tại thời điểm đặt được lưu vào
booking detail. Phòng bị giữ nếu có booking Pending/Confirmed giao ngày hoặc
lưu trú thực tế chưa checkout; tạo booking/xác nhận trùng trả 409. Booking enum
chỉ gồm Pending, Confirmed, Cancelled; check-in/out được theo dõi riêng.

## 4. Check-in, checkout và dịch vụ

| Method | Route | Vai trò | Body / chức năng |
|---|---|---|---|
| POST | `/checkin` | Admin, Manager, Receptionist | `{"booking_id":1,"receptionist_id":1}` |
| POST | `/checkout` | Admin, Manager, Receptionist | `{"checkin_id":1}`; checkout và lập hóa đơn |
| GET | `/services[/:id]` | Đã đăng nhập | Danh mục dịch vụ |
| POST/PATCH/DELETE | `/services[/:id]` | Admin, Manager | Quản lý dịch vụ |
| POST | `/service-orders` | Admin, Manager, Receptionist | `{"checkin_id":1,"service_id":2,"quantity":1}` |

Chỉ booking Confirmed mới check-in; phòng phải sạch, hoạt động bình thường và
chưa occupied. Checkout tạo hóa đơn, chuyển phòng về AVAILABLE/DIRTY. Đơn dịch
vụ chỉ phát sinh trong lưu trú đang hoạt động; giá và tổng tiền do server tính.

## 5. Hóa đơn, thanh toán và khuyến mãi

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/invoices` và `/invoices/:id` | Admin, Manager, Receptionist | Tra cứu hóa đơn/chi tiết |
| POST | `/payments` | Admin, Manager, Receptionist | Thu tiền |
| POST | `/refunds` | Admin, Manager | Hoàn khoản đã thanh toán |
| GET/POST/PATCH/DELETE | `/promotions[/:id]` | Customer chỉ đọc; ghi bởi Admin/Manager | Quản lý mã |
| POST | `/invoices/:id/promotions` | Admin, Manager, Receptionist | Áp mã trước khi thanh toán |

Payment: `{"invoice_id":1,"amount_paid":100000,"payment_method":"Cash"}`.
Phương thức: `Cash`, `Transfer`, `Credit_Card`. Refund:
`{"invoice_id":1,"amount":50000,"reason":"..."}`. Promotion:
`{"code":"SUMMER10"}`. Server kiểm tra số dư, hiệu lực, loại và thời gian mã;
không nhận tổng tiền/discount do client tính.

## 6. Housekeeping, maintenance, notification, review

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/housekeeping-tasks?status=Pending` | Admin, Manager, Receptionist | Tối đa 100 task, lọc trạng thái |
| POST | `/housekeeping-tasks` | Admin, Manager, Receptionist | Tạo task |
| PATCH | `/housekeeping-tasks/:id/complete` | Admin, Manager, Receptionist | Hoàn tất và đánh dấu CLEAN |
| GET | `/maintenance-requests?status=Pending` | Admin, Manager, Receptionist | Danh sách/lọc |
| POST | `/maintenance-requests` | Admin, Manager, Receptionist | Ghi nhận sự cố |
| PATCH | `/maintenance-requests/:id` | Admin, Manager | Gán người xử lý/thay trạng thái |
| GET | `/notifications` | Đã đăng nhập | Thông báo của user hiện tại |
| POST | `/notifications` | Admin, Manager, Receptionist | Gửi thông báo cho user |
| PATCH | `/notifications/:id/read` | Chủ thông báo | Đánh dấu đã đọc |
| PATCH | `/notifications/read-all` | Đã đăng nhập | Đánh dấu thông báo của mình đã đọc |
| GET | `/reviews` | Customer chỉ xem của mình; staff xem tất cả | Danh sách đánh giá |
| POST | `/reviews` | Customer | Đánh giá booking đã checkout |

Housekeeping body: `{"room_id":1,"assigned_to":2,"notes":"..."}`.
Maintenance body: `{"room_id":1,"issue_description":"Air conditioner not cooling","assigned_to":2}`.
Update maintenance: `{"status":"In_Progress","assigned_to":2}`; status hợp lệ
`Pending`, `In_Progress`, `Resolved`. Review:
`{"booking_id":1,"rating":5,"comment":"..."}`; rating 1–5, chỉ chủ booking có
lưu trú đã checkout, một review/booking. Notification body:
`{"user_id":3,"title":"Booking confirmed","message":"..."}`. User chỉ đọc/đánh
dấu thông báo của chính mình.

## 7. Báo cáo, nhật ký và cấu hình

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/reports/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD` | Admin, Manager | Doanh thu thực thu theo ngày |
| GET | `/reports/occupancy` | Admin, Manager | Số phòng theo trạng thái vận hành/kỹ thuật |
| GET | `/activity-logs` | Admin | Nhật ký thao tác |
| GET/POST/PATCH/DELETE | `/system-configurations[/:id]` | Admin | Cấu hình hệ thống |

Mutation có xác thực được ghi lại trong activity log. Doanh thu tổng hợp các
payment thực tế, không đồng nghĩa tổng hóa đơn. Occupancy phản ánh trạng thái
vận hành tại thời điểm gọi; lịch còn trống tra qua availability.

## 8. Tài nguyên CRUD dùng chung

Ngoài endpoint nghiệp vụ ở trên, các route tài nguyên sau có CRUD tương ứng
`GET /:resource`, `GET /:resource/:id`, `POST /:resource`,
`PATCH /:resource/:id`, `DELETE /:resource/:id`, trừ khi ghi read-only:

`/booking-details` (read-only), `/checkin` (read-only),
`/employee-shifts`, `/employees`, `/leave-requests`, `/shifts`,
`/room-types`, `/roles` (Admin), `/invoice-promotions`,
`/activity-logs` (read-only, Admin). Tài chính, booking, notification, review
và maintenance được giới hạn vào endpoint nghiệp vụ chuyên biệt; không dùng
CRUD tổng quát để thay đổi trạng thái giao dịch.

Route composite `/invoice-promotions/:invoice_id/:promotion_id` dùng cả hai
khóa. `/users` dùng controller riêng và không trả password/hash.

## 9. Cấu hình và giới hạn

Đặt `DATABASE_URL` trỏ đến MariaDB/MySQL. `JWT_SECRET` phải là chuỗi bí mật
ngẫu nhiên dài tối thiểu 32 ký tự ở production; khi thiếu trong development,
server cảnh báo và dùng khóa tạm. Tùy chọn: `PORT`,
`JWT_EXPIRES_IN_SECONDS` (mặc định 28800), `CORS_ORIGIN` (mặc định
`http://localhost:5173`). Thanh toán hiện ghi nhận thủ công, chưa tích hợp cổng
thanh toán thực, webhook, refresh token hay gửi email/SMS.
