# Module 05 — Đặt phòng

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/bookings?limit=50&offset=0` | Admin, Manager, Receptionist | Danh sách booking và chi tiết |
| GET | `/bookings/:id` | Admin, Manager, Receptionist | Chi tiết booking |
| GET | `/my/bookings` | Customer | Lịch sử booking của tài khoản hiện tại |
| POST | `/bookings` | Admin, Manager, Receptionist, Customer | Tạo booking Pending |
| PATCH | `/bookings/:id/confirm` | Admin, Manager, Receptionist | Xác nhận Pending |
| PATCH | `/bookings/:id/cancel` | Admin, Manager, Receptionist; Customer chỉ đơn mình | Hủy Pending/Confirmed |

Body:

```json
{
  "customer_id": 1,
  "expected_checkin": "2026-12-10T14:00:00.000Z",
  "expected_checkout": "2026-12-12T12:00:00.000Z",
  "deposit": 0,
  "rooms": [{"room_id": 1}]
}
```

`rooms` phải có ít nhất một phòng. Khách hàng chỉ đặt cho hồ sơ liên kết với
tài khoản của mình. Lễ tân/quản lý chỉ định `customer_id`. Ngày checkout phải
sau check-in; giá tại thời điểm đặt được lưu vào booking detail. API khóa phòng
và kiểm tra các booking Pending/Confirmed giao nhau; xung đột trả 409. Enum
booking trong DB chỉ có `Pending`, `Confirmed`, `Cancelled`; trạng thái lưu trú
được biểu diễn riêng bằng `checkin_checkout`.
