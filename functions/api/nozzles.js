import { normalizeNozzle } from './_dbNormalizer.js';

export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM nozzles ORDER BY nozzle_number ASC"
      ).all();
      const normalized = (results || []).map(normalizeNozzle);
      return Response.json({ success: true, nozzles: normalized, source: "Cloudflare D1 Edge" });
    }

    return Response.json({
      success: true,
      message: "Nozzles Edge API Active",
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

    // Action 1: Update Nozzle Totalizer Meter Reading
    if (action === "UPDATE_METER") {
      const { nozzleId, currentMeter, testingVolume } = body;
      if (!nozzleId || currentMeter === undefined) {
        return Response.json({ success: false, error: "Missing nozzleId or currentMeter" }, { status: 400 });
      }

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE nozzles 
          SET current_reading = ?, testing_vol = COALESCE(?, testing_vol)
          WHERE nozzle_id = ?
        `).bind(Number(currentMeter), testingVolume !== undefined ? Number(testingVolume) : null, nozzleId).run();
      }

      return Response.json({
        success: true,
        action: "UPDATE_METER",
        nozzleId,
        currentMeter: Number(currentMeter),
        updatedAt: new Date().toISOString(),
        edgeNode: request.cf?.colo || "EDGE-LOCAL"
      });
    }

    // Action 2: 5-Liter W&M Stamping Measure Calibration Test (Poured Back into Tank)
    if (action === "RECORD_CALIBRATION") {
      const {
        nozzleId,
        nozzleNumber,
        fuelCode,
        tankId,
        testVolumeL = 5.0,
        varianceMl = 0.0,
        inspector = "Vijay Sharma (Manager)"
      } = body;

      const testId = `CAL-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toISOString().split("T")[0];
      const status = Math.abs(Number(varianceMl)) <= 25.0 ? "PASSED" : "FAILED_NEEDS_CALIBRATION";

      if (env.DB) {
        // Record test in calibration register
        await env.DB.prepare(`
          INSERT INTO calibration_tests (id, date, nozzle_id, nozzle_number, fuel_code, test_measure_volume_l, quantity_dispensed_l, variance_ml, tolerance_ml, status, poured_back_to_tank, inspector)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 25.0, ?, ?, ?)
        `).bind(
          testId,
          dateStr,
          nozzleId,
          nozzleNumber,
          fuelCode,
          Number(testVolumeL),
          Number(testVolumeL),
          Number(varianceMl),
          status,
          tankId || "tank-1",
          inspector
        ).run();

        // Increment testing_vol on nozzle
        await env.DB.prepare(`
          UPDATE nozzles 
          SET testing_vol = testing_vol + ?, current_reading = current_reading + ?
          WHERE nozzle_id = ?
        `).bind(Number(testVolumeL), Number(testVolumeL), nozzleId).run();
      }

      return Response.json({
        success: true,
        action: "RECORD_CALIBRATION",
        testId,
        nozzleId,
        varianceMl: Number(varianceMl),
        status,
        pouredBackToTank: tankId || "Associated Tank",
        message: "5-Liter calibration verified & testing volume credited to zero net sales"
      });
    }

    // Action 3: Set Status / Safety Interlock (e.g., 'DECANTING_LOCKED' | 'ACTIVE' | 'CALIBRATION')
    if (action === "SET_STATUS") {
      const { nozzleId, status, tankId } = body;
      if (!status) {
        return Response.json({ success: false, error: "Missing status" }, { status: 400 });
      }

      if (env.DB) {
        if (tankId) {
          // Lock all nozzles connected to this tank during decantation
          await env.DB.prepare(`
            UPDATE nozzles SET status = ? WHERE tank_id = ?
          `).bind(status, tankId).run();
        } else if (nozzleId) {
          await env.DB.prepare(`
            UPDATE nozzles SET status = ? WHERE nozzle_id = ?
          `).bind(status, nozzleId).run();
        }
      }

      return Response.json({
        success: true,
        action: "SET_STATUS",
        target: tankId ? `tank:${tankId}` : `nozzle:${nozzleId}`,
        newStatus: status,
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
