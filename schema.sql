-- Comprehensive Cloudflare D1 Relational SQLite Schema
-- Shree Vinayaka PetroSoft AI Shiva Petrol Pump Enterprise ERP
-- Compliant with Petroleum Ministry, W&M, and OMC Guidelines (IOCL / BPCL / HPCL)

-- Clean Migration: Drop existing tables to ensure complete column alignment
DROP TABLE IF EXISTS lfr_recovery_register;
DROP TABLE IF EXISTS section_194q_tds_register;
DROP TABLE IF EXISTS attendant_handovers;
DROP TABLE IF EXISTS customer_payments;
DROP TABLE IF EXISTS bank_accounts;
DROP TABLE IF EXISTS transfers;
DROP TABLE IF EXISTS cheque_returns;
DROP TABLE IF EXISTS stamping_register;
DROP TABLE IF EXISTS dip_register;
DROP TABLE IF EXISTS staff_advances;
DROP TABLE IF EXISTS forecourt_coordination_logs;
DROP TABLE IF EXISTS morning_density_logs;
DROP TABLE IF EXISTS calibration_tests;
DROP TABLE IF EXISTS automated_alerts;
DROP TABLE IF EXISTS loyalty_customers;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS forecourt_expenses;
DROP TABLE IF EXISTS bank_deposits;
DROP TABLE IF EXISTS staff_shortage_logs;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS lubricants;
DROP TABLE IF EXISTS digital_indents;
DROP TABLE IF EXISTS fleet_vehicles;
DROP TABLE IF EXISTS credit_accounts;
DROP TABLE IF EXISTS inward_stock;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS shift_readings;
DROP TABLE IF EXISTS shift_denominations;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS price_change_logs;
DROP TABLE IF EXISTS fuel_prices;
DROP TABLE IF EXISTS nozzles;
DROP TABLE IF EXISTS dispensers;
DROP TABLE IF EXISTS tanks;
DROP TABLE IF EXISTS dealer_margins;
DROP TABLE IF EXISTS lfr_rates;

-- 1. Underground Fuel Storage Tanks (UST) & CNG Cascades
CREATE TABLE IF NOT EXISTS tanks (
  tank_id TEXT PRIMARY KEY,
  tank_number TEXT NOT NULL,
  fuel_code TEXT NOT NULL, -- 'MS', 'XP95', 'HSD', 'CNG', 'EV'
  fuel_name TEXT NOT NULL,
  capacity REAL NOT NULL,
  current_stock REAL NOT NULL,
  dead_stock REAL NOT NULL DEFAULT 1000.0,
  reorder_level REAL NOT NULL DEFAULT 5000.0,
  atg_level REAL,
  physical_dip_mm REAL DEFAULT 0.0,
  diameter_mm REAL DEFAULT 2500.0,
  length_mm REAL DEFAULT 5000.0,
  temperature_c REAL DEFAULT 28.0,
  density_observed REAL DEFAULT 745.0,
  density_15c REAL NOT NULL DEFAULT 750.0,
  water_bottom_mm REAL DEFAULT 0.0,
  last_dip_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  color TEXT DEFAULT '#38bdf8',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Forecourt Dispenser MPDs (Multi-Product Dispensers)
CREATE TABLE IF NOT EXISTS dispensers (
  dispenser_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  island TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT,
  status TEXT DEFAULT 'ONLINE',
  last_service_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dispenser Nozzles & Totalizer Meters
CREATE TABLE IF NOT EXISTS nozzles (
  nozzle_id TEXT PRIMARY KEY,
  nozzle_number TEXT NOT NULL,
  dispenser_id TEXT NOT NULL,
  island TEXT NOT NULL,
  tank_id TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  fuel_name TEXT NOT NULL,
  flow_rate REAL DEFAULT 40.0,
  opening_meter REAL NOT NULL,
  current_reading REAL NOT NULL,
  testing_vol REAL DEFAULT 0.0,
  rate REAL NOT NULL,
  status TEXT DEFAULT 'IDLE', -- 'IDLE', 'DISPENSING', 'DECANTING_LOCKED', 'CALIBRATING'
  color TEXT DEFAULT '#f97316',
  FOREIGN KEY (dispenser_id) REFERENCES dispensers(dispenser_id),
  FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

-- 4. Fuel Retail Selling Prices (RSP)
CREATE TABLE IF NOT EXISTS fuel_prices (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  tax_percent REAL DEFAULT 18.0,
  color TEXT DEFAULT '#f97316',
  unit TEXT DEFAULT 'L',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Daily 06:00 AM Fuel Price Revision Logs
CREATE TABLE IF NOT EXISTS price_change_logs (
  id TEXT PRIMARY KEY,
  fuel_code TEXT NOT NULL,
  old_price REAL NOT NULL,
  new_price REAL NOT NULL,
  effective_date DATETIME NOT NULL,
  updated_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Shift Operations & Cash Drop Control
CREATE TABLE IF NOT EXISTS shifts (
  shift_id TEXT PRIMARY KEY,
  shift_number TEXT NOT NULL,
  attendant_id TEXT NOT NULL,
  attendant_name TEXT,
  supervisor TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT NOT NULL,
  end_time TEXT,
  cash_collected REAL DEFAULT 0.0,
  card_collected REAL DEFAULT 0.0,
  upi_collected REAL DEFAULT 0.0,
  credit_issued REAL DEFAULT 0.0,
  driver_kharcha_disbursed REAL DEFAULT 0.0,
  expenses REAL DEFAULT 0.0,
  testing_pourback_ltrs REAL DEFAULT 0.0,
  lube_sales_amount REAL DEFAULT 0.0,
  expected_cash REAL DEFAULT 0.0,
  physical_cash REAL DEFAULT 0.0,
  gap_of_account REAL DEFAULT 0.0,
  manager_remarks TEXT,
  is_frozen INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' -- 'ACTIVE', 'CLOSED', 'HANDOVER_VERIFIED'
);

-- 7. Shift Currency Denomination Reconciliations
CREATE TABLE IF NOT EXISTS shift_denominations (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL,
  d2000 INTEGER DEFAULT 0,
  d500 INTEGER DEFAULT 0,
  d200 INTEGER DEFAULT 0,
  d100 INTEGER DEFAULT 0,
  d50 INTEGER DEFAULT 0,
  d20 INTEGER DEFAULT 0,
  d10 INTEGER DEFAULT 0,
  coins REAL DEFAULT 0.0,
  total_physical_cash REAL NOT NULL,
  calculated_cash REAL NOT NULL,
  variance REAL DEFAULT 0.0,
  outgoing_cashier TEXT NOT NULL,
  incoming_cashier TEXT NOT NULL,
  notes TEXT,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id)
);

-- 8. Shift Meter Readings (Opening vs Closing Stips)
CREATE TABLE IF NOT EXISTS shift_readings (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL,
  nozzle_id TEXT NOT NULL,
  opening_reading REAL NOT NULL,
  closing_reading REAL NOT NULL,
  testing_vol REAL DEFAULT 0.0,
  sale_liters REAL NOT NULL,
  sale_amount REAL NOT NULL,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
  FOREIGN KEY (nozzle_id) REFERENCES nozzles(nozzle_id)
);

-- 9. Forecourt Billing Transactions (POS / Mobile)
CREATE TABLE IF NOT EXISTS transactions (
  txn_id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  shift_id TEXT NOT NULL,
  nozzle_id TEXT NOT NULL,
  nozzle_number TEXT,
  fuel_code TEXT NOT NULL,
  fuel_name TEXT,
  liters REAL NOT NULL,
  rate REAL NOT NULL,
  fuel_amount REAL NOT NULL,
  discount_per_liter REAL DEFAULT 0.0,
  discount_amount REAL DEFAULT 0.0,
  lube_items_json TEXT, -- JSON array of [{ id, name, qty, price }]
  lube_amount REAL DEFAULT 0.0,
  cash_advance REAL DEFAULT 0.0, -- Driver Kharcha
  total_amount REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- 'CASH', 'CARD', 'UPI', 'CREDIT', 'FLEET'
  customer_id TEXT,
  credit_account_id TEXT,
  slip_no TEXT,
  driver_name TEXT,
  customer_vehicle TEXT DEFAULT 'WALK-IN',
  customer_name TEXT DEFAULT 'Retail Customer',
  customer_phone TEXT DEFAULT 'N/A',
  manager_override INTEGER DEFAULT 0,
  balance_after_txn REAL DEFAULT 0.0,
  attendant TEXT,
  status TEXT DEFAULT 'COMPLETED',
  sync_status TEXT DEFAULT 'SYNCED',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
  FOREIGN KEY (nozzle_id) REFERENCES nozzles(nozzle_id)
);

-- 10. Inward Tanker Decantations (TT Inward Register & Decantation Audit)
CREATE TABLE IF NOT EXISTS inward_stock (
  delivery_id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  tanker_tt_no TEXT NOT NULL,
  driver_name TEXT,
  dealer_name TEXT DEFAULT 'BHARAT PETROLEUM CO LTD',
  tank_id TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  fuel_name TEXT,
  invoiced_qty REAL NOT NULL,
  dip_before_decantation REAL NOT NULL,
  dip_after_decantation REAL NOT NULL,
  received_qty REAL NOT NULL,
  shortage_liters REAL NOT NULL,
  shortage_percent REAL NOT NULL,
  invoice_density_15c REAL NOT NULL,
  observed_temp_c REAL NOT NULL,
  observed_density REAL NOT NULL,
  converted_density_15c REAL NOT NULL,
  density_variance REAL NOT NULL,
  -- Security Wooden Seals
  wood_seal_1 TEXT,
  wood_seal_2 TEXT,
  wood_seal_3 TEXT,
  wood_seal_4 TEXT,
  -- Security Aluminum Seals
  alum_seal_1 TEXT,
  alum_seal_2 TEXT,
  alum_seal_3 TEXT,
  alum_seal_4 TEXT,
  -- Inward Tax Breakdown
  basic_rate REAL DEFAULT 0.0,
  basic_amount REAL DEFAULT 0.0,
  basic_excise REAL DEFAULT 0.0,
  add_excise REAL DEFAULT 0.0,
  vat_rate REAL DEFAULT 14.9,
  vat_amount REAL DEFAULT 0.0,
  cess REAL DEFAULT 0.0,
  tcs REAL DEFAULT 0.0,
  freight REAL DEFAULT 0.0,
  final_amount REAL DEFAULT 0.0,
  status TEXT DEFAULT 'VERIFIED_OK', -- 'VERIFIED_OK' | 'VARIANCE_FLAGGED'
  verified_by TEXT NOT NULL,
  delivery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

-- 11. B2B Fleet Khata Credit Accounts
CREATE TABLE IF NOT EXISTS credit_accounts (
  customer_id TEXT PRIMARY KEY,
  customer_code INTEGER,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  remarks TEXT,
  address TEXT,
  city TEXT DEFAULT 'Bangalore',
  state TEXT DEFAULT 'Karnataka',
  gstin TEXT,
  pan_no TEXT,
  ndc_required INTEGER DEFAULT 0,
  is_b2c INTEGER DEFAULT 0,
  tds_apply INTEGER DEFAULT 1,
  is_tanker INTEGER DEFAULT 0,
  is_blocked INTEGER DEFAULT 0,
  bill_period TEXT DEFAULT '30 day',
  driver_pin TEXT DEFAULT '0000',
  credit_limit REAL NOT NULL,
  opening_balance REAL DEFAULT 0.0,
  current_balance REAL DEFAULT 0.0,
  billing_cycle TEXT DEFAULT 'Monthly',
  payment_terms_days INTEGER DEFAULT 15,
  discount_per_liter REAL DEFAULT 0.0,
  charge_pct REAL DEFAULT 0.0,
  hard_lock_enabled INTEGER DEFAULT 1,
  allow_cash_advance INTEGER DEFAULT 1,
  max_cash_advance REAL DEFAULT 2000.0,
  status TEXT DEFAULT 'ACTIVE' -- 'ACTIVE', 'ALERT', 'LOCKED'
);

-- 12. B2B Fleet Registered Vehicles
CREATE TABLE IF NOT EXISTS fleet_vehicles (
  vehicle_id TEXT PRIMARY KEY,
  fleet_id TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  vehicle_type TEXT,
  driver_name TEXT,
  allowed_fuels TEXT DEFAULT 'HSD',
  daily_quota_liters REAL DEFAULT 300.0,
  FOREIGN KEY (fleet_id) REFERENCES credit_accounts(customer_id)
);

-- 13. Digital Fleet QR Indent Slips
CREATE TABLE IF NOT EXISTS digital_indents (
  id TEXT PRIMARY KEY,
  indent_number TEXT UNIQUE NOT NULL,
  fleet_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  fuel_code TEXT NOT NULL,
  fuel_name TEXT,
  max_liters REAL NOT NULL,
  max_amount REAL NOT NULL,
  cash_advance_kharcha REAL DEFAULT 0.0,
  discount_per_liter REAL DEFAULT 0.0,
  security_pin TEXT NOT NULL,
  qr_payload TEXT NOT NULL,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'REDEEMED', 'EXPIRED'
  redeemed_receipt TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

-- 14. 2T/4T Lubricants & DEF AdBlue Inventory
CREATE TABLE IF NOT EXISTS lubricants (
  lube_id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT DEFAULT 'ENGINE_OIL',
  price REAL NOT NULL,
  stock_qty INTEGER NOT NULL,
  min_reorder INTEGER NOT NULL,
  gst_percent REAL DEFAULT 18.0
);

-- 15. Forecourt Staff & Pump Attendants
CREATE TABLE IF NOT EXISTS staff (
  staff_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  island TEXT,
  shift TEXT DEFAULT 'Morning',
  phone TEXT,
  commission_rate REAL DEFAULT 0.0,
  total_shortage_pending REAL DEFAULT 0.0,
  is_active INTEGER DEFAULT 1
);

-- 16. Staff Shortage & Recovery History Logs
CREATE TABLE IF NOT EXISTS staff_shortage_logs (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  shift_id TEXT NOT NULL,
  date DATE NOT NULL,
  calculated_sales REAL NOT NULL,
  deposited_cash REAL NOT NULL,
  shortage_amount REAL NOT NULL,
  recovered_amount REAL DEFAULT 0.0,
  recovery_mode TEXT DEFAULT 'UNRECOVERED', -- 'UNRECOVERED', 'SALARY_DEDUCTION', 'CASH_REPAYMENT'
  status TEXT DEFAULT 'UNRECOVERED',
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- 17. Bank Remittance & Cash Deposit Challans
CREATE TABLE IF NOT EXISTS bank_deposits (
  deposit_id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  bank_name TEXT NOT NULL,
  account_no TEXT NOT NULL,
  amount REAL NOT NULL,
  deposited_by TEXT NOT NULL,
  challan_no TEXT NOT NULL,
  status TEXT DEFAULT 'CLEARED'
);

-- 18. Forecourt Petty Cash Expenses & Overheads
CREATE TABLE IF NOT EXISTS expenses (
  expense_id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_to TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  receipt_voucher_no TEXT,
  shift_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Customer Loyalty & Rewards Points
CREATE TABLE IF NOT EXISTS loyalty_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  vehicle_no TEXT,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'SILVER',
  total_liters REAL DEFAULT 0.0,
  last_visit DATE
);

-- 20. Automated WhatsApp & SMS Notification Logs
CREATE TABLE IF NOT EXISTS automated_alerts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'SENT'
);

-- 21. 5-Liter W&M Calibration Stamping Test Register
CREATE TABLE IF NOT EXISTS calibration_tests (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  nozzle_id TEXT NOT NULL,
  nozzle_number TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  test_measure_volume_l REAL DEFAULT 5.0,
  quantity_dispensed_l REAL DEFAULT 5.0,
  variance_ml REAL DEFAULT 0.0,
  tolerance_ml REAL DEFAULT 25.0,
  status TEXT DEFAULT 'PASSED',
  poured_back_to_tank TEXT NOT NULL,
  inspector TEXT NOT NULL,
  weights_and_measures_stamp TEXT DEFAULT 'VALID-Q4-2026',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. 06:00 AM Morning Quality, Density & Dip Register (ASTM 53B)
CREATE TABLE IF NOT EXISTS morning_density_logs (
  id TEXT PRIMARY KEY,
  tank_id TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  log_date DATE NOT NULL,
  log_time TEXT DEFAULT '06:00 AM',
  observed_temp_c REAL NOT NULL,
  observed_density REAL NOT NULL,
  converted_density_15c REAL NOT NULL,
  invoice_density_15c REAL NOT NULL,
  density_variance REAL NOT NULL,
  dip_mm REAL DEFAULT 0,
  water_dip_mm REAL DEFAULT 0,
  status TEXT DEFAULT 'WITHIN_TOLERANCE',
  tested_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

-- 23. Statutory Dealer Commission & Margins
CREATE TABLE IF NOT EXISTS dealer_margins (
  fuel_code TEXT PRIMARY KEY,
  margin_per_unit REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'L',
  effective_date DATE NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 24. OMC License Fee Recovery (LFR) Rates
CREATE TABLE IF NOT EXISTS lfr_rates (
  fuel_code TEXT PRIMARY KEY,
  rate_per_kl REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'KL',
  gst_percent REAL DEFAULT 18.0,
  effective_date DATE NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 25. Forecourt Operational Phasing & Workflow Logs
CREATE TABLE IF NOT EXISTS forecourt_coordination_logs (
  id TEXT PRIMARY KEY,
  phase_id INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME,
  shift_id TEXT,
  completed_checklist_json TEXT,
  status TEXT DEFAULT 'ACTIVE',
  supervisor TEXT NOT NULL
);

-- 26. Contra Transfers & Inter-Account Vouchers
CREATE TABLE IF NOT EXISTS transfers (
  transfer_id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  shift TEXT DEFAULT 'First',
  voucher_type TEXT NOT NULL, -- 'Receipt Cash Voucher(Cash Deposit)', 'Payment Voucher', 'Contra Voucher'
  from_account TEXT NOT NULL,
  to_account TEXT NOT NULL,
  amount REAL NOT NULL,
  narration TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 27. Cheque Bounce & Returns Audit Register
CREATE TABLE IF NOT EXISTS cheque_returns (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  receipt_no TEXT,
  cheque_no TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  amount REAL NOT NULL,
  return_date DATE NOT NULL,
  penalty_charges REAL DEFAULT 350.0,
  reason TEXT,
  status TEXT DEFAULT 'BOUNCED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 28. Legal Metrology / Weights & Measures Dispenser Stamping Register
CREATE TABLE IF NOT EXISTS stamping_register (
  id TEXT PRIMARY KEY,
  nozzle_id TEXT NOT NULL,
  nozzle_name TEXT NOT NULL,
  dispenser_id TEXT DEFAULT 'MPD-01',
  dispenser_name TEXT NOT NULL,
  product TEXT DEFAULT 'MS (Petrol)',
  last_stamped_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  days_left INTEGER,
  certificate_no TEXT,
  seal_serial TEXT,
  inspector_name TEXT,
  status TEXT DEFAULT 'VALID',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 29. Physical Tank Dip & OMC Loss Tolerance Register
CREATE TABLE IF NOT EXISTS dip_register (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  shift TEXT DEFAULT 'First',
  tank_id TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  opening_dip REAL NOT NULL,
  opening_stock REAL NOT NULL,
  receipt_qty REAL DEFAULT 0.0,
  closing_dip REAL NOT NULL,
  closing_stock REAL NOT NULL,
  dip_sale REAL NOT NULL,
  meter_sale REAL NOT NULL,
  variation REAL NOT NULL,
  allowable_limit REAL NOT NULL,
  status TEXT DEFAULT 'OK',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 30. Forecourt Staff Counter Advance (Upaad) Register
CREATE TABLE IF NOT EXISTS staff_advances (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  date DATE NOT NULL,
  shift TEXT DEFAULT 'First',
  advance_amount REAL NOT NULL,
  reason TEXT,
  recovered_amount REAL DEFAULT 0.0,
  balance_pending REAL NOT NULL,
  status TEXT DEFAULT 'PENDING'
);

-- 31. Master Bank & Cash Accounts (Contra Ledgers)
CREATE TABLE IF NOT EXISTS bank_accounts (
  account_id TEXT PRIMARY KEY,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL, -- 'CASH', 'CURRENT', 'OVERDRAFT', 'UPI_SETTLEMENT'
  account_number TEXT NOT NULL,
  bank_name TEXT,
  branch_ifsc TEXT,
  opening_balance REAL DEFAULT 0.0,
  current_balance REAL DEFAULT 0.0,
  balance_type TEXT DEFAULT 'Dr', -- 'Dr' or 'Cr'
  od_limit REAL DEFAULT 0.0,
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 32. Dedicated Customer Payment & Cheque Collection Book
CREATE TABLE IF NOT EXISTS customer_payments (
  payment_id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- 'CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI'
  bank_account_id TEXT,
  cheque_no TEXT,
  cheque_date DATE,
  bank_name TEXT,
  branch_name TEXT,
  reference_no TEXT,
  discount_allowed REAL DEFAULT 0.0,
  tds_amount REAL DEFAULT 0.0, -- Section 194Q / 0.1%
  net_credited REAL NOT NULL,
  status TEXT DEFAULT 'CLEARED', -- 'CLEARED', 'BOUNCED', 'PENDING'
  notes TEXT,
  recorded_by TEXT DEFAULT 'Manager',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES credit_accounts(customer_id)
);

-- 33. Machine-Wise Attendant Shift Handover Vouchers (FrmLi)
CREATE TABLE IF NOT EXISTS attendant_handovers (
  id TEXT PRIMARY KEY,
  voucher_no TEXT UNIQUE NOT NULL,
  handover_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_period TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  dispenser_machine TEXT NOT NULL, -- 'MPD-01 (Island 1)', 'MPD-02 (Island 2)'
  fuel_amount REAL DEFAULT 0.0,
  lube_amount REAL DEFAULT 0.0,
  gross_duty REAL NOT NULL,
  credit_slips_amount REAL DEFAULT 0.0,
  card_slips_amount REAL DEFAULT 0.0,
  staff_advance_upaad REAL DEFAULT 0.0,
  expected_cash REAL NOT NULL,
  physical_cash REAL NOT NULL,
  cash_variance REAL DEFAULT 0.0, -- Negative = Shortage, Positive = Surplus
  notes TEXT,
  status TEXT DEFAULT 'VERIFIED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- 34. Section 194Q Statutory TDS Register (0.1% on OMC Purchases > ₹50L)
CREATE TABLE IF NOT EXISTS section_194q_tds_register (
  id TEXT PRIMARY KEY,
  fy_year TEXT DEFAULT '2026-27',
  supplier_name TEXT DEFAULT 'INDIAN OIL CORPORATION LTD',
  pan_no TEXT DEFAULT 'AAACI1681G',
  invoice_no TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  basic_purchase_value REAL NOT NULL,
  cumulative_purchase_ytd REAL NOT NULL,
  threshold_exceeded INTEGER DEFAULT 1,
  tds_rate_pct REAL DEFAULT 0.1,
  tds_deducted REAL NOT NULL,
  challan_bsr_code TEXT,
  challan_date DATE,
  status TEXT DEFAULT 'DEDUCTED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 35. License Fee Recovery (LFR) Register with 10% TDS Deduction
CREATE TABLE IF NOT EXISTS lfr_recovery_register (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  month_year TEXT NOT NULL,
  product_code TEXT NOT NULL, -- 'MS', 'HSD'
  volume_kl REAL NOT NULL,
  lfr_rate_per_kl REAL NOT NULL,
  basic_lfr REAL NOT NULL,
  cgst_9pct REAL NOT NULL,
  sgst_9pct REAL NOT NULL,
  total_lfr_with_gst REAL NOT NULL,
  tds_10pct_on_basic REAL NOT NULL,
  net_lfr_payable REAL NOT NULL,
  status TEXT DEFAULT 'POSTED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indices for Real-Time Edge Routing
CREATE INDEX IF NOT EXISTS idx_txn_shift ON transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_txn_nozzle ON transactions(nozzle_id);
CREATE INDEX IF NOT EXISTS idx_txn_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_nozzle_tank ON nozzles(tank_id);
CREATE INDEX IF NOT EXISTS idx_credit_status ON credit_accounts(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_phone ON loyalty_customers(phone);
CREATE INDEX IF NOT EXISTS idx_indents_fleet ON digital_indents(fleet_id);
CREATE INDEX IF NOT EXISTS idx_indents_plate ON digital_indents(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_density_tank_date ON morning_density_logs(tank_id, log_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_bank_deposits_date ON bank_deposits(date);
CREATE INDEX IF NOT EXISTS idx_cust_pay_customer ON customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_attendant_handover_staff ON attendant_handovers(staff_id);
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(date);
CREATE INDEX IF NOT EXISTS idx_tds_194q_invoice ON section_194q_tds_register(invoice_no);
CREATE INDEX IF NOT EXISTS idx_lfr_recovery_invoice ON lfr_recovery_register(invoice_no);

