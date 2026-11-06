# Sequence Diagram — Check-out

```mermaid
sequenceDiagram
    actor Receptionist
    participant Client as React Client
    participant Controller as NestJS OperationsController
    participant Service as OperationsService
    participant Prisma as PrismaService
    participant DB as MariaDB/MySQL

    Receptionist->>Client: Chọn kỳ lưu trú để trả phòng
    Client->>Controller: POST /checkout {checkin_id}
    Controller->>Controller: Kiểm tra JWT, role và DTO
    Controller->>Service: checkOut(body)
    Service->>Prisma: Mở transaction
    Prisma->>DB: Khóa stay, tải booking/phòng/dịch vụ
    DB-->>Prisma: Dữ liệu stay đang hoạt động
    Service->>Service: Tính tiền phòng + dịch vụ
    Service->>Prisma: Đóng stay, tạo invoice, cập nhật phòng
    Prisma->>DB: Commit transaction
    DB-->>Prisma: Kết quả commit
    Prisma-->>Service: Invoice đã tạo
    Service-->>Controller: Trả invoice
    Controller-->>Client: 201 Created + JSON invoice
    Client-->>Receptionist: Hiển thị kết quả checkout
```

Tất cả thao tác ghi checkout cùng nằm trong transaction; lỗi trước commit sẽ
rollback việc đóng stay, tạo hóa đơn và cập nhật trạng thái phòng. API checkout
không tự thu tiền; thanh toán được ghi riêng qua `POST /payments`.
