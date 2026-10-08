// Cloudflare Pages Function: /api/lubes
// 2T/4T Lubricant Inventory, Stock Adjustments, and Reorder Monitoring

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM lubricants ORDER BY name ASC"
      ).all();
      return Response.json({ success: true, lubricants: results, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      message: "Lubricants Edge API Active",
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

    // Action 1: Stock Inward / Adjustment
    if (action === "ADJUST_STOCK") {
      const { lubeId, deltaQty, newStockQty, reason = "INWARD_STOCK" } = body;
      if (!lubeId) {
        return Response.json({ success: false, error: "Missing lubeId" }, { status: 400 });
      }

      if (env.DB) {
        if (newStockQty !== undefined) {
          await env.DB.prepare(
            "UPDATE lubricants SET stock_qty = ? WHERE lube_id = ?"
          ).bind(Number(newStockQty), lubeId).run();
        } else if (deltaQty !== undefined) {
          await env.DB.prepare(
            "UPDATE lubricants SET stock_qty = MAX(0, stock_qty + ?) WHERE lube_id = ?"
          ).bind(Number(deltaQty), lubeId).run();
        }
      }

      return Response.json({
        success: true,
        action: "ADJUST_STOCK",
        lubeId,
        reason,
        updatedAt: new Date().toISOString(),
        message: "Lube stock updated successfully"
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
