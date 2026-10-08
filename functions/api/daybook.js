// Cloudflare Pages Function: /api/daybook
// Forecourt Day Book Cash Register, Expenses, Bank Remittances, and Attendant Shortage Ledger

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (env.DB) {
      const expenses = await env.DB.prepare(
        "SELECT * FROM expenses ORDER BY date DESC LIMIT 20"
      ).all();

      const bankDeposits = await env.DB.prepare(
        "SELECT * FROM bank_deposits ORDER BY date DESC LIMIT 20"
      ).all();

      const staff = await env.DB.prepare(
        "SELECT staff_id, name, role, total_shortage_pending FROM staff WHERE is_active = 1"
      ).all();

      return Response.json({
        success: true,
        date,
        expenses: expenses.results || [],
        bankDeposits: bankDeposits.results || [],
        staffShortages: staff.results || [],
        source: "Cloudflare D1 Edge"
      });
    }

    return Response.json({
      success: true,
      date,
      message: "Daybook Edge API Active",
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

    // Action 1: Record Forecourt Petty Expense Voucher
    if (action === "RECORD_EXPENSE") {
      const {
        category,
        amount,
        paidTo,
        approvedBy = "Vijay Sharma (Manager)",
        shiftId
      } = body;

      if (!category || !amount || !paidTo) {
        return Response.json({ success: false, error: "Missing required expense fields" }, { status: 400 });
      }

      const expenseId = `EXP-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toISOString().split("T")[0];

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO expenses (expense_id, date, category, amount, paid_to, approved_by)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(expenseId, dateStr, category, Number(amount), paidTo, approvedBy).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_EXPENSE",
        expenseId,
        date: dateStr,
        category,
        amount: Number(amount),
        paidTo,
        approvedBy,
        message: "Petty expense voucher logged to Day Book"
      });
    }

    // Action 2: Record Bank Cash Deposit / Remittance
    if (action === "RECORD_BANK_DEPOSIT") {
      const {
        bankName,
        accountNo,
        amount,
        depositedBy = "Vijay Sharma (Manager)",
        challanNo
      } = body;

      if (!bankName || !amount) {
        return Response.json({ success: false, error: "Missing bankName or amount" }, { status: 400 });
      }

      const depositId = `DEP-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toISOString().split("T")[0];
      const challan = challanNo || `CHL-${Date.now().toString().slice(-4)}`;

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO bank_deposits (deposit_id, date, bank_name, account_no, amount, deposited_by, challan_no, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'CLEARED')
        `).bind(depositId, dateStr, bankName, accountNo || "30819284901", Number(amount), depositedBy, challan).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_BANK_DEPOSIT",
        depositId,
        date: dateStr,
        bankName,
        amount: Number(amount),
        challanNo: challan,
        message: "Cash remittance voucher recorded"
      });
    }

    // Action 3: Attendant Shortage Flagging
    if (action === "RECORD_STAFF_SHORTAGE") {
      const { staffId, shortageAmount, shiftId, note } = body;
      if (!staffId || !shortageAmount) {
        return Response.json({ success: false, error: "Missing staffId or shortageAmount" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE staff 
          SET total_shortage_pending = total_shortage_pending + ?
          WHERE staff_id = ?
        `).bind(Number(shortageAmount), staffId).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_STAFF_SHORTAGE",
        staffId,
        shortageAmount: Number(shortageAmount),
        shiftId,
        message: "Attendant cash shortage flagged to staff ledger"
      });
    }

    // Action 4: Attendant Shortage Recovery
    if (action === "RECOVER_STAFF_SHORTAGE") {
      const { staffId, recoveredAmount, recoveryMode = "SALARY_DEDUCTION" } = body;
      if (!staffId || !recoveredAmount) {
        return Response.json({ success: false, error: "Missing staffId or recoveredAmount" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE staff 
          SET total_shortage_pending = MAX(0, total_shortage_pending - ?)
          WHERE staff_id = ?
        `).bind(Number(recoveredAmount), staffId).run();
      }

      return Response.json({
        success: true,
        action: "RECOVER_STAFF_SHORTAGE",
        staffId,
        recoveredAmount: Number(recoveredAmount),
        recoveryMode,
        message: "Attendant shortage recovered successfully"
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
