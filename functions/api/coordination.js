// Cloudflare Pages Function: /api/coordination
// Master Forecourt Phasing, Shift Timings, Interlocks, and Operational Workflow Coordinator

export async function onRequestGet(context) {
  try {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeNum = hours * 60 + minutes;

    // Automatic Petroleum Timing & Phasing Engine
    // 06:00 - 06:30 (360 - 390 min): Phase 1 - 06:00 AM Morning Opening & Quality
    // 06:30 - 14:00 (390 - 840 min): Phase 2 - Shift 1 Forecourt Sales & Mid-Shift Cash Drop
    // 14:00 - 14:30 (840 - 870 min): Phase 4A - Shift 1 Handover & Cash Reconciliation
    // 14:30 - 22:00 (870 - 1320 min): Phase 2B - Shift 2 Forecourt Sales
    // 22:00 - 22:30 (1320 - 1350 min): Phase 4B - Shift 2 Handover & Night Attendant Change
    // 22:30 - 23:59 (1350 - 1440 min): Phase 5 - EOD Day Book, Wet-Stock Dip Reconciliation & CA Tax
    // 00:00 - 06:00 (0 - 360 min): Phase 2C - Shift 3 Night Forecourt Guard & Low-Light Sales

    let activePhaseId = 2;
    let phaseName = "Phase 2: Shift Forecourt Dispensing & Cash Drop";
    let nextPhaseName = "Phase 4: Shift Handover & Cash Reconciliation";
    let nextPhaseTime = "14:00 PM";

    if (timeNum >= 360 && timeNum < 390) {
      activePhaseId = 1;
      phaseName = "Phase 1: 06:00 AM Statutory Quality & Opening";
      nextPhaseName = "Phase 2: Shift 1 Forecourt Dispensing";
      nextPhaseTime = "06:30 AM";
    } else if (timeNum >= 840 && timeNum < 870) {
      activePhaseId = 4;
      phaseName = "Phase 4: Shift-1 Handover & Dual Cash Sign-off";
      nextPhaseName = "Phase 2: Shift-2 Afternoon Dispensing";
      nextPhaseTime = "14:30 PM";
    } else if (timeNum >= 1320 && timeNum < 1350) {
      activePhaseId = 4;
      phaseName = "Phase 4: Shift-2 Handover & Night Attendant Sign-off";
      nextPhaseName = "Phase 5: EOD Day Book & Wet-Stock Audit";
      nextPhaseTime = "22:30 PM";
    } else if (timeNum >= 1350 && timeNum < 1440) {
      activePhaseId = 5;
      phaseName = "Phase 5: EOD Day Book, Tank Reconciliation & CA Tax";
      nextPhaseName = "Phase 2: Night Shift Guard Operations";
      nextPhaseTime = "00:00 AM";
    }

    return Response.json({
      success: true,
      forecourtClock: now.toLocaleTimeString(),
      activePhaseId,
      phaseName,
      nextPhaseName,
      nextPhaseTime,
      standards: {
        densityReference: "15°C ASTM 53B",
        densityTolerance: "±3.0 kg/m³",
        permissibleLoss: "0.59%",
        settlingTimeMinutes: 15
      },
      coordinationStatus: "SYNCHRONIZED_EDGE",
      timestamp: now.toISOString()
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

    // Action 1: Trigger Tanker Decantation Safety Interlock
    if (action === "TRIGGER_DECANTATION_LOCK") {
      const { tankId, tankerTTNo, invoiceNo } = body;
      if (env.DB && tankId) {
        // Lock nozzles connected to this tank
        await env.DB.prepare(
          "UPDATE nozzles SET status = 'DECANTING_LOCKED' WHERE tank_id = ?"
        ).bind(tankId).run();
      }

      return Response.json({
        success: true,
        action: "TRIGGER_DECANTATION_LOCK",
        tankId,
        tankerTTNo,
        status: "LOCKED_DECANTING",
        settlingMinutesRequired: 15,
        safetyNotice: "Forecourt dispensing paused on connected nozzles to prevent aerated sediment delivery.",
        timestamp: new Date().toISOString()
      });
    }

    // Action 2: Release Decantation Safety Interlock
    if (action === "RELEASE_DECANTATION_LOCK") {
      const { tankId } = body;
      if (env.DB && tankId) {
        // Restore nozzles to IDLE / ACTIVE
        await env.DB.prepare(
          "UPDATE nozzles SET status = 'IDLE' WHERE tank_id = ?"
        ).bind(tankId).run();
      }

      return Response.json({
        success: true,
        action: "RELEASE_DECANTATION_LOCK",
        tankId,
        status: "ACTIVE",
        message: "Settling period complete. Forecourt nozzles restored to active dispensing.",
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
