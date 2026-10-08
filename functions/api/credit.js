// Cloudflare Pages Function: /api/credit
// B2B Fleet Khata Accounts, Credit Limits, Ledgers, and Payment Receipts

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");

    if (env.DB) {
      if (customerId) {
        const account = await env.DB.prepare(
          "SELECT * FROM credit_accounts WHERE customer_id = ? LIMIT 1"
        ).bind(customerId).first();

        const transactions = await env.DB.prepare(
          "SELECT * FROM transactions WHERE customer_id = ? ORDER BY timestamp DESC LIMIT 30"
        ).bind(customerId).all();

        return Response.json({
          success: true,
          account,
          transactions: transactions.results || []
        });
      }

      const { results } = await env.DB.prepare(
        "SELECT * FROM credit_accounts ORDER BY current_balance DESC"
      ).all();

      return Response.json({ success: true, accounts: results, source: "Cloudflare D1 Edge" });
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
      const { customerId, creditLimit, status } = body;
      if (!customerId) {
        return Response.json({ success: false, error: "Missing customerId" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE credit_accounts 
          SET credit_limit = COALESCE(?, credit_limit), status = COALESCE(?, status)
          WHERE customer_id = ?
        `).bind(creditLimit !== undefined ? Number(creditLimit) : null, status || null, customerId).run();
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
