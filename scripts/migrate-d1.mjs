import { execSync } from 'child_process';

const commands = [
  // 1. Create missing tables
  `CREATE TABLE IF NOT EXISTS bank_accounts (
    account_id TEXT PRIMARY KEY,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT,
    branch_ifsc TEXT,
    opening_balance REAL DEFAULT 0.0,
    current_balance REAL DEFAULT 0.0,
    balance_type TEXT DEFAULT 'Dr',
    od_limit REAL DEFAULT 0.0,
    is_active INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS customer_payments (
    payment_id TEXT PRIMARY KEY,
    receipt_no TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount REAL NOT NULL,
    payment_mode TEXT NOT NULL,
    bank_account_id TEXT,
    cheque_no TEXT,
    cheque_date DATE,
    bank_name TEXT,
    branch_name TEXT,
    reference_no TEXT,
    discount_allowed REAL DEFAULT 0.0,
    tds_amount REAL DEFAULT 0.0,
    net_credited REAL NOT NULL,
    status TEXT DEFAULT 'CLEARED',
    notes TEXT,
    recorded_by TEXT DEFAULT 'Manager',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS attendant_handovers (
    id TEXT PRIMARY KEY,
    voucher_no TEXT UNIQUE NOT NULL,
    handover_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_period TEXT NOT NULL,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    dispenser_machine TEXT NOT NULL,
    fuel_amount REAL DEFAULT 0.0,
    lube_amount REAL DEFAULT 0.0,
    gross_duty REAL NOT NULL,
    credit_slips_amount REAL DEFAULT 0.0,
    card_slips_amount REAL DEFAULT 0.0,
    staff_advance_upaad REAL DEFAULT 0.0,
    expected_cash REAL NOT NULL,
    physical_cash REAL NOT NULL,
    cash_variance REAL DEFAULT 0.0,
    notes TEXT,
    status TEXT DEFAULT 'VERIFIED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS section_194q_tds_register (
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
  );`,

  `CREATE TABLE IF NOT EXISTS lfr_recovery_register (
    id TEXT PRIMARY KEY,
    invoice_no TEXT NOT NULL,
    month_year TEXT NOT NULL,
    product_code TEXT NOT NULL,
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
  );`,

  // 2. Add columns if not already present (using ALTER TABLE safe wrapper)
  `ALTER TABLE stamping_register ADD COLUMN dispenser_id TEXT DEFAULT 'MPD-01';`,
  `ALTER TABLE stamping_register ADD COLUMN product TEXT DEFAULT 'MS (Petrol)';`,
  `ALTER TABLE stamping_register ADD COLUMN seal_serial TEXT;`,
  `ALTER TABLE stamping_register ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;`,

  `ALTER TABLE shifts ADD COLUMN testing_pourback_ltrs REAL DEFAULT 0.0;`,
  `ALTER TABLE shifts ADD COLUMN lube_sales_amount REAL DEFAULT 0.0;`,
  `ALTER TABLE shifts ADD COLUMN expected_cash REAL DEFAULT 0.0;`,
  `ALTER TABLE shifts ADD COLUMN physical_cash REAL DEFAULT 0.0;`,
  `ALTER TABLE shifts ADD COLUMN gap_of_account REAL DEFAULT 0.0;`,
  `ALTER TABLE shifts ADD COLUMN manager_remarks TEXT;`,
  `ALTER TABLE shifts ADD COLUMN is_frozen INTEGER DEFAULT 0;`,

  `ALTER TABLE transactions ADD COLUMN balance_after_txn REAL DEFAULT 0.0;`,
  `ALTER TABLE transactions ADD COLUMN customer_phone TEXT DEFAULT 'N/A';`,
  `ALTER TABLE transactions ADD COLUMN manager_override INTEGER DEFAULT 0;`,

  `ALTER TABLE shift_denominations ADD COLUMN d2000 INTEGER DEFAULT 0;`,

  `ALTER TABLE credit_accounts ADD COLUMN email TEXT;`,
  `ALTER TABLE credit_accounts ADD COLUMN remarks TEXT;`,

  // 3. Create indices
  `CREATE INDEX IF NOT EXISTS idx_cust_pay_customer ON customer_payments(customer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_attendant_handover_staff ON attendant_handovers(staff_id);`,
  `CREATE INDEX IF NOT EXISTS idx_tds_194q_invoice ON section_194q_tds_register(invoice_no);`,
  `CREATE INDEX IF NOT EXISTS idx_lfr_recovery_invoice ON lfr_recovery_register(invoice_no);`
];

console.log(`Starting execution of ${commands.length} DDL migrations on remote D1...`);

for (let i = 0; i < commands.length; i++) {
  const sql = commands[i].replace(/\s+/g, ' ').trim();
  const escapedSql = sql.replace(/"/g, '\\"');
  console.log(`[${i + 1}/${commands.length}] Running: ${sql.slice(0, 60)}...`);
  try {
    const cmd = `npx wrangler d1 execute petrosoft-d1-db --remote --command="${escapedSql}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  -> SUCCESS`);
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString() : err.message;
    if (msg.includes('duplicate column name')) {
      console.log(`  -> Already exists (Skipped)`);
    } else {
      console.warn(`  -> Note/Error: ${msg.split('\n')[0]}`);
    }
  }
}

console.log('Remote D1 Migration Complete!');
