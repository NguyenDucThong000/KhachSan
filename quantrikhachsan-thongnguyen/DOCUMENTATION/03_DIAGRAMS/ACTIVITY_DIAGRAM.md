# SƠ ĐỒ HOẠT ĐỘNG (ACTIVITY DIAGRAM)

## Quy trình tổng quát từ Đặt phòng đến Thanh toán
1. **Khách hàng** tìm kiếm phòng trống trên Web.
2. Nếu có phòng trống -> Tạo đơn đặt phòng (`Booking`).
3. Đến ngày nhận phòng -> **Lễ tân** thực hiện **Check-in**.
4. Trong thời gian lưu trú -> Khách có thể gọi thêm dịch vụ (`Service Orders`).
5. Khi khách rời khách sạn -> **Lễ tân** thực hiện **Check-out**.
6. Hệ thống tổng hợp hóa đơn (`Invoice`) -> Khách thanh toán (`Payment`) -> Hoàn tất quy trình.
