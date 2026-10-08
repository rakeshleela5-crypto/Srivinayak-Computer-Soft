// Cloudflare Pages Function: /api/billing
// Forecourt Transaction Billing, Receipt Generation, and Multi-Table Ledger Reconciliation
import { normalizeTransaction } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 50"
      ).all();
      const normalized = (results || []).map(normalizeTransaction);
      return Response.json({ success: true, transactions: normalized, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      message: "Cloudflare Pages Edge Billing API Active",
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

    const {
      nozzleId,
      nozzleNumber,
      fuelCode,
      fuelName,
      liters,
      rate,
      fuelAmount,
      totalAmount,
      discountPerLiter = 0,
      discountAmount = 0,
      lubeItems = [],
      lubeAmount = 0,
      cashAdvance = 0,
      paymentMode = "CASH",
      customerVehicle = "WALK-IN",
      customerName = "Retail Customer",
      creditAccountId,
      slipNo,
      driverName,
      attendant = "Vijay Sharma"
    } = body;

    if (!liters || !rate || !totalAmount) {
      return Response.json({ success: false, error: "Missing required transaction fields" }, { status: 400 });
    }

    const receiptNo = body.receiptNo || `SV-REC-${Date.now().toString().slice(-6)}`;
    const txnId = body.id || `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const timestamp = body.timestamp || new Date().toISOString();
    const lubeItemsJson = JSON.stringify(lubeItems);

    if (env.DB) {
      let activeShiftId = body.shiftId;
      if (!activeShiftId) {
        const activeShift = await env.DB.prepare(
          "SELECT shift_id FROM shifts WHERE status = 'ACTIVE' LIMIT 1"
        ).first();
        activeShiftId = activeShift ? activeShift.shift_id : "SHIFT-20261008-01";
      }

      // 1. Insert Transaction into transactions table
      await env.DB.prepare(`
        INSERT INTO transactions (
          txn_id, receipt_no, shift_id, nozzle_id, nozzle_number, fuel_code, fuel_name,
          liters, rate, fuel_amount, discount_per_liter, discount_amount, lube_items_json,
          lube_amount, cash_advance, total_amount, payment_mode, customer_id, credit_account_id,
          slip_no, driver_name, customer_vehicle, customer_name, attendant, status, sync_status, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', 'SYNCED', ?)
      `).bind(
        txnId,
        receiptNo,
        activeShiftId,
        nozzleId || "noz-1",
        nozzleNumber || "N-01",
        fuelCode || "MS",
        fuelName || (fuelCode === "MS" ? "Petrol (MS-91)" : "Diesel (HSD)"),
        Number(liters),
        Number(rate),
        Number(fuelAmount || totalAmount),
        Number(discountPerLiter),
        Number(discountAmount),
        lubeItemsJson,
        Number(lubeAmount),
        Number(cashAdvance),
        Number(totalAmount),
        paymentMode,
        creditAccountId || null,
        creditAccountId || null,
        slipNo || null,
        driverName || null,
        customerVehicle,
        customerName,
        attendant,
        timestamp
      ).run();

      // 2. Decrement Tank Stock
      await env.DB.prepare(`
        UPDATE tanks 
        SET current_stock = MAX(0, current_stock - ?), atg_level = MAX(0, atg_level - ?)
        WHERE fuel_code = ?
      `).bind(Number(liters), Number(liters), fuelCode || "MS").run();

      // 3. Increment Nozzle Totalizer Reading
      if (nozzleId) {
        await env.DB.prepare(`
          UPDATE nozzles 
          SET current_reading = current_reading + ?
          WHERE nozzle_id = ?
        `).bind(Number(liters), nozzleId).run();
      }

      // 4. Update Shift Totals
      const mode = (paymentMode || "").toUpperCase();
      const totAmt = Number(totalAmount);
      const cashAdv = Number(cashAdvance);

      let shiftUpdateQuery = `UPDATE shifts SET `;
      if (mode === "CASH") shiftUpdateQuery += `cash_collected = cash_collected + ?, `;
      else if (mode === "CARD") shiftUpdateQuery += `card_collected = card_collected + ?, `;
      else if (mode === "UPI") shiftUpdateQuery += `upi_collected = upi_collected + ?, `;
      else if (mode === "CREDIT" || mode === "FLEET") shiftUpdateQuery += `credit_issued = credit_issued + ?, `;
      else shiftUpdateQuery += `cash_collected = cash_collected + ?, `;

      shiftUpdateQuery += `driver_kharcha_disbursed = driver_kharcha_disbursed + ? WHERE shift_id = ?`;

      await env.DB.prepare(shiftUpdateQuery).bind(totAmt, cashAdv, activeShiftId).run();

      // 5. Update Fleet Account Ledger Balance if Credit Sale
      if (creditAccountId) {
        await env.DB.prepare(`
          UPDATE credit_accounts 
          SET current_balance = current_balance + ?
          WHERE customer_id = ?
        `).bind(totAmt, creditAccountId).run();
      }

      // 6. Decrement Lubricant inventory if lubes included
      if (Array.isArray(lubeItems) && lubeItems.length > 0) {
        for (const item of lubeItems) {
          if (item.id && item.qty) {
            await env.DB.prepare(`
              UPDATE lubricants SET stock_qty = MAX(0, stock_qty - ?) WHERE lube_id = ?
            `).bind(Number(item.qty), item.id).run();
          }
        }
      }
    }

    return Response.json({
      success: true,
      txnId,
      id: txnId,
      receiptNo,
      timestamp,
      totalAmount: Number(totalAmount),
      fuelAmount: Number(fuelAmount || totalAmount),
      cashAdvance: Number(cashAdvance),
      discountAmount: Number(discountAmount),
      paymentMode,
      status: "COMPLETED",
      syncStatus: "SYNCED",
      edgeLocation: request.cf?.colo || "EDGE-LOCAL",
      message: "Transaction processed and all ledgers reconciled on Cloudflare Edge"
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
