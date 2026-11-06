USE hotel_management;
-- ==========================================
-- 1. NHÓM DỮ LIỆU CƠ BẢN (Bảng không có khóa ngoại)
-- ==========================================

-- Roles (Phân quyền)
INSERT INTO roles (id, role_name, description) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Manager', 'Quản lý khách sạn'),
(3, 'Receptionist', 'Nhân viên lễ tân'),
(4, 'Customer', 'Khách hàng');

-- System Configurations (Cấu hình)
INSERT INTO system_configurations (config_key, config_value, description) VALUES
('TAX_RATE', '0.10', 'Thuế VAT 10%'),
('CHECKIN_TIME', '14:00', 'Giờ nhận phòng tiêu chuẩn'),
('CHECKOUT_TIME', '12:00', 'Giờ trả phòng tiêu chuẩn'),
('HOTEL_NAME', 'Grand Hotel', 'Tên khách sạn');

-- Room Types (Loại phòng)
INSERT INTO room_types (id, type_name, base_price, capacity, description) VALUES
(1, 'Standard', 500000.00, 2, 'Phòng tiêu chuẩn 1 giường đôi'),
(2, 'Deluxe', 800000.00, 2, 'Phòng cao cấp view thành phố'),
(3, 'Suite', 1500000.00, 4, 'Phòng gia đình rộng rãi có bếp nhỏ');

-- Services (Dịch vụ)
INSERT INTO services (id, service_name, price, unit) VALUES
(1, 'Giặt ủi', 50000.00, 'kg'),
(2, 'Ăn sáng Buffet', 150000.00, 'người'),
(3, 'Massage thư giãn', 300000.00, 'lần'),
(4, 'Nước suối', 20000.00, 'chai');

-- Promotions (Khuyến mãi)
INSERT INTO promotions (id, code, discount_type, discount_value, start_date, end_date, is_active) VALUES
(1, 'SUMMER20', 'Percentage', 20.00, '2026-05-01 00:00:00', '2026-08-31 23:59:59', TRUE),
(2, 'NEWYEAR100K', 'Fixed_Amount', 100000.00, '2026-01-01 00:00:00', '2026-01-31 23:59:59', FALSE);

-- Shifts (Ca làm việc)
INSERT INTO shifts (id, shift_name, start_time, end_time) VALUES
(1, 'Ca Sáng', '06:00:00', '14:00:00'),
(2, 'Ca Chiều', '14:00:00', '22:00:00'),
(3, 'Ca Đêm', '22:00:00', '06:00:00');

-- ==========================================
-- 2. NHÓM NGƯỜI DÙNG & NHÂN VIÊN
-- ==========================================

-- Users (Tài khoản)
-- Tài khoản demo chỉ dùng cho môi trường phát triển; mật khẩu 123456 đã được lưu bằng BCrypt.
INSERT INTO users (id, username, password, email, role_id, is_active) VALUES
(1, 'admin', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'admin@grandhotel.com', 1, TRUE),
(2, 'manager_an', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'an.nguyen@grandhotel.com', 2, TRUE),
(3, 'letan_binh', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'binh.tran@grandhotel.com', 3, TRUE),
(4, 'letan_chi', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'chi.le@grandhotel.com', 3, TRUE),
(5, 'khach_dung', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'dung.pham@gmail.com', 4, TRUE),
(6, 'khach_giang', '$2b$12$7AScnqrsMLF/w.AgXuqQj.yfTiCJO6zYbGlZ2f5Er6Hzc7i9RxFca', 'giang.hoang@gmail.com', 4, TRUE);

-- Employees (Hồ sơ nhân viên)
INSERT INTO employees (id, user_id, full_name, phone, cccd, address) VALUES
(1, 1, 'Quản trị viên', '0900000001', '001201000001', 'Đà Nẵng'),
(2, 2, 'Nguyễn Văn An', '0901234567', '001201001234', 'Quận 1, TP.HCM'),
(3, 3, 'Trần Thị Bình', '0902345678', '001201005678', 'Quận 3, TP.HCM'),
(4, 4, 'Lê Thị Chi', '0903456789', '001201009012', 'Quận Bình Thạnh, TP.HCM');

-- Customers (Hồ sơ khách hàng)
INSERT INTO customers (id, user_id, full_name, phone, cccd_passport, email) VALUES
(1, 5, 'Phạm Văn Dũng', '0911222333', '079201001111', 'dung.pham@gmail.com'),
(2, 6, 'Hoàng Thị Giang', '0922333444', '079201002222', 'giang.hoang@gmail.com'),
(3, NULL, 'Vãng lai (Ngô Minh Hải)', '0933444555', '079201003333', 'hai.ngo@yahoo.com'); -- Khách không đăng ký tài khoản

-- ==========================================
-- 3. NHÓM QUẢN LÝ PHÒNG (ROOMS)
-- ==========================================

-- Rooms (Phòng) - Phân bổ trạng thái đa dạng
INSERT INTO rooms (id, room_number, room_type_id, operational_status, cleaning_status, technical_status) VALUES
(1, '101', 1, 'AVAILABLE', 'DIRTY', 'NORMAL'),     -- Khách đã trả phòng, đang chờ dọn
(2, '102', 1, 'AVAILABLE', 'CLEAN', 'NORMAL'),      -- Sẵn sàng đón khách
(3, '103', 1, 'AVAILABLE', 'CLEAN', 'MAINTENANCE'),-- Đang sửa điều hòa
(4, '201', 2, 'AVAILABLE', 'CLEAN', 'NORMAL'),
(5, '202', 2, 'RESERVED', 'CLEAN', 'NORMAL'),       -- Đã có khách đặt trước
(6, '301', 3, 'AVAILABLE', 'DIRTY', 'NORMAL');      -- Phòng Suite đang chờ dọn

-- ==========================================
-- 4. NHÓM ĐẶT PHÒNG & LƯU TRÚ
-- ==========================================

-- Bookings (Đơn đặt phòng)
INSERT INTO bookings (id, customer_id, booking_date, expected_checkin, expected_checkout, deposit, status) VALUES
(1, 1, '2026-10-25 10:00:00', '2026-11-01 14:00:00', '2026-11-03 12:00:00', 200000.00, 'Confirmed'), -- Đã hoàn tất lưu trú
(2, 2, '2026-11-01 15:30:00', '2026-11-10 14:00:00', '2026-11-12 12:00:00', 500000.00, 'Confirmed'), -- Sắp tới (Đặt trước phòng 202)
(3, 3, '2026-11-02 08:00:00', '2026-11-05 14:00:00', '2026-11-06 12:00:00', 0.00, 'Pending');          -- Đang chờ xử lý

-- Booking Details (Chi tiết đặt phòng)
INSERT INTO booking_details (id, booking_id, room_id, price_at_booking) VALUES
(1, 1, 1, 500000.00),  -- Booking 1 thuê phòng 101
(2, 2, 5, 800000.00),  -- Booking 2 thuê phòng 202
(3, 3, 2, 500000.00);  -- Booking 3 thuê phòng 102

-- Checkin_Checkout (Nhận/Trả phòng thực tế)
INSERT INTO checkin_checkout (id, booking_id, actual_checkin, actual_checkout, receptionist_id) VALUES
(1, 1, '2026-11-01 14:15:00', '2026-11-03 12:00:00', 3); -- Khách đã hoàn tất lưu trú

-- ==========================================
-- 5. NHÓM DỊCH VỤ & DỌN PHÒNG
-- ==========================================

-- Service Orders (Gọi dịch vụ) - Khách đang ở phòng 101 gọi dịch vụ
INSERT INTO service_orders (id, checkin_id, service_id, quantity, total_price, order_time) VALUES
(1, 1, 2, 2, 300000.00, '2026-11-02 07:30:00'), -- 2 suất ăn sáng
(2, 1, 1, 2, 100000.00, '2026-11-02 16:00:00'), -- 2kg giặt ủi
(3, 1, 4, 4, 80000.00, '2026-11-02 20:00:00');  -- 4 chai nước

-- Housekeeping Tasks (Phân công dọn phòng)
INSERT INTO housekeeping_tasks (id, room_id, assigned_to, status, notes, created_at, completed_at) VALUES
(1, 1, 3, 'Pending', 'Dọn phòng sau khi khách trả phòng', '2026-11-03 08:00:00', NULL),
(2, 6, 3, 'In_Progress', 'Dọn phòng Suite', '2026-11-03 09:00:00', NULL);

-- Maintenance Requests (Bảo trì)
INSERT INTO maintenance_requests (id, room_id, reported_by, assigned_to, issue_description, status, created_at, resolved_at) VALUES
(1, 3, 2, 1, 'Điều hòa phòng 103 không mát, kêu to', 'In_Progress', '2026-11-03 08:30:00', NULL);

-- ==========================================
-- 6. NHÓM HÓA ĐƠN & THANH TOÁN
-- ==========================================

-- Invoices (Hóa đơn) - Hóa đơn phát sinh sau khi khách trả phòng
INSERT INTO invoices (id, checkin_id, employee_id, room_charge, service_charge, discount, total_amount, status) VALUES
(1, 1, 3, 1000000.00, 480000.00, 0.00, 1480000.00, 'PARTIALLY_PAID');
-- Khớp công thức backend hiện tại: tiền phòng + dịch vụ = 1.480.000; đã thanh toán trước 200.000.

-- Payments (Lịch sử thanh toán) - Đã cọc trước đó
INSERT INTO payments (id, invoice_id, payment_method, amount_paid, payment_time) VALUES
(1, 1, 'Transfer', 200000.00, '2026-10-25 10:15:00'); 

-- ==========================================
-- 7. NHÓM NHÂN SỰ & TƯƠNG TÁC KHÁCH HÀNG
-- ==========================================

-- Employee Shifts (Phân ca)
INSERT INTO employee_shifts (id, employee_id, shift_id, work_date) VALUES
(1, 3, 1, '2026-11-03'), -- Bình làm ca sáng
(2, 4, 2, '2026-11-03'); -- Chi làm ca chiều

-- Leave Requests (Xin nghỉ phép)
INSERT INTO leave_requests (id, employee_id, start_date, end_date, reason, status, approved_by) VALUES
(1, 4, '2026-11-15', '2026-11-16', 'Có việc gia đình', 'Pending', NULL);

-- Reviews (Đánh giá) - Khách Dũng đã hoàn tất lưu trú.
INSERT INTO reviews (id, customer_id, booking_id, rating, comment) VALUES
(1, 1, 1, 5, 'Phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!');

-- Notifications (Thông báo cho khách hàng Giang về việc sắp đến ngày nhận phòng)
INSERT INTO notifications (id, user_id, title, message, is_read) VALUES
(1, 6, 'Sắp đến ngày nhận phòng', 'Chào bạn, bạn có lịch đặt phòng 202 vào ngày 10/11. Vui lòng đến đúng giờ.', FALSE),
(2, 5, 'Hóa đơn chưa thanh toán', 'Bạn có hóa đơn chưa thanh toán cho phòng 101.', FALSE);

-- Activity Logs (Lịch sử thao tác)
INSERT INTO activity_logs (id, user_id, action, module, description) VALUES
(1, 1, 'LOGIN', 'Auth', 'Admin đăng nhập hệ thống'),
(2, 3, 'CHECKIN', 'Booking', 'Lễ tân Bình check-in cho khách Phạm Văn Dũng tại phòng 101'),
(3, 3, 'CREATE_INVOICE', 'Invoice', 'Lập hóa đơn sau khi khách trả phòng 101');