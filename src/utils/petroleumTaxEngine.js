// Shree Vinayaka PetroSoft AI Shiva - Petroleum Tax & Compliance Engine
// Implements OMC LFR (License Fee Recovery), TDS 194C/194J, Section 194Q (0.1%), and Dealer Margins

export const DEFAULT_DEALER_MARGINS = {
  MS: 3.82,    // ₹3.82 per Liter (Motor Spirit)
  XP95: 4.25,  // ₹4.25 per Liter (Extra Premium)
  HSD: 2.60,   // ₹2.60 per Liter (High Speed Diesel)
  CNG: 3.20,   // ₹3.20 per Kg
  EV: 2.50,    // ₹2.50 per kWh
  LUBES_MARGIN_PCT: 22.0 // 22% gross retail margin on lubricants
};

export const DEFAULT_LFR_RATES = {
  MS: 460.00,  // ₹460.00 per KL (A-Site/CC benchmark)
  XP95: 480.00, // ₹480.00 per KL
  HSD: 390.00  // ₹390.00 per KL
};

/**
 * Calculate OMC LFR (License Fee Recovery) and associated TDS for a given volume
 * @param {Object} volumeLiters - { MS: number, HSD: number, XP95: number }
 * @param {Object} customLfrRates - Optional override for LFR rates
 */
export function calculateLfrRecovery(volumeLiters = {}, customLfrRates = DEFAULT_LFR_RATES) {
  const msKl = (volumeLiters.MS || 0) / 1000;
  const xp95Kl = (volumeLiters.XP95 || 0) / 1000;
  const hsdKl = (volumeLiters.HSD || 0) / 1000;
  const totalKl = msKl + xp95Kl + hsdKl;

  const msLfr = msKl * (customLfrRates.MS || 460);
  const xp95Lfr = xp95Kl * (customLfrRates.XP95 || 480);
  const hsdLfr = hsdKl * (customLfrRates.HSD || 390);
  const baseLfrTotal = msLfr + xp95Lfr + hsdLfr;

  // OMC charges 18% GST on LFR license charges
  const gstOnLfr = baseLfrTotal * 0.18;
  const totalLfrWithGst = baseLfrTotal + gstOnLfr;

  // Section 194I / 194C TDS on OMC premises / recovery if applicable (typically 10% on plant/machinery or 2% on equipment)
  const tds10Percent = baseLfrTotal * 0.10;
  const tds2Percent = baseLfrTotal * 0.02;

  return {
    volumesKl: {
      MS: Number(msKl.toFixed(3)),
      XP95: Number(xp95Kl.toFixed(3)),
      HSD: Number(hsdKl.toFixed(3)),
      total: Number(totalKl.toFixed(3))
    },
    lfrRates: customLfrRates,
    baseLfr: {
      MS: Number(msLfr.toFixed(2)),
      XP95: Number(xp95Lfr.toFixed(2)),
      HSD: Number(hsdLfr.toFixed(2)),
      total: Number(baseLfrTotal.toFixed(2))
    },
    gst18: Number(gstOnLfr.toFixed(2)),
    totalLfrWithGst: Number(totalLfrWithGst.toFixed(2)),
    tdsApplicable: {
      rate10: Number(tds10Percent.toFixed(2)),
      rate2: Number(tds2Percent.toFixed(2))
    }
  };
}

/**
 * Section 194Q TDS (0.1%) Statutory Purchase Tax Audit Calculator
 * Law: Buyer with turnover > ₹10 Cr must deduct 0.1% TDS on purchases > ₹50 Lakhs from any seller (OMC)
 */
export function calculateSection194Q({
  cumulativeFyPurchases = 18450000, // YTD OMC fuel purchases
  currentInvoiceAmount = 0,
  thresholdLimit = 5000000, // ₹50 Lakhs statutory limit
  isPanCompliant = true
}) {
  const prevPurchases = cumulativeFyPurchases;
  const newCumulativePurchases = prevPurchases + currentInvoiceAmount;
  const isThresholdCrossed = newCumulativePurchases > thresholdLimit;

  // Exemption limit remaining
  const remainingExemption = Math.max(0, thresholdLimit - prevPurchases);

  // Eligible purchase value subject to 194Q
  let taxablePurchaseUnder194Q = 0;
  if (prevPurchases >= thresholdLimit) {
    taxablePurchaseUnder194Q = currentInvoiceAmount;
  } else if (newCumulativePurchases > thresholdLimit) {
    taxablePurchaseUnder194Q = newCumulativePurchases - thresholdLimit;
  }

  const tdsRate = isPanCompliant ? 0.001 : 0.05; // 0.1% normal, 5% if PAN not furnished u/s 206AA
  const tdsDeductibleCurrent = taxablePurchaseUnder194Q * tdsRate;
  
  // Total cumulative 194Q TDS YTD
  const cumulativeTaxableYtd = Math.max(0, newCumulativePurchases - thresholdLimit);
  const cumulativeTdsYtd = cumulativeTaxableYtd * tdsRate;

  return {
    thresholdLimit,
    prevPurchases: Number(prevPurchases.toFixed(2)),
    currentInvoiceAmount: Number(currentInvoiceAmount.toFixed(2)),
    newCumulativePurchases: Number(newCumulativePurchases.toFixed(2)),
    isThresholdCrossed,
    remainingExemption: Number(remainingExemption.toFixed(2)),
    taxablePurchaseUnder194Q: Number(taxablePurchaseUnder194Q.toFixed(2)),
    tdsRatePct: isPanCompliant ? 0.1 : 5.0,
    tdsDeductibleCurrent: Number(tdsDeductibleCurrent.toFixed(2)),
    cumulativeTaxableYtd: Number(cumulativeTaxableYtd.toFixed(2)),
    cumulativeTdsYtd: Number(cumulativeTdsYtd.toFixed(2)),
    section: "194Q",
    challanType: "ITNS 281",
    tcs206C1HApplies: false, // Proviso to 206C(1H): TCS not applicable if buyer deducts TDS u/s 194Q
    statutoryNote: "Section 194Q mandates 0.1% TDS on aggregate purchase exceeding ₹50,00,000 from OMC (IOCL). OMC cannot levy Section 206C(1H) TCS."
  };
}

/**
 * Calculate Day-by-Day Dealer Margin and Net Forecourt Profit
 */
export function calculateDealerProfitAndMargin({
  fuelVolumes = { MS: 0, XP95: 0, HSD: 0, CNG: 0, EV: 0 },
  fuelMargins = DEFAULT_DEALER_MARGINS,
  lubesSalesAmount = 0,
  lubeMarginPct = DEFAULT_DEALER_MARGINS.LUBES_MARGIN_PCT,
  forecourtExpenses = 0,
  attendantShortages = 0,
  transporterDiscountsGiven = 0,
  lfrCost = 0
}) {
  const msMarginEarned = (fuelVolumes.MS || 0) * (fuelMargins.MS || 3.82);
  const xp95MarginEarned = (fuelVolumes.XP95 || 0) * (fuelMargins.XP95 || 4.25);
  const hsdMarginEarned = (fuelVolumes.HSD || 0) * (fuelMargins.HSD || 2.60);
  const cngMarginEarned = (fuelVolumes.CNG || 0) * (fuelMargins.CNG || 3.20);
  const evMarginEarned = (fuelVolumes.EV || 0) * (fuelMargins.EV || 2.50);

  const totalFuelMarginEarned = msMarginEarned + xp95MarginEarned + hsdMarginEarned + cngMarginEarned + evMarginEarned;
  const lubesMarginEarned = lubesSalesAmount * (lubeMarginPct / 100);

  const grossDealerMargin = totalFuelMarginEarned + lubesMarginEarned;

  // Total Operating Deductions
  const totalDeductions = forecourtExpenses + attendantShortages + transporterDiscountsGiven + lfrCost;

  // Net Profit for the dealer
  const netDealerProfit = grossDealerMargin - totalDeductions;

  // Total Fuel Liters
  const totalFuelVolumeLiters = (fuelVolumes.MS || 0) + (fuelVolumes.XP95 || 0) + (fuelVolumes.HSD || 0) + (fuelVolumes.CNG || 0);
  
  // Blended Net Margin per Liter
  const blendedNetMarginPerLiter = totalFuelVolumeLiters > 0 
    ? Number((netDealerProfit / totalFuelVolumeLiters).toFixed(2))
    : 0;

  return {
    fuelMarginsEarned: {
      MS: Number(msMarginEarned.toFixed(2)),
      XP95: Number(xp95MarginEarned.toFixed(2)),
      HSD: Number(hsdMarginEarned.toFixed(2)),
      CNG: Number(cngMarginEarned.toFixed(2)),
      EV: Number(evMarginEarned.toFixed(2)),
      totalFuelMargin: Number(totalFuelMarginEarned.toFixed(2))
    },
    lubesMarginEarned: Number(lubesMarginEarned.toFixed(2)),
    grossDealerMargin: Number(grossDealerMargin.toFixed(2)),
    deductions: {
      forecourtExpenses: Number(forecourtExpenses.toFixed(2)),
      attendantShortages: Number(attendantShortages.toFixed(2)),
      transporterDiscountsGiven: Number(transporterDiscountsGiven.toFixed(2)),
      lfrCost: Number(lfrCost.toFixed(2)),
      total: Number(totalDeductions.toFixed(2))
    },
    netDealerProfit: Number(netDealerProfit.toFixed(2)),
    totalFuelVolumeLiters: Number(totalFuelVolumeLiters.toFixed(2)),
    blendedNetMarginPerLiter
  };
}
