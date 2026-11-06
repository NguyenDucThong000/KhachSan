# Module 04 — Khách hàng

| Method | Route | Quyền | Mô tả |
|---|---|---|---|
| GET | `/customers?search=0900&limit=50&offset=0` | Admin, Manager, Receptionist | Tìm tên/SĐT/CCCD/email |
| GET | `/customers/:id` | Admin, Manager, Receptionist | Xem hồ sơ |
| POST | `/customers` | Admin, Manager, Receptionist | Thêm khách vãng lai |
| PATCH | `/customers/:id` | Admin, Manager, Receptionist | Cập nhật hồ sơ |

Body tạo: `{"full_name":"Nguyen Van A","phone":"0900000000",
"cccd_passport":"012345678901","email":"a@example.com"}`. Tìm kiếm chỉ tìm các
field hồ sơ khách; không cho khách hàng tự liệt kê hồ sơ người khác. Tài khoản
khách tự đăng ký tại `POST /auth/register`, giao dịch đó tạo cả user và hồ sơ.
SĐT/CCCD trùng trả 409; phân trang mặc định 50, tối đa 100.
