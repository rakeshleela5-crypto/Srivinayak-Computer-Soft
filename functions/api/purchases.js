// Cloudflare Pages Edge API: Tanker Purchase Decantation & Security Seals
// Shree Vinayaka PetroSoft AI Shiva
import { normalizeDbRow, normalizeDbRows } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ success: true, purchases: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM inward_stock ORDER BY delivery_date DESC LIMIT 50"
    ).all();

    return new Response(JSON.stringify({
      success: true,
      purchases: normalizeDbRows(results || [])
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
      invoiceNo,
      tankerTtNo,
      dealerName = 'BHARAT PETROLEUM CO LTD',
      driverName = 'Tanker Driver',
      tankId,
      fuelCode,
      fuelName,
      invoicedQty,
      dipBeforeDecantation = 0,
      dipAfterDecantation = 0,
      receivedQty = invoicedQty,
      shortageLiters = 0,
      shortagePercent = 0,
      invoiceDensity15c = 750.0,
      observedTempC = 28.0,
      observedDensity = 745.0,
      convertedDensity15c = 750.0,
      densityVariance = 0.0,
      // Wooden Seals
      woodSeal1 = '',
      woodSeal2 = '',
      woodSeal3 = '',
      woodSeal4 = '',
      // Aluminum Seals
      alumSeal1 = '',
      alumSeal2 = '',
      alumSeal3 = '',
      alumSeal4 = '',
      // Taxes
      basicRate = 0,
      basicAmount = 0,
      basicExcise = 0,
      addExcise = 0,
      vatRate = 14.9,
      vatAmount = 0,
      cess = 0,
      tcs = 0,
      freight = 0,
      finalAmount = 0,
      verifiedBy = 'Vijay Sharma (Manager)'
    } = data;

    const deliveryId = `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO inward_stock (
          delivery_id, invoice_no, tanker_tt_no, driver_name, dealer_name, tank_id, fuel_code, fuel_name,
          invoiced_qty, dip_before_decantation, dip_after_decantation, received_qty, shortage_liters, shortage_percent,
          invoice_density_15c, observed_temp_c, observed_density, converted_density_15c, density_variance,
          wood_seal_1, wood_seal_2, wood_seal_3, wood_seal_4, alum_seal_1, alum_seal_2, alum_seal_3, alum_seal_4,
          basic_rate, basic_amount, basic_excise, add_excise, vat_rate, vat_amount, cess, tcs, freight, final_amount,
          status, verified_by, delivery_date
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          'VERIFIED_OK', ?, CURRENT_TIMESTAMP
        )`
      ).bind(
        deliveryId, invoiceNo, tankerTtNo, driverName, dealerName, tankId, fuelCode, fuelName,
        parseFloat(invoicedQty), parseFloat(dipBeforeDecantation), parseFloat(dipAfterDecantation),
        parseFloat(receivedQty), parseFloat(shortageLiters), parseFloat(shortagePercent),
        parseFloat(invoiceDensity15c), parseFloat(observedTempC), parseFloat(observedDensity),
        parseFloat(convertedDensity15c), parseFloat(densityVariance),
        woodSeal1, woodSeal2, woodSeal3, woodSeal4, alumSeal1, alumSeal2, alumSeal3, alumSeal4,
        parseFloat(basicRate), parseFloat(basicAmount), parseFloat(basicExcise), parseFloat(addExcise),
        parseFloat(vatRate), parseFloat(vatAmount), parseFloat(cess), parseFloat(tcs), parseFloat(freight),
        parseFloat(finalAmount), verifiedBy
      ).run();

      // Automatically increment tank stock
      await env.DB.prepare(
        "UPDATE tanks SET current_stock = current_stock + ? WHERE tank_id = ?"
      ).bind(parseFloat(receivedQty), tankId).run();
    }

    return new Response(JSON.stringify({
      success: true,
      deliveryId,
      message: 'Tanker Inward Decantation and Security Seals recorded successfully'
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
