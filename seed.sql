-- Comprehensive Initial Seed Data for Cloudflare D1 Edge Database
-- Shree Vinayaka PetroSoft AI Shiva Petrol Pump Management System

-- 1. Tanks
INSERT OR REPLACE INTO tanks (tank_id, tank_number, fuel_code, fuel_name, capacity, current_stock, dead_stock, reorder_level, atg_level, physical_dip_mm, diameter_mm, length_mm, temperature_c, density_observed, density_15c, water_bottom_mm, last_dip_time, color)
VALUES 
('tank-1', 'UST-01', 'MS', 'Petrol (MS-91)', 25000, 18450, 1200, 5000, 18420, 1640, 2500, 5200, 28.5, 742.8, 753.2, 4, '2026-10-08 06:00', '#f97316'),
('tank-2', 'UST-02', 'XP95', 'Extra Premium 95', 15000, 10800, 800, 3000, 10790, 1420, 2200, 4000, 28.2, 746.1, 756.9, 2, '2026-10-08 06:00', '#ec4899'),
('tank-3', 'UST-03', 'HSD', 'High Speed Diesel (Tank A)', 30000, 22150, 1500, 6000, 22190, 1850, 2600, 5800, 29.0, 828.4, 837.6, 5, '2026-10-08 06:00', '#3b82f6'),
('tank-4', 'UST-04', 'HSD', 'High Speed Diesel (Tank B - Commercial)', 35000, 14600, 1800, 7000, 14580, 1390, 2800, 5900, 29.1, 829.1, 838.2, 3, '2026-10-08 06:00', '#0284c7'),
('tank-5', 'CNG-CASCADE-01', 'CNG', 'CNG Cascade Bank', 4500, 3200, 300, 800, 3200, 0, 0, 0, 27.5, 0.72, 0.72, 0, '2026-10-08 06:00', '#10b981');

-- 2. Dispensers
INSERT OR REPLACE INTO dispensers (dispenser_id, name, island, model, serial_number, status, last_service_date)
VALUES
('disp-1', 'Dispenser 01 (Island 1 - Two Wheeler & Light)', 'Island 1', 'Gilbarco Encore 500S', 'GB-500S-99120', 'ONLINE', '2026-09-15'),
('disp-2', 'Dispenser 02 (Island 2 - Four Wheeler Cars)', 'Island 2', 'Tokheim Quantium 510', 'TK-510-44102', 'ONLINE', '2026-09-15'),
('disp-3', 'Dispenser 03 (Island 3 - Commercial Fleet High-Flow)', 'Island 3', 'Wayne Ovation Turbo 120 LPM', 'WO-TRB-88194', 'ONLINE', '2026-09-15'),
('disp-4', 'Dispenser 04 (Island 4 - Green Clean Fuel)', 'Island 4', 'Compac CNG Dual + Delta EV 60kW', 'CP-DLT-11029', 'ONLINE', '2026-09-15');

-- 3. Nozzles
INSERT OR REPLACE INTO nozzles (nozzle_id, nozzle_number, dispenser_id, island, tank_id, fuel_code, fuel_name, flow_rate, opening_meter, current_reading, testing_vol, rate, status, color)
VALUES
('noz-1', 'N-01', 'disp-1', 'Island 1', 'tank-1', 'MS', 'Petrol (MS-91)', 38.0, 1254820.50, 1255140.75, 10.0, 102.84, 'IDLE', '#f97316'),
('noz-2', 'N-02', 'disp-1', 'Island 1', 'tank-2', 'XP95', 'XP95 Premium', 35.0, 482100.10, 482215.30, 5.0, 108.40, 'IDLE', '#ec4899'),
('noz-3', 'N-03', 'disp-1', 'Island 1', 'tank-3', 'HSD', 'Diesel (HSD)', 45.0, 948210.00, 948490.40, 5.0, 89.75, 'IDLE', '#3b82f6'),
('noz-4', 'N-04', 'disp-2', 'Island 2', 'tank-1', 'MS', 'Petrol (MS-91)', 40.0, 812400.25, 812780.80, 5.0, 102.84, 'IDLE', '#f97316'),
('noz-5', 'N-05', 'disp-2', 'Island 2', 'tank-3', 'HSD', 'Diesel (HSD)', 45.0, 1540100.00, 1540620.50, 10.0, 89.75, 'IDLE', '#3b82f6'),
('noz-6', 'N-06', 'disp-3', 'Island 3', 'tank-4', 'HSD', 'Diesel High-Flow', 90.0, 2410800.00, 2411950.00, 10.0, 89.75, 'IDLE', '#0284c7'),
('noz-7', 'N-07', 'disp-4', 'Island 4', 'tank-5', 'CNG', 'CNG Fast Fill', 20.0, 345100.00, 345380.20, 0.0, 85.50, 'IDLE', '#10b981'),
('noz-8', 'N-08', 'disp-4', 'Island 4', 'tank-5', 'EV', 'EV DC Fast 60kW', 60.0, 18450.00, 18575.40, 0.0, 18.50, 'IDLE', '#8b5cf6');

-- 4. Fuel Retail Prices
INSERT OR REPLACE INTO fuel_prices (id, code, name, price, tax_percent, color, unit)
VALUES
('fuel-ms', 'MS', 'Motor Spirit (Petrol 91)', 102.84, 18.0, '#f97316', 'L'),
('fuel-xp95', 'XP95', 'Extra Premium 95', 108.40, 18.0, '#ec4899', 'L'),
('fuel-hsd', 'HSD', 'High Speed Diesel', 89.75, 18.0, '#3b82f6', 'L'),
('fuel-cng', 'CNG', 'Compressed Natural Gas', 85.50, 12.0, '#10b981', 'Kg'),
('fuel-ev', 'EV', 'EV Fast Charger (DC 60kW)', 18.50, 18.0, '#8b5cf6', 'kWh');

-- 5. Active Shifts
INSERT OR REPLACE INTO shifts (shift_id, shift_number, attendant_id, attendant_name, supervisor, date, start_time, end_time, cash_collected, card_collected, upi_collected, credit_issued, driver_kharcha_disbursed, expenses, status)
VALUES
('SHIFT-20261008-01', 'Shift-1 (Morning)', 'staff-1', 'Ramesh Kumar', 'Vijay Sharma', '2026-10-08', '06:00 AM', '02:00 PM', 168450.0, 84200.0, 112350.0, 78500.0, 2500.0, 1200.0, 'ACTIVE');

-- 6. Shift Denominations
INSERT OR REPLACE INTO shift_denominations (id, shift_id, d500, d200, d100, d50, d20, d10, coins, total_physical_cash, calculated_cash, variance, outgoing_cashier, incoming_cashier, notes)
VALUES
('SDEN-01', 'SHIFT-20261008-01', 300, 60, 45, 20, 30, 40, 450.0, 168450.0, 168450.0, 0.0, 'Ramesh Kumar', 'Suresh Patil', 'Opening shift denominations verified by supervisor');

-- 7. B2B Fleet Khata Credit Accounts
INSERT OR REPLACE INTO credit_accounts (customer_id, company_name, contact_person, phone, gstin, credit_limit, current_balance, billing_cycle, payment_terms_days, discount_per_liter, hard_lock_enabled, allow_cash_advance, max_cash_advance, status)
VALUES
('fl-01', 'Shree Balaji Logistics & Movers', 'Rajendra Prasad', '+91 98860 77112', '29AABCU9603R1ZM', 500000.0, 342150.0, 'Monthly', 15, 0.75, 1, 1, 2000.0, 'ACTIVE'),
('fl-02', 'Shiva Transport Corporation', 'Anand Murthy', '+91 99001 22889', '29AABCS8810K1ZZ', 350000.0, 185600.0, 'Fortnightly', 10, 1.00, 1, 1, 3000.0, 'ACTIVE'),
('fl-03', 'City Express Cabs & Travels', 'Kavitha R', '+91 97400 44556', '29AADFC5500J1ZO', 150000.0, 68400.0, 'Weekly', 7, 0.50, 1, 0, 0.0, 'ACTIVE'),
('fl-04', 'Apex Infra Roadways Ltd', 'Col. Sanjeev Nair', '+91 94480 33221', '29AACCA9081B1ZU', 800000.0, 720500.0, 'Monthly', 30, 0.85, 1, 1, 2500.0, 'ALERT');

-- 8. Fleet Registered Vehicles
INSERT OR REPLACE INTO fleet_vehicles (vehicle_id, fleet_id, plate_number, vehicle_type, driver_name, allowed_fuels, daily_quota_liters)
VALUES
('veh-01', 'fl-01', 'KA-01-AK-4455', 'BharatBenz Heavy Tipper', 'Ramu Gowda', 'HSD', 350.0),
('veh-02', 'fl-01', 'KA-04-MB-1290', 'Tata Prima 4028.S', 'Shankar Lal', 'HSD', 400.0),
('veh-03', 'fl-02', 'KA-02-AA-9988', 'Ashok Leyland 2820', 'Basavaraj', 'HSD', 300.0),
('veh-04', 'fl-03', 'KA-05-AG-6712', 'Toyota Innova Crysta', 'Prakash V', 'HSD', 65.0);

-- 9. Digital Fleet Indents
INSERT OR REPLACE INTO digital_indents (id, indent_number, fleet_id, company_name, vehicle_plate, driver_name, driver_phone, fuel_code, fuel_name, max_liters, max_amount, cash_advance_kharcha, discount_per_liter, security_pin, qr_payload, status, notes, created_at, expires_at)
VALUES
('ind-101', 'IND-2026-801', 'fl-01', 'Shree Balaji Logistics & Movers', 'KA-01-AK-4455', 'Ramu Gowda', '+91 98860 12345', 'HSD', 'High Speed Diesel', 250.0, 22437.50, 1500.0, 0.75, '4829', 'INDENT|fl-01|KA-01-AK-4455|HSD|250|1500|4829', 'ACTIVE', 'National Highway Bangalore to Pune trip', '2026-10-08 07:15:00', '2026-10-09 07:15:00'),
('ind-102', 'IND-2026-802', 'fl-02', 'Shiva Transport Corporation', 'KA-02-AA-9988', 'Basavaraj', '+91 99001 54321', 'HSD', 'High Speed Diesel', 180.0, 16155.00, 1000.0, 1.00, '3190', 'INDENT|fl-02|KA-02-AA-9988|HSD|180|1000|3190', 'ACTIVE', 'Local Sand Mining Depot run', '2026-10-08 08:30:00', '2026-10-09 08:30:00');

-- 10. Lubricants & Packaged Goods
INSERT OR REPLACE INTO lubricants (lube_id, code, name, brand, category, price, stock_qty, min_reorder, gst_percent)
VALUES
('lube-1', 'LUB-4T-1L', 'SERVO 4T Super 20W-40 (1L)', 'Servo / IOCL', 'MOTORCYCLE_4T', 385.0, 48, 15, 18.0),
('lube-2', 'LUB-2T-500', 'SERVO 2T Supreme (500ml)', 'Servo / IOCL', 'TWO_STROKE_2T', 165.0, 32, 10, 18.0),
('lube-3', 'LUB-SYN-3.5L', 'SERVO Futura Synth 5W-30 (3.5L)', 'Servo / IOCL', 'PASSENGER_CAR_SYNTH', 1650.0, 18, 5, 18.0),
('lube-5', 'DEF-20L', 'ClearBlue AdBlue / DEF Bucket (20L)', 'IOCL Green', 'EMISSION_DEF', 950.0, 55, 20, 18.0);

-- 11. Staff & Attendants
INSERT OR REPLACE INTO staff (staff_id, name, role, island, shift, phone, commission_rate, total_shortage_pending, is_active)
VALUES
('staff-1', 'Ramesh Kumar', 'Pump Attendant', 'Island 1', 'Morning', '+91 98451 11223', 1.5, 800.0, 1),
('staff-2', 'Suresh Patil', 'Pump Attendant', 'Island 2', 'Morning', '+91 98452 22334', 1.5, 150.0, 1),
('staff-3', 'Ganesh Rao', 'Senior Attendant', 'Island 3', 'Morning', '+91 98453 33445', 1.5, 0.0, 1),
('staff-4', 'Manjunath Hegde', 'CNG Operator', 'Island 4', 'Morning', '+91 98454 44556', 1.2, 50.0, 1),
('staff-5', 'Vijay Sharma', 'Station Manager', 'Control Room', 'General', '+91 98455 55667', 0.0, 0.0, 1),
('staff-6', 'Shiva Kumar (Owner)', 'Station Owner', 'Office', 'Executive', '+91 98450 12345', 0.0, 0.0, 1);

-- 12. Staff Shortage Logs
INSERT OR REPLACE INTO staff_shortage_logs (id, staff_id, shift_id, date, calculated_sales, deposited_cash, shortage_amount, recovered_amount, recovery_mode, status, note)
VALUES
('SLOG-01', 'staff-1', 'SHIFT-20261007-02', '2026-10-07', 50000.0, 49200.0, 800.0, 0.0, 'UNRECOVERED', 'UNRECOVERED', 'Shift cash bag shortage flagged'),
('SLOG-02', 'staff-2', 'SHIFT-20261006-01', '2026-10-06', 62400.0, 62250.0, 150.0, 0.0, 'UNRECOVERED', 'UNRECOVERED', 'UPI cash exchange variance');

-- 13. Bank Remittances
INSERT OR REPLACE INTO bank_deposits (deposit_id, date, bank_name, account_no, amount, deposited_by, challan_no, status)
VALUES
('DEP-1008-01', '2026-10-08', 'State Bank of India (SBI)', '30819284901', 150000.0, 'Vijay Sharma', 'CHL-SBI-8812', 'CLEARED'),
('DEP-1007-02', '2026-10-07', 'HDFC Bank Cash Credit', '502000849281', 220000.0, 'Vijay Sharma', 'CHL-HDFC-9914', 'CLEARED');

-- 14. Forecourt Expenses
INSERT OR REPLACE INTO expenses (expense_id, date, category, amount, paid_to, approved_by, receipt_voucher_no, shift_id)
VALUES
('EXP-1008-01', '2026-10-08', 'Generator Diesel', 650.0, 'Station Backup GenSet', 'Vijay Sharma', 'VOUCH-GEN-01', 'SHIFT-20261008-01'),
('EXP-1008-02', '2026-10-08', 'Staff Tea & Snacks', 350.0, 'Udupi Sri Krishna Hotel', 'Vijay Sharma', 'VOUCH-TEA-02', 'SHIFT-20261008-01');

-- 15. Loyalty Customers
INSERT OR REPLACE INTO loyalty_customers (id, name, phone, vehicle_no, points, tier, total_liters, last_visit)
VALUES
('loy-1', 'Rahul S. Verma', '+91 98450 11223', 'KA-04-MB-4512', 340, 'GOLD', 3400.0, '2026-10-08'),
('loy-2', 'Dr. Priya Patel', '+91 99800 22334', 'KA-01-EQ-9011', 180, 'SILVER', 1800.0, '2026-10-07'),
('loy-3', 'Kiran Gowda', '+91 97420 55667', 'KA-03-JJ-3344', 620, 'PLATINUM', 6200.0, '2026-10-08');

-- 16. Statutory Dealer Commission Margins
INSERT OR REPLACE INTO dealer_margins (fuel_code, margin_per_unit, unit, effective_date)
VALUES
('MS', 3.82, 'L', '2026-04-01'),
('XP95', 4.25, 'L', '2026-04-01'),
('HSD', 2.60, 'L', '2026-04-01'),
('CNG', 3.20, 'Kg', '2026-04-01'),
('EV', 2.50, 'kWh', '2026-04-01');

-- 17. OMC License Fee Recovery (LFR) Rates
INSERT OR REPLACE INTO lfr_rates (fuel_code, rate_per_kl, unit, gst_percent, effective_date)
VALUES
('MS', 460.0, 'KL', 18.0, '2026-04-01'),
('XP95', 480.0, 'KL', 18.0, '2026-04-01'),
('HSD', 390.0, 'KL', 18.0, '2026-04-01');

-- 18. 06:00 AM Density Register (ASTM 53B)
INSERT OR REPLACE INTO morning_density_logs (id, tank_id, fuel_code, log_date, log_time, observed_temp_c, observed_density, converted_density_15c, invoice_density_15c, density_variance, dip_mm, water_dip_mm, status, tested_by)
VALUES
('MDL-1008-01', 'tank-1', 'MS', '2026-10-08', '06:00 AM', 28.5, 742.8, 753.2, 752.5, 0.7, 1640.0, 4.0, 'WITHIN_TOLERANCE', 'Vijay Sharma (Manager)'),
('MDL-1008-02', 'tank-3', 'HSD', '2026-10-08', '06:00 AM', 29.0, 828.4, 837.6, 836.8, 0.8, 1850.0, 5.0, 'WITHIN_TOLERANCE', 'Vijay Sharma (Manager)');

-- 19. 5-Liter Stamping Measure Calibration Test
INSERT OR REPLACE INTO calibration_tests (id, date, nozzle_id, nozzle_number, fuel_code, test_measure_volume_l, quantity_dispensed_l, variance_ml, tolerance_ml, status, poured_back_to_tank, inspector, weights_and_measures_stamp)
VALUES
('CAL-1008-01', '2026-10-08', 'noz-1', 'N-01', 'MS', 5.0, 5.0, 0.0, 25.0, 'PASSED', 'tank-1', 'Vijay Sharma (Manager)', 'VALID-Q4-2026'),
('CAL-1008-02', '2026-10-08', 'noz-3', 'N-03', 'HSD', 5.0, 5.0, 0.0, 25.0, 'PASSED', 'tank-3', 'Vijay Sharma (Manager)', 'VALID-Q4-2026');
