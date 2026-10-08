// Cloudflare Pages Function: /api/sync
// Comprehensive Batch Edge Synchronization & Multi-Table Reconciliation Engine

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { queue = [], clientTimestamp } = body;

    const results = {
      totalReceived: queue.length,
      syncedCount: 0,
      failedCount: 0,
      syncedIds: [],
      errors: []
    };

    if (queue.length === 0) {
      return Response.json({
        success: true,
        message: "Offline queue empty. Edge in sync.",
        edgeTimestamp: new Date().toISOString()
      });
    }

    for (const item of queue) {
      try {
        const itemType = item.type || (item.receiptNo ? "TRANSACTION" : "UNKNOWN");

        if (itemType === "TRANSACTION" && env.DB) {
          const txnId = item.id || `TXN-${Date.now()}`;
          const receiptNo = item.receiptNo || `REC-${Date.now()}`;
          const liters = Number(item.liters || 0);
          const fuelCode = item.fuelCode || item.fuel_code || "MS";

          await env.DB.prepare(`
            INSERT OR REPLACE INTO transactions (
              txn_id, receipt_no, shift_id, nozzle_id, nozzle_number, fuel_code, fuel_name,
              liters, rate, fuel_amount, discount_per_liter, discount_amount, lube_items_json,
              lube_amount, cash_advance, total_amount, payment_mode, customer_id, credit_account_id,
              slip_no, driver_name, customer_vehicle, customer_name, attendant, status, sync_status, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', 'SYNCED', ?)
          `).bind(
            txnId,
            receiptNo,
            item.shiftId || "SHIFT-1",
            item.nozzleId || "noz-1",
            item.nozzleNumber || "N-01",
            fuelCode,
            item.fuelName || (fuelCode === "MS" ? "Petrol (MS-91)" : "Diesel (HSD)"),
            liters,
            Number(item.rate || 0),
            Number(item.fuelAmount || item.totalAmount || 0),
            Number(item.discountPerLiter || 0),
            Number(item.discountAmount || 0),
            JSON.stringify(item.lubeItems || []),
            Number(item.lubeAmount || 0),
            Number(item.cashAdvance || 0),
            Number(item.totalAmount || 0),
            item.paymentMode || "CASH",
            item.creditAccountId || null,
            item.creditAccountId || null,
            item.slipNo || null,
            item.driverName || null,
            item.customerVehicle || "WALK-IN",
            item.customerName || "Retail Customer",
            item.attendant || "Vijay Sharma",
            item.timestamp || new Date().toISOString()
          ).run();

          // Decrement tank stock
          await env.DB.prepare(`
            UPDATE tanks SET current_stock = MAX(0, current_stock - ?) WHERE fuel_code = ?
          `).bind(liters, fuelCode).run();

          // Increment nozzle reading
          if (item.nozzleId) {
            await env.DB.prepare(`
              UPDATE nozzles SET current_reading = current_reading + ? WHERE nozzle_id = ?
            `).bind(liters, item.nozzleId).run();
          }
        } else if (itemType === "DECANTATION" && env.DB) {
          const decId = item.id || `DEC-${Date.now()}`;
          await env.DB.prepare(`
            INSERT OR REPLACE INTO inward_stock (
              delivery_id, invoice_no, tanker_tt_no, driver_name, tank_id, fuel_code,
              invoiced_qty, dip_before_decantation, dip_after_decantation, received_qty,
              shortage_liters, shortage_percent, invoice_density_15c, observed_temp_c,
              observed_density, converted_density_15c, density_variance, status, verified_by, delivery_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            decId,
            item.invoiceNo || "INV-DEC",
            item.tankerTTNo || "KA-01-TT",
            item.driverName || "Tanker Driver",
            item.tankId || "tank-1",
            item.fuelCode || "MS",
            Number(item.invoicedQty || 0),
            Number(item.dipBeforeDecantation || 0),
            Number(item.dipAfterDecantation || 0),
            Number(item.receivedQty || 0),
            Number(item.shortageLiters || 0),
            Number(item.shortagePercent || 0),
            Number(item.invoiceDensityAt15C || 750),
            Number(item.observedTempC || 28),
            Number(item.observedDensity || 745),
            Number(item.convertedDensityAt15C || 750),
            Number(item.densityVariance || 0),
            item.status || "VERIFIED_OK",
            item.verifiedBy || "Vijay Sharma (Manager)",
            item.date || new Date().toISOString()
          ).run();

          await env.DB.prepare(`
            UPDATE tanks SET current_stock = current_stock + ? WHERE tank_id = ?
          `).bind(Number(item.receivedQty || 0), item.tankId).run();
        } else if (itemType === "INDENT_CREATE" && env.DB) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO digital_indents (
              id, indent_number, fleet_id, company_name, vehicle_plate, driver_name,
              driver_phone, fuel_code, max_liters, max_amount, cash_advance_kharcha,
              security_pin, qr_payload, status, created_at, expires_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
          `).bind(
            item.id || `IND-${Date.now()}`,
            item.indentNumber || `IND-2026-${Date.now().toString().slice(-4)}`,
            item.fleetId || "fl-01",
            item.companyName || "Fleet Company",
            item.vehiclePlate || "KA-01-XX-0000",
            item.driverName || "Authorized Driver",
            item.driverPhone || null,
            item.fuelCode || "HSD",
            Number(item.maxLiters || 100),
            Number(item.maxAmount || 8975),
            Number(item.cashAdvanceKharcha || 0),
            item.securityPin || "9999",
            item.qrPayload || "INDENT",
            item.createdAt || new Date().toISOString(),
            item.expiresAt || new Date(Date.now() + 86400000).toISOString()
          ).run();
        } else if (itemType === "EXPENSE" && env.DB) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO expenses (expense_id, date, category, amount, paid_to, approved_by)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            item.id || `EXP-${Date.now()}`,
            item.date || new Date().toISOString().split("T")[0],
            item.category || "General",
            Number(item.amount || 0),
            item.paidTo || "Vendor",
            item.approvedBy || "Vijay Sharma"
          ).run();
        } else if (itemType === "BANK_DEPOSIT" && env.DB) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO bank_deposits (deposit_id, date, bank_name, account_no, amount, deposited_by, challan_no, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'CLEARED')
          `).bind(
            item.id || `DEP-${Date.now()}`,
            item.date || new Date().toISOString().split("T")[0],
            item.bankName || "State Bank of India (SBI)",
            item.accountNo || "30819284901",
            Number(item.amount || 0),
            item.depositedBy || "Vijay Sharma",
            item.challanNo || `CHL-${Date.now().toString().slice(-4)}`
          ).run();
        }

        results.syncedCount++;
        results.syncedIds.push(item.id || item.receiptNo || item.indentNumber);
      } catch (itemErr) {
        results.failedCount++;
        results.errors.push({ id: item.id, error: itemErr.message });
      }
    }

    return Response.json({
      success: true,
      results,
      edgeTimestamp: new Date().toISOString(),
      colo: request.cf?.colo || "EDGE-LOCAL",
      message: `Batch sync reconciled ${results.syncedCount} of ${queue.length} items to D1 database.`
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
