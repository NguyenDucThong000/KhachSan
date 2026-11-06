# Module 12 — Notification

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/notifications` | Đã đăng nhập | Danh sách thông báo của user hiện tại |
| POST | `/notifications` | Admin, Manager, Receptionist | Tạo thông báo cho user |
| PATCH | `/notifications/:id/read` | Chủ thông báo | Đánh dấu một thông báo đã đọc |
| PATCH | `/notifications/read-all` | Đã đăng nhập | Đánh dấu toàn bộ thông báo của mình đã đọc |

Tạo body: `{"user_id":3,"title":"Booking confirmed","message":"Your booking is confirmed."}`.
User đích phải tồn tại. Người dùng không thể đọc hoặc cập nhật thông báo thuộc
tài khoản khác; endpoint CRUD tổng quát bị khóa cho resource này.

Response danh sách sắp xếp mới nhất trước, tối đa 100 bản ghi. `read-all` trả
`{"updated":N}` với số bản ghi chưa đọc vừa được cập nhật.
