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

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
