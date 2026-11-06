# Module 11 — Maintenance

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/maintenance-requests?status=Pending` | Admin, Manager, Receptionist | Danh sách sự cố, phòng và người phụ trách |
| POST | `/maintenance-requests` | Admin, Manager, Receptionist | Ghi nhận sự cố |
| PATCH | `/maintenance-requests/:id` | Admin, Manager | Gán nhân viên, cập nhật trạng thái |

Tạo sự cố:
`{"room_id":1,"issue_description":"Air conditioner not cooling","assigned_to":2}`.
`issue_description` tối thiểu 5 ký tự. Người báo cáo được lấy từ tài khoản nhân
viên hiện tại nếu hồ sơ nhân viên đã liên kết.

Trạng thái hợp lệ: `Pending`, `In_Progress`, `Resolved`. Tạo/yêu cầu chưa giải
quyết sẽ đưa phòng về `MAINTENANCE`; khi giải quyết, phòng chỉ trở lại `NORMAL`
nếu không còn yêu cầu mở khác. `resolved_at` do server đặt khi chuyển sang
Resolved. Không cho staff cập nhật trạng thái qua CRUD chung.
