# Đặc tả Use Case

## UC-01 — Đăng ký và đăng nhập

- **Tác nhân:** Khách hàng, nhân viên, quản trị viên.
- **Tiền điều kiện:** Vai trò Customer được cấu hình; nhân viên đã được Admin cấp tài khoản.
- **Luồng chính:** Người dùng gửi thông tin hợp lệ; API kiểm tra định danh trùng;
  đăng ký tạo user và customer trong một transaction. Đăng nhập kiểm tra tài khoản,
  hash mật khẩu và trạng thái hoạt động rồi trả JWT cùng vai trò.
- **Ngoại lệ:** Thiếu/sai dữ liệu trả 400; định danh trùng 409; thông tin đăng nhập
  sai hoặc tài khoản khóa 401.
- **Hậu điều kiện:** Mật khẩu lưu dạng bcrypt; JWT dùng cho các API yêu cầu đăng nhập.

## UC-02 — Tìm phòng và đặt phòng

- **Tác nhân:** Khách hàng, lễ tân.
- **Tiền điều kiện:** Ngày trả sau ngày nhận; phòng và loại phòng tồn tại.
- **Luồng chính:** Tìm phòng bằng khoảng ngày; hệ thống loại phòng lỗi kỹ thuật,
  có booking Pending/Confirmed giao nhau hoặc đang lưu trú. Khách chọn phòng; hệ
  thống khóa phòng, kiểm tra lại xung đột, chụp giá vào booking detail và tạo đơn Pending.
- **Ngoại lệ:** Ngày sai 400; phòng không tồn tại 404; xung đột lịch 409.
- **Hậu điều kiện:** Booking mới không làm thay đổi trạng thái vận hành hiện tại của phòng.

## UC-03 — Xác nhận hoặc hủy booking

- **Tác nhân:** Lễ tân, quản lý, khách hàng (chỉ hủy booking của mình).
- **Luồng chính:** Lễ tân xác nhận đơn Pending sau khi kiểm tra lịch lại; hoặc chủ
  booking hủy đơn Pending/Confirmed khi chưa check-in. Hệ thống ghi trạng thái
  booking; trạng thái vận hành phòng được giữ độc lập.
- **Ngoại lệ:** Sai trạng thái hoặc lịch bị chiếm 409; booking không thuộc khách 404.

## UC-04 — Check-in và check-out

- **Tác nhân:** Lễ tân.
- **Tiền điều kiện:** Booking Confirmed, phòng sạch/bình thường và chưa có khách.
- **Luồng chính:** Check-in tạo bản ghi lưu trú và đánh dấu phòng Occupied. Check-out
  chỉ một lần, khóa bản ghi, tính tiền phòng theo thời gian thực tế, cộng service
  order, tạo hóa đơn, đánh dấu phòng Available/Dirty và mở quy trình dọn phòng.
- **Ngoại lệ:** Booking chưa xác nhận, phòng chưa sẵn sàng hoặc đã thao tác trước đó 409.

## UC-05 — Dịch vụ, hóa đơn và thanh toán

- **Tác nhân:** Lễ tân, quản lý.
- **Luồng chính:** Ghi dịch vụ vào kỳ lưu trú đang mở; checkout tạo hóa đơn; có thể
  áp promotion còn hạn trước thanh toán; ghi một hoặc nhiều payment; tạo refund
  trong giới hạn số tiền đã thực trả.
- **Ngoại lệ:** Dịch vụ/hóa đơn không tồn tại 404; quá số dư, promotion không hợp lệ
  hoặc hóa đơn đã chốt 400/409.

## UC-06 — Housekeeping và bảo trì

- **Tác nhân:** Lễ tân, quản lý.
- **Luồng chính:** Tạo task dọn phòng cho phòng chưa có khách; trạng thái vệ sinh
  chuyển CLEANING; hoàn tất chuyển CLEAN. Tạo yêu cầu bảo trì chuyển kỹ thuật sang
  MAINTENANCE; chỉ về NORMAL khi không còn yêu cầu mở.
- **Ngoại lệ:** Phòng có khách không được hoàn tất vệ sinh; phòng/nhân viên không tồn tại.

## UC-07 — Thông báo và đánh giá

- **Tác nhân:** Người dùng, nhân viên, khách hàng.
- **Luồng chính:** Nhân viên gửi thông báo đến tài khoản; người nhận chỉ đọc/đánh
  dấu thông báo của mình. Khách hàng đánh giá booking đã trả phòng của chính họ,
  tối đa một đánh giá cho một booking.
- **Ngoại lệ:** Không sở hữu bản ghi hoặc chưa hoàn tất lưu trú thì bị từ chối.

## UC-08 — Quản trị và báo cáo

- **Tác nhân:** Admin, Manager.
- **Luồng chính:** Admin quản lý tài khoản/vai trò/cấu hình và xem audit log;
  Manager/Admin quản lý tài nguyên, xem doanh thu thực thu theo ngày và thống kê phòng.
- **Hậu điều kiện:** Thao tác ghi được lưu trong activity log.
