# Module 08 — Hóa đơn, thanh toán và khuyến mãi

Chỉ Admin, Manager, Receptionist được xem/thu tiền; chỉ Admin/Manager được hoàn tiền.

| Method | Route | Mô tả |
|---|---|---|
| GET | `/invoices?limit=50&offset=0` | Danh sách |
| GET | `/invoices/:id` | Chi tiết, lưu trú, dịch vụ, thanh toán, khuyến mãi và refund |
| POST | `/invoices/:id/promotions` | Áp promotion trước thanh toán |
| POST | `/payments` | Ghi nhận thanh toán |
| POST | `/refunds` | Ghi nhận refund hợp lệ |

Payment body:
`{"invoice_id":1,"amount_paid":100000,"payment_method":"Cash"}`. Phương thức hợp
lệ: `Cash`, `Transfer`, `Credit_Card`. Refund body:
`{"invoice_id":1,"amount":50000,"reason":"..."}`. Payment/refund khóa hóa đơn,
không vượt số dư đã thu/thực trả và cập nhật trạng thái trong transaction.

Áp khuyến mãi:
`POST /invoices/1/promotions` body `{"code":"SUMMER10"}`. Mã cần active, trong
khoảng thời hạn, chưa dùng trên hóa đơn; hệ thống tính Percentage/Fixed_Amount
và cập nhật discount/total_amount. Chỉ áp khi hóa đơn chưa có thanh toán.
