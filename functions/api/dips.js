// Cloudflare Pages Edge API: Physical Tank DIP Register & OMC Allowable Loss Limits
// Shree Vinayaka PetroSoft AI Shiva
import { normalizeDbRow, normalizeDbRows } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: true, dips: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM dip_register ORDER BY created_at DESC LIMIT 50"
    ).all();

    return new Response(JSON.stringify({
      success: true,
      dips: normalizeDbRows(results || [])
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
      tankId,
      fuelCode,
      openingDip,
      openingStock,
      receiptQty = 0,
      closingDip,
      closingStock,
      meterSale = 0
    } = data;

    // OMC standard evaporation & handling tolerance formula
    // MS (Petrol) allowable loss limit = -0.75% of opening stock
    // HSD (Diesel) allowable loss limit = -0.25% of opening stock
    const opStockNum = parseFloat(openingStock);
    const recNum = parseFloat(receiptQty);
    const clStockNum = parseFloat(closingStock);
    const mSaleNum = parseFloat(meterSale);

    const dipSale = opStockNum + recNum - clStockNum;
    const variation = dipSale - mSaleNum;
    const tolerancePct = (fuelCode === 'MS' || fuelCode === 'XP95') ? 0.0075 : 0.0025;
    const allowableLimit = -1 * (opStockNum * tolerancePct);

    const status = Math.abs(variation) <= Math.abs(allowableLimit) ? 'PASS_WITHIN_TOLERANCE' : 'VARIANCE_ALERT';
    const dipId = `DIP-${Date.now()}-${fuelCode}`;

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO dip_register (
          id, date, shift, tank_id, fuel_code, opening_dip, opening_stock, receipt_qty,
          closing_dip, closing_stock, dip_sale, meter_sale, variation, allowable_limit, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        dipId, date, shift, tankId, fuelCode, parseFloat(openingDip), opStockNum, recNum,
        parseFloat(closingDip), clStockNum, dipSale, mSaleNum, variation, allowableLimit, status
      ).run();

      // Update current tank stock
      await env.DB.prepare(
        "UPDATE tanks SET current_stock = ?, physical_dip_mm = ?, last_dip_time = CURRENT_TIMESTAMP WHERE tank_id = ?"
      ).bind(clStockNum, parseFloat(closingDip), tankId).run();
    }

    return new Response(JSON.stringify({
      success: true,
      dipId,
      dipSale,
      meterSale: mSaleNum,
      variation,
      allowableLimit,
      status,
      message: 'Tank DIP Register entry recorded successfully'
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
