# Hotel Management System

Website quản lý khách sạn gồm frontend React/Vite, backend REST API NestJS và
cơ sở dữ liệu MySQL/MariaDB. Hướng dẫn dưới đây dành cho lần cài đặt mới trên
Windows.

## 1. Yêu cầu

- Windows 10/11.
- Node.js 22 LTS (tối thiểu 22.12) và npm.
- MySQL 8 hoặc MariaDB đang chạy trên máy; cổng mặc định `3306`.
- MySQL Workbench (khuyến nghị) hoặc một công cụ SQL tương đương.
- Git nếu bạn cần clone mã nguồn.

Kiểm tra Node/npm trong PowerShell:

```powershell
node --version
npm --version
```

Mở PowerShell tại thư mục gốc dự án:

```powershell
cd C:\Users\<ten-ban>\Desktop\quantrikhachsan-thongnguyen
```

## 2. Cài đặt và khởi tạo database

### 2.1 Khởi động MySQL

Tên service tùy cách cài MySQL/MariaDB. Tìm service:

```powershell
Get-Service *mysql*, *maria*
```

Nếu service `MySQL80` đang dừng, mở PowerShell với quyền phù hợp rồi chạy:

```powershell
Start-Service MySQL80
Test-NetConnection localhost -Port 3306
```

Kết quả mong đợi của `TcpTestSucceeded` là `True`. Nếu service có tên khác,
thay `MySQL80` bằng tên hiển thị trên máy bạn.

### 2.2 Tạo schema và dữ liệu mẫu (database mới)

Trong MySQL Workbench, kết nối bằng tài khoản quản trị MySQL rồi mở và chạy
lần lượt hai file sau:

1. `DOCUMENTATION/hotel_management_Thongbel.sql` — tạo database
   `hotel_management` và các bảng.
2. `DOCUMENTATION/hotel_management_Thongbel_dulieumau.sql` — thêm tài khoản,
   phòng và dữ liệu demo.

Chỉ chạy file dữ liệu mẫu **một lần trên database mới, đang trống**. Không chạy
lại hai file này trên database đã có dữ liệu. Với database hiện có, hãy sao
lưu trước và làm theo quy trình preflight/nâng cấp tại
[`DOCUMENTATION/04_DATABASE/DATABASE_DESIGN.md`](./DOCUMENTATION/04_DATABASE/DATABASE_DESIGN.md).

### 2.3 Tạo tài khoản kết nối ứng dụng

Trong MySQL Workbench, tạo một tài khoản riêng cho backend (đổi mật khẩu mẫu
thành mật khẩu mạnh của bạn):

```sql
CREATE USER 'hotel_app'@'localhost' IDENTIFIED BY 'ThayBangMatKhauManh';
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_management.* TO 'hotel_app'@'localhost';
```

Nếu bạn đã tạo tài khoản này trước đó, không cần chạy lại `CREATE USER`; có thể
đổi mật khẩu bằng `ALTER USER`. Không dùng tài khoản ứng dụng cho production
nếu chưa đánh giá lại quyền truy cập.

Tài khoản demo được tạo bởi script seed:

| Vai trò | Tên đăng nhập |
|---|---|
| Admin | `admin` |
| Quản lý | `manager_an` |
| Lễ tân | `letan_binh`, `letan_chi` |
| Khách hàng | `khach_dung`, `khach_giang` |

Mật khẩu chung của các tài khoản demo là `123456`. Chỉ dùng để phát triển/thử
nghiệm; hãy đổi hoặc xóa các tài khoản này trước khi triển khai thật.

## 3. Cấu hình và chạy backend

Mở **Terminal 1** tại thư mục gốc dự án:

```powershell
cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
npx prisma generate --schema prisma/schema.prisma
```

Mở `backend/.env`, cập nhật thông tin kết nối cho khớp với MySQL của bạn:

```dotenv
DATABASE_URL="mysql://hotel_app:ThayBangMatKhauManh@localhost:3306/hotel_management"
PORT=3000
JWT_SECRET=thay-bang-chuoi-ngau-nhien-it-nhat-32-ky-tu
JWT_EXPIRES_IN_SECONDS=28800
CORS_ORIGIN=http://localhost:5173
```

Tạo giá trị ngẫu nhiên cho `JWT_SECRET` bằng lệnh sau trong PowerShell; chép
kết quả vào `.env` và giữ nguyên giá trị đó qua các lần khởi động:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Không chia sẻ hoặc commit file `.env`. Nếu mật khẩu MySQL có ký tự đặc biệt như
`@`, `:`, `/`, `#` hoặc `%`, hãy URL-encode mật khẩu trong `DATABASE_URL`.
Không thay thế một `.env` đã có nếu chưa lưu lại các cấu hình của bạn.

Chạy backend:

```powershell
npm run start:dev
```

Giữ terminal này mở. Backend mặc định chạy tại `http://localhost:3000`. Dòng
`Đã kết nối Database qua PrismaService` xác nhận backend đã kết nối MySQL.

## 4. Cấu hình và chạy frontend

Mở **Terminal 2** tại thư mục gốc dự án:

```powershell
cd frontend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm install
```

`frontend/.env` cần có:

```dotenv
VITE_API_URL=http://localhost:3000
```

Chạy frontend:

```powershell
npm run dev
```

Mở URL Vite hiển thị trong terminal, thường là `http://localhost:5173`. Nếu
thay đổi file `.env` khi Vite đang chạy, hãy dừng rồi khởi động lại Vite để
nhận cấu hình mới.

Để chạy hệ thống, cần giữ **cả hai terminal backend và frontend** mở. MySQL
service cũng phải tiếp tục chạy.

## 5. Kiểm tra nhanh

- Mở `http://localhost:5173` để xem landing page.
- Thử đăng nhập bằng một tài khoản demo ở bảng trên.
- API công khai để kiểm tra backend:
  `http://localhost:3000/public/room-types`.
- Có thể kiểm tra cổng MySQL bằng
  `Test-NetConnection localhost -Port 3306`.

## 6. Lỗi thường gặp

- **Không kết nối được database:** kiểm tra service MySQL, cổng `3306`,
  database `hotel_management`, username/password và `DATABASE_URL`.
- **Thiếu Prisma Client:** chạy lại
  `npx prisma generate --schema prisma/schema.prisma` trong thư mục `backend`.
- **`JWT_SECRET must be set` hoặc quá ngắn:** đặt `JWT_SECRET` dài ít nhất 32
  ký tự trong `backend/.env`, rồi khởi động lại backend.
- **`EADDRINUSE` trên cổng 3000/5173:** đã có tiến trình khác dùng cổng đó.
  Dừng terminal backend/frontend cũ trước; tránh chạy hai backend cùng lúc.
- **Frontend báo không kết nối backend:** xác nhận backend đang chạy, kiểm tra
  `VITE_API_URL` và `CORS_ORIGIN`; sau khi sửa `.env`, khởi động lại tiến trình
  tương ứng và tải lại trang.
- **Tài khoản demo không đăng nhập được:** xác nhận đã chạy script dữ liệu mẫu
  đúng một lần trên database vừa tạo và nhập đúng tên đăng nhập/mật khẩu.

## 7. Kiểm tra mã nguồn

Backend, chạy trong thư mục `backend`:

```powershell
npm run build
npm run lint
npm test -- --runInBand
```

Frontend, chạy trong thư mục `frontend`:

```powershell
npm run build
npm run lint
```

Tài liệu API: [`DOCUMENTATION/05_API_DESIGN/BACKEND_API_GUIDE.md`](./DOCUMENTATION/05_API_DESIGN/BACKEND_API_GUIDE.md).

Một số tích hợp chưa có trong dự án: thanh toán qua cổng trực tuyến/webhook,
refresh token và gửi email/SMS.
