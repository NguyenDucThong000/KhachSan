-- ==========================================
-- TẠO DATABASE VÀ SỬ DỤNG
-- ==========================================

CREATE DATABASE IF NOT EXISTS hotel_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_management;

-- ==========================================
-- NHÓM 1: QUẢN TRỊ HỆ THỐNG (Module 01, 02, 03, 04)
-- ==========================================

-- Bảng Phân quyền (Module 01)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL, -- Admin, Manager, Receptionist, Customer
    description VARCHAR(255)
);

-- Bảng Tài khoản đăng nhập (Module 01)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX role_id (role_id)
);

-- Bảng Nhân viên (Module 02)
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    cccd VARCHAR(20) UNIQUE NOT NULL,
    address VARCHAR(255),
    CONSTRAINT uq_employees_user_id UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng Cấu hình hệ thống (Module 03)
CREATE TABLE system_configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL, -- Ví dụ: 'TAX_RATE', 'CHECKIN_TIME'
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

-- Bảng Nhật ký hoạt động (Module 04)
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL, -- Ví dụ: 'CREATE_BOOKING', 'DELETE_ROOM'
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- NHÓM 2: QUẢN LÝ NGHIỆP VỤ KHÁCH SẠN (Module 05 -> 12)
-- ==========================================

-- Bảng Khách hàng (Module 06)
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    cccd_passport VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    CONSTRAINT uq_customers_user_id UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng Loại phòng (Module 05)
CREATE TABLE room_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    CONSTRAINT uq_room_types_type_name UNIQUE (type_name),
    CONSTRAINT chk_room_types_price CHECK (base_price >= 0),
    CONSTRAINT chk_room_types_capacity CHECK (capacity > 0)
);

-- Bảng Phòng (Module 05)
-- Cập nhật theo đúng quy tắc: Tách biệt trạng thái khai thác, vệ sinh, kỹ thuật
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type_id INT NOT NULL,
    image_url VARCHAR(2048) NULL,
    operational_status ENUM('AVAILABLE', 'RESERVED', 'OCCUPIED') NOT NULL DEFAULT 'AVAILABLE',
    cleaning_status ENUM('CLEAN', 'DIRTY', 'CLEANING') NOT NULL DEFAULT 'CLEAN',
    technical_status ENUM('NORMAL', 'MAINTENANCE', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'NORMAL',
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
);

-- Bảng Đơn đặt phòng (Module 07)
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_checkin DATETIME NOT NULL,
    expected_checkout DATETIME NOT NULL,
    deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    CONSTRAINT chk_bookings_dates CHECK (expected_checkout > expected_checkin),
    CONSTRAINT chk_bookings_deposit CHECK (deposit >= 0),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_bookings_status_dates (status, expected_checkin, expected_checkout)
);

-- Bảng Chi tiết đặt phòng (Module 07)
CREATE TABLE booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    price_at_booking DECIMAL(10,2) NOT NULL,
    CONSTRAINT uq_booking_details_booking_room UNIQUE (booking_id, room_id),
    CONSTRAINT chk_booking_details_price CHECK (price_at_booking >= 0),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- Bảng Nhận & Trả phòng thực tế (Module 08)
CREATE TABLE checkin_checkout (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    actual_checkin DATETIME NOT NULL,
    actual_checkout DATETIME NULL,
    receptionist_id INT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (receptionist_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Bảng Danh mục Dịch vụ (Module 09)
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL
);

-- Bảng Gọi dịch vụ (Module 09)
CREATE TABLE service_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checkin_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_service_orders_quantity CHECK (quantity > 0),
    CONSTRAINT chk_service_orders_total CHECK (total_price >= 0),
    FOREIGN KEY (checkin_id) REFERENCES checkin_checkout(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Bảng Quản lý dọn phòng (Module 11)
CREATE TABLE housekeeping_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    assigned_to INT, 
    status ENUM('Pending', 'In_Progress', 'Completed') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
);

-- Bảng Quản lý bảo trì (Module 12)
CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    reported_by INT, 
    assigned_to INT, 
    issue_description TEXT NOT NULL,
    status ENUM('Pending', 'In_Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (reported_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
);

-- ==========================================
-- NHÓM 3: HÓA ĐƠN, THANH TOÁN, KHUYẾN MÃI (Module 10, 15)
-- ==========================================

-- Bảng Hóa đơn (Module 10)
-- Cập nhật đầy đủ 7 trạng thái thanh toán
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checkin_id INT,
    employee_id INT,
    room_charge DECIMAL(10,2) NOT NULL,
    service_charge DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM(
        'UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
    ) NOT NULL DEFAULT 'UNPAID',
    CONSTRAINT chk_invoices_amounts CHECK (room_charge >= 0 AND service_charge >= 0 AND discount >= 0 AND total_amount >= 0),
    FOREIGN KEY (checkin_id) REFERENCES checkin_checkout(id) ON DELETE RESTRICT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Bảng Lịch sử thanh toán (Module 10)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Transfer') NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payments_amount CHECK (amount_paid > 0),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT
);

-- Bảng Hoàn tiền (Module 10)
CREATE TABLE refunds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    refunded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_refunds_amount CHECK (amount > 0),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    FOREIGN KEY (refunded_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Bảng Khuyến mãi (Module 15)
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, 
    discount_type ENUM('Percentage', 'Fixed_Amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_promotions_period CHECK (end_date > start_date),
    CONSTRAINT chk_promotions_discount CHECK (
        discount_value > 0 AND
        (discount_type <> 'Percentage' OR discount_value <= 100)
    )
);

-- Bảng Áp dụng khuyến mãi vào hóa đơn (Module 15)
CREATE TABLE invoice_promotions (
    invoice_id INT,
    promotion_id INT,
    PRIMARY KEY (invoice_id, promotion_id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE
);

-- ==========================================
-- NHÓM 4: NHÂN SỰ & TƯƠNG TÁC KHÁCH HÀNG (Module 13, 16, 17)
-- ==========================================

-- Bảng Ca làm việc (Module 13)
CREATE TABLE shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shift_name VARCHAR(50) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Bảng Phân ca làm việc (Module 13)
CREATE TABLE employee_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    work_date DATE NOT NULL,
    CONSTRAINT uq_employee_shifts_employee_shift_date UNIQUE (employee_id, shift_id, work_date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT
);

-- Bảng Đơn xin nghỉ phép (Module 13)
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    approved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_request_dates CHECK (end_date >= start_date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- Bảng Thông báo (Module 16)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng Đánh giá & Phản hồi (Module 17)
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    booking_id INT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);
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