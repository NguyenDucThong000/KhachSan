# Đặc tả yêu cầu phần mềm — Quản lý khách sạn

## 1. Mục tiêu và phạm vi

Hệ thống cung cấp REST API NestJS, cơ sở dữ liệu MariaDB/MySQL và giao diện web
để phục vụ khách hàng và nhân viên khách sạn. Phạm vi nghiệp vụ gồm 13 module:

1. Xác thực và phân quyền.
2. Tài khoản và hồ sơ nhân viên.
3. Phòng và loại phòng.
4. Khách hàng.
5. Đặt phòng.
6. Nhận phòng, trả phòng và hóa đơn phát sinh.
7. Danh mục dịch vụ và ghi nhận sử dụng.
8. Hóa đơn, thanh toán, khuyến mãi và hoàn tiền.
9. Báo cáo.
10. Buồng phòng.
11. Bảo trì.
12. Thông báo.
13. Nhật ký hoạt động.

Khuyến mãi, đánh giá và cấu hình hệ thống được hỗ trợ như các chức năng mở rộng
trên các bảng tương ứng trong cơ sở dữ liệu.

## 2. Tác nhân và quyền

| Tác nhân | Quyền chính |
|---|---|
| Admin | Toàn quyền quản trị, tài khoản, vai trò, cấu hình, báo cáo và nghiệp vụ |
| Manager | Quản lý danh mục, phòng, nhân viên, nghiệp vụ, bảo trì, tài chính, báo cáo |
| Receptionist | Khách hàng, đặt phòng, nhận/trả phòng, dịch vụ, thanh toán, trạng thái phòng |
| Customer | Tra cứu danh mục và lịch phòng, đặt/hủy đơn của mình, xem lịch sử, thông báo và đánh giá kỳ lưu trú của mình |

Các API quản trị yêu cầu JWT Bearer. Chỉ đăng nhập, đăng ký khách hàng và trang
giới thiệu phòng là public. Mỗi API ghi dữ liệu phải xác thực vai trò và quyền
sở hữu bản ghi khi áp dụng.

## 3. Yêu cầu chức năng

### 3.1 Tài khoản

- Đăng ký tài khoản khách hàng và hồ sơ khách trong một giao dịch.
- Đăng nhập phát JWT hết hạn; từ chối tài khoản bị khóa hoặc mật khẩu sai.
- Tạo/cập nhật/vô hiệu hóa tài khoản bởi Admin; không trả mật khẩu hoặc hash.
- Lưu mật khẩu mới bằng bcrypt; nâng cấp hash legacy sau khi xác thực đúng.

### 3.2 Phòng và đặt phòng

- Quản lý phòng, loại phòng và ba trạng thái độc lập: vận hành, vệ sinh, kỹ thuật.
- Tra cứu phòng trống theo thời điểm check-in/check-out và sức chứa.
- Tình trạng còn phòng được xác định từ khoảng thời gian giao nhau của booking
  `Pending`/`Confirmed`, không suy ra từ trạng thái vận hành hiện tại.
- Tạo đặt phòng phải xác nhận khách/phòng tồn tại, ngày hợp lệ, phòng không lỗi kỹ
  thuật, không trùng phòng và không có lịch đặt giao nhau.
- Ghi snapshot giá vào chi tiết đặt phòng. Xác nhận, hủy và check-in phải theo
  đúng chuyển trạng thái; thao tác cạnh tranh phải được khóa/giao dịch bảo vệ.
- Khách hàng chỉ được xem hoặc hủy đặt phòng của chính mình.

### 3.3 Lưu trú và tài chính

- Chỉ check-in booking đã xác nhận; phòng phải sạch, hoạt động và chưa có khách.
- Check-out chỉ thực hiện một lần; khóa lưu trú, tính tiền phòng theo thời gian ở,
  cộng dịch vụ, lập hóa đơn và chuyển phòng sang chờ dọn trong cùng giao dịch.
- Dịch vụ chỉ ghi nhận vào kỳ lưu trú đang hoạt động; đơn giá được lấy từ danh mục.
- Thanh toán/hoàn tiền không vượt số dư; cập nhật trạng thái hóa đơn nguyên tử.
- Chỉ áp mã ưu đãi đang hiệu lực, trước thanh toán; không áp lặp lại.

### 3.4 Vận hành và phản hồi

- Tạo/hoàn tất nhiệm vụ dọn phòng cập nhật trạng thái vệ sinh phù hợp.
- Tạo/theo dõi/yêu cầu hoàn tất bảo trì đồng bộ trạng thái kỹ thuật; không đưa
  phòng về bình thường nếu vẫn còn yêu cầu bảo trì mở.
- Thông báo được giới hạn theo chủ sở hữu; nhân viên được gửi thông báo và người
  dùng đánh dấu đã đọc.
- Chỉ khách có tài khoản liên kết và kỳ lưu trú đã hoàn tất mới được đánh giá;
  một booking chỉ có một review.
- Ghi nhật ký cho thao tác POST/PATCH/PUT/DELETE đã xác thực.

### 3.5 Báo cáo

- Báo cáo doanh thu tính từ tiền thực thu theo ngày; hỗ trợ bộ lọc ngày.
- Báo cáo công suất/trạng thái phòng thể hiện số phòng theo trạng thái.

## 4. Yêu cầu phi chức năng

- Validation đầu vào và danh sách field allowlist; lỗi trả HTTP 4xx phù hợp.
- Truy vấn dùng tham số hóa; cấm truy cập trực tiếp bảng `users` qua CRUD tổng
  quát và không tiết lộ mật khẩu.
- Giao dịch cho đặt phòng, check-in/out, thanh toán, hoàn tiền và áp khuyến mãi.
- API danh sách có phân trang; CORS chỉ cho origin cấu hình.
- Secret JWT bắt buộc ở production; dùng secret ngẫu nhiên tối thiểu 32 ký tự.
- Không ghi mật khẩu, token hoặc thông tin xác thực vào log.

## 5. Ràng buộc dữ liệu và quy tắc trạng thái

- `bookings.status`: `Pending`, `Confirmed`, `Cancelled`. Trạng thái lưu trú được
  suy ra từ các bản ghi check-in/out; không trộn với trạng thái phòng.
- `rooms.operational_status`: `AVAILABLE`, `RESERVED`, `OCCUPIED`.
- `rooms.cleaning_status`: `CLEAN`, `DIRTY`, `CLEANING`.
- `rooms.technical_status`: `NORMAL`, `MAINTENANCE`, `OUT_OF_SERVICE`.
- Nguồn cấu trúc database chính thức là `backend/prisma/schema.prisma`; mọi thay
  đổi schema cần migration tương thích dữ liệu hiện tại.

## 6. Ngoài phạm vi triển khai hiện tại

Thanh toán cổng ngân hàng, email/SMS/push thực, refresh/revoke token, đặt phòng
không cần tài khoản, lưu trữ file, phân quyền theo từng chi nhánh và giao diện
quản trị hoàn chỉnh cần tích hợp dịch vụ/bổ sung yêu cầu riêng.
