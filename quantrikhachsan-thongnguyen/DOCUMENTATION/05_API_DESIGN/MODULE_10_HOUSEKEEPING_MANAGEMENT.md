# Module 10 — Housekeeping

| Method | Route | Vai trò | Chức năng |
|---|---|---|---|
| GET | `/housekeeping-tasks?status=Pending` | Admin, Manager, Receptionist | Danh sách tối đa 100 task, mới nhất trước |
| POST | `/housekeeping-tasks` | Admin, Manager, Receptionist | Tạo task dọn phòng |
| PATCH | `/housekeeping-tasks/:id/complete` | Admin, Manager, Receptionist | Hoàn tất task |

Tạo task:
`{"room_id":1,"assigned_to":2,"notes":"Change towels"}`. `assigned_to` và
`notes` tùy chọn. Trạng thái task do server quản lý (`Pending` khi tạo,
`Completed` khi hoàn tất); filter status sai trả 400.

Không tạo task cho phòng OCCUPIED. Khi tạo task, phòng chuyển `CLEANING`; khi
hoàn tất, phòng chuyển `CLEAN` và task có `completed_at`. Không thể hoàn tất
nhiều lần hoặc dọn trong lúc khách đang ở phòng. Ghi/chuyển trạng thái nằm
trong transaction.
