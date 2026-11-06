# Module 01 — Authentication & Authorization

Base URL: `http://localhost:3000`. Dữ liệu JSON; JWT gửi bằng
`Authorization: Bearer <access_token>`.

| Method | Route | Quyền | Mục đích |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký khách hàng và tạo hồ sơ liên kết |
| POST | `/auth/login` | Public | Đăng nhập, nhận JWT |

Đăng ký:

```json
{
  "username": "customer01",
  "password": "a-long-password",
  "email": "customer@example.com",
  "full_name": "Nguyen Van A",
  "phone": "0900000000",
  "cccd_passport": "012345678901"
}
```

Đăng nhập nhận HTTP 201 và `{ "access_token": "...", "token_type": "Bearer",
"expires_in": 28800, "role": "Customer", "user": { "id": 1, "username":
"customer01", "email": "customer@example.com" } }`.
Sai tài khoản/mật khẩu hoặc tài khoản khóa: 401. Tài khoản/email/SĐT/giấy tờ
trùng: 409. Body không hợp lệ: 400. Mật khẩu lưu bcrypt; mật khẩu cũ được nâng cấp
hash bcrypt sau lần đăng nhập thành công.

Vai trò: `Admin`, `Manager`, `Receptionist`, `Customer`. Đăng ký public chỉ tạo
vai trò Customer. JWT secret production lấy từ `JWT_SECRET`, không dùng khóa
development tạm.
