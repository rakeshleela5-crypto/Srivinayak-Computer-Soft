// Cloudflare Pages Function: /api/credit
// B2B Fleet Khata Accounts, Credit Limits, Ledgers, and Payment Receipts
import { normalizeCreditAccount, normalizeTransaction } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");

    if (env.DB) {
      if (customerId) {
        const rawAccount = await env.DB.prepare(
          "SELECT * FROM credit_accounts WHERE customer_id = ? LIMIT 1"
        ).bind(customerId).first();

        const rawTransactions = await env.DB.prepare(
          "SELECT * FROM transactions WHERE customer_id = ? OR credit_account_id = ? ORDER BY timestamp DESC LIMIT 30"
        ).bind(customerId, customerId).all();

        const rawVehicles = await env.DB.prepare(
          "SELECT * FROM fleet_vehicles WHERE fleet_id = ?"
        ).bind(customerId).all();

        const account = normalizeCreditAccount(rawAccount);
        if (account) {
          account.vehicles = (rawVehicles.results || []).map(v => ({
            plate: v.plate_number,
            type: v.vehicle_type,
            driver: v.driver_name,
            dailyQuotaLiters: v.daily_quota_liters
          }));
        }

        return Response.json({
          success: true,
          account,
          transactions: (rawTransactions.results || []).map(normalizeTransaction),
          source: "Cloudflare D1 Edge"
        });
      }

      const { results } = await env.DB.prepare(
        "SELECT * FROM credit_accounts ORDER BY current_balance DESC"
      ).all();

      const normalized = (results || []).map(normalizeCreditAccount);
      return Response.json({ success: true, accounts: normalized, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      message: "Credit API Edge Endpoint Active",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { action } = body;

    // Action 1: Record Fleet Payment Receipt (Cheque / NEFT / RTGS)
    if (action === "RECORD_PAYMENT") {
      const { customerId, amount, paymentMode = "NEFT", referenceNo, notes } = body;
      if (!customerId || !amount) {
        return Response.json({ success: false, error: "Missing customerId or amount" }, { status: 400 });
      }

      const receiptId = `RCP-CR-${Date.now().toString().slice(-6)}`;
      const timestamp = new Date().toISOString();

      if (env.DB) {
        // Decrease customer balance
        await env.DB.prepare(`
          UPDATE credit_accounts 
          SET current_balance = MAX(0, current_balance - ?)
          WHERE customer_id = ?
        `).bind(Number(amount), customerId).run();

        // Also log in customer_payments table
        const cust = await env.DB.prepare("SELECT company_name FROM credit_accounts WHERE customer_id = ?").bind(customerId).first();
        const custName = cust ? cust.company_name : "Fleet Transporter";
        await env.DB.prepare(`
          INSERT INTO customer_payments (
            payment_id, receipt_no, customer_id, customer_name, payment_date,
            amount, payment_mode, reference_no, discount_allowed, tds_amount,
            net_credited, status, notes
          ) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, 0.0, 0.0, ?, 'CLEARED', ?)
        `).bind(
          receiptId,
          referenceNo || receiptId,
          customerId,
          custName,
          Number(amount),
          paymentMode,
          referenceNo || null,
          Number(amount),
          notes || 'Payment received'
        ).run();

        // Also log payment in bank_deposits as cleared settlement
        await env.DB.prepare(`
          INSERT INTO bank_deposits (deposit_id, date, bank_name, account_no, amount, deposited_by, challan_no, status)
          VALUES (?, CURRENT_DATE, ?, 'B2B-SETTLEMENT', ?, 'Fleet Owner Payment', ?, 'CLEARED')
        `).bind(
          receiptId,
          `Fleet Remittance (${paymentMode})`,
          Number(amount),
          referenceNo || `CR-REF-${Date.now().toString().slice(-4)}`
        ).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_PAYMENT",
        receiptId,
        customerId,
        amount: Number(amount),
        paymentMode,
        referenceNo,
        timestamp,
        message: "Credit payment received and credited to fleet ledger"
      });
    }

    // Action 2: Update Credit Limit / Strict Lock
    if (action === "UPDATE_LIMIT") {
      const { customerId, creditLimit, hardLockEnabled, status } = body;
      if (!customerId) {
        return Response.json({ success: false, error: "Missing customerId" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE credit_accounts 
          SET credit_limit = COALESCE(?, credit_limit), 
              hard_lock_enabled = COALESCE(?, hard_lock_enabled),
              status = COALESCE(?, status)
          WHERE customer_id = ?
        `).bind(
          creditLimit !== undefined ? Number(creditLimit) : null,
          hardLockEnabled !== undefined ? (hardLockEnabled ? 1 : 0) : null,
          status || null,
          customerId
        ).run();
      }

      return Response.json({
        success: true,
        action: "UPDATE_LIMIT",
        customerId,
        creditLimit: creditLimit !== undefined ? Number(creditLimit) : undefined,
        status,
        message: "Fleet credit terms updated successfully"
      });
    }

    // Action 3: Register / Update Customer Master
    if (action === "REGISTER_CUSTOMER") {
      const {
        customerId = `fl-${Date.now().toString().slice(-4)}`,
        customerCode,
        companyName,
        contactPerson = '',
        phone,
        email = '',
        remarks = '',
        address = '',
        city = 'Bangalore',
        state = 'Karnataka',
        gstin = '',
        panNo = '',
        ndcRequired = 0,
        isB2c = 0,
        tdsApply = 1,
        isTanker = 0,
        isBlocked = 0,
        billPeriod = '30 day',
        driverPin = '0000',
        creditLimit = 100000,
        openingBalance = 0,
        discountPerLiter = 0,
        chargePct = 0
      } = body;

      if (!companyName || !phone) {
        return Response.json({ success: false, error: "Missing customer name or phone" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO credit_accounts (
            customer_id, customer_code, company_name, contact_person, phone, email, remarks, address, city, state,
            gstin, pan_no, ndc_required, is_b2c, tds_apply, is_tanker, is_blocked, bill_period,
            driver_pin, credit_limit, opening_balance, current_balance, discount_per_liter, charge_pct
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(customer_id) DO UPDATE SET
            company_name = excluded.company_name,
            phone = excluded.phone,
            email = excluded.email,
            remarks = excluded.remarks,
            address = excluded.address,
            city = excluded.city,
            state = excluded.state,
            gstin = excluded.gstin,
            pan_no = excluded.pan_no,
            ndc_required = excluded.ndc_required,
            is_b2c = excluded.is_b2c,
            tds_apply = excluded.tds_apply,
            is_tanker = excluded.is_tanker,
            is_blocked = excluded.is_blocked,
            bill_period = excluded.bill_period,
            driver_pin = excluded.driver_pin,
            credit_limit = excluded.credit_limit,
            discount_per_liter = excluded.discount_per_liter,
            charge_pct = excluded.charge_pct
        `).bind(
          customerId, customerCode ? Number(customerCode) : Math.floor(Math.random() * 90) + 10,
          companyName, contactPerson, phone, email, remarks, address, city, state,
          gstin, panNo, ndcRequired ? 1 : 0, isB2c ? 1 : 0, tdsApply ? 1 : 0,
          isTanker ? 1 : 0, isBlocked ? 1 : 0, billPeriod, driverPin,
          Number(creditLimit), Number(openingBalance), Number(openingBalance),
          Number(discountPerLiter), Number(chargePct)
        ).run();
      }

      return Response.json({
        success: true,
        action: "REGISTER_CUSTOMER",
        customerId,
        companyName,
        message: "Customer master registered successfully in D1 database"
      });
    }

    // Action 4: Cheque Return / Bounce Reversal
    if (action === "CHEQUE_RETURN") {
      const { customerId, customerName, receiptNo = '', chequeNo, bankName, amount, returnDate = new Date().toISOString().split('T')[0], penalty = 350.0, reason = 'Insufficient Funds' } = body;
      if (!customerId || !chequeNo || !amount) {
        return Response.json({ success: false, error: "Missing customer, cheque number or amount" }, { status: 400 });
      }

      const returnId = `CHQ-RET-${Date.now()}`;
      const totalDebit = Number(amount) + Number(penalty);

      if (env.DB) {
        // Log in cheque_returns table
        await env.DB.prepare(`
          INSERT INTO cheque_returns (id, customer_id, customer_name, receipt_no, cheque_no, bank_name, amount, return_date, penalty_charges, reason, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BOUNCED')
        `).bind(returnId, customerId, customerName, receiptNo, chequeNo, bankName, Number(amount), returnDate, Number(penalty), reason).run();

        // Reverse credit account balance (re-debit the customer)
        await env.DB.prepare(`
          UPDATE credit_accounts 
          SET current_balance = current_balance + ?
          WHERE customer_id = ?
        `).bind(totalDebit, customerId).run();
      }

      return Response.json({
        success: true,
        action: "CHEQUE_RETURN",
        returnId,
        customerId,
        amountReversed: Number(amount),
        penaltyApplied: Number(penalty),
        totalDebit,
        message: `Cheque #${chequeNo} returned. ₹${totalDebit} re-debited to customer ledger.`
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
