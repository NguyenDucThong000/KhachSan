# Module 06 — Check-in / Check-out

Chỉ Admin, Manager và Receptionist:

| Method | Route | Body | Kết quả |
|---|---|---|---|
| POST | `/checkin` | `{"booking_id":1,"receptionist_id":1}` | Tạo kỳ lưu trú, phòng chuyển OCCUPIED |
| POST | `/checkout` | `{"checkin_id":1}` | Đóng lưu trú, tạo invoice |

Chỉ booking Confirmed mới check-in; phòng phải CLEAN, NORMAL và chưa OCCUPIED.
Check-out chỉ thực hiện một lần. Hệ thống tính tiền phòng theo thời lượng thực
tế tối thiểu một đêm, cộng dịch vụ đã ghi nhận, tạo hóa đơn UNPAID và chuyển
phòng sang AVAILABLE/DIRTY. Lịch booking giữ nguyên để tra cứu lịch sử; không
dùng status booking để giả lập trạng thái check-in.

Lỗi ngày/body: 400; booking/phòng không sẵn sàng hoặc đã thao tác: 404/409.
Thay đổi lưu trú, trạng thái phòng và hóa đơn nằm trong transaction.
