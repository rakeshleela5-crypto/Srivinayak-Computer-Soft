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
