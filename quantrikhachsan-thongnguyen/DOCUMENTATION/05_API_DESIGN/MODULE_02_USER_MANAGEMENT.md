# Module 02 — Tài khoản và nhân sự

Tất cả `/users` chỉ dành cho Admin; mật khẩu/hash không xuất hiện trong response.

| Method | Route | Mô tả |
|---|---|---|
| GET | `/users?limit=50&offset=0` | Danh sách tài khoản và tên vai trò |
| POST | `/users` | Tạo tài khoản nội bộ, hash mật khẩu bcrypt |
| PATCH | `/users/:id` | Đổi username/email/role/password/trạng thái |
| DELETE | `/users/:id` | Vô hiệu hóa tài khoản, không xóa lịch sử |

Tạo user:
`{"username":"staff01","password":"a-long-password","email":"staff@example.com","role_id":2}`.
Password dài 10–72 ký tự; username 3–50; email hợp lệ. Body update chỉ nhận
field được hỗ trợ; 404 khi user không tồn tại; trùng username/email 409.

Hồ sơ nhân viên, ca làm, phân ca và nghỉ phép dùng các route tài nguyên
`/employees`, `/shifts`, `/employee-shifts`, `/leave-requests`. CRUD tổng quát:
GET danh sách/`:id`, POST tạo, PATCH cập nhật, DELETE xóa nếu không vi phạm khóa
ngoại; role Admin/Manager ghi dữ liệu. Không lưu mật khẩu trong hồ sơ nhân viên.
