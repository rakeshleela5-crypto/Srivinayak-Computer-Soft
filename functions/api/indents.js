// Cloudflare Pages Function: /api/indents
// High-performance Cloudflare D1 Edge API for B2B Fleet QR Indent Slips

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fleetId = url.searchParams.get("fleetId");
    const status = url.searchParams.get("status") || "ACTIVE";
    const indentNumber = url.searchParams.get("indentNumber");

    if (env.DB) {
      if (indentNumber) {
        const indent = await env.DB.prepare(
          "SELECT * FROM digital_indents WHERE indent_number = ? LIMIT 1"
        ).bind(indentNumber).first();

        return Response.json({ success: true, indent: indent || null });
      }

      let query = "SELECT * FROM digital_indents WHERE 1=1";
      const params = [];

      if (fleetId) {
        query += " AND fleet_id = ?";
        params.push(fleetId);
      }
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      query += " ORDER BY created_at DESC LIMIT 50";

      const stmt = env.DB.prepare(query);
      const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all();

      return Response.json({ success: true, indents: results, source: "Cloudflare D1 Edge" });
    }

    // Edge Mock Fallback if D1 not bound locally
    return Response.json({
      success: true,
      indents: [
        {
          id: "IND-801",
          indent_number: "IND-2026-801",
          fleet_id: "fl-01",
          company_name: "VRL Logistics Ltd",
          vehicle_plate: "KA-01-AB-1234",
          driver_name: "Rajesh Kumar",
          fuel_code: "HSD",
          max_liters: 150,
          security_pin: "4829",
          status: "ACTIVE"
        }
      ],
      source: "Edge Local"
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
      fleetId,
      companyName,
      vehiclePlate,
      driverName,
      driverPhone,
      fuelCode,
      maxLiters,
      maxAmount,
      action // 'CREATE' | 'VERIFY' | 'REDEEM'
    } = body;

    // Action: Redeem
    if (action === "REDEEM" && body.indentId) {
      if (env.DB) {
        await env.DB.prepare(
          "UPDATE digital_indents SET status = 'REDEEMED', redeemed_receipt = ? WHERE id = ?"
        ).bind(body.receiptNo || "REC-POS", body.indentId).run();
      }
      return Response.json({
        success: true,
        message: "Digital indent marked as redeemed",
        indentId: body.indentId,
        redeemedReceipt: body.receiptNo
      });
    }

    // Action: Verify
    if (action === "VERIFY") {
      const pin = body.securityPin;
      const plate = (body.vehiclePlate || "").toUpperCase();

      if (env.DB) {
        const found = await env.DB.prepare(
          "SELECT * FROM digital_indents WHERE vehicle_plate = ? AND security_pin = ? AND status = 'ACTIVE' LIMIT 1"
        ).bind(plate, pin).first();

        if (found) {
          return Response.json({ success: true, verified: true, indent: found });
        }
        return Response.json({ success: false, verified: false, error: "Invalid PIN or expired indent" }, { status: 400 });
      }

      return Response.json({
        success: true,
        verified: true,
        indent: {
          id: "IND-801",
          indent_number: "IND-2026-801",
          vehicle_plate: plate || "KA-01-AB-1234",
          driver_name: "Rajesh Kumar",
          fuel_code: "HSD",
          max_liters: 150,
          status: "ACTIVE"
        }
      });
    }

    // Default Action: Create new Digital Indent
    const now = new Date();
    const id = `IND-${Math.floor(1000 + Math.random() * 9000)}`;
    const indentNumber = `IND-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const securityPin = Math.floor(1000 + Math.random() * 9000).toString();
    const cashAdvanceKharcha = Number(body.cashAdvanceKharcha) || 0;
    const qrPayload = `INDENT|${fleetId}|${(vehiclePlate || "").toUpperCase()}|${fuelCode || "HSD"}|${maxLiters}|${cashAdvanceKharcha}|${securityPin}`;
    const createdAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO digital_indents (id, indent_number, fleet_id, company_name, vehicle_plate, driver_name, driver_phone, fuel_code, max_liters, max_amount, security_pin, qr_payload, status, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
      `).bind(
        id,
        indentNumber,
        fleetId,
        companyName,
        (vehiclePlate || "").toUpperCase(),
        driverName || "Authorized Driver",
        driverPhone || null,
        fuelCode || "HSD",
        Number(maxLiters) || 100,
        Number(maxAmount) || (Number(maxLiters) * 89.75),
        securityPin,
        qrPayload,
        createdAt,
        expiresAt
      ).run();
    }

    return Response.json({
      success: true,
      indent: {
        id,
        indentNumber,
        fleetId,
        companyName,
        vehiclePlate: (vehiclePlate || "").toUpperCase(),
        driverName,
        fuelCode,
        maxLiters,
        cashAdvanceKharcha,
        securityPin,
        qrPayload,
        createdAt,
        expiresAt,
        status: "ACTIVE"
      },
      edgeNode: request.cf?.colo || "EDGE-LOCAL"
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
