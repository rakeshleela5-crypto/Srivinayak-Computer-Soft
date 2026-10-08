// Cloudflare Pages Function: /api/tanks
// Handles underground storage tanks, dip vs ATG telemetry, and tanker decantations

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare("SELECT * FROM tanks").all();
      return Response.json({ success: true, tanks: results });
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

    const {
      invoiceNo,
      tankerTTNo,
      tankId,
      fuelCode,
      invoicedQty,
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

    return Response.json({
      success: true,
      decantationId: `DEC-${Date.now().toString().slice(-6)}`,
      invoiceNo,
      tankerTTNo,
      invoicedQty: Number(invoicedQty),
      receivedQty: Number(receivedQty),
      shortageLiters,
      shortagePercent,
      convertedDensity15C,
      densityVariance,
      isCompliant,
      status: isCompliant ? "VERIFIED_OK" : "FLAGGED_VARIANCE",
      allowableLossLimitPercent: 0.59
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
