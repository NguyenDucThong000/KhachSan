-- Run against hotel_management before database_normalize_upgrade.sql.
-- Every result set must be empty; resolve results without deleting history.

USE hotel_management;

SELECT user_id, COUNT(*) AS duplicate_count
FROM employees
GROUP BY user_id
HAVING user_id IS NULL OR COUNT(*) > 1;

SELECT user_id, COUNT(*) AS duplicate_count
FROM customers
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

SELECT type_name, COUNT(*) AS duplicate_count
FROM room_types
GROUP BY type_name
HAVING COUNT(*) > 1;

SELECT shift_name, COUNT(*) AS duplicate_count
FROM shifts
GROUP BY shift_name
HAVING COUNT(*) > 1;

SELECT booking_id, room_id, COUNT(*) AS duplicate_count
FROM booking_details
GROUP BY booking_id, room_id
HAVING booking_id IS NULL OR room_id IS NULL OR COUNT(*) > 1;

SELECT employee_id, shift_id, work_date, COUNT(*) AS duplicate_count
FROM employee_shifts
GROUP BY employee_id, shift_id, work_date
HAVING employee_id IS NULL OR shift_id IS NULL OR COUNT(*) > 1;

SELECT id FROM users WHERE role_id IS NULL;
SELECT id FROM employees WHERE user_id IS NULL;
SELECT id FROM rooms WHERE room_type_id IS NULL;
SELECT id FROM rooms
WHERE operational_status IS NULL OR cleaning_status IS NULL OR technical_status IS NULL;
SELECT id FROM bookings
WHERE booking_date IS NULL
   OR customer_id IS NULL
   OR deposit IS NULL
   OR status IS NULL
   OR expected_checkout <= expected_checkin
   OR COALESCE(deposit, 0) < 0;
SELECT id FROM booking_details WHERE booking_id IS NULL OR room_id IS NULL OR price_at_booking < 0;
SELECT id FROM employee_shifts WHERE employee_id IS NULL OR shift_id IS NULL;
SELECT id FROM checkin_checkout WHERE booking_id IS NULL;
SELECT id FROM service_orders WHERE checkin_id IS NULL OR service_id IS NULL OR quantity IS NULL OR quantity <= 0 OR total_price < 0;
SELECT id FROM housekeeping_tasks WHERE room_id IS NULL;
SELECT id FROM maintenance_requests WHERE room_id IS NULL;
SELECT id FROM leave_requests WHERE employee_id IS NULL OR end_date < start_date;
SELECT id FROM notifications WHERE user_id IS NULL;
SELECT id FROM payments WHERE invoice_id IS NULL OR amount_paid <= 0;
SELECT id FROM refunds WHERE invoice_id IS NULL OR amount <= 0;
SELECT id FROM reviews WHERE customer_id IS NULL OR booking_id IS NULL OR rating IS NULL OR rating < 1 OR rating > 5;
SELECT id FROM room_types WHERE base_price < 0 OR capacity <= 0;
SELECT id FROM promotions
WHERE end_date <= start_date
   OR discount_value <= 0
   OR (discount_type = 'Percentage' AND discount_value > 100);
SELECT id FROM invoices
WHERE discount IS NULL
   OR status IS NULL
   OR room_charge < 0
   OR service_charge < 0
   OR discount < 0
   OR total_amount < 0;
