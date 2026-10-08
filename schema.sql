-- Cloudflare D1 Edge Relational SQLite Schema
-- Shree Vinayaka PetroSoft AI Shiva Petrol Pump Management System
-- Extracted from Technical Blueprint & Standard Petroleum Operations

CREATE TABLE IF NOT EXISTS tanks (
  tank_id TEXT PRIMARY KEY,
  tank_number TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  capacity REAL NOT NULL,
  current_stock REAL NOT NULL,
  dead_stock REAL NOT NULL,
  reorder_level REAL NOT NULL,
  atg_level REAL,
  physical_dip_mm REAL,
  density_15c REAL,
  water_bottom_mm REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nozzles (
  nozzle_id TEXT PRIMARY KEY,
  nozzle_number TEXT NOT NULL,
  dispenser_id TEXT NOT NULL,
  island TEXT NOT NULL,
  tank_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  opening_meter REAL NOT NULL,
  current_reading REAL NOT NULL,
  testing_vol REAL DEFAULT 0.0,
  rate REAL NOT NULL,
  status TEXT DEFAULT 'IDLE',
  FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

CREATE TABLE IF NOT EXISTS shifts (
  shift_id TEXT PRIMARY KEY,
  shift_number TEXT NOT NULL,
  attendant_id TEXT NOT NULL,
  supervisor TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  cash_collected REAL DEFAULT 0.0,
  card_collected REAL DEFAULT 0.0,
  upi_collected REAL DEFAULT 0.0,
  credit_issued REAL DEFAULT 0.0,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS shift_readings (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL,
  nozzle_id TEXT NOT NULL,
  opening_reading REAL NOT NULL,
  closing_reading REAL NOT NULL,
  testing_vol REAL DEFAULT 0.0,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
  FOREIGN KEY (nozzle_id) REFERENCES nozzles(nozzle_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  txn_id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  shift_id TEXT NOT NULL,
  nozzle_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  liters REAL NOT NULL,
  rate REAL NOT NULL,
  fuel_amount REAL NOT NULL,
  lube_amount REAL DEFAULT 0.0,
  total_amount REAL NOT NULL,
  payment_mode TEXT NOT NULL, -- 'CASH', 'CARD', 'UPI', 'CREDIT', 'FLEET'
  customer_vehicle TEXT,
  customer_name TEXT,
  customer_id TEXT,
  slip_no TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
  FOREIGN KEY (nozzle_id) REFERENCES nozzles(nozzle_id)
);

CREATE TABLE IF NOT EXISTS inward_stock (
  delivery_id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  tanker_tt_no TEXT NOT NULL,
  tank_id TEXT NOT NULL,
  invoiced_qty REAL NOT NULL,
  received_qty REAL NOT NULL,
  shortage_liters REAL NOT NULL,
  density_15c REAL NOT NULL,
  temp_observed REAL NOT NULL,
  delivery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_by TEXT,
  FOREIGN KEY (tank_id) REFERENCES tanks(tank_id)
);

CREATE TABLE IF NOT EXISTS credit_accounts (
  customer_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  gstin TEXT,
  credit_limit REAL NOT NULL,
  current_balance REAL DEFAULT 0.0,
  status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS lubricants (
  lube_id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price REAL NOT NULL,
  stock_qty INTEGER NOT NULL,
  min_reorder INTEGER NOT NULL,
  gst_percent REAL DEFAULT 18.0
);

CREATE TABLE IF NOT EXISTS staff (
  staff_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  total_shortage_pending REAL DEFAULT 0.0,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bank_deposits (
  deposit_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_no TEXT NOT NULL,
  amount REAL NOT NULL,
  deposited_by TEXT NOT NULL,
  challan_no TEXT NOT NULL,
  status TEXT DEFAULT 'CLEARED'
);

CREATE TABLE IF NOT EXISTS expenses (
  expense_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_to TEXT NOT NULL,
  approved_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loyalty_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  vehicle_no TEXT,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'SILVER',
  total_liters REAL DEFAULT 0.0,
  last_visit TEXT
);

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

CREATE TABLE IF NOT EXISTS calibration_tests (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  nozzle_id TEXT NOT NULL,
  nozzle_number TEXT NOT NULL,
  fuel_code TEXT NOT NULL,
  test_measure_volume_l REAL DEFAULT 5.0,
  quantity_dispensed_l REAL DEFAULT 5.0,
  variance_ml REAL DEFAULT 0.0,
  tolerance_ml REAL DEFAULT 25.0,
  status TEXT DEFAULT 'PASSED',
  poured_back_to_tank TEXT NOT NULL,
  inspector TEXT NOT NULL
);

-- Indices for Microsecond Edge Query Routing
CREATE INDEX IF NOT EXISTS idx_txn_shift ON transactions(shift_id);
CREATE INDEX IF NOT EXISTS idx_txn_nozzle ON transactions(nozzle_id);
CREATE INDEX IF NOT EXISTS idx_nozzle_tank ON nozzles(tank_id);
CREATE INDEX IF NOT EXISTS idx_credit_status ON credit_accounts(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_phone ON loyalty_customers(phone);

