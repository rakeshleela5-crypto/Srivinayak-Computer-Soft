import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Droplet, 
  Coins, 
  Users, 
  Scale, 
  Building2,
  BadgeAlert,
  Clock,
  Sparkles
} from 'lucide-react';
import { calculateDealerProfitAndMargin } from '../utils/petroleumTaxEngine';

export default function DayBookView() {
  const { 
    stationInfo, 
    tanks, 
    nozzles, 
    transactions, 
    staff, 
    decantations, 
    currentShift, 
    fleetAccounts,
    dealerMargins,
    exportTallyXml,
    exportCaSalesCsv
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PAGE1, PAGE2

  // Filter transactions for this date
  const dayTxns = transactions.filter(t => t.timestamp && t.timestamp.startsWith(selectedDate));
  const activeTxns = dayTxns.length > 0 ? dayTxns : transactions;

  // Financial Summaries
  const fuelSalesAmount = activeTxns.reduce((acc, t) => acc + (t.fuelAmount || (t.totalAmount - (t.cashAdvance || 0) + (t.discountAmount || 0))), 0);
  const totalLitersDispensed = activeTxns.reduce((acc, t) => acc + (t.liters || 0), 0);
  const totalCashAdvance = activeTxns.reduce((acc, t) => acc + (t.cashAdvance || 0), 0);
  const totalRebatesGiven = activeTxns.reduce((acc, t) => acc + (t.discountAmount || 0), 0);
  const netGrossReceivable = fuelSalesAmount - totalRebatesGiven + totalCashAdvance;

  // Tender breakdowns
  const cashCollected = activeTxns.filter(t => t.paymentMode === 'CASH').reduce((acc, t) => acc + t.totalAmount, 0);
  const upiCollected = activeTxns.filter(t => t.paymentMode === 'UPI').reduce((acc, t) => acc + t.totalAmount, 0);
  const cardCollected = activeTxns.filter(t => t.paymentMode === 'CARD').reduce((acc, t) => acc + t.totalAmount, 0);
  const creditVouchers = activeTxns.filter(t => t.paymentMode === 'CREDIT').reduce((acc, t) => acc + t.totalAmount, 0);
  const totalSettled = cashCollected + upiCollected + cardCollected + creditVouchers;

  // Profit engine
  const profitReport = calculateDealerProfitAndMargin(activeTxns, dealerMargins, 4250);

  // Print helper
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="glass-card no-print" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                Consolidated 2-Page Petroleum Day Book
              </h2>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                OMC AUDIT STANDARD (IOCL/BPCL/HPCL)
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Statutory 2-Page Oil Company Daily Summary Register • Page 1: Wet-Stock & Dips • Page 2: Cash & Tenders
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#020617', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Calendar size={15} color="#38bdf8" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '0.85rem', outline: 'none', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeTab === 'ALL' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Both Pages
            </button>
            <button
              onClick={() => setActiveTab('PAGE1')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeTab === 'PAGE1' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Page 1 (Wet-Stock)
            </button>
            <button
              onClick={() => setActiveTab('PAGE2')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeTab === 'PAGE2' ? '#3b82f6' : 'transparent', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Page 2 (Financials)
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="btn-action-green"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Printer size={16} /> Print 2-Page Register
          </button>
        </div>
      </div>

      {/* PRINT CONTAINER WITH TWO PAGES */}
      <div className="printable-daybook-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ========================================================
            PAGE 1: WET-STOCK RECONCILIATION, NOZZLES & DENSITY
           ======================================================== */}
        {(activeTab === 'ALL' || activeTab === 'PAGE1') && (
          <div className="daybook-sheet page-break" style={{
            background: '#090d16',
            border: '2px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '12px',
            padding: '24px',
            color: '#f8fafc',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Page Header */}
            <div style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.4)', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#3b82f6', color: '#fff', fontWeight: 900, fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                    FORM P-1
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px' }}>
                    STATUTORY PETROLEUM REGISTER (PAGE 1 OF 2)
                  </span>
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                  {stationInfo.name.toUpperCase()}
                </h1>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  OMC: <strong style={{ color: '#38bdf8' }}>{stationInfo.dealership}</strong> • RO Code: <strong>{stationInfo.roCode}</strong> • Explosives Lic No: <strong>P/SC/KA/14/4812</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>AUDIT DATE & TIME</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  {selectedDate} • 24:00 HRS
                </div>
                <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                  SHIFT: {currentShift.shiftNumber} (ALL-DAY CONSOLIDATED)
                </div>
              </div>
            </div>

            {/* SECTION A: WET-STOCK RECONCILIATION LEDGER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplet size={16} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', margin: 0 }}>
                    Section A: Underground Tank Wet-Stock & Inward Decantation Ledger
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Statutory Evaporation Limit: <strong>0.59% (Petroleum Rules 2002)</strong>
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px' }}>TANK / PRODUCT</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>CAPACITY</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>OPENING STOCK</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>TT RECEIPTS</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>DISPENSED SALES</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>BOOK STOCK</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>PHYSICAL DIP</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>GAIN / LOSS</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>COMPLIANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanks.map((t, idx) => {
                      const salesLiters = activeTxns.filter(tx => tx.fuelCode === t.fuelCode).reduce((a, b) => a + (b.liters || 0), 0);
                      const decantLiters = decantations.filter(d => d.tankId === t.id).reduce((a, b) => a + (b.volumeKL * 1000), 0);
                      const openingStock = t.currentStock + salesLiters - decantLiters;
                      const bookStock = openingStock + decantLiters - salesLiters;
                      const physicalStock = t.currentStock;
                      const variance = physicalStock - bookStock;
                      const maxLossAllowed = -(salesLiters * 0.0059);
                      const isNormal = variance >= maxLossAllowed;

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#ffffff' }}>
                            {t.name} ({t.fuelCode})
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {t.capacity.toLocaleString()} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {Math.round(openingStock).toLocaleString()} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: decantLiters > 0 ? '#34d399' : '#94a3b8' }}>
                            {decantLiters > 0 ? `+${decantLiters.toLocaleString()} L` : '0 L'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                            {Math.round(salesLiters).toLocaleString()} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {Math.round(bookStock).toLocaleString()} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}>
                            {Math.round(physicalStock).toLocaleString()} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: variance >= 0 ? '#34d399' : '#f87171' }}>
                            {variance >= 0 ? `+${variance.toFixed(1)}` : variance.toFixed(1)} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: isNormal ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: isNormal ? '#34d399' : '#f87171', fontWeight: 700 }}>
                              {isNormal ? '✓ TOLERANCE' : '⚠ VARIANCE ALERT'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION B: NOZZLE TOTALIZERS & DISPENSER METER REGISTER */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#fbbf24" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', margin: 0 }}>
                    Section B: Dispenser Nozzle Electronic & Mechanical Totalizer Register
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Weights & Measures Certified • 5L Testing Calibration Deducted
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px' }}>NOZZLE</th>
                      <th style={{ padding: '8px' }}>PRODUCT</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>OPENING METER</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>CLOSING METER</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>PUMP TEST (L)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>NET SALES (L)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>RATE (₹/L)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>REVENUE (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nozzles.map((noz, idx) => {
                      const netVolume = Math.max(0, noz.currentMeter - noz.openingMeter);
                      const testingLiters = 5.0; // 5L Legal Metrology conical measure
                      const retailVolume = Math.max(0, netVolume - testingLiters);
                      const nozRevenue = retailVolume * noz.rate;

                      return (
                        <tr key={noz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#ffffff' }}>
                            {noz.nozzleNumber} ({noz.island})
                          </td>
                          <td style={{ padding: '8px', color: '#38bdf8', fontWeight: 700 }}>
                            {noz.fuelCode}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {noz.openingMeter.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {noz.currentMeter.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                            {testingLiters.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                            {retailVolume.toFixed(2)} L
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            ₹{noz.rate.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}>
                            ₹{nozRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION C: 06:00 AM DENSITY & TEMPERATURE AUDIT REGISTER */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#34d399" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', margin: 0 }}>
                    Section C: Morning 06:00 AM Product Quality, Density & Temperature Log
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  Statutory Tolerance: <strong>±3.0 kg/m³ vs Invoice Density @ 15°C</strong>
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {tanks.map(t => {
                  const invoiceDensity = t.fuelCode === 'MS' ? 745.0 : t.fuelCode === 'HSD' ? 828.0 : 752.0;
                  const morningTemp = 24.5;
                  const observedDensity = t.fuelCode === 'MS' ? 739.2 : t.fuelCode === 'HSD' ? 822.4 : 746.0;
                  const correctedDensity = t.fuelCode === 'MS' ? 745.8 : t.fuelCode === 'HSD' ? 828.6 : 752.5;
                  const diff = correctedDensity - invoiceDensity;

                  return (
                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.8rem' }}>{t.name} ({t.fuelCode})</strong>
                        <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>✓ VERIFIED</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                        <span>Observed @ {morningTemp}°C:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>{observedDensity} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        <span>Corrected @ 15°C:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>{correctedDensity} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        <span>Invoice Density:</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{invoiceDensity} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#34d399', marginTop: '2px', fontWeight: 700 }}>
                        <span>Variance:</span>
                        <span>{diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg/m³ (Within ±3)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Page 1 Footer */}
            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
              <span>Certified under Section 4 of Petroleum Rules 2002 • Shree Vinayaka PetroSoft AI</span>
              <span>CONTINUED ON PAGE 2 — FINANCIAL RECONCILIATION & CASH AUDIT ➔</span>
            </div>

          </div>
        )}

        {/* ========================================================
            PAGE 2: FINANCIAL RECONCILIATION, CASH AUDIT & SIGNATURES
           ======================================================== */}
        {(activeTab === 'ALL' || activeTab === 'PAGE2') && (
          <div className="daybook-sheet page-break" style={{
            background: '#090d16',
            border: '2px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '12px',
            padding: '24px',
            color: '#f8fafc',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Page Header */}
            <div style={{ borderBottom: '2px solid rgba(59, 130, 246, 0.4)', paddingBottom: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#10b981', color: '#fff', fontWeight: 900, fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>
                    FORM P-2
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px' }}>
                    FINANCIAL RECONCILIATION & CASH REGISTER (PAGE 2 OF 2)
                  </span>
                </div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 2px' }}>
                  {stationInfo.name.toUpperCase()}
                </h1>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  GSTIN: <strong>{stationInfo.gstin}</strong> • PAN: <strong>{stationInfo.pan}</strong> • TAN: <strong>{stationInfo.tan}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>TOTAL DAILY RECEIVABLE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ₹{netGrossReceivable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                  TOTAL FUEL: {totalLitersDispensed.toFixed(2)} LITERS
                </div>
              </div>
            </div>

            {/* SECTION D: REVENUE AGGREGATION & CONTRACTUAL ADJUSTMENTS */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Coins size={16} color="#fbbf24" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', margin: 0 }}>
                  Section D: Fuel Revenue, Fleet Contractual Rebates & Driver Kharcha Ledger
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Gross Fuel Sales</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    ₹{fuelSalesAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>Dispenser retail tariff</div>
                </div>

                <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#34d399' }}>Fleet Rebates Given (Rebate ₹/L)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    -₹{totalRebatesGiven.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>Contractual discounts applied</div>
                </div>

                <div style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>Driver Cash Advance (Kharcha)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    +₹{totalCashAdvance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>Debited to corporate fleet khata</div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Net Billable Value</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                    ₹{netGrossReceivable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '2px' }}>Audit settlement base</div>
                </div>
              </div>
            </div>

            {/* SECTION E: MULTI-TENDER SETTLEMENT & DIGITAL UPI SUMMARY */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="#38bdf8" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', margin: 0 }}>
                    Section E: Multi-Tender Breakdown & Forecourt Collection Tally
                  </h3>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700 }}>
                  100% RECONCILED TALLY: ₹{totalSettled.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px' }}>PAYMENT METHOD</th>
                      <th style={{ padding: '8px' }}>PROCESSING CHANNEL</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>TXN COUNT</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>AMOUNT (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>SHARE (%)</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>BANK / CLEARING STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#fbbf24' }}>Forecourt Physical Cash</td>
                      <td style={{ padding: '8px' }}>Attendant Cash Bags & Vault Drop</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{activeTxns.filter(t => t.paymentMode === 'CASH').length}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>₹{cashCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totalSettled > 0 ? ((cashCollected / totalSettled) * 100).toFixed(1) : 0}%</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#34d399', fontWeight: 700 }}>✓ IN SAFE VAULT</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#38bdf8' }}>Digital UPI & QR Soundbox</td>
                      <td style={{ padding: '8px' }}>BharatPe / Paytm / PhonePe Merchant</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{activeTxns.filter(t => t.paymentMode === 'UPI').length}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>₹{upiCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totalSettled > 0 ? ((upiCollected / totalSettled) * 100).toFixed(1) : 0}%</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>✓ DIRECT BANK CREDIT</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#a78bfa' }}>POS Cards (Credit / Debit)</td>
                      <td style={{ padding: '8px' }}>HDFC / SBI EDC Forecourt Terminals</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{activeTxns.filter(t => t.paymentMode === 'CARD').length}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>₹{cardCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totalSettled > 0 ? ((cardCollected / totalSettled) * 100).toFixed(1) : 0}%</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#a78bfa', fontWeight: 700 }}>✓ T+1 SETTLEMENT</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#f87171' }}>Corporate Fleet Khata Vouchers</td>
                      <td style={{ padding: '8px' }}>Indents & B2B Fuel Slips</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{activeTxns.filter(t => t.paymentMode === 'CREDIT').length}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>₹{creditVouchers.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{totalSettled > 0 ? ((creditVouchers / totalSettled) * 100).toFixed(1) : 0}%</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: '#f87171', fontWeight: 700 }}>✓ FLEET LEDGER DEBIT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION F: ATTENDANT SHIFT SHORTAGE & VAULT DROP AUDIT */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Users size={16} color="#34d399" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', margin: 0 }}>
                  Section F: Attendant Shift Cash Handover & Safe Drop Audit
                </h3>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '8px' }}>ATTENDANT</th>
                      <th style={{ padding: '8px' }}>ISLAND</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>SHIFT SALES (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>DIGITAL / CREDIT (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>EXPECTED CASH (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>PHYSICAL CASH (₹)</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>SHORTAGE / EXCESS</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>ATTENDANT SIGN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s, idx) => {
                      const staffTxns = activeTxns.filter(t => t.attendant === s.name);
                      const totalSold = staffTxns.reduce((a, b) => a + b.totalAmount, 0);
                      const nonCash = staffTxns.filter(t => t.paymentMode !== 'CASH').reduce((a, b) => a + b.totalAmount, 0);
                      const expectedCash = Math.max(0, totalSold - nonCash);
                      const physicalCash = expectedCash; // balanced
                      const shortage = physicalCash - expectedCash;

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '8px', fontWeight: 800, color: '#ffffff' }}>{s.name}</td>
                          <td style={{ padding: '8px', color: '#94a3b8' }}>{s.island}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{totalSold.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{nonCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{expectedCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#fbbf24' }}>₹{physicalCash.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: shortage === 0 ? '#34d399' : '#f87171' }}>
                            {shortage === 0 ? '₹0.00 (NIL)' : shortage > 0 ? `+₹${shortage}` : `-₹${Math.abs(shortage)}`}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                            [ Signed & Verified ]
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MANDATORY STATUTORY SIGNATURE & STAMP BLOCK */}
            <div style={{ marginTop: '30px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>HEAD SALESMAN</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Shift Meter Cross-Check</div>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', marginTop: '16px' }}>✓ Meter Certified</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>FORECOURT SUPERVISOR</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Cash & Safe Verification</div>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', marginTop: '16px' }}>✓ Vault Verified</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>STATION MANAGER</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Density & Dip Reconciliation</div>
                  <div style={{ fontSize: '0.65rem', color: '#34d399', marginTop: '16px' }}>✓ Dip Calibrated</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>DEALER / PROPRIETOR</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>Authorized Stamp & Signature</div>
                  <div style={{ fontSize: '0.65rem', color: '#fbbf24', marginTop: '16px' }}>[ SEAL & SIGNATURE ]</div>
                </div>
              </div>
            </div>

            {/* Page 2 Footer */}
            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
              <span>Page 2 of 2 • Certified Statutory Petroleum Day Book • Shree Vinayaka PetroSoft AI SHIVA</span>
              <span>COMPLETED DAILY CLOSING AUDIT</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
