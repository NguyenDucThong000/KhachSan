# Module 13 — Activity Log

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/activity-logs?limit=50&offset=0` | Admin | Tra cứu log theo thứ tự ID |

Interceptor ghi lại các request POST/PATCH/PUT/DELETE đã xác thực sau khi
handler xử lý thành công. Mỗi record lưu `user_id`, `action`, `module`,
`description`, `created_at`; query string bị loại khỏi path. Log chỉ đọc qua
API, không được sửa/xóa bằng endpoint CRUD. Admin là vai trò duy nhất được
truy cập. Đây là nhật ký thao tác ứng dụng, không thay thế audit log bất biến
hoặc giám sát hạ tầng.
