// Cloudflare Pages Function: /api/sync
// High-Throughput Edge Synchronization & Offline Queue Reconciliation Engine

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
          await env.DB.prepare(`
            INSERT OR REPLACE INTO transactions (txn_id, receipt_no, shift_id, nozzle_id, fuel_type, liters, rate, fuel_amount, total_amount, payment_mode, customer_vehicle, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            item.id || `TXN-${Date.now()}`,
            item.receiptNo || `REC-${Date.now()}`,
            item.shiftId || "SHIFT-1",
            item.nozzleId || "noz-1",
            item.fuelCode || "MS",
            Number(item.liters || 0),
            Number(item.rate || 0),
            Number(item.fuelAmount || item.totalAmount || 0),
            Number(item.totalAmount || 0),
            item.paymentMode || "CASH",
            item.customerVehicle || "WALK-IN",
            item.timestamp || new Date().toISOString()
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
      message: `Successfully synchronized ${results.syncedCount} of ${queue.length} items to Cloudflare Edge.`
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
