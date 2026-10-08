// Cloudflare Pages Function: /api/settlement
// Edge-computed Daily Settlement Sheet (DSS) & Tax Report

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    return Response.json({
      success: true,
      stationName: "SHREE VINAYAKA PETROSOFT FUEL JUNCTION",
      roCode: "IOCL-RO-849201",
      date,
      permissibleLossThresholdPercent: 0.59,
      edgeComputed: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
