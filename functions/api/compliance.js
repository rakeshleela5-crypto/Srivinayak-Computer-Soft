// Cloudflare Pages Function: /api/compliance
// Section 194Q TDS, OMC License Fee Recovery (LFR), ASTM 53B Density Register, and Dealer Margins

export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (env.DB) {
      const morningDensity = await env.DB.prepare(
        "SELECT * FROM morning_density_logs ORDER BY created_at DESC LIMIT 10"
      ).all();

      const dealerMargins = await env.DB.prepare(
        "SELECT * FROM dealer_margins"
      ).all();

      const lfrRates = await env.DB.prepare(
        "SELECT * FROM lfr_rates"
      ).all();

      const densityList = (morningDensity.results || []).map(m => ({
        ...m,
        id: m.id,
        tankId: m.tank_id || m.tankId,
        fuelCode: m.fuel_code || m.fuelCode,
        observedTempC: Number(m.observed_temp_c ?? 28),
        observedDensity: Number(m.observed_density ?? 745),
        convertedDensityAt15C: Number(m.converted_density_15c ?? 750),
        invoiceDensityAt15C: Number(m.invoice_density_15c ?? 750),
        densityVariance: Number(m.density_variance ?? 0),
        dipMm: Number(m.dip_mm ?? 0),
        waterDipMm: Number(m.water_dip_mm ?? 0),
        testedBy: m.tested_by || m.testedBy
      }));

      const marginsMap = {};
      (dealerMargins.results || []).forEach(d => {
        marginsMap[d.fuel_code] = Number(d.margin_per_unit);
      });

      const lfrMap = {};
      (lfrRates.results || []).forEach(l => {
        lfrMap[l.fuel_code] = Number(l.rate_per_kl);
      });

      return Response.json({
        success: true,
        date,
        morningDensityLogs: densityList,
        dealerMargins: marginsMap,
        lfrRates: lfrMap,
        source: "Cloudflare D1 Edge"
      });
    }

    return Response.json({
      success: true,
      date,
      standards: {
        astmReference: "ASTM 53B / 54B Table at 15°C",
        densityTolerance: "±3.0 kg/m³",
        transitLossThreshold: "0.59% permissible limit",
        section194QThreshold: 5000000,
        tdsRatePercent: 0.1
      },
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

    // Action 1: Log Daily 06:00 AM Density & Dip Quality Register
    if (action === "LOG_MORNING_DENSITY") {
      const {
        tankId,
        fuelCode,
        observedTempC,
        observedDensity,
        invoiceDensity15C,
        dipMm = 0,
        waterDipMm = 0,
        testedBy = "Vijay Sharma (Manager)"
      } = body;

      const coeff = fuelCode === 'HSD' ? 0.00075 : 0.00085;
      const deltaT = Number(observedTempC) - 15;
      const converted15 = Number((Number(observedDensity) / (1 - (coeff * deltaT))).toFixed(1));
      const variance = Number((converted15 - Number(invoiceDensity15C)).toFixed(1));
      const status = Math.abs(variance) <= 3.0 ? "WITHIN_TOLERANCE" : "VARIANCE_ALERT";
      const logId = `MDL-${Date.now().toString().slice(-6)}`;
      const logDate = new Date().toISOString().split("T")[0];

      if (env.DB) {
        await env.DB.prepare(`
          INSERT INTO morning_density_logs (id, tank_id, fuel_code, log_date, observed_temp_c, observed_density, converted_density_15c, invoice_density_15c, density_variance, dip_mm, water_dip_mm, status, tested_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          logId,
          tankId,
          fuelCode,
          logDate,
          Number(observedTempC),
          Number(observedDensity),
          converted15,
          Number(invoiceDensity15C),
          variance,
          Number(dipMm),
          Number(waterDipMm),
          status,
          testedBy
        ).run();
      }

      return Response.json({
        success: true,
        action: "LOG_MORNING_DENSITY",
        logId,
        convertedDensity15C: converted15,
        densityVariance: variance,
        status,
        message: "06:00 AM Quality Compliance register entry recorded"
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
