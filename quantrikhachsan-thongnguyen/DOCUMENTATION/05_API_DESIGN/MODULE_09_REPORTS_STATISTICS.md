# Module 09 — Báo cáo và thống kê

Chỉ Admin và Manager.

| Method | Route | Response |
|---|---|---|
| GET | `/reports/revenue?from=2026-01-01&to=2026-01-31` | Tổng thực thu và doanh thu theo ngày |
| GET | `/reports/occupancy` | Tổng phòng, số phòng theo vận hành và kỹ thuật |

Doanh thu tính theo payment thực tế (`payments.amount_paid`), không phải tổng
hóa đơn được lập. `from`/`to` dùng `YYYY-MM-DD`; ngày `to` được bao gồm. Ngày
sai hoặc `from > to`: 400. Occupancy phản ánh trạng thái vận hành hiện tại; tra
cứu booking còn trống trong một khoảng ngày dùng `GET /rooms/availability`.
