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