# Test cases — Backend hotel management

Chạy API case trên database test. Mỗi case gồm fixtures cần thiết; không chạy
case tạo/sửa dữ liệu trên môi trường production.

| ID | Module | Bước / dữ liệu | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | Auth | Đăng nhập đúng username/password | 201, JWT và user/role; không trả password |
| TC-02 | Auth | Đăng nhập sai mật khẩu | 401, không phát token |
| TC-03 | Auth | Đăng ký với username/email/SĐT/CCCD mới | 201; có user Customer và profile liên kết |
| TC-04 | Auth | Đăng ký trùng username/email | 409; không tạo một phần dữ liệu |
| TC-05 | Auth | Gọi protected route không token/token sai | 401 |
| TC-06 | RBAC | Customer gọi route staff-only | 403 |
| TC-07 | Rooms | Lấy danh sách phòng bằng token hợp lệ | 200; gồm trạng thái vận hành, vệ sinh, kỹ thuật |
| TC-08 | Availability | Hai booking Pending/Confirmed giao ngày cùng phòng | Phòng không xuất hiện trong availability |
| TC-09 | Availability | Có lưu trú `actual_checkout=null` kéo qua kỳ yêu cầu | Phòng không xuất hiện trong availability |
| TC-10 | Availability | Booking chỉ chạm tại thời điểm checkout/checkin liền nhau | Không xem là giao khoảng ngày |
| TC-11 | Availability | Khoảng ngày ngược hoặc capacity không hợp lệ | 400 |
| TC-12 | Booking | Tạo booking hợp lệ, phòng NORMAL | 201 Pending; lưu giá tại thời điểm đặt |
| TC-13 | Booking | Đặt lặp room_id hoặc room không tồn tại | 400 hoặc 404; không tạo booking |
| TC-14 | Booking | Tạo booking xung đột booking hoặc active stay | 409; không tạo booking |
| TC-15 | Booking | Customer đặt với customer_id của người khác | Bị từ chối; không lộ/ghi booking cho người khác |
| TC-16 | Booking | Customer đọc `/my/bookings` | Chỉ trả booking của hồ sơ liên kết |
| TC-17 | Booking | Customer hủy booking của Customer khác | 404; booking không đổi |
| TC-18 | Booking | Confirm booking khi phòng đã có xung đột hoặc không hoạt động | 409; status vẫn Pending |
| TC-19 | Check-in | Check-in booking Confirmed với phòng CLEAN/NORMAL | Tạo stay và chuyển phòng OCCUPIED |
| TC-20 | Check-in | Check-in booking chưa Confirmed hoặc phòng DIRTY/MAINTENANCE | 409; không tạo stay |
| TC-21 | Check-out | Checkout stay đang hoạt động | Đóng stay, tạo hóa đơn, phòng AVAILABLE/DIRTY |
| TC-22 | Check-out | Checkout lần hai | 409; không tạo hóa đơn thứ hai |
| TC-23 | Services | Tạo service order cho stay đang hoạt động | Giá/tổng tiền do server tính, lưu thành công |
| TC-24 | Services | Tạo service order cho stay đã checkout | Bị từ chối |
| TC-25 | Payments | Thanh toán nhỏ hơn hoặc bằng số dư hóa đơn | Ghi payment, cập nhật status/số dư |
| TC-26 | Payments | Thanh toán vượt số dư, amount âm hoặc method lạ | Bị từ chối; không ghi payment |
| TC-27 | Refund | Refund nhỏ hơn hoặc bằng khoản đã thu | Ghi nhận refund |
| TC-28 | Refund | Refund vượt khoản đã thanh toán | Bị từ chối |
| TC-29 | Promotion | Áp mã active, hợp lệ trước thanh toán | Gắn promotion và tính discount phía server |
| TC-30 | Promotion | Mã inactive/hết hạn/trùng hoặc hóa đơn đã thanh toán | Bị từ chối; tổng không đổi |
| TC-31 | Housekeeping | Tạo task phòng không occupied | Task Pending, phòng CLEANING |
| TC-32 | Housekeeping | Hoàn thành task | Task Completed, phòng CLEAN |
| TC-33 | Housekeeping | Tạo/hoàn tất task khi OCCUPIED hoặc hoàn tất lần hai | Bị từ chối |
| TC-34 | Maintenance | Tạo request sự cố | Request Pending, phòng MAINTENANCE |
| TC-35 | Maintenance | Resolve request cuối cùng của phòng | Phòng về NORMAL và có resolved_at |
| TC-36 | Notifications | User đọc/đánh dấu thông báo của mình | Trả đúng danh sách; is_read chuyển true |
| TC-37 | Notifications | User truy cập notification của người khác | 403/404; thông báo không đổi |
| TC-38 | Reviews | Chủ booking tạo review sau checkout | Tạo rating 1–5 |
| TC-39 | Reviews | Review booking chưa checkout/không thuộc khách/trùng | Bị từ chối |
| TC-40 | Reports | Gọi doanh thu với khoảng hợp lệ | Tổng theo payment thực thu, ngày `to` inclusive |
| TC-41 | Reports | Customer gọi báo cáo hoặc ngày sai | 403 hoặc 400 |
| TC-42 | Activity Log | Mutation thành công đã đăng nhập | Tạo log actor/action/module; không lưu query string |
| TC-43 | Activity Log | Non-admin đọc logs hoặc gọi mutation log | 403/read-only |
| TC-44 | Generic CRUD | Ghi resource read-only/dedicated-only hoặc field ngoài allowlist | Bị từ chối; không thay dữ liệu nhạy cảm |
| TC-45 | Regression | Build/lint/unit suite backend | Tất cả lệnh thành công |
