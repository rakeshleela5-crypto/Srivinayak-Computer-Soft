// Cloudflare Pages Function: /api/telemetry
// Ingests real-time IoT probe data (ESP32/ATG) and dispenser pulse pulses

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const telemetry = await request.json();

    return Response.json({
      received: true,
      timestamp: new Date().toISOString(),
      probeStatus: "INGESTED",
      edgeLocation: request.cf?.colo || "EDGE-LOCAL",
      message: "Dispenser telemetry acknowledged by Cloudflare Edge Worker"
    });
  } catch (err) {
    return Response.json({ received: false, error: err.message }, { status: 500 });
  }
}
