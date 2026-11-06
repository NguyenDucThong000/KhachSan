# Kế hoạch kiểm thử

## Mục tiêu

Xác minh 13 module nghiệp vụ, phân quyền JWT, validation, quy tắc trạng thái
phòng/booking, quyền sở hữu dữ liệu và các luồng tiền. Mọi kiểm tra ghi dữ liệu
phải chạy trên database test hoặc bản sao đã chuẩn bị; không dùng production.

## Phạm vi và cấp kiểm thử

1. **Unit:** dịch vụ nghiệp vụ, quy tắc tính availability, validation và role.
2. **API/integration:** NestJS controller, JWT guard, Prisma và database test.
3. **Regression:** đăng nhập, danh sách phòng/trạng thái, đặt phòng, lưu trú,
   hóa đơn, dịch vụ và báo cáo.
4. **Tài liệu:** đối chiếu endpoints/roles trong `05_API_DESIGN` với controller
   và DataService.

## Môi trường và dữ liệu

- Node.js theo `backend/package.json`; MariaDB/MySQL dùng schema triển khai từ
  `backend/prisma/schema.prisma`.
- Cấu hình riêng `DATABASE_URL`, `JWT_SECRET` test và `CORS_ORIGIN`; không dùng
  secret hay tài khoản production.
- Tạo fixtures cho Admin, Manager, Receptionist, hai Customer; phòng CLEAN/NORMAL,
  phòng MAINTENANCE, loại phòng, booking, lưu trú active/đã checkout, hóa đơn,
  dịch vụ và promotion.
- Mỗi test giao dịch phải dọn fixture riêng trong transaction hoặc khôi phục
  database test sau kiểm thử.

## Ưu tiên và tiêu chí đạt

| Mức | Hạng mục | Điều kiện đạt |
|---|---|---|
| P0 | JWT và role | Public/protected đúng; token lỗi 401; role sai 403 |
| P0 | Availability/booking | Không giao lịch booking hoặc lưu trú đang hoạt động; request hợp lệ tạo đúng bản ghi |
| P0 | Check-in/out và tiền | Không double check-in/out, thanh toán/refund không vượt số dư, tổng tính từ server |
| P1 | Customer ownership | Customer không truy cập booking, review, notification của người khác |
| P1 | Housekeeping/maintenance | Trạng thái phòng nhất quán theo task/yêu cầu mở |
| P1 | API CRUD và validation | Tài nguyên allowlist, role và input đúng; dữ liệu không hợp lệ trả lỗi rõ |
| P2 | Báo cáo và audit | Doanh thu tính theo payment; mutation tạo log; log chỉ đọc |

Đạt khi toàn bộ kiểm thử P0 và P1 pass; không có lỗi nghiêm trọng ở P2; build,
lint và unit test backend pass. Ghi lại môi trường, lệnh chạy, fixtures, kết quả
pass/fail và lỗi mở trong báo cáo nghiệm thu.

## Lệnh kiểm thử backend

Chạy tại `backend`:

```powershell
npm run build
npm run lint
npm test -- --runInBand
```

Kiểm thử HTTP/database cần server và MariaDB test đã cấu hình; dùng tập
`TEST_CASE.md` làm checklist Postman hoặc integration suite.
