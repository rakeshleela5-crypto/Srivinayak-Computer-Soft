// Cloudflare Pages Edge API: Inter-Account Contra Transfers & Vouchers
// Shree Vinayaka PetroSoft AI Shiva
import { normalizeDbRow, normalizeDbRows } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: true, transfers: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM transfers ORDER BY created_at DESC LIMIT 50"
    ).all();

    return new Response(JSON.stringify({
      success: true,
      transfers: normalizeDbRows(results || [])
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const {
      date = new Date().toISOString().split('T')[0],
      shift = 'First',
      voucherType = 'Receipt Cash Voucher(Cash Deposit)',
      fromAccount,
      toAccount,
      amount,
      narration = ''
    } = data;

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid accounts or amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const transferId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO transfers (transfer_id, date, shift, voucher_type, from_account, to_account, amount, narration)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        transferId,
        date,
        shift,
        voucherType,
        fromAccount,
        toAccount,
        parseFloat(amount),
        narration
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      transferId,
      message: 'Contra Transfer Voucher recorded successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
