import { execSync } from 'child_process';

const seedInserts = [
  // 1. Master Bank Accounts
  `INSERT OR REPLACE INTO bank_accounts (account_id, account_name, account_type, account_number, bank_name, branch_ifsc, opening_balance, current_balance, balance_type, od_limit, is_active)
   VALUES
   ('bank-1', 'Cash on Hand Counter', 'CASH', 'CASH-RO-01', 'Forecourt Counter Vault', 'N/A', 100000.0, 142500.0, 'Dr', 0.0, 1),
   ('bank-2', 'State Bank of India (SBI)', 'CURRENT', '30981249821', 'State Bank of India', 'SBIN0004051', 400000.0, 489200.0, 'Dr', 0.0, 1),
   ('bank-3', 'HDFC Bank Cash Credit / OD', 'OVERDRAFT', '502000192841', 'HDFC Bank Ltd', 'HDFC0001290', 0.0, 215000.0, 'Cr', 1500000.0, 1),
   ('bank-4', 'ICICI Bank Digital POS Settled', 'UPI_SETTLEMENT', '002905018291', 'ICICI Bank', 'ICIC0000029', 50000.0, 84350.0, 'Dr', 0.0, 1);`,

  // 2. Customer Payments
  `INSERT OR REPLACE INTO customer_payments (payment_id, receipt_no, customer_id, customer_name, payment_date, amount, payment_mode, cheque_no, cheque_date, bank_name, branch_name, reference_no, discount_allowed, tds_amount, net_credited, status, notes)
   VALUES
   ('CPAY-1008-01', 'RCP-CR-9041', 'fl-01', 'Shree Balaji Logistics & Movers', '2026-10-08', 50000.0, 'NEFT', NULL, NULL, 'HDFC Bank', 'Peenya', 'NEFT-HDFC-99120', 0.0, 0.0, 50000.0, 'CLEARED', 'On account payment against September invoice'),
   ('CPAY-1007-02', 'RCP-CR-8924', 'fl-02', 'Shiva Transport Corporation', '2026-10-07', 35000.0, 'CHEQUE', 'CHQ-449102', '2026-10-07', 'State Bank of India', 'Yeshwantpur', 'SBI-CL-3391', 0.0, 0.0, 35000.0, 'CLEARED', 'Cheque cleared on presentation'),
   ('CPAY-1006-03', 'RCP-CR-8802', 'fl-05', 'LIVAVATI TRANSPORTY', '2026-10-06', 25000.0, 'CASH', NULL, NULL, 'Counter Cash', 'Station', 'CSH-REC-1102', 250.0, 0.0, 24750.0, 'CLEARED', 'Direct counter cash settlement');`,

  // 3. Attendant Handovers (FrmLi)
  `INSERT OR REPLACE INTO attendant_handovers (id, voucher_no, handover_date, shift_period, staff_id, staff_name, dispenser_machine, fuel_amount, lube_amount, gross_duty, credit_slips_amount, card_slips_amount, staff_advance_upaad, expected_cash, physical_cash, cash_variance, notes, status)
   VALUES
   ('AHO-1008-01', 'FRMLI-8801', '2026-10-08', 'Morning (06:00 - 14:00)', 'staff-1', 'Ramesh Kumar', 'MPD-01 (Island 1)', 68450.0, 850.0, 69300.0, 4200.0, 6500.0, 500.0, 58100.0, 58100.0, 0.0, 'Perfect handover balance', 'VERIFIED'),
   ('AHO-1008-02', 'FRMLI-8802', '2026-10-08', 'Morning (06:00 - 14:00)', 'staff-2', 'Suresh Patil', 'MPD-02 (Island 2)', 54200.0, 400.0, 54600.0, 3100.0, 8200.0, 0.0, 43300.0, 43150.0, -150.0, 'Shortage debited to staff ledger', 'VERIFIED');`,

  // 4. Section 194Q TDS Register
  `INSERT OR REPLACE INTO section_194q_tds_register (id, fy_year, supplier_name, pan_no, invoice_no, invoice_date, basic_purchase_value, cumulative_purchase_ytd, threshold_exceeded, tds_rate_pct, tds_deducted, challan_bsr_code, challan_date, status)
   VALUES
   ('TDS-194Q-01', '2026-27', 'INDIAN OIL CORPORATION LTD', 'AAACI1681G', 'IOCL-INV-20261001-01', '2026-10-01', 1845000.0, 18450000.0, 1, 0.1, 1845.0, '0029104', '2026-10-07', 'DEDUCTED'),
   ('TDS-194Q-02', '2026-27', 'INDIAN OIL CORPORATION LTD', 'AAACI1681G', 'IOCL-INV-20261005-02', '2026-10-05', 2150000.0, 20600000.0, 1, 0.1, 2150.0, '0029104', '2026-10-07', 'DEDUCTED');`,

  // 5. License Fee Recovery (LFR) Register
  `INSERT OR REPLACE INTO lfr_recovery_register (id, invoice_no, month_year, product_code, volume_kl, lfr_rate_per_kl, basic_lfr, cgst_9pct, sgst_9pct, total_lfr_with_gst, tds_10pct_on_basic, net_lfr_payable, status)
   VALUES
   ('LFR-202610-01', 'IOCL-INV-20261001-01', '2026-10', 'MS', 20.0, 460.0, 9200.0, 828.0, 828.0, 10856.0, 920.0, 9936.0, 'POSTED'),
   ('LFR-202610-02', 'IOCL-INV-20261005-02', '2026-10', 'HSD', 24.0, 390.0, 9360.0, 842.4, 842.4, 11044.8, 936.0, 10108.8, 'POSTED');`,

  // 6. Sample Forecourt Transactions
  `INSERT OR REPLACE INTO transactions (
    txn_id, receipt_no, shift_id, nozzle_id, nozzle_number, fuel_code, fuel_name,
    liters, rate, fuel_amount, discount_per_liter, discount_amount, lube_items_json, lube_amount,
    cash_advance, total_amount, payment_mode, customer_id, credit_account_id, slip_no, driver_name,
    customer_vehicle, customer_name, customer_phone, manager_override, balance_after_txn, attendant, status, sync_status, timestamp
  ) VALUES
  ('TXN-1008-01', 'SVP-892101', 'SHIFT-20261008-01', 'noz-1', 'N-01', 'MS', 'Petrol (MS-91)', 19.45, 102.84, 2000.0, 0.0, 0.0, '[]', 0.0, 0.0, 2000.0, 'UPI', NULL, NULL, NULL, NULL, 'KA-04-MB-4512', 'Rahul S. Verma', '+91 98450 11223', 0, 0.0, 'Ramesh Kumar', 'COMPLETED', 'SYNCED', '2026-10-08 08:15:20'),
  ('TXN-1008-02', 'SVP-892102', 'SHIFT-20261008-01', 'noz-3', 'N-03', 'HSD', 'Diesel (HSD)', 160.0, 89.75, 14360.0, 0.50, 80.0, '[]', 0.0, 1500.0, 15780.0, 'CREDIT', 'fl-01', 'fl-01', 'IND-2026-801', 'Ramu Gowda', 'KA-01-AK-4455', 'Shree Balaji Logistics & Movers', '+91 98860 12345', 0, 342150.0, 'Ramesh Kumar', 'COMPLETED', 'SYNCED', '2026-10-08 08:45:10'),
  ('TXN-1008-03', 'SVP-892103', 'SHIFT-20261008-01', 'noz-1', 'N-01', 'MS', 'Petrol (MS-91)', 4.86, 102.84, 500.0, 0.0, 0.0, '[]', 0.0, 0.0, 500.0, 'CASH', NULL, NULL, NULL, NULL, 'WALK-IN', 'Retail Customer', 'N/A', 0, 0.0, 'Ramesh Kumar', 'COMPLETED', 'SYNCED', '2026-10-08 09:10:05');`
];

console.log(`Starting seeding of ${seedInserts.length} new datasets on remote D1...`);

for (let i = 0; i < seedInserts.length; i++) {
  const sql = seedInserts[i].replace(/\s+/g, ' ').trim();
  const escapedSql = sql.replace(/"/g, '\\"');
  console.log(`[${i + 1}/${seedInserts.length}] Seeding table...`);
  try {
    const cmd = `npx wrangler d1 execute petrosoft-d1-db --remote --command="${escapedSql}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  -> SUCCESS`);
  } catch (err) {
    console.warn(`  -> Note/Error: ${err.message}`);
  }
}

console.log('Remote D1 Seeding Complete!');
