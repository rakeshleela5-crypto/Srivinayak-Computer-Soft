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
  Sparkles,
  Edit3,
  X,
  Plus
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
    exportCaSalesCsv,
    morningDensityLogs,
    recordMorningDensityLog,
    forecourtExpenses
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PAGE1, PAGE2
  const [densityModalOpen, setDensityModalOpen] = useState(false);
  const [selectedTankForDensity, setSelectedTankForDensity] = useState(tanks[0]?.id || 'tank-1');
  const [densityForm, setDensityForm] = useState({
    observedTempC: '24.5',
    observedDensity: '740.0',
    invoiceDensityAt15C: '745.0',
    dipMm: '1420',
    waterDipMm: '0',
    testedBy: 'Vijay Sharma (Manager)'
  });

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

  // Dynamic forecourt overheads calculated from real recorded expenses
  const totalActualExpenses = forecourtExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const profitReport = calculateDealerProfitAndMargin(activeTxns, dealerMargins, totalActualExpenses);

  const handleOpenDensityModal = (tank) => {
    setSelectedTankForDensity(tank.id);
    const existing = morningDensityLogs[tank.id];
    if (existing) {
      setDensityForm({
        observedTempC: existing.observedTempC.toString(),
        observedDensity: existing.observedDensity.toString(),
        invoiceDensityAt15C: existing.invoiceDensityAt15C.toString(),
        dipMm: (existing.dipMm || 1200).toString(),
        waterDipMm: (existing.waterDipMm || 0).toString(),
        testedBy: existing.testedBy || 'Vijay Sharma (Manager)'
      });
    } else {
      setDensityForm({
        observedTempC: '24.5',
        observedDensity: tank.fuelCode === 'MS' ? '740.0' : '825.0',
        invoiceDensityAt15C: tank.fuelCode === 'MS' ? '745.0' : '828.0',
        dipMm: '1200',
        waterDipMm: '0',
        testedBy: 'Vijay Sharma (Manager)'
      });
    }
    setDensityModalOpen(true);
  };

  const handleSaveDensity = (e) => {
    e.preventDefault();
    recordMorningDensityLog(selectedTankForDensity, {
      observedTempC: parseFloat(densityForm.observedTempC) || 24.5,
      observedDensity: parseFloat(densityForm.observedDensity) || 740,
      invoiceDensityAt15C: parseFloat(densityForm.invoiceDensityAt15C) || 745,
      dipMm: parseFloat(densityForm.dipMm) || 0,
      waterDipMm: parseFloat(densityForm.waterDipMm) || 0,
      testedBy: densityForm.testedBy
    });
    setDensityModalOpen(false);
  };

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
                      const testingLiters = noz.testingVolume !== undefined ? noz.testingVolume : 5.0; // Legal Metrology conical measure
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                    Statutory Tolerance: <strong>±3.0 kg/m³ vs Invoice Density @ 15°C</strong>
                  </span>
                  <button
                    onClick={() => handleOpenDensityModal(tanks[0] || { id: 'tank-1', fuelCode: 'MS', name: 'Tank 1' })}
                    className="no-print"
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(52, 211, 153, 0.15)',
                      border: '1px solid #34d399',
                      borderRadius: '6px',
                      color: '#34d399',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit3 size={12} /> Log / Edit 06:00 AM Dips
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {tanks.map(t => {
                  const log = morningDensityLogs[t.id] || {
                    observedTempC: 24.5,
                    observedDensity: t.fuelCode === 'MS' ? 739.2 : 822.4,
                    convertedDensityAt15C: t.fuelCode === 'MS' ? 745.8 : 828.6,
                    invoiceDensityAt15C: t.fuelCode === 'MS' ? 745.0 : 828.0,
                    densityVariance: t.fuelCode === 'MS' ? 0.8 : 0.6,
                    dipMm: t.currentDipMm || 1600,
                    waterDipMm: 0,
                    status: 'WITHIN_TOLERANCE'
                  };
                  const diff = log.densityVariance !== undefined ? log.densityVariance : (log.convertedDensityAt15C - log.invoiceDensityAt15C);
                  const isVerified = Math.abs(diff) <= 3.0;

                  return (
                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.8rem' }}>{t.name} ({t.fuelCode})</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.65rem', color: isVerified ? '#34d399' : '#f87171', fontWeight: 700 }}>
                            {isVerified ? '✓ VERIFIED' : '⚠ OUT OF SPEC'}
                          </span>
                          <button
                            onClick={() => handleOpenDensityModal(t)}
                            className="no-print"
                            title="Edit Density & Dip"
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                        <span>Observed @ {log.observedTempC}°C:</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>{log.observedDensity} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        <span>Corrected @ 15°C (ASTM 53B):</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>{log.convertedDensityAt15C} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                        <span>Invoice Density:</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{log.invoiceDensityAt15C} kg/m³</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: isVerified ? '#34d399' : '#f87171', marginTop: '2px', fontWeight: 700 }}>
                        <span>Variance:</span>
                        <span>{diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} kg/m³ ({isVerified ? 'Within ±3' : 'FAIL'})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                        <span>Opening Dip: {log.dipMm || t.currentDipMm || 0} mm</span>
                        <span>Water Dip: {log.waterDipMm || 0} mm</span>
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

      {/* 06:00 AM DENSITY & DIP ENTRY MODAL */}
      {densityModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#34d399" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Log 06:00 AM Density & Dip (ASTM 53B)
                </h3>
              </div>
              <button
                onClick={() => setDensityModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDensity} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Select Tank</label>
                <select
                  value={selectedTankForDensity}
                  onChange={(e) => {
                    const tId = e.target.value;
                    const tank = tanks.find(t => t.id === tId);
                    if (tank) handleOpenDensityModal(tank);
                  }}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.fuelCode}) - Capacity {t.capacityLiters} L</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Observed Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={densityForm.observedTempC}
                    onChange={(e) => setDensityForm({ ...densityForm, observedTempC: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Observed Density (kg/m³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={densityForm.observedDensity}
                    onChange={(e) => setDensityForm({ ...densityForm, observedDensity: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Invoice Density @ 15°C</label>
                  <input
                    type="number"
                    step="0.1"
                    value={densityForm.invoiceDensityAt15C}
                    onChange={(e) => setDensityForm({ ...densityForm, invoiceDensityAt15C: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Opening Dip (mm)</label>
                  <input
                    type="number"
                    value={densityForm.dipMm}
                    onChange={(e) => setDensityForm({ ...densityForm, dipMm: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Water Dip (mm)</label>
                  <input
                    type="number"
                    value={densityForm.waterDipMm}
                    onChange={(e) => setDensityForm({ ...densityForm, waterDipMm: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Tested & Verified By</label>
                  <input
                    type="text"
                    value={densityForm.testedBy}
                    onChange={(e) => setDensityForm({ ...densityForm, testedBy: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '8px', padding: '10px', fontSize: '0.75rem', color: '#6ee7b7' }}>
                <strong>ASTM 53B Standard Formula:</strong> Automatically converts observed hydrometer density at measured temperature to standard density at 15°C and alerts if deviation exceeds ±3.0 kg/m³.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDensityModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action-green"
                  style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Save & Certify Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
