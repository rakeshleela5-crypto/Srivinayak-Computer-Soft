// Cloudflare Pages Helper: Dual-Key Schema Normalizer
// Bridges SQLite snake_case database columns and React camelCase property models seamlessly

export function normalizeTank(row) {
  if (!row) return null;
  const id = row.tank_id || row.id;
  const fuelCode = row.fuel_code || row.fuel_type || row.fuelCode || 'MS';
  const fuelName = row.fuel_name || row.fuelName || (fuelCode === 'MS' ? 'Petrol (MS-91)' : fuelCode === 'HSD' ? 'Diesel (HSD)' : fuelCode);
  const currentStock = Number(row.current_stock ?? row.currentStock ?? 0);
  const capacity = Number(row.capacity ?? 0);
  const deadStock = Number(row.dead_stock ?? row.deadStock ?? 0);
  const reorderLevel = Number(row.reorder_level ?? row.reorderLevel ?? 0);
  const atgLevel = Number(row.atg_level ?? row.atgLevel ?? currentStock);
  const physicalDipMm = Number(row.physical_dip_mm ?? row.physicalDipMm ?? 0);
  const density15C = Number(row.density_15c ?? row.densityAt15C ?? 0);
  const waterBottomMm = Number(row.water_bottom_mm ?? row.waterBottomMm ?? 0);

  return {
    ...row,
    id,
    tank_id: id,
    tankId: id,
    tank_number: row.tank_number || row.tankNumber,
    tankNumber: row.tank_number || row.tankNumber,
    fuel_code: fuelCode,
    fuelCode,
    fuel_type: fuelCode,
    fuelType: fuelCode,
    fuel_name: fuelName,
    fuelName,
    capacity,
    current_stock: currentStock,
    currentStock,
    dead_stock: deadStock,
    deadStock,
    reorder_level: reorderLevel,
    reorderLevel,
    atg_level: atgLevel,
    atgLevel,
    physical_dip_mm: physicalDipMm,
    physicalDipMm,
    diameter_mm: Number(row.diameter_mm ?? row.diameterMm ?? 2500),
    diameterMm: Number(row.diameter_mm ?? row.diameterMm ?? 2500),
    length_mm: Number(row.length_mm ?? row.lengthMm ?? 5000),
    lengthMm: Number(row.length_mm ?? row.lengthMm ?? 5000),
    temperature_c: Number(row.temperature_c ?? row.temperatureC ?? 28.0),
    temperatureC: Number(row.temperature_c ?? row.temperatureC ?? 28.0),
    density_observed: Number(row.density_observed ?? row.densityObserved ?? density15C),
    densityObserved: Number(row.density_observed ?? row.densityObserved ?? density15C),
    density_15c: density15C,
    densityAt15C: density15C,
    water_bottom_mm: waterBottomMm,
    waterBottomMm,
    last_dip_time: row.last_dip_time || row.lastDipTime || '06:00 AM',
    lastDipTime: row.last_dip_time || row.lastDipTime || '06:00 AM'
  };
}

export function normalizeNozzle(row) {
  if (!row) return null;
  const id = row.nozzle_id || row.id;
  const fuelCode = row.fuel_code || row.fuel_type || row.fuelCode || 'MS';
  const currentMeter = Number(row.current_reading ?? row.currentMeter ?? row.current_meter ?? 0);
  const openingMeter = Number(row.opening_meter ?? row.openingMeter ?? 0);
  const testingVolume = Number(row.testing_vol ?? row.testingVolume ?? row.testing_volume ?? 0);
  const rate = Number(row.rate ?? 0);

  return {
    ...row,
    id,
    nozzle_id: id,
    nozzleId: id,
    nozzle_number: row.nozzle_number || row.nozzleNumber,
    nozzleNumber: row.nozzle_number || row.nozzleNumber,
    dispenser_id: row.dispenser_id || row.dispenserId,
    dispenserId: row.dispenser_id || row.dispenserId,
    island: row.island || 'Island 1',
    tank_id: row.tank_id || row.tankId,
    tankId: row.tank_id || row.tankId,
    fuel_code: fuelCode,
    fuelCode,
    fuel_type: fuelCode,
    fuelType: fuelCode,
    fuel_name: row.fuel_name || row.fuelName || (fuelCode === 'MS' ? 'Petrol (MS-91)' : 'Diesel (HSD)'),
    fuelName: row.fuel_name || row.fuelName || (fuelCode === 'MS' ? 'Petrol (MS-91)' : 'Diesel (HSD)'),
    opening_meter: openingMeter,
    openingMeter,
    current_reading: currentMeter,
    current_meter: currentMeter,
    currentMeter,
    testing_vol: testingVolume,
    testing_volume: testingVolume,
    testingVolume,
    rate,
    status: row.status || 'IDLE',
    flow_rate: Number(row.flow_rate ?? row.flowRate ?? 40),
    flowRate: Number(row.flow_rate ?? row.flowRate ?? 40)
  };
}

export function normalizeTransaction(row) {
  if (!row) return null;
  const id = row.txn_id || row.id;
  const receiptNo = row.receipt_no || row.receiptNo;
  const liters = Number(row.liters ?? 0);
  const rate = Number(row.rate ?? 0);
  const totalAmount = Number(row.total_amount ?? row.totalAmount ?? (liters * rate));
  const fuelAmount = Number(row.fuel_amount ?? row.fuelAmount ?? totalAmount);
  const cashAdvance = Number(row.cash_advance ?? row.cashAdvance ?? 0);

  let lubeItems = [];
  try {
    if (typeof row.lube_items_json === 'string') {
      lubeItems = JSON.parse(row.lube_items_json);
    } else if (Array.isArray(row.lubeItems)) {
      lubeItems = row.lubeItems;
    }
  } catch {
    lubeItems = [];
  }

  return {
    ...row,
    id,
    txn_id: id,
    txnId: id,
    receipt_no: receiptNo,
    receiptNo,
    shift_id: row.shift_id || row.shiftId,
    shiftId: row.shift_id || row.shiftId,
    nozzle_id: row.nozzle_id || row.nozzleId,
    nozzleId: row.nozzle_id || row.nozzleId,
    nozzle_number: row.nozzle_number || row.nozzleNumber,
    nozzleNumber: row.nozzle_number || row.nozzleNumber,
    fuel_code: row.fuel_code || row.fuel_type || row.fuelCode || 'MS',
    fuelCode: row.fuel_code || row.fuel_type || row.fuelCode || 'MS',
    fuel_name: row.fuel_name || row.fuelName,
    fuelName: row.fuel_name || row.fuelName,
    liters,
    rate,
    fuel_amount: fuelAmount,
    fuelAmount,
    lube_items: lubeItems,
    lubeItems,
    lube_amount: Number(row.lube_amount ?? row.lubeAmount ?? 0),
    lubeAmount: Number(row.lube_amount ?? row.lubeAmount ?? 0),
    cash_advance: cashAdvance,
    cashAdvance,
    discount_amount: Number(row.discount_amount ?? row.discountAmount ?? 0),
    discountAmount: Number(row.discount_amount ?? row.discountAmount ?? 0),
    total_amount: totalAmount,
    totalAmount,
    payment_mode: row.payment_mode || row.paymentMode || 'CASH',
    paymentMode: row.payment_mode || row.paymentMode || 'CASH',
    customer_vehicle: row.customer_vehicle || row.customerVehicle || 'WALK-IN',
    customerVehicle: row.customer_vehicle || row.customerVehicle || 'WALK-IN',
    customer_name: row.customer_name || row.customerName || 'Retail Customer',
    customerName: row.customer_name || row.customerName || 'Retail Customer',
    customer_id: row.customer_id || row.creditAccountId || null,
    creditAccountId: row.customer_id || row.creditAccountId || null,
    slip_no: row.slip_no || row.slipNo || null,
    slipNo: row.slip_no || row.slipNo || null,
    driver_name: row.driver_name || row.driverName || null,
    driverName: row.driver_name || row.driverName || null,
    attendant: row.attendant || 'Vijay Sharma',
    status: row.status || 'COMPLETED',
    sync_status: row.sync_status || row.syncStatus || 'SYNCED',
    syncStatus: row.sync_status || row.syncStatus || 'SYNCED',
    timestamp: row.timestamp || new Date().toISOString()
  };
}

export function normalizeShift(row) {
  if (!row) return null;
  const id = row.shift_id || row.id;
  return {
    ...row,
    id,
    shift_id: id,
    shiftId: id,
    shift_number: row.shift_number || row.shiftNumber,
    shiftNumber: row.shift_number || row.shiftNumber,
    supervisor: row.supervisor || 'Vijay Sharma',
    attendant_id: row.attendant_id || row.attendantId,
    attendantId: row.attendant_id || row.attendantId,
    start_time: row.start_time || row.startTime,
    startTime: row.start_time || row.startTime,
    end_time: row.end_time || row.endTime,
    endTime: row.end_time || row.endTime,
    cash_collected: Number(row.cash_collected ?? row.cashCollected ?? 0),
    cashCollected: Number(row.cash_collected ?? row.cashCollected ?? 0),
    card_collected: Number(row.card_collected ?? row.cardCollected ?? 0),
    cardCollected: Number(row.card_collected ?? row.cardCollected ?? 0),
    upi_collected: Number(row.upi_collected ?? row.upiCollected ?? 0),
    upiCollected: Number(row.upi_collected ?? row.upiCollected ?? 0),
    credit_issued: Number(row.credit_issued ?? row.creditIssued ?? 0),
    creditIssued: Number(row.credit_issued ?? row.creditIssued ?? 0),
    driver_kharcha_disbursed: Number(row.driver_kharcha_disbursed ?? row.driverKharchaDisbursed ?? 0),
    driverKharchaDisbursed: Number(row.driver_kharcha_disbursed ?? row.driverKharchaDisbursed ?? 0),
    expenses: Number(row.expenses ?? 0),
    status: row.status || 'ACTIVE'
  };
}

export function normalizeCreditAccount(row) {
  if (!row) return null;
  const id = row.customer_id || row.id;
  return {
    ...row,
    id,
    customer_id: id,
    customerId: id,
    company_name: row.company_name || row.companyName,
    companyName: row.company_name || row.companyName,
    contact_person: row.contact_person || row.contactPerson,
    contactPerson: row.contact_person || row.contactPerson,
    phone: row.phone,
    gstin: row.gstin,
    credit_limit: Number(row.credit_limit ?? row.creditLimit ?? 0),
    creditLimit: Number(row.credit_limit ?? row.creditLimit ?? 0),
    current_balance: Number(row.current_balance ?? row.currentBalance ?? 0),
    currentBalance: Number(row.current_balance ?? row.currentBalance ?? 0),
    status: row.status || 'ACTIVE',
    billing_cycle: row.billing_cycle || row.billingCycle || 'Monthly',
    billingCycle: row.billing_cycle || row.billingCycle || 'Monthly',
    hard_lock_enabled: Boolean(row.hard_lock_enabled ?? row.hardLockEnabled ?? true),
    hardLockEnabled: Boolean(row.hard_lock_enabled ?? row.hardLockEnabled ?? true),
    allow_cash_advance: Boolean(row.allow_cash_advance ?? row.allowCashAdvance ?? true),
    allowCashAdvance: Boolean(row.allow_cash_advance ?? row.allowCashAdvance ?? true),
    max_cash_advance: Number(row.max_cash_advance ?? row.maxCashAdvance ?? 2000),
    maxCashAdvance: Number(row.max_cash_advance ?? row.maxCashAdvance ?? 2000),
    discount_per_liter: Number(row.discount_per_liter ?? row.discountPerLiter ?? 0),
    discountPerLiter: Number(row.discount_per_liter ?? row.discountPerLiter ?? 0)
  };
}

export function normalizeDigitalIndent(row) {
  if (!row) return null;
  const id = row.id || row.indent_id;
  return {
    ...row,
    id,
    indent_number: row.indent_number || row.indentNumber,
    indentNumber: row.indent_number || row.indentNumber,
    fleet_id: row.fleet_id || row.fleetId,
    fleetId: row.fleet_id || row.fleetId,
    company_name: row.company_name || row.companyName,
    companyName: row.company_name || row.companyName,
    vehicle_plate: row.vehicle_plate || row.vehiclePlate,
    vehiclePlate: row.vehicle_plate || row.vehiclePlate,
    driver_name: row.driver_name || row.driverName,
    driverName: row.driver_name || row.driverName,
    driver_phone: row.driver_phone || row.driverPhone,
    driverPhone: row.driver_phone || row.driverPhone,
    fuel_code: row.fuel_code || row.fuelCode || 'HSD',
    fuelCode: row.fuel_code || row.fuelCode || 'HSD',
    fuel_name: row.fuel_name || row.fuelName || 'High Speed Diesel',
    fuelName: row.fuel_name || row.fuelName || 'High Speed Diesel',
    max_liters: Number(row.max_liters ?? row.maxLiters ?? 100),
    maxLiters: Number(row.max_liters ?? row.maxLiters ?? 100),
    max_amount: Number(row.max_amount ?? row.maxAmount ?? 0),
    maxAmount: Number(row.max_amount ?? row.maxAmount ?? 0),
    cash_advance_kharcha: Number(row.cash_advance_kharcha ?? row.cashAdvanceKharcha ?? 0),
    cashAdvanceKharcha: Number(row.cash_advance_kharcha ?? row.cashAdvanceKharcha ?? 0),
    security_pin: row.security_pin || row.securityPin,
    securityPin: row.security_pin || row.securityPin,
    qr_payload: row.qr_payload || row.qrPayload,
    qrPayload: row.qr_payload || row.qrPayload,
    status: row.status || 'ACTIVE',
    redeemed_receipt: row.redeemed_receipt || row.redeemedReceipt,
    redeemedReceipt: row.redeemed_receipt || row.redeemedReceipt,
    created_at: row.created_at || row.createdAt,
    createdAt: row.created_at || row.createdAt,
    expires_at: row.expires_at || row.expiresAt,
    expiresAt: row.expires_at || row.expiresAt,
    notes: row.notes || 'Digital Fleet Indent Slip'
  };
}

export function normalizeDecantation(row) {
  if (!row) return null;
  const id = row.delivery_id || row.id || row.decantation_id;
  return {
    ...row,
    id,
    delivery_id: id,
    invoice_no: row.invoice_no || row.invoiceNo,
    invoiceNo: row.invoice_no || row.invoiceNo,
    tanker_tt_no: row.tanker_tt_no || row.tankerTTNo,
    tankerTTNo: row.tanker_tt_no || row.tankerTTNo,
    driver_name: row.driver_name || row.driverName,
    driverName: row.driver_name || row.driverName,
    tank_id: row.tank_id || row.tankId,
    tankId: row.tank_id || row.tankId,
    fuel_code: row.fuel_code || row.fuelCode || 'MS',
    fuelCode: row.fuel_code || row.fuelCode || 'MS',
    fuel_name: row.fuel_name || row.fuelName,
    fuelName: row.fuel_name || row.fuelName,
    invoiced_qty: Number(row.invoiced_qty ?? row.invoicedQty ?? 0),
    invoicedQty: Number(row.invoiced_qty ?? row.invoicedQty ?? 0),
    received_qty: Number(row.received_qty ?? row.receivedQty ?? 0),
    receivedQty: Number(row.received_qty ?? row.receivedQty ?? 0),
    shortage_liters: Number(row.shortage_liters ?? row.shortageLiters ?? 0),
    shortageLiters: Number(row.shortage_liters ?? row.shortageLiters ?? 0),
    shortage_percent: Number(row.shortage_percent ?? row.shortagePercent ?? 0),
    shortagePercent: Number(row.shortage_percent ?? row.shortagePercent ?? 0),
    invoice_density_15c: Number(row.invoice_density_15c ?? row.invoiceDensityAt15C ?? 0),
    invoiceDensityAt15C: Number(row.invoice_density_15c ?? row.invoiceDensityAt15C ?? 0),
    observed_temp_c: Number(row.observed_temp_c ?? row.observedTempC ?? 0),
    observedTempC: Number(row.observed_temp_c ?? row.observedTempC ?? 0),
    observed_density: Number(row.observed_density ?? row.observedDensity ?? 0),
    observedDensity: Number(row.observed_density ?? row.observedDensity ?? 0),
    converted_density_15c: Number(row.converted_density_15c ?? row.convertedDensityAt15C ?? 0),
    convertedDensityAt15C: Number(row.converted_density_15c ?? row.convertedDensityAt15C ?? 0),
    density_variance: Number(row.density_variance ?? row.densityVariance ?? 0),
    densityVariance: Number(row.density_variance ?? row.densityVariance ?? 0),
    status: row.status || 'VERIFIED_OK',
    verified_by: row.verified_by || row.verifiedBy,
    verifiedBy: row.verified_by || row.verifiedBy,
    date: row.delivery_date || row.date || new Date().toISOString()
  };
}

// Generic Dual-Key Row Normalizer
export function normalizeDbRow(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = { ...row };
  for (const [key, val] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
    if (camelKey !== key && !(camelKey in normalized)) {
      normalized[camelKey] = val;
    }
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (snakeKey !== key && !(snakeKey in normalized)) {
      normalized[snakeKey] = val;
    }
  }
  return normalized;
}

export function normalizeDbRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeDbRow);
}
