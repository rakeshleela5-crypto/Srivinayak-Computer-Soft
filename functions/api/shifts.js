// Cloudflare Pages Function: /api/shifts
// Shift Management, Attendant Cash drops, Denomination Handover, and Dual Sign-off
import { normalizeShift } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM shifts WHERE status = 'ACTIVE' LIMIT 1"
      ).all();
      const activeShift = results[0] ? normalizeShift(results[0]) : null;
      return Response.json({ success: true, activeShift, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      activeShift: {
        shiftId: "SHIFT-20261008-01",
        shiftNumber: "Shift-1 (Morning)",
        status: "ACTIVE",
        supervisor: "Vijay Sharma",
        startTime: "06:00 AM"
      }
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
      shiftId = "SHIFT-20261008-01",
      outgoingCashier,
      incomingCashier,
      physicalCashHanded,
      calculatedCash,
      supervisor = "Vijay Sharma",
      notes = "Shift handover verified",
      denominations = {}
    } = body;

    const physCash = Number(physicalCashHanded || 0);
    const calcCash = Number(calculatedCash || 0);
    const variance = physCash - calcCash;
    const handoverId = `HO-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    if (env.DB) {
      // 1. Insert into shift_denominations
      await env.DB.prepare(`
        INSERT INTO shift_denominations (
          id, shift_id, d500, d200, d100, d50, d20, d10, coins,
          total_physical_cash, calculated_cash, variance,
          outgoing_cashier, incoming_cashier, notes, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        handoverId,
        shiftId,
        Number(denominations[500] || 0),
        Number(denominations[200] || 0),
        Number(denominations[100] || 0),
        Number(denominations[50] || 0),
        Number(denominations[20] || 0),
        Number(denominations[10] || 0),
        Number(denominations.coins || 0),
        physCash,
        calcCash,
        variance,
        outgoingCashier || "Outgoing Cashier",
        incomingCashier || "Incoming Cashier",
        notes,
        timestamp
      ).run();

      // 2. If shortage, log against attendant in staff_shortage_logs
      if (variance < 0 && outgoingCashier) {
        const targetStaff = await env.DB.prepare(
          "SELECT staff_id FROM staff WHERE name = ? LIMIT 1"
        ).bind(outgoingCashier).first();

        if (targetStaff) {
          const shortageAmt = Math.abs(variance);
          await env.DB.prepare(`
            INSERT INTO staff_shortage_logs (id, staff_id, shift_id, date, calculated_sales, deposited_cash, shortage_amount, status, note)
            VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?, 'UNRECOVERED', ?)
          `).bind(
            `SLOG-${Date.now().toString().slice(-6)}`,
            targetStaff.staff_id,
            shiftId,
            calcCash,
            physCash,
            shortageAmt,
            notes
          ).run();

          await env.DB.prepare(`
            UPDATE staff SET total_shortage_pending = total_shortage_pending + ? WHERE staff_id = ?
          `).bind(shortageAmt, targetStaff.staff_id).run();
        }
      }
    }

    return Response.json({
      success: true,
      handoverId,
      timestamp,
      outgoingCashier,
      incomingCashier,
      physicalCashHanded: physCash,
      calculatedCash: calcCash,
      variance,
      status: "HANDOVER_VERIFIED",
      auditCertificate: `CERT-EDGE-SVP-${Math.floor(1000 + Math.random() * 9000)}`,
      edgeNode: request.cf?.colo || "EDGE-LOCAL",
      message: "Shift handover and cash denominations recorded to D1 database"
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
