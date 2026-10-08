import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Receipt, 
  FileCheck2, 
  Calculator, 
  Download, 
  AlertCircle, 
  Building2, 
  Percent, 
  HelpCircle,
  ExternalLink,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { calculateLfrRecovery, calculateSection194Q, DEFAULT_LFR_RATES } from '../utils/petroleumTaxEngine';

export default function TaxComplianceView() {
  const { 
    stationInfo, 
    transactions, 
    lfrRates, 
    updateLfrRates,
    getLfrAndTdsReport,
    getSection194QReport,
    decantations
  } = useApp();

  // Calculate live decanted inward purchases value
  const decs = Array.isArray(decantations) ? decantations : [];
  const decantedInwardsTotal = decs.reduce((sum, d) => {
    const estRate = d.fuelCode === 'MS' ? 92.50 : 81.20;
    return sum + (Number(d.invoicedQty || 0) * estRate);
  }, 0);
  const baselinePurchases = stationInfo?.fyPurchasesOMC || 18450000;
  const liveTotalPurchases = baselinePurchases + decantedInwardsTotal;

  const [activeTab, setActiveTab] = useState('194Q'); // '194Q' or 'LFR' or '194C'
  const [fyPurchasesInput, setFyPurchasesInput] = useState(liveTotalPurchases);
  const [hasHigherRate206AB, setHasHigherRate206AB] = useState(false);
  const [editingLfr, setEditingLfr] = useState(false);
  const [customLfrRates, setCustomLfrRates] = useState({
    msPerKL: lfrRates?.msPerKL ?? lfrRates?.MS ?? DEFAULT_LFR_RATES.MS,
    hsdPerKL: lfrRates?.hsdPerKL ?? lfrRates?.HSD ?? DEFAULT_LFR_RATES.HSD,
    cngPerKG: lfrRates?.cngPerKG ?? lfrRates?.CNG ?? DEFAULT_LFR_RATES.CNG
  });

  const txns = Array.isArray(transactions) ? transactions : [];
  // Calculate live tax data
  const lfrData = calculateLfrRecovery(txns, customLfrRates);
  const tax194Q = calculateSection194Q(parseFloat(fyPurchasesInput) || 0, hasHigherRate206AB);

  const handleSaveLfrRates = (e) => {
    e.preventDefault();
    if (updateLfrRates) {
      updateLfrRates(customLfrRates);
    }
    setEditingLfr(false);
  };

  const downloadTaxAuditSummary = () => {
    const dealership = stationInfo?.dealership || 'IOCL';
    const roCode = stationInfo?.roCode || 'RO-DEFAULT';
    const gstin = stationInfo?.gstin || '';
    const pan = stationInfo?.pan || '';
    const tan = stationInfo?.tan || '';

    const csvContent = "data:text/csv;charset=utf-8," + 
      `SHREE VINAYAKA PETROSOFT - STATUTORY TAX AUDIT REPORT\n` +
      `Date,${new Date().toISOString().slice(0, 10)}\n` +
      `OMC,${dealership} (${roCode})\n` +
      `GSTIN,${gstin},PAN,${pan},TAN,${tan}\n\n` +
      `--- SECTION 194Q PURCHASE TDS REPORT ---\n` +
      `Cumulative FY Purchases (OMC),Rs. ${Number(tax194Q?.fyPurchases || tax194Q?.newCumulativePurchases || 0).toFixed(2)}\n` +
      `Statutory Threshold Limit,Rs. ${Number(tax194Q?.thresholdLimit || 5000000).toFixed(2)}\n` +
      `Taxable Base for 194Q,Rs. ${Number(tax194Q?.taxableBase || tax194Q?.cumulativeTaxableYtd || 0).toFixed(2)}\n` +
      `Applicable TDS Rate,${tax194Q?.tdsRate || 0.1}%\n` +
      `Total TDS Deducted,Rs. ${Number(tax194Q?.tdsAmount || tax194Q?.cumulativeTdsYtd || 0).toFixed(2)}\n` +
      `TDS Challan Type,${tax194Q?.challanType || 'ITNS 281'} - Minor Head 200\n` +
      `Quarterly Form,${tax194Q?.quarterlyForm || 'Form 26Q'}\n\n` +
      `--- OMC LFR (LICENSE FEE RECOVERY) REPORT ---\n` +
      `Total MS Volume,${Number(lfrData?.msLiters || 0).toFixed(2)} L (${Number(lfrData?.msKL || 0).toFixed(3)} KL) @ Rs. ${lfrData?.msRate || 460}/KL = Rs. ${Number(lfrData?.msBaseLfr || 0).toFixed(2)}\n` +
      `Total HSD Volume,${Number(lfrData?.hsdLiters || 0).toFixed(2)} L (${Number(lfrData?.hsdKL || 0).toFixed(3)} KL) @ Rs. ${lfrData?.hsdRate || 390}/KL = Rs. ${Number(lfrData?.hsdBaseLfr || 0).toFixed(2)}\n` +
      `Total Base LFR Recovery,Rs. ${Number(lfrData?.totalBaseLfr || 0).toFixed(2)}\n` +
      `GST @ 18% on LFR,Rs. ${Number(lfrData?.gstOnLfr || 0).toFixed(2)}\n` +
      `Gross LFR Invoice Deduction,Rs. ${Number(lfrData?.grossLfrWithGst || 0).toFixed(2)}\n` +
      `Section 194C / 194-I TDS on LFR,Rs. ${Number(lfrData?.tdsOnLfr || 0).toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tax_Audit_Compliance_194Q_LFR_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #6b21a8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                LFR & Statutory Petroleum Tax Compliance Center
              </h2>
              <span className="badge badge-active" style={{ background: '#a855f7', color: '#fff', fontSize: '0.7rem' }}>
                INCOME TAX ACT 1961 & GST
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Section 194Q Purchase Tax Audit • OMC License Fee Recovery (LFR) • Transporter Section 194C Guidelines
            </div>
          </div>
        </div>

        <button
          onClick={downloadTaxAuditSummary}
          className="btn-action-green"
          style={{ fontSize: '0.85rem' }}
        >
          <Download size={16} /> Download Tax Audit CSV
        </button>
      </div>

      {/* Compliance Tab Switcher */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('194Q')}
          style={{
            padding: '10px 18px',
            background: activeTab === '194Q' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            color: activeTab === '194Q' ? '#c084fc' : 'var(--text-muted)',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === '194Q' ? '2px solid #a855f7' : 'none'
          }}
        >
          <Calculator size={16} /> Section 194Q (0.1% Purchase Tax)
        </button>

        <button
          onClick={() => setActiveTab('LFR')}
          style={{
            padding: '10px 18px',
            background: activeTab === 'LFR' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'LFR' ? '#38bdf8' : 'var(--text-muted)',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === 'LFR' ? '2px solid #38bdf8' : 'none'
          }}
        >
          <Building2 size={16} /> OMC License Fee Recovery (LFR)
        </button>

        <button
          onClick={() => setActiveTab('194C')}
          style={{
            padding: '10px 18px',
            background: activeTab === '194C' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
            color: activeTab === '194C' ? '#34d399' : 'var(--text-muted)',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: activeTab === '194C' ? '2px solid #34d399' : 'none'
          }}
        >
          <FileCheck2 size={16} /> Section 194C & Fleet TDS Guidelines
        </button>
      </div>

      {/* ========================================================
          TAB 1: SECTION 194Q PURCHASE TDS CALCULATOR
         ======================================================== */}
      {activeTab === '194Q' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Statutory Law Summary Banner */}
          <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={20} color="#c084fc" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  Statutory Mandate: Section 194Q of Income Tax Act 1961
                </strong>
                <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Every fuel dealer with total turnover exceeding ₹10 Crores in the preceding FY must deduct <strong>TDS @ 0.1%</strong> on purchase of petroleum products from Oil Marketing Companies (IOCL/BPCL/HPCL) once aggregate purchases exceed <strong>₹50,00,000</strong> in the financial year.
                  Deduction must be deposited under <strong>Challan ITNS 281 (Minor Head 200)</strong> before the 7th of the following month. Once 194Q is deducted, the OMC is legally prohibited from charging Section 206C(1H) TCS.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Input Controls */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
                🏢 FY Purchase Audit Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Cumulative FY Purchases from OMC (₹)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={fyPurchasesInput}
                    onChange={(e) => setFyPurchasesInput(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Gross inward product purchases (Ex-Tax + Excise/VAT) from OMC SAP ledger.
                  </div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasHigherRate206AB}
                      onChange={(e) => setHasHigherRate206AB(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hasHigherRate206AB ? '#f87171' : '#e2e8f0' }}>
                        Non-Filer Higher Rate Section 206AB (5.0%)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        OMC non-compliance penalty (rarely applicable to public sector OMCs).
                      </div>
                    </div>
                  </label>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Statutory Exemption Threshold:</span>
                    <strong style={{ color: '#ffffff' }}>₹50,00,000.00</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Threshold Status:</span>
                    <strong style={{ color: tax194Q?.thresholdBreached ? '#ef4444' : '#34d399' }}>
                      {tax194Q?.thresholdBreached ? 'EXCEEDED (194Q ACTIVE)' : 'WITHIN THRESHOLD'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>OMC 206C(1H) TCS Applicability:</span>
                    <strong style={{ color: '#38bdf8' }}>EXEMPT (Section 194Q Precedence)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Computation Results */}
            <div className="glass-card" style={{ padding: '22px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc', marginBottom: '16px' }}>
                📊 Section 194Q Computation Result
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cumulative FY Purchases:</span>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                    ₹{Number(tax194Q?.fyPurchases ?? tax194Q?.newCumulativePurchases ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Less: Statutory Exemption:</span>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    -₹{Number(tax194Q?.thresholdLimit ?? 5000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Taxable Base for 194Q:</span>
                  <strong style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                    ₹{Number(tax194Q?.taxableBase ?? tax194Q?.cumulativeTaxableYtd ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>
                    TDS TO BE DEDUCTED & DEPOSITED ({tax194Q?.tdsRate ?? 0.1}%)
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', margin: '6px 0' }}>
                    ₹{Number(tax194Q?.tdsAmount ?? tax194Q?.cumulativeTdsYtd ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#e2e8f0' }}>
                    Deposit via <strong>{tax194Q?.challanType || 'ITNS 281'}</strong> • Minor Head 200 (TDS Payable by Assessee)
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                    Next Due Date: <strong style={{ color: '#ffffff' }}>{tax194Q?.nextDueDate || '07th of Next Month'}</strong>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                    Quarterly Return: <strong style={{ color: '#ffffff' }}>{tax194Q?.quarterlyForm || 'Form 26Q'}</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Live Inward Tanker Decantations Audit Table */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} color="#a855f7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Live Inward Tanker Decantations (OMC Purchase Audit Ledger)
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {decs.length} RECORDED TT DELIVERIES (₹{decantedInwardsTotal.toLocaleString('en-IN')} TOTAL)
                </span>
                <button
                  type="button"
                  onClick={() => setFyPurchasesInput(liveTotalPurchases)}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#a855f7', borderColor: '#a855f7' }}
                >
                  ⚡ Auto-Sync Cumulative FY Total
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 8px' }}>INVOICE NO</th>
                    <th style={{ padding: '10px 8px' }}>TANKER TT NO</th>
                    <th style={{ padding: '10px 8px' }}>DATE & TIME</th>
                    <th style={{ padding: '10px 8px' }}>PRODUCT</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>INVOICED QTY (L)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>EST. INVOICE VALUE (₹)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>194Q TDS @ 0.1% (₹)</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {decs.map(dec => {
                    const estRate = dec.fuelCode === 'MS' ? 92.50 : 81.20;
                    const estValue = Number(dec.invoicedQty || 0) * estRate;
                    const decTds = estValue * 0.001; // 0.1% TDS
                    return (
                      <tr key={dec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                          {dec.invoiceNo}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#38bdf8', fontWeight: 700 }}>
                          {dec.tankerTTNo}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#94a3b8' }}>
                          {dec.date}
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: dec.fuelCode === 'MS' ? '#f97316' : '#3b82f6' }}>
                          {dec.fuelCode} ({dec.fuelName})
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {Number(dec.invoicedQty || 0).toLocaleString('en-IN')} L
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                          ₹{estValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#a855f7' }}>
                          ₹{decTds.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 700 }}>
                            ✓ {dec.status || 'VERIFIED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 2: OMC LICENSE FEE RECOVERY (LFR) ENGINE
         ======================================================== */}
      {activeTab === 'LFR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card" style={{ padding: '16px 20px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Building2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  OMC License Fee Recovery (LFR) Structure
                </strong>
                <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: '4px 0 0', lineHeight: 1.5 }}>
                  Under OMC dealership agreements, LFR is recovered on retail sales (KL dispensed) for Company Owned Company Operated (COCO) or 'A' / 'CCPS' Site retail outlets where OMC provides underground storage tanks, dispensers, canopy, and forecourt infrastructure.
                  LFR attracts <strong>18% GST</strong> for which the dealer can claim Input Tax Credit (ITC) on GSTR-2B against non-fuel services or lube sales.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1.5fr)', gap: '20px' }}>
            
            {/* LFR Rate Config Card */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  ⚙️ Contractual LFR Rates
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingLfr(!editingLfr)}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                >
                  {editingLfr ? 'Cancel' : 'Edit Rates'}
                </button>
              </div>

              {editingLfr ? (
                <form onSubmit={handleSaveLfrRates} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Motor Spirit (MS Petrol) LFR (₹ / KL)</label>
                    <input
                      type="number"
                      step="1"
                      value={customLfrRates.msPerKL}
                      onChange={(e) => setCustomLfrRates({ ...customLfrRates, msPerKL: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Speed Diesel (HSD) LFR (₹ / KL)</label>
                    <input
                      type="number"
                      step="1"
                      value={customLfrRates.hsdPerKL}
                      onChange={(e) => setCustomLfrRates({ ...customLfrRates, hsdPerKL: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CNG Gas LFR (₹ / KG)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={customLfrRates.cngPerKG}
                      onChange={(e) => setCustomLfrRates({ ...customLfrRates, cngPerKG: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    />
                  </div>

                  <button type="submit" className="btn-action-green" style={{ marginTop: '8px', justifyContent: 'center' }}>
                    Save LFR Rates
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>MS Petrol LFR:</span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{Number(customLfrRates.msPerKL || 460).toFixed(2)} / KL</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>HSD Diesel LFR:</span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{Number(customLfrRates.hsdPerKL || 390).toFixed(2)} / KL</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>CNG Gas LFR:</span>
                    <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{Number(customLfrRates.cngPerKG || 0.45).toFixed(2)} / KG</strong>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(2, 6, 23, 0.5)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Site Category: <strong>A-Site / Corpus Fund Model</strong> • Land Ownership: <strong>OMC Leasehold</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Live LFR Deduction Breakdown */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>
                📋 Live Month LFR Deduction Audit
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>MS Volume Dispensed:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(lfrData?.msLiters || 0).toFixed(2)} L ({Number(lfrData?.msKL || 0).toFixed(3)} KL) = ₹{Number(lfrData?.msBaseLfr || 0).toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>HSD Volume Dispensed:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{Number(lfrData?.hsdLiters || 0).toFixed(2)} L ({Number(lfrData?.hsdKL || 0).toFixed(3)} KL) = ₹{Number(lfrData?.hsdBaseLfr || 0).toFixed(2)}</strong>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#ffffff' }}>Base LFR Recovery:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>₹{Number(lfrData?.totalBaseLfr || 0).toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#ffffff' }}>Add: 18% GST (CGST 9% + SGST 9%):</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>+₹{Number(lfrData?.gstOnLfr || 0).toFixed(2)}</strong>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800 }}>GROSS LFR DEDUCTED IN OMC INVOICE</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Eligible for full 18% GST Input Tax Credit</div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    ₹{Number(lfrData?.grossLfrWithGst || 0).toFixed(2)}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '6px' }}>
                  <span>TDS Deductible u/s 194C / 194-I (if contractual):</span>
                  <strong style={{ color: '#34d399' }}>₹{Number(lfrData?.tdsOnLfr || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: SECTION 194C TRANSPORTER FLEET TDS RULES
         ======================================================== */}
      {activeTab === '194C' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-card" style={{ padding: '20px', background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>
              🚛 Transporter Payments & Section 194C Statutory Audit
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Under Indian Income Tax Section 194C, contractors and transporters are subject to TDS on freight charges:
              <strong> 1% for Individuals/HUF</strong> and <strong>2% for Corporate entities</strong> if single payment exceeds ₹30,000 or aggregate annual exceeds ₹1,00,000.
            </p>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Section 194C(6) Exemption:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>Small Transporter Nil TDS</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  No TDS if transporter owns ≤ 10 goods carriages and furnishes valid PAN declaration.
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Fuel Surcharge Rebate:</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>Rebate Not Subject to TDS</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Contractual per-liter discounts (e.g. ₹0.75/L) are commercial trade rebates, not commissions.
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Driver Cash Advance (Kharcha):</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>Petty Cash Debit</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Treated as direct imprest advance to transporter fleet account; not subject to tax withholding.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
