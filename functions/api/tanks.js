// Cloudflare Pages Function: /api/tanks
// Handles underground storage tanks, dip vs ATG telemetry, and tanker decantations
import { normalizeTank, normalizeDecantation } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare("SELECT * FROM tanks ORDER BY tank_number ASC").all();
      const normalized = (results || []).map(normalizeTank);
      return Response.json({ success: true, tanks: normalized, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      message: "Tanks API edge endpoint active",
      standardTempReference: "15°C ASTM 53B"
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

    // Action 1: Record Physical Dip
    if (action === "RECORD_DIP") {
      const { tankId, dipMm, temp, density } = body;
      if (!tankId) {
        return Response.json({ success: false, error: "Missing tankId" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE tanks 
          SET physical_dip_mm = ?, temperature_c = COALESCE(?, temperature_c), density_observed = COALESCE(?, density_observed), last_dip_time = CURRENT_TIMESTAMP
          WHERE tank_id = ?
        `).bind(Number(dipMm), temp !== undefined ? Number(temp) : null, density !== undefined ? Number(density) : null, tankId).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_DIP",
        tankId,
        physicalDipMm: Number(dipMm),
        timestamp: new Date().toISOString()
      });
    }

    // Default Action: Inward Tanker Decantation
    const {
      invoiceNo,
      tankerTTNo,
      driverName = "Tanker Driver",
      tankId,
      fuelCode,
      invoicedQty,
      dipBeforeDecantation = 0,
      dipAfterDecantation = 0,
      receivedQty,
      observedDensity,
      observedTempC,
      invoiceDensityAt15C
    } = body;

    // Standard ASTM 53B calculation
    const coeff = fuelCode === 'HSD' ? 0.00075 : 0.00085;
    const deltaT = Number(observedTempC) - 15;
    const convertedDensity15C = Number((Number(observedDensity) / (1 - (coeff * deltaT))).toFixed(1));
    const densityVariance = Number((convertedDensity15C - Number(invoiceDensityAt15C)).toFixed(1));

    const shortageLiters = Number(invoicedQty) - Number(receivedQty);
    const shortagePercent = Number(((shortageLiters / Number(invoicedQty)) * 100).toFixed(2));
    const isCompliant = shortagePercent <= 0.59 && Math.abs(densityVariance) <= 3.0;
    const deliveryId = `DEC-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    if (env.DB) {
      // 1. Insert into inward_stock
      await env.DB.prepare(`
        INSERT INTO inward_stock (delivery_id, invoice_no, tanker_tt_no, driver_name, tank_id, fuel_code, invoiced_qty, dip_before_decantation, dip_after_decantation, received_qty, shortage_liters, shortage_percent, invoice_density_15c, observed_temp_c, observed_density, converted_density_15c, density_variance, status, verified_by, delivery_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        deliveryId,
        invoiceNo,
        tankerTTNo,
        driverName,
        tankId,
        fuelCode,
        Number(invoicedQty),
        Number(dipBeforeDecantation),
        Number(dipAfterDecantation),
        Number(receivedQty),
        shortageLiters,
        shortagePercent,
        Number(invoiceDensityAt15C),
        Number(observedTempC),
        Number(observedDensity),
        convertedDensity15C,
        densityVariance,
        isCompliant ? "VERIFIED_OK" : "FLAGGED_VARIANCE",
        body.verifiedBy || "Vijay Sharma (Manager)",
        nowIso
      ).run();

      // 2. Increment stock in tanks table
      await env.DB.prepare(`
        UPDATE tanks 
        SET current_stock = current_stock + ?, atg_level = atg_level + ?, density_15c = ?, last_dip_time = CURRENT_TIMESTAMP
        WHERE tank_id = ?
      `).bind(Number(receivedQty), Number(receivedQty), convertedDensity15C, tankId).run();
    }

    return Response.json({
      success: true,
      decantationId: deliveryId,
      deliveryId,
      invoiceNo,
      tankerTTNo,
      driverName,
      tankId,
      fuelCode,
      invoicedQty: Number(invoicedQty),
      receivedQty: Number(receivedQty),
      shortageLiters,
      shortagePercent,
      convertedDensity15C,
      densityVariance,
      isCompliant,
      status: isCompliant ? "VERIFIED_OK" : "FLAGGED_VARIANCE",
      allowableLossLimitPercent: 0.59,
      timestamp: nowIso
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
