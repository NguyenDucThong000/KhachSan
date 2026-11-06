# SƠ ĐỒ THỰC THỂ LIÊN KẾT (ERD)

Hệ thống quản lý khách sạn bao gồm 13 thực thể chính liên kết chặt chẽ với nhau qua các khóa ngoại (Foreign Keys):
- `roles` (1) ----< `users` (n)
- `users` (1) ----< `employees` (1) & `customers` (1)
- `room_types` (1) ----< `rooms` (n)
- `customers` (1) ----< `bookings` (n)
- `bookings` (1) ----< `booking_details` (n) >---- `rooms` (1)
- `bookings` (1) ----< `checkin_checkout` (1) >---- `employees` (1) [Lễ tân]
- `checkin_checkout` (1) ----< `service_orders` (n) >---- `services` (1)
- `checkin_checkout` (1) ----< `invoices` (1) >---- `employees` (1) [Lập hóa đơn]
- `invoices` (1) ----< `payments` (n)
