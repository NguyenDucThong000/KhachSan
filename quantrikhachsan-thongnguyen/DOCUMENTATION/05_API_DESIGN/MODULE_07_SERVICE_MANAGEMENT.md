# Module 07 — Dịch vụ

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/services?limit=50&offset=0` | Đã đăng nhập | Danh mục dịch vụ |
| GET | `/services/:id` | Đã đăng nhập | Chi tiết |
| POST/PATCH/DELETE | `/services[/:id]` | Admin, Manager | Quản lý danh mục |
| GET | `/service-orders?limit=50&offset=0` | Admin, Manager, Receptionist | Tra cứu đơn dịch vụ |
| POST | `/service-orders` | Admin, Manager, Receptionist | Ghi nhận sử dụng |

Body order: `{"checkin_id":1,"service_id":2,"quantity":3}`. Check-in phải còn
đang lưu trú; đơn giá lấy từ bảng `services`, tổng tiền được tính phía server,
không nhận giá từ client. Check-in/service không tồn tại hoặc lưu trú đã đóng
trả lỗi phù hợp. Tiền lưu bằng Decimal.
