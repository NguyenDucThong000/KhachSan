# Module 03 — Phòng và loại phòng

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/rooms` | Đã đăng nhập | Danh sách phòng, trạng thái và loại phòng |
| GET | `/rooms/:id` | Đã đăng nhập | Chi tiết phòng |
| GET | `/rooms/availability?checkin=...&checkout=...&capacity=2` | Đã đăng nhập | Phòng khả dụng theo khoảng lưu trú |
| POST | `/rooms` | Admin, Manager | Tạo phòng |
| PATCH | `/rooms/:id` | Admin, Manager | Cập nhật thông tin phòng |
| PATCH | `/rooms/:id/status` | Admin, Manager, Receptionist | Cập nhật trạng thái phòng |
| GET/POST/PATCH/DELETE | `/room-types[/:id]` | Đọc: đã đăng nhập; ghi: Admin, Manager | Quản lý loại phòng |

Body đổi trạng thái:
`{"operational_status":"AVAILABLE","cleaning_status":"CLEAN","technical_status":"NORMAL"}`.
Mỗi trạng thái là độc lập: vận hành (`AVAILABLE/RESERVED/OCCUPIED`), vệ sinh
(`CLEAN/DIRTY/CLEANING`), kỹ thuật (`NORMAL/MAINTENANCE/OUT_OF_SERVICE`).

Availability dùng ISO 8601, ví dụ:
`GET /rooms/availability?checkin=2026-12-10T14:00:00Z&checkout=2026-12-12T12:00:00Z`.
Phòng bị loại khi trạng thái kỹ thuật không bình thường hoặc có booking
`Pending/Confirmed` giao với khoảng yêu cầu. Ngày checkout được xem là ngày kết
thúc không bao gồm. Phòng trống theo lịch không đồng nghĩa trạng thái hiện tại
của phòng đổi thành `RESERVED`.
