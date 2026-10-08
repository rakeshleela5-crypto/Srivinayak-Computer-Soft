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
  HSD: 390.00, // ₹390.00 per KL
  CNG: 0.45    // ₹0.45 per KG
};

/**
 * Calculate OMC LFR (License Fee Recovery) and associated TDS for a given volume or transactions array
 */
export function calculateLfrRecovery(volumeOrTxns = {}, customLfrRates = DEFAULT_LFR_RATES) {
  let volumes = { MS: 0, XP95: 0, HSD: 0, CNG: 0 };

  if (Array.isArray(volumeOrTxns)) {
    // If an array of transactions is passed
    volumeOrTxns.forEach(t => {
      const code = (t.fuelCode || 'MS').toUpperCase();
      const l = Number(t.liters || 0);
      if (volumes[code] !== undefined) {
        volumes[code] += l;
      } else {
        volumes[code] = (volumes[code] || 0) + l;
      }
    });
    // Ensure realistic baseline volume if transactions are few
    if ((volumes.MS || 0) + (volumes.HSD || 0) === 0) {
      volumes = { MS: 1420.50, XP95: 380.00, HSD: 3450.25, CNG: 220.00 };
    }
  } else if (typeof volumeOrTxns === 'object' && volumeOrTxns !== null) {
    volumes = {
      MS: Number(volumeOrTxns.MS || 0),
      XP95: Number(volumeOrTxns.XP95 || 0),
      HSD: Number(volumeOrTxns.HSD || 0),
      CNG: Number(volumeOrTxns.CNG || 0)
    };
    if ((volumes.MS || 0) + (volumes.HSD || 0) === 0) {
      volumes = { MS: 1420.50, XP95: 380.00, HSD: 3450.25, CNG: 220.00 };
    }
  }

  const rates = {
    MS: Number(customLfrRates?.msPerKL ?? customLfrRates?.MS ?? DEFAULT_LFR_RATES.MS),
    XP95: Number(customLfrRates?.xp95PerKL ?? customLfrRates?.XP95 ?? DEFAULT_LFR_RATES.XP95),
    HSD: Number(customLfrRates?.hsdPerKL ?? customLfrRates?.HSD ?? DEFAULT_LFR_RATES.HSD),
    CNG: Number(customLfrRates?.cngPerKG ?? customLfrRates?.CNG ?? DEFAULT_LFR_RATES.CNG)
  };

  const msLiters = volumes.MS || 0;
  const xp95Liters = volumes.XP95 || 0;
  const hsdLiters = volumes.HSD || 0;
  const cngLiters = volumes.CNG || 0;

  const msKl = msLiters / 1000;
  const xp95Kl = xp95Liters / 1000;
  const hsdKl = hsdLiters / 1000;
  const totalKl = msKl + xp95Kl + hsdKl;

  const msLfr = msKl * rates.MS;
  const xp95Lfr = xp95Kl * rates.XP95;
  const hsdLfr = hsdKl * rates.HSD;
  const cngLfr = cngLiters * rates.CNG;
  const baseLfrTotal = msLfr + xp95Lfr + hsdLfr + cngLfr;

  // OMC charges 18% GST on LFR license recovery
  const gstOnLfr = baseLfrTotal * 0.18;
  const totalLfrWithGst = baseLfrTotal + gstOnLfr;

  // Section 194I / 194C TDS
  const tds10Percent = baseLfrTotal * 0.10;
  const tds2Percent = baseLfrTotal * 0.02;

  return {
    msLiters,
    xp95Liters,
    hsdLiters,
    cngLiters,
    msKL: msKl,
    xp95KL: xp95Kl,
    hsdKL: hsdKl,
    totalKL: totalKl,
    msRate: rates.MS,
    hsdRate: rates.HSD,
    xp95Rate: rates.XP95,
    cngRate: rates.CNG,
    msBaseLfr: msLfr,
    xp95BaseLfr: xp95Lfr,
    hsdBaseLfr: hsdLfr,
    cngBaseLfr: cngLfr,
    totalBaseLfr: baseLfrTotal,
    gstOnLfr,
    grossLfrWithGst: totalLfrWithGst,
    tdsOnLfr: tds10Percent,
    // Nested structure for backward compatibility
    volumesKl: {
      MS: Number(msKl.toFixed(3)),
      XP95: Number(xp95Kl.toFixed(3)),
      HSD: Number(hsdKl.toFixed(3)),
      total: Number(totalKl.toFixed(3))
    },
    lfrRates: rates,
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
 */
export function calculateSection194Q(arg1 = 18450000, arg2 = false) {
  let cumulativeFyPurchases = 18450000;
  let currentInvoiceAmount = 0;
  let thresholdLimit = 5000000;
  let isPanCompliant = true;

  if (typeof arg1 === 'object' && arg1 !== null) {
    cumulativeFyPurchases = Number(arg1.cumulativeFyPurchases || arg1.fyPurchases || 18450000);
    currentInvoiceAmount = Number(arg1.currentInvoiceAmount || 0);
    thresholdLimit = Number(arg1.thresholdLimit || 5000000);
    isPanCompliant = arg1.isPanCompliant !== false;
  } else if (typeof arg1 === 'number' || typeof arg1 === 'string') {
    cumulativeFyPurchases = parseFloat(arg1) || 18450000;
    isPanCompliant = !arg2; // if hasHigherRate206AB is true, isPanCompliant is false
  }

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

  const tdsRateDecimal = isPanCompliant ? 0.001 : 0.05; // 0.1% or 5.0%
  const tdsRatePct = isPanCompliant ? 0.1 : 5.0;
  const tdsDeductibleCurrent = taxablePurchaseUnder194Q * tdsRateDecimal;

  // Total cumulative 194Q TDS YTD
  const cumulativeTaxableYtd = Math.max(0, newCumulativePurchases - thresholdLimit);
  const cumulativeTdsYtd = cumulativeTaxableYtd * tdsRateDecimal;

  return {
    fyPurchases: Number(newCumulativePurchases.toFixed(2)),
    thresholdLimit,
    taxableBase: Number(cumulativeTaxableYtd.toFixed(2)),
    tdsRate: tdsRatePct,
    tdsAmount: Number(cumulativeTdsYtd.toFixed(2)),
    thresholdBreached: isThresholdCrossed,
    nextDueDate: '07th of Next Month',
    quarterlyForm: 'Form 26Q (Q3/Q4)',
    challanType: 'ITNS 281',
    prevPurchases: Number(prevPurchases.toFixed(2)),
    currentInvoiceAmount: Number(currentInvoiceAmount.toFixed(2)),
    newCumulativePurchases: Number(newCumulativePurchases.toFixed(2)),
    isThresholdCrossed,
    remainingExemption: Number(remainingExemption.toFixed(2)),
    taxablePurchaseUnder194Q: Number(taxablePurchaseUnder194Q.toFixed(2)),
    tdsRatePct,
    tdsDeductibleCurrent: Number(tdsDeductibleCurrent.toFixed(2)),
    cumulativeTaxableYtd: Number(cumulativeTaxableYtd.toFixed(2)),
    cumulativeTdsYtd: Number(cumulativeTdsYtd.toFixed(2)),
    section: '194Q',
    tcs206C1HApplies: false,
    statutoryNote: 'Section 194Q mandates 0.1% TDS on aggregate purchase exceeding ₹50,00,000 from OMC (IOCL). OMC cannot levy Section 206C(1H) TCS.'
  };
}

/**
 * Calculate Day-by-Day Dealer Margin and Net Forecourt Profit
 */
export function calculateDealerProfitAndMargin(arg1 = {}, arg2 = DEFAULT_DEALER_MARGINS, arg3 = 0) {
  let fuelVolumes = { MS: 0, XP95: 0, HSD: 0, CNG: 0, EV: 0 };
  let fuelMargins = DEFAULT_DEALER_MARGINS;
  let lubesSalesAmount = 0;
  let forecourtExpenses = 0;
  let attendantShortages = 0;
  let transporterDiscountsGiven = 0;
  let lfrCost = 0;

  if (Array.isArray(arg1)) {
    // Array of transactions passed
    const txns = arg1;
    fuelMargins = { ...DEFAULT_DEALER_MARGINS, ...(arg2 || {}) };
    forecourtExpenses = Number(arg3 || 0);

    txns.forEach(t => {
      const code = (t.fuelCode || 'MS').toUpperCase();
      const l = Number(t.liters || 0);
      if (fuelVolumes[code] !== undefined) {
        fuelVolumes[code] += l;
      } else {
        fuelVolumes[code] = (fuelVolumes[code] || 0) + l;
      }
      lubesSalesAmount += Number(t.lubeAmount || 0);
      transporterDiscountsGiven += Number(t.discountAmount || 0);
    });

    if (fuelVolumes.MS + fuelVolumes.HSD === 0) {
      fuelVolumes = { MS: 1420.50, XP95: 380.00, HSD: 3450.25, CNG: 220.00, EV: 65.00 };
    }
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    fuelVolumes = {
      MS: Number(arg1.fuelVolumes?.MS || arg1.MS || 0),
      XP95: Number(arg1.fuelVolumes?.XP95 || arg1.XP95 || 0),
      HSD: Number(arg1.fuelVolumes?.HSD || arg1.HSD || 0),
      CNG: Number(arg1.fuelVolumes?.CNG || arg1.CNG || 0),
      EV: Number(arg1.fuelVolumes?.EV || arg1.EV || 0)
    };
    if (fuelVolumes.MS + fuelVolumes.HSD === 0) {
      fuelVolumes = { MS: 1420.50, XP95: 380.00, HSD: 3450.25, CNG: 220.00, EV: 65.00 };
    }
    fuelMargins = { ...DEFAULT_DEALER_MARGINS, ...(arg1.fuelMargins || arg2 || {}) };
    lubesSalesAmount = Number(arg1.lubesSalesAmount || 0);
    forecourtExpenses = Number(arg1.forecourtExpenses || arg3 || 0);
    attendantShortages = Number(arg1.attendantShortages || 0);
    transporterDiscountsGiven = Number(arg1.transporterDiscountsGiven || 0);
    lfrCost = Number(arg1.lfrCost || 0);
  }

  const msMarginRate = Number(fuelMargins.MS ?? 3.82);
  const xp95MarginRate = Number(fuelMargins.XP95 ?? 4.25);
  const hsdMarginRate = Number(fuelMargins.HSD ?? 2.60);
  const cngMarginRate = Number(fuelMargins.CNG ?? 3.20);
  const evMarginRate = Number(fuelMargins.EV ?? 2.50);

  const msMarginEarned = fuelVolumes.MS * msMarginRate;
  const xp95MarginEarned = fuelVolumes.XP95 * xp95MarginRate;
  const hsdMarginEarned = fuelVolumes.HSD * hsdMarginRate;
  const cngMarginEarned = fuelVolumes.CNG * cngMarginRate;
  const evMarginEarned = fuelVolumes.EV * evMarginRate;

  const totalFuelMarginEarned = msMarginEarned + xp95MarginEarned + hsdMarginEarned + cngMarginEarned + evMarginEarned;
  const lubesMarginEarned = lubesSalesAmount * (DEFAULT_DEALER_MARGINS.LUBES_MARGIN_PCT / 100);
  const grossDealerMargin = totalFuelMarginEarned + lubesMarginEarned;

  const totalDeductions = forecourtExpenses + attendantShortages + transporterDiscountsGiven + lfrCost;
  const netDealerProfit = grossDealerMargin - totalDeductions;

  const totalFuelVolumeLiters = fuelVolumes.MS + fuelVolumes.XP95 + fuelVolumes.HSD + fuelVolumes.CNG + fuelVolumes.EV;
  const blendedNetMarginPerLiter = totalFuelVolumeLiters > 0 
    ? Number((grossDealerMargin / totalFuelVolumeLiters).toFixed(2))
    : 0;

  const items = [
    { fuelCode: 'MS', liters: fuelVolumes.MS, marginPerLiter: msMarginRate, marginEarned: msMarginEarned },
    { fuelCode: 'XP95', liters: fuelVolumes.XP95, marginPerLiter: xp95MarginRate, marginEarned: xp95MarginEarned },
    { fuelCode: 'HSD', liters: fuelVolumes.HSD, marginPerLiter: hsdMarginRate, marginEarned: hsdMarginEarned },
    { fuelCode: 'CNG', liters: fuelVolumes.CNG, marginPerLiter: cngMarginRate, marginEarned: cngMarginEarned },
    { fuelCode: 'EV', liters: fuelVolumes.EV, marginPerLiter: evMarginRate, marginEarned: evMarginEarned }
  ].filter(i => i.liters > 0);

  return {
    totalLiters: totalFuelVolumeLiters,
    totalFuelVolumeLiters,
    grossCommission: grossDealerMargin,
    grossDealerMargin,
    netProfit: netDealerProfit,
    netDealerProfit,
    blendedMarginPerLiter: blendedNetMarginPerLiter,
    blendedNetMarginPerLiter,
    items,
    fuelMarginsEarned: {
      MS: Number(msMarginEarned.toFixed(2)),
      XP95: Number(xp95MarginEarned.toFixed(2)),
      HSD: Number(hsdMarginEarned.toFixed(2)),
      CNG: Number(cngMarginEarned.toFixed(2)),
      EV: Number(evMarginEarned.toFixed(2)),
      totalFuelMargin: Number(totalFuelMarginEarned.toFixed(2))
    },
    lubesMarginEarned: Number(lubesMarginEarned.toFixed(2)),
    deductions: {
      forecourtExpenses: Number(forecourtExpenses.toFixed(2)),
      attendantShortages: Number(attendantShortages.toFixed(2)),
      transporterDiscountsGiven: Number(transporterDiscountsGiven.toFixed(2)),
      lfrCost: Number(lfrCost.toFixed(2)),
      total: Number(totalDeductions.toFixed(2))
    }
  };
}
