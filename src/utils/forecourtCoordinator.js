// Forecourt Phasing & Timing Coordination Engine
// Encodes the 5 petroleum operational phases, chronological timings, and statutory interlocks

export const FORECOURT_PHASES = [
  {
    id: 1,
    code: 'PHASE_1_MORNING_QUALITY',
    name: 'Phase 1: 06:00 AM Statutory Quality & Opening',
    shortName: '06:00 AM Quality & Opening',
    timeWindow: '06:00 AM - 06:30 AM',
    color: '#38bdf8',
    description: 'Mandatory daily density hydrometer test (ASTM 53B 15°C), water bottom paste test, and 5L W&M calibration stamping test.',
    checklist: [
      { id: 'dip_opening', label: 'Opening Physical Brass Dip Recorded', mandatory: true },
      { id: 'water_paste', label: 'Water Finding Paste Check (<5mm water cut)', mandatory: true },
      { id: 'astm_density', label: 'Hydrometer Density at 15°C within ±3.0 kg/m³', mandatory: true },
      { id: 'wm_stamping', label: '5-Liter Stamping Measure Poured Back to Tank', mandatory: true },
      { id: 'meters_locked', label: 'Opening Totalizers Locked for Shift-1', mandatory: true }
    ]
  },
  {
    id: 2,
    code: 'PHASE_2_FORECOURT_DISPENSING',
    name: 'Phase 2: Shift Forecourt Dispensing & Mid-Shift Cash Drop',
    shortName: 'Forecourt Dispensing & Cash Drop',
    timeWindow: '06:30 AM - 14:00 PM (Shift-1) & 14:30 PM - 22:00 PM (Shift-2)',
    color: '#10b981',
    description: 'Active vehicle fuelling, mobile POS billing, digital fleet indent scanning, and routine cash drops to safe.',
    checklist: [
      { id: 'nozzles_active', label: 'Dispenser Nozzles Active & Calibrated', mandatory: true },
      { id: 'digital_indents', label: 'Fleet QR Indents Verified via PIN', mandatory: false },
      { id: 'cash_drops', label: 'Mid-Shift Cash Drops Deposited to Safe', mandatory: true },
      { id: 'lube_tracking', label: '2T/4T Lubricant Sales Recorded', mandatory: false }
    ]
  },
  {
    id: 3,
    code: 'PHASE_3_DECANTATION_INTERLOCK',
    name: 'Phase 3: Tanker TT Decantation Safety Interlock',
    shortName: 'Decantation Safety Interlock',
    timeWindow: 'Dynamic (On Oil Tanker Arrival)',
    color: '#f59e0b',
    description: 'Petroleum tanker decantation: Pre-dip density check, safety lock on connected nozzles, 15-minute settling timer, and 0.59% loss audit.',
    checklist: [
      { id: 'pre_dip_ullage', label: 'Pre-Decantation Dip & Ullage Verified', mandatory: true },
      { id: 'invoice_density', label: 'TT Invoice Density Verified (±3.0 kg/m³)', mandatory: true },
      { id: 'nozzles_locked', label: 'Connected Nozzles Locked (DECANTING_LOCKED)', mandatory: true },
      { id: 'settling_timer', label: '15-Minute Fuel Settling Completed', mandatory: true },
      { id: 'transit_loss', label: 'Transit Loss ≤ 0.59% Permissible Limit', mandatory: true }
    ]
  },
  {
    id: 4,
    code: 'PHASE_4_SHIFT_HANDOVER',
    name: 'Phase 4: Shift Changeover & Dual Cash Sign-off',
    shortName: 'Shift Handover & Reconciliation',
    timeWindow: '14:00 PM - 14:30 PM & 22:00 PM - 22:30 PM',
    color: '#8b5cf6',
    description: 'Nozzle closing meters read, physical cash counted with denomination matrix, and attendant cash shortage recovery logged.',
    checklist: [
      { id: 'closing_meters', label: 'Nozzle Closing Totalizers Captured', mandatory: true },
      { id: 'cash_counted', label: 'Physical Cash Counted via Denominations', mandatory: true },
      { id: 'shortage_flagged', label: 'Cash Variance Audited & Attendant Signed', mandatory: true },
      { id: 'handover_signed', label: 'Outgoing & Incoming Cashier Dual Sign-off', mandatory: true }
    ]
  },
  {
    id: 5,
    code: 'PHASE_5_EOD_SETTLEMENT',
    name: 'Phase 5: 22:00 EOD Day Book & Statutory CA Tax',
    shortName: 'EOD Day Book & CA Tax Audit',
    timeWindow: '22:30 PM - 23:59 PM',
    color: '#ec4899',
    description: 'Daily Settlement Sheet (DSS), Wet-stock loss vs dip reconciliation, Bank remittance generation, and Tally Prime XML export.',
    checklist: [
      { id: 'dss_generated', label: 'Daily Settlement Sheet (DSS) Finalized', mandatory: true },
      { id: 'stock_recon', label: 'Wet-Stock Tank Loss Reconciliation', mandatory: true },
      { id: 'bank_remittance', label: 'Daily Bank Cash Deposit Challan Prepared', mandatory: true },
      { id: 'tax_194q', label: 'Section 194Q TDS Cumulative Purchase Logged', mandatory: true },
      { id: 'tally_exported', label: 'Tally Prime XML Export Ready for CA', mandatory: true }
    ]
  }
];

export function getActivePhaseFromTime(date = new Date()) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMin = hours * 60 + minutes;

  // 06:00 - 06:30 AM
  if (totalMin >= 360 && totalMin < 390) {
    return FORECOURT_PHASES[0];
  }
  // 14:00 - 14:30 PM
  if (totalMin >= 840 && totalMin < 870) {
    return FORECOURT_PHASES[3];
  }
  // 22:00 - 22:30 PM
  if (totalMin >= 1320 && totalMin < 1350) {
    return FORECOURT_PHASES[3];
  }
  // 22:30 - 23:59 PM
  if (totalMin >= 1350 && totalMin < 1440) {
    return FORECOURT_PHASES[4];
  }
  // Default: Phase 2 (Dispensing)
  return FORECOURT_PHASES[1];
}
