-- Seed Initial Petrol Pump Data into Cloudflare D1 Edge Database

INSERT OR REPLACE INTO shifts (shift_id, shift_number, attendant_id, supervisor, start_time, status)
VALUES ('SHIFT-20261008-01', 'Shift-1 (Morning)', 'staff-1', 'Vijay Sharma', '2026-10-08 06:00:00', 'ACTIVE');

INSERT OR REPLACE INTO tanks (tank_id, tank_number, fuel_type, capacity, current_stock, dead_stock, reorder_level, atg_level, physical_dip_mm, density_15c, water_bottom_mm)
VALUES 
('tank-1', 'UST-01', 'MS', 25000, 18450, 1200, 5000, 18420, 1640, 753.2, 4),
('tank-2', 'UST-02', 'XP95', 15000, 10800, 800, 3000, 10790, 1420, 756.9, 2),
('tank-3', 'UST-03', 'HSD', 30000, 22150, 1500, 6000, 22190, 1850, 837.6, 5),
('tank-4', 'UST-04', 'HSD', 35000, 14600, 1800, 7000, 14580, 1390, 838.2, 3),
('tank-5', 'CNG-01', 'CNG', 4500, 3200, 300, 800, 3200, 0, 0.72, 0);

INSERT OR REPLACE INTO nozzles (nozzle_id, nozzle_number, dispenser_id, island, tank_id, fuel_type, opening_meter, current_reading, testing_vol, rate, status)
VALUES
('noz-1', 'N-01', 'disp-1', 'Island 1', 'tank-1', 'MS', 1254820.50, 1255140.75, 10.0, 102.84, 'IDLE'),
('noz-2', 'N-02', 'disp-1', 'Island 1', 'tank-2', 'XP95', 482100.10, 482215.30, 5.0, 108.40, 'IDLE'),
('noz-3', 'N-03', 'disp-1', 'Island 1', 'tank-3', 'HSD', 948210.00, 948490.40, 5.0, 89.75, 'IDLE'),
('noz-4', 'N-04', 'disp-2', 'Island 2', 'tank-1', 'MS', 812400.25, 812780.80, 5.0, 102.84, 'IDLE'),
('noz-5', 'N-05', 'disp-2', 'Island 2', 'tank-3', 'HSD', 1540100.00, 1540620.50, 10.0, 89.75, 'IDLE'),
('noz-6', 'N-06', 'disp-3', 'Island 3', 'tank-4', 'HSD', 2410800.00, 2411950.00, 10.0, 89.75, 'IDLE'),
('noz-7', 'N-07', 'disp-4', 'Island 4', 'tank-5', 'CNG', 345100.00, 345380.20, 0.0, 85.50, 'IDLE'),
('noz-8', 'N-08', 'disp-4', 'Island 4', 'tank-5', 'EV', 18450.00, 18575.40, 0.0, 18.50, 'IDLE');

INSERT OR REPLACE INTO credit_accounts (customer_id, company_name, contact_person, phone, gstin, credit_limit, current_balance, status)
VALUES
('fl-01', 'Shree Balaji Logistics & Movers', 'Rajendra Prasad', '+91 98860 77112', '29AABCU9603R1ZM', 500000, 342150, 'ACTIVE'),
('fl-02', 'Shiva Transport Corporation', 'Anand Murthy', '+91 99001 22889', '29AABCS8810K1ZZ', 350000, 185600, 'ACTIVE'),
('fl-03', 'City Express Cabs & Travels', 'Kavitha R', '+91 97400 44556', '29AADFC5500J1ZO', 150000, 68400, 'ACTIVE'),
('fl-04', 'Apex Infra Roadways Ltd', 'Col. Sanjeev Nair', '+91 94480 33221', '29AACCA9081B1ZU', 800000, 720500, 'ALERT');

INSERT OR REPLACE INTO staff (staff_id, name, role, phone, total_shortage_pending, is_active)
VALUES
('staff-1', 'Ramesh Kumar', 'Senior Fuelling Attendant', '+91 98451 22334', 800, 1),
('staff-2', 'Suresh Gowda', 'Fuelling Attendant', '+91 98452 33445', 0, 1),
('staff-3', 'Manjunath Hegde', 'Cashier & Night Attendant', '+91 98453 44556', 200, 1),
('staff-4', 'Vijay Sharma', 'Forecourt Manager', '+91 98450 12345', 0, 1);

INSERT OR REPLACE INTO bank_deposits (deposit_id, date, bank_name, account_no, amount, deposited_by, challan_no, status)
VALUES
('DEP-1008-01', '2026-10-08', 'State Bank of India (SBI)', '30819284901', 150000, 'Vijay Sharma', 'CHL-SBI-8812', 'CLEARED'),
('DEP-1007-02', '2026-10-07', 'HDFC Bank Cash Credit', '502000849281', 220000, 'Vijay Sharma', 'CHL-HDFC-9914', 'CLEARED');

INSERT OR REPLACE INTO expenses (expense_id, date, category, amount, paid_to, approved_by)
VALUES
('EXP-1008-01', '2026-10-08', 'Generator Diesel', 650, 'Station Backup GenSet', 'Vijay Sharma'),
('EXP-1008-02', '2026-10-08', 'Staff Tea & Snacks', 350, 'Udupi Sri Krishna Hotel', 'Vijay Sharma');

INSERT OR REPLACE INTO loyalty_customers (id, name, phone, vehicle_no, points, tier, total_liters, last_visit)
VALUES
('loy-1', 'Rahul S. Verma', '+91 98450 11223', 'KA-04-MB-4512', 340, 'GOLD', 3400, '2026-10-08'),
('loy-2', 'Dr. Priya Patel', '+91 99800 22334', 'KA-01-EQ-9011', 180, 'SILVER', 1800, '2026-10-07'),
('loy-3', 'Kiran Gowda', '+91 97420 55667', 'KA-03-JJ-3344', 620, 'PLATINUM', 6200, '2026-10-08');

INSERT OR REPLACE INTO lubricants (lube_id, code, name, brand, price, stock_qty, min_reorder, gst_percent)
VALUES
('lube-1', 'LUB-4T-1L', 'SERVO 4T Super 20W-40 (1L)', 'Servo / IOCL', 385, 48, 15, 18.0),
('lube-2', 'LUB-2T-500', 'SERVO 2T Supreme (500ml)', 'Servo / IOCL', 165, 32, 10, 18.0),
('lube-3', 'LUB-SYN-3.5L', 'SERVO Futura Synth 5W-30 (3.5L)', 'Servo / IOCL', 1650, 18, 5, 18.0),
('lube-5', 'DEF-20L', 'ClearBlue AdBlue / DEF Bucket (20L)', 'IOCL Green', 950, 55, 20, 18.0);

