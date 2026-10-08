// Shree Vinayaka PetroSoft AI Shiva - Tally Prime XML & CA Data Export Engine
// Generates standard Tally Prime XML for 1-click accounting import and CA audit CSV registers

/**
 * Format date to YYYYMMDD for Tally XML
 */
function toTallyDate(dateStr) {
  if (!dateStr) return '20261008';
  const clean = dateStr.replace(/-/g, '').slice(0, 8);
  return clean;
}

/**
 * Clean string for XML output
 */
function escapeXml(unsafe = '') {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generate full Tally Prime standard XML envelope
 */
export function generateTallyPrimeXml(arg1 = {}, arg2 = {}) {
  let stationInfo = {};
  let transactions = [];
  let decantations = [];
  let fleetAccounts = [];
  let currentShift = {};
  let forecourtExpenses = [];
  let date = '2026-10-08';

  if (Array.isArray(arg1)) {
    transactions = arg1;
    stationInfo = (typeof arg2 === 'object' && arg2 !== null) ? arg2 : {};
  } else if (typeof arg1 === 'object' && arg1 !== null) {
    stationInfo = arg1.stationInfo || {};
    transactions = arg1.transactions || [];
    decantations = arg1.decantations || [];
    fleetAccounts = arg1.fleetAccounts || [];
    currentShift = arg1.currentShift || {};
    forecourtExpenses = arg1.forecourtExpenses || [];
    date = arg1.date || '2026-10-08';
  }

  const companyName = (stationInfo && stationInfo.name) ? stationInfo.name : 'SHREE VINAYAKA PETROSOFT FUEL JUNCTION';
  const tallyDate = toTallyDate(date);
  let xml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

  // 1. SALES VOUCHERS (One consolidated or voucher per transaction)
  transactions.forEach((txn) => {
    const vDate = toTallyDate(txn.timestamp);
    const partyLedger = txn.paymentMode === 'CREDIT' 
      ? escapeXml(txn.customerName || 'Fleet Debtors')
      : txn.paymentMode === 'CARD'
      ? 'HDFC Bank Card POS'
      : txn.paymentMode === 'UPI'
      ? 'SBI Bank UPI QR'
      : 'Cash in Hand (Forecourt)';

    const salesLedger = txn.fuelCode ? `${txn.fuelCode} Fuel Sales` : 'Motor Spirit Sales';
    const netAmount = Number(txn.totalAmount || 0).toFixed(2);
    const fuelAmount = Number(txn.fuelAmount || 0).toFixed(2);
    const discountAmt = Number(txn.discountAmount || 0).toFixed(2);
    const cashAdvance = Number(txn.cashAdvance || 0).toFixed(2);

    xml += `        <!-- Sales Voucher: ${escapeXml(txn.receiptNo)} -->
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${vDate}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(txn.receiptNo)}</VOUCHERNUMBER>
            <REFERENCE>${escapeXml(txn.id)}</REFERENCE>
            <PARTYLEDGERNAME>${partyLedger}</PARTYLEDGERNAME>
            <NARRATION>Fuel Sale ${escapeXml(txn.customerVehicle || '')} | Nozzle ${escapeXml(txn.nozzleNumber || '')} | ${escapeXml(txn.liters || 0)}L @ ₹${escapeXml(txn.rate || 0)} ${discountAmt > 0 ? `(Rebate: ₹${discountAmt})` : ''} ${cashAdvance > 0 ? `| Driver Kharcha: ₹${cashAdvance}` : ''}</NARRATION>
            
            <!-- Debit: Party or Tender Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${netAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Fuel Sales Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${salesLedger}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${fuelAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;

    // If Contractual Transporter Discount Rebate was applied
    if (Number(discountAmt) > 0) {
      xml += `            <!-- Debit: Transporter Rebate / Discount Allowed -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Transporter Contract Rebates Allowed</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${discountAmt}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    // If Driver Cash Advance (Kharcha) was given
    if (Number(cashAdvance) > 0) {
      xml += `            <!-- Credit: Cash Drawer (Cash handed to driver) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Cash in Hand (Forecourt)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${cashAdvance}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    // If Lubes Included
    if (txn.lubeAmount && Number(txn.lubeAmount) > 0) {
      xml += `            <!-- Credit: Lubricants & Specialties Sales -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Lubricants &amp; Greases Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${Number(txn.lubeAmount).toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
`;
    }

    xml += `          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  // 2. PURCHASE VOUCHERS (Inward Tanker Decantations with Section 194Q TDS deduction)
  decantations.forEach((dec) => {
    const vDate = toTallyDate(dec.date);
    const invoiceNo = escapeXml(dec.invoiceNo || 'INV-DEC');
    const rateEstimate = dec.fuelCode === 'HSD' ? 82.50 : 94.20; // Pre-tax wholesale OMC rate estimate
    const grossPurchaseAmt = (Number(dec.receivedQty || 0) * rateEstimate).toFixed(2);
    // TDS 194Q @ 0.1%
    const tds194q = (Number(grossPurchaseAmt) * 0.001).toFixed(2);
    const netOmcPayable = (Number(grossPurchaseAmt) - Number(tds194q)).toFixed(2);

    xml += `        <!-- Purchase Voucher: TT ${escapeXml(dec.tankerTTNo || '')} -->
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Purchase" ACTION="Create">
            <DATE>${vDate}</DATE>
            <VOUCHERTYPENAME>Purchase</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${invoiceNo}</VOUCHERNUMBER>
            <REFERENCE>${escapeXml(dec.tankerTTNo || '')}</REFERENCE>
            <PARTYLEDGERNAME>Indian Oil Corporation Ltd (OMC)</PARTYLEDGERNAME>
            <NARRATION>Tanker TT Decantation ${escapeXml(dec.tankerTTNo)} | ${escapeXml(dec.fuelName)} ${dec.receivedQty}L | Shortage ${dec.shortageLiters}L | Section 194Q TDS 0.1% Deducted</NARRATION>
            
            <!-- Debit: Fuel Wet-Stock Purchase Account -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(dec.fuelCode)} Wet-Stock Purchase</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${grossPurchaseAmt}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: Indian Oil Corporation Ltd (Net Payable) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Indian Oil Corporation Ltd (OMC)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${netOmcPayable}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Credit: TDS Payable under Section 194Q (0.1%) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>TDS Payable u/s 194Q (0.1% OMC Purchases)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${tds194q}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  // 3. PAYMENT VOUCHERS (Forecourt Expenses)
  forecourtExpenses.forEach((exp) => {
    const vDate = toTallyDate(exp.date);
    const amt = Number(exp.amount || 0).toFixed(2);
    xml += `        <!-- Payment Voucher: Expense ${escapeXml(exp.id)} -->
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Payment" ACTION="Create">
            <DATE>${vDate}</DATE>
            <VOUCHERTYPENAME>Payment</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${escapeXml(exp.id)}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${escapeXml(exp.category || 'Forecourt General Expense')}</PARTYLEDGERNAME>
            <NARRATION>Petty Cash: ${escapeXml(exp.category)} paid to ${escapeXml(exp.paidTo || '')}</NARRATION>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${escapeXml(exp.category || 'Forecourt General Expense')}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amt}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Cash in Hand (Forecourt)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${amt}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
`;
  });

  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
}

/**
 * Generate CA-Ready Sales Register CSV
 */
export function generateCaSalesRegisterCsv(transactions = [], stationInfo = {}) {
  let csv = `CA AUDIT SALES REGISTER - ${stationInfo.name || 'SHREE VINAYAKA PETROSOFT'}\n`;
  csv += `RO Code: ${stationInfo.roCode || ''}, GSTIN: ${stationInfo.gstin || ''}\n`;
  csv += `Export Generated: ${new Date().toLocaleString('en-IN')}\n\n`;

  csv += "Date,Receipt No,Txn ID,Shift,Vehicle No,Customer Name,Credit Account ID,Fuel Code,Rate (Rs),Liters,Fuel Amount (Rs),Contract Rebate (Rs/L),Rebate Total (Rs),Driver Kharcha Cash (Rs),Lubes Amount (Rs),Net Billed (Rs),Payment Mode,Attendant\n";

  transactions.forEach((t) => {
    const date = t.timestamp || '';
    const recNo = t.receiptNo || '';
    const id = t.id || '';
    const shift = t.shiftId || '';
    const veh = (t.customerVehicle || 'WALK-IN').replace(/,/g, ' ');
    const cust = (t.customerName || 'Retail Customer').replace(/,/g, ' ');
    const fleetId = t.creditAccountId || '-';
    const fuel = t.fuelCode || 'MS';
    const rate = Number(t.rate || 0).toFixed(2);
    const ltr = Number(t.liters || 0).toFixed(2);
    const fuelAmt = Number(t.fuelAmount || 0).toFixed(2);
    const rebRate = Number(t.discountPerLiter || 0).toFixed(2);
    const rebTot = Number(t.discountAmount || 0).toFixed(2);
    const kharcha = Number(t.cashAdvance || 0).toFixed(2);
    const lubAmt = Number(t.lubeAmount || 0).toFixed(2);
    const net = Number(t.totalAmount || 0).toFixed(2);
    const mode = t.paymentMode || 'CASH';
    const att = (t.attendant || '').replace(/,/g, ' ');

    csv += `"${date}","${recNo}","${id}","${shift}","${veh}","${cust}","${fleetId}","${fuel}",${rate},${ltr},${fuelAmt},${rebRate},${rebTot},${kharcha},${lubAmt},${net},"${mode}","${att}"\n`;
  });

  return csv;
}

/**
 * Generate CA-Ready Purchase & Section 194Q Register CSV
 */
export function generateCaPurchaseRegisterCsv(decantations = [], stationInfo = {}) {
  let csv = `CA AUDIT INWARD FUEL PURCHASE & SECTION 194Q REGISTER - ${stationInfo.name || 'SHREE VINAYAKA PETROSOFT'}\n`;
  csv += `OMC: Indian Oil Corporation Ltd, Station GSTIN: ${stationInfo.gstin || ''}\n\n`;

  csv += "Date,Invoice No,Tanker TT No,Driver,Fuel Code,Invoiced (L),Received (L),Shortage (L),Est Rate (Rs),Gross Purchase (Rs),Sec 194Q TDS 0.1% (Rs),Net OMC Payable (Rs),Density 15C Invoiced,Density 15C Converted,Status\n";

  decantations.forEach((d) => {
    const rateEst = d.fuelCode === 'HSD' ? 82.50 : 94.20;
    const gross = (Number(d.receivedQty || 0) * rateEst).toFixed(2);
    const tds = (Number(gross) * 0.001).toFixed(2);
    const netPayable = (Number(gross) - Number(tds)).toFixed(2);

    csv += `"${d.date || ''}","${d.invoiceNo || ''}","${d.tankerTTNo || ''}","${(d.driverName || '').replace(/,/g, ' ')}","${d.fuelCode}",${d.invoicedQty},${d.receivedQty},${d.shortageLiters},${rateEst.toFixed(2)},${gross},${tds},${netPayable},${d.invoiceDensityAt15C || ''},${d.convertedDensityAt15C || ''},"${d.status || 'VERIFIED_OK'}"\n`;
  });

  return csv;
}

/**
 * Download file helper in browser
 */
export function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
