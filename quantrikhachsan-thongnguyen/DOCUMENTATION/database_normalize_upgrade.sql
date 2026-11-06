-- Upgrade an existing hotel_management database to the normalized constraints
-- in hotel_management_Thongbel.sql and backend/prisma/schema.prisma.
--
-- Back up the database first. Run the preflight SELECT statements and stop if
-- they return rows. This script deliberately does not delete or merge records.
-- Apply once, during a maintenance window, on MySQL/MariaDB with CHECK support.

USE hotel_management;

ALTER TABLE users
  MODIFY role_id INT NOT NULL,
  DROP FOREIGN KEY users_ibfk_1,
  ADD CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;

ALTER TABLE employees
  MODIFY user_id INT NOT NULL,
  DROP INDEX user_id,
  ADD CONSTRAINT uq_employees_user_id UNIQUE (user_id),
  DROP FOREIGN KEY employees_ibfk_1,
  ADD CONSTRAINT employees_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE customers
  DROP INDEX user_id,
  ADD CONSTRAINT uq_customers_user_id UNIQUE (user_id);

ALTER TABLE room_types
  ADD CONSTRAINT uq_room_types_type_name UNIQUE (type_name),
  ADD CONSTRAINT chk_room_types_price CHECK (base_price >= 0),
  ADD CONSTRAINT chk_room_types_capacity CHECK (capacity > 0);

ALTER TABLE rooms
  MODIFY room_type_id INT NOT NULL,
  MODIFY operational_status ENUM('AVAILABLE', 'RESERVED', 'OCCUPIED') NOT NULL DEFAULT 'AVAILABLE',
  MODIFY cleaning_status ENUM('CLEAN', 'DIRTY', 'CLEANING') NOT NULL DEFAULT 'CLEAN',
  MODIFY technical_status ENUM('NORMAL', 'MAINTENANCE', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'NORMAL',
  DROP FOREIGN KEY rooms_ibfk_1,
  ADD CONSTRAINT rooms_ibfk_1 FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT;

ALTER TABLE bookings
  MODIFY booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  MODIFY customer_id INT NOT NULL,
  MODIFY deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  DROP FOREIGN KEY bookings_ibfk_1,
  ADD CONSTRAINT bookings_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_bookings_dates CHECK (expected_checkout > expected_checkin),
  ADD CONSTRAINT chk_bookings_deposit CHECK (deposit >= 0),
  ADD INDEX idx_bookings_status_dates (status, expected_checkin, expected_checkout);

ALTER TABLE booking_details
  MODIFY booking_id INT NOT NULL,
  MODIFY room_id INT NOT NULL,
  DROP INDEX booking_id,
  ADD CONSTRAINT uq_booking_details_booking_room UNIQUE (booking_id, room_id),
  ADD CONSTRAINT chk_booking_details_price CHECK (price_at_booking >= 0),
  DROP FOREIGN KEY booking_details_ibfk_1,
  ADD CONSTRAINT booking_details_ibfk_1 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
  DROP FOREIGN KEY booking_details_ibfk_2,
  ADD CONSTRAINT booking_details_ibfk_2 FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT;

ALTER TABLE checkin_checkout
  MODIFY booking_id INT NOT NULL,
  DROP FOREIGN KEY checkin_checkout_ibfk_1,
  ADD CONSTRAINT checkin_checkout_ibfk_1 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT;

ALTER TABLE employee_shifts
  MODIFY employee_id INT NOT NULL,
  MODIFY shift_id INT NOT NULL,
  DROP INDEX employee_id,
  ADD CONSTRAINT uq_employee_shifts_employee_shift_date UNIQUE (employee_id, shift_id, work_date),
  DROP FOREIGN KEY employee_shifts_ibfk_1,
  ADD CONSTRAINT employee_shifts_ibfk_1 FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  DROP FOREIGN KEY employee_shifts_ibfk_2,
  ADD CONSTRAINT employee_shifts_ibfk_2 FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE RESTRICT;

ALTER TABLE shifts
  ADD CONSTRAINT uq_shifts_name UNIQUE (shift_name);

ALTER TABLE service_orders
  MODIFY checkin_id INT NOT NULL,
  MODIFY service_id INT NOT NULL,
  MODIFY quantity INT NOT NULL DEFAULT 1,
  DROP FOREIGN KEY service_orders_ibfk_1,
  ADD CONSTRAINT service_orders_ibfk_1 FOREIGN KEY (checkin_id) REFERENCES checkin_checkout(id) ON DELETE RESTRICT,
  DROP FOREIGN KEY service_orders_ibfk_2,
  ADD CONSTRAINT service_orders_ibfk_2 FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_service_orders_quantity CHECK (quantity > 0),
  ADD CONSTRAINT chk_service_orders_total CHECK (total_price >= 0);

ALTER TABLE housekeeping_tasks
  MODIFY room_id INT NOT NULL,
  DROP FOREIGN KEY housekeeping_tasks_ibfk_1,
  ADD CONSTRAINT housekeeping_tasks_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT;

ALTER TABLE maintenance_requests
  MODIFY room_id INT NOT NULL,
  DROP FOREIGN KEY maintenance_requests_ibfk_1,
  ADD CONSTRAINT maintenance_requests_ibfk_1 FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT;

ALTER TABLE leave_requests
  MODIFY employee_id INT NOT NULL,
  DROP FOREIGN KEY leave_requests_ibfk_1,
  ADD CONSTRAINT leave_requests_ibfk_1 FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_leave_request_dates CHECK (end_date >= start_date);

ALTER TABLE notifications
  MODIFY user_id INT NOT NULL,
  DROP FOREIGN KEY notifications_ibfk_1,
  ADD CONSTRAINT notifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE invoices
  MODIFY discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  MODIFY status ENUM('UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL DEFAULT 'UNPAID',
  DROP FOREIGN KEY invoices_ibfk_1,
  ADD CONSTRAINT invoices_ibfk_1 FOREIGN KEY (checkin_id) REFERENCES checkin_checkout(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_invoices_amounts CHECK (
    room_charge >= 0 AND service_charge >= 0 AND discount >= 0 AND total_amount >= 0
  );

ALTER TABLE payments
  MODIFY invoice_id INT NOT NULL,
  DROP FOREIGN KEY payments_ibfk_1,
  ADD CONSTRAINT payments_ibfk_1 FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_payments_amount CHECK (amount_paid > 0);

ALTER TABLE refunds
  MODIFY invoice_id INT NOT NULL,
  DROP FOREIGN KEY refunds_ibfk_1,
  ADD CONSTRAINT refunds_ibfk_1 FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_refunds_amount CHECK (amount > 0);

ALTER TABLE promotions
  ADD CONSTRAINT chk_promotions_period CHECK (end_date > start_date),
  ADD CONSTRAINT chk_promotions_discount CHECK (
    discount_value > 0 AND
    (discount_type <> 'Percentage' OR discount_value <= 100)
  );

ALTER TABLE reviews
  MODIFY customer_id INT NOT NULL,
  MODIFY booking_id INT NOT NULL,
  MODIFY rating INT NOT NULL,
  DROP FOREIGN KEY reviews_ibfk_1,
  ADD CONSTRAINT reviews_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  DROP FOREIGN KEY reviews_ibfk_2,
  ADD CONSTRAINT reviews_ibfk_2 FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
  ADD CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5);
