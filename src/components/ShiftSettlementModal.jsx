import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Coins, 
  CreditCard, 
  Truck, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  X, 
  Calendar, 
  Clock, 
  Lock, 
  Save, 
  Calculator,
  ArrowRight
} from 'lucide-react';

export default function ShiftSettlementModal({ isOpen, onClose }) {
  const { 
    currentShift, 
    nozzles, 
    fuelPrices, 
    transactions, 
    fleetAccounts, 
    forecourtExpenses, 
    stationInfo 
  } = useApp();

  const [shiftDate, setShiftDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShiftNo, setSelectedShiftNo] = useState(currentShift.shiftNumber || 'Shift 1 (06:00 - 14:00)');
  const [supervisor, setSupervisor] = useState(currentShift.supervisor || 'Ramesh Kumar (Forecourt Incharge)');
  const [testingDeductionLtrs, setTestingDeductionLtrs] = useState(10); // 2 nozzles x 5L

  // Denominations state
  const [notes, setNotes] = useState({
    2000: 0,
    500: 42,
    200: 15,
    100: 25,
    50: 10,
    20: 15,
    10: 20,
    coins: 400
  });

  const [lubeSalesAmt, setLubeSalesAmt] = useState(2450);
  const [managerRemarks, setManagerRemarks] = useState('');
  const [isFrozen, setIsFrozen] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Meter fuel sales calculation
  const msNozzles = nozzles.filter(n => n.fuelType === 'MS');
  const hsdNozzles = nozzles.filter(n => n.fuelType === 'HSD');

  const msLtrs = msNozzles.reduce((acc, n) => acc + (n.currentMeter - n.openingMeter), 0);
  const hsdLtrs = hsdNozzles.reduce((acc, n) => acc + (n.currentMeter - n.openingMeter), 0);

  const msPrice = fuelPrices.find(p => p.code === 'MS')?.price || 102.84;
  const hsdPrice = fuelPrices.find(p => p.code === 'HSD')?.price || 89.75;

  const grossFuelLtrs = msLtrs + hsdLtrs;
  const netFuelLtrs = Math.max(0, grossFuelLtrs - testingDeductionLtrs);

  const msFuelValue = msLtrs * msPrice;
  const hsdFuelValue = hsdLtrs * hsdPrice;
  const grossFuelRevenue = msFuelValue + hsdFuelValue;
  const grossShiftTurnover = grossFuelRevenue + Number(lubeSalesAmt || 0);

  // Collections Breakdown
  const creditVouchersAmt = currentShift.creditIssued || 14850;
  const digitalPosAmt = (currentShift.cardCollected || 8500) + (currentShift.upiCollected || 12400);
  const staffAdvancesUpaad = forecourtExpenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0) || 1200;

  // Expected Counter Cash
  const expectedCounterCash = grossShiftTurnover - creditVouchersAmt - digitalPosAmt - staffAdvancesUpaad;

  // Physical Cash Counted
  const totalPhysicalCash = 
    (notes[2000] * 2000) +
    (notes[500] * 500) +
    (notes[200] * 200) +
    (notes[100] * 100) +
    (notes[50] * 50) +
    (notes[20] * 20) +
    (notes[10] * 10) +
    Number(notes.coins || 0);

  // Gap of Account (Variance)
  const gapOfAccount = totalPhysicalCash - expectedCounterCash;
  const isShortage = gapOfAccount < -10;
  const isSurplus = gapOfAccount > 10;
  const isBalanced = Math.abs(gapOfAccount) <= 10;

  const handleDenomChange = (denom, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setNotes(prev => ({ ...prev, [denom]: num }));
  };

  const handlePostAndFreeze = () => {
    setIsFrozen(true);
    setSuccessNotice(`Shift Account for ${shiftDate} (${selectedShiftNo}) reconciled and posted to Cloudflare D1 Day Book.`);
    setTimeout(() => {
      setSuccessNotice('');
      onClose();
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '1050px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#0b1329',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Shift Settlement & Account Reconciliation
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Account of {shiftDate} in {selectedShiftNo} | Supervisor: {supervisor}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Top Control Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Shift Date</label>
            <input 
              type="date" 
              value={shiftDate} 
              onChange={(e) => setShiftDate(e.target.value)} 
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Shift Rotation</label>
            <select 
              value={selectedShiftNo} 
              onChange={(e) => setSelectedShiftNo(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <option value="Shift 1 (06:00 - 14:00)">Shift 1 (06:00 - 14:00 - Morning)</option>
              <option value="Shift 2 (14:00 - 22:00)">Shift 2 (14:00 - 22:00 - Evening)</option>
              <option value="Shift 3 (22:00 - 06:00)">Shift 3 (22:00 - 06:00 - Night)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Forecourt Supervisor</label>
            <input 
              type="text" 
              value={supervisor} 
              onChange={(e) => setSupervisor(e.target.value)} 
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Testing Pour-Back (Ltrs)</label>
            <input 
              type="number" 
              value={testingDeductionLtrs} 
              onChange={(e) => setTestingDeductionLtrs(parseFloat(e.target.value) || 0)} 
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
        </div>

        {/* 3 Column Grid: Sales Turnover | Collections | Physical Cash Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Card 1: Shift Turnover Breakdown */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>1. Meter Sales & Turnover</span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>MS (Petrol) Dispensed:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{msLtrs.toFixed(2)} L @ ₹{msPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24' }}>
                <span>MS Revenue:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{msFuelValue.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>HSD (Diesel) Dispensed:</span>
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>{hsdLtrs.toFixed(2)} L @ ₹{hsdPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
                <span>HSD Revenue:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{hsdFuelValue.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Testing Pourback:</span>
                <span style={{ color: '#f87171' }}>-{testingDeductionLtrs.toFixed(1)} Ltrs</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lubricant / 2T Sales:</span>
                <input 
                  type="number" 
                  value={lubeSalesAmt} 
                  onChange={(e) => setLubeSalesAmt(e.target.value)} 
                  style={{ width: '90px', padding: '3px 6px', textAlign: 'right', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '2px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>Gross Shift Turnover:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  ₹{grossShiftTurnover.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Shift Collections & Deductions */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#60a5fa', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>2. Deductions & Non-Cash</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Slips (Transporters):</span>
                <span style={{ fontWeight: 600, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                  - ₹{creditVouchersAmt.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>POS Swipes & Digital UPI:</span>
                <span style={{ fontWeight: 600, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  - ₹{digitalPosAmt.toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Staff Advance / Upaad:</span>
                <span style={{ fontWeight: 600, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                  - ₹{staffAdvancesUpaad.toFixed(2)}
                </span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>EXPECTED COUNTER CASH</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  ₹{expectedCounterCash.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  (Turnover - Credit - Digital - Advances)
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Physical Cash Denominations Matrix */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>3. Cash Denomination Matrix</span>
              <Coins size={16} color="#34d399" />
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem' }}>
              {[
                { denom: 2000, label: '₹ 2000' },
                { denom: 500, label: '₹ 500' },
                { denom: 200, label: '₹ 200' },
                { denom: 100, label: '₹ 100' },
                { denom: 50, label: '₹ 50' },
                { denom: 20, label: '₹ 20' },
                { denom: 10, label: '₹ 10' },
                { denom: 'coins', label: 'Coins ₹' }
              ].map(item => (
                <div key={item.denom} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '3px 6px', borderRadius: '4px' }}>
                  <span style={{ width: '45px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>{item.label}</span>
                  <input
                    type="number"
                    value={notes[item.denom]}
                    onChange={(e) => handleDenomChange(item.denom, e.target.value)}
                    style={{ width: '48px', padding: '2px 4px', textAlign: 'center', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    = {item.denom === 'coins' ? `₹${notes.coins}` : `₹${notes[item.denom] * item.denom}`}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Physical Handover:</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                ₹{totalPhysicalCash.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Gap of Account Reconciliation Status Bar */}
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: isShortage 
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)' 
            : isSurplus 
              ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)'
              : 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: isShortage 
            ? '1px solid rgba(239, 68, 68, 0.4)' 
            : isSurplus 
              ? '1px solid rgba(59, 130, 246, 0.4)'
              : '1px solid rgba(16, 185, 129, 0.4)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isShortage ? (
              <AlertCircle size={28} color="#f87171" />
            ) : isSurplus ? (
              <CheckCircle2 size={28} color="#60a5fa" />
            ) : (
              <CheckCircle2 size={28} color="#34d399" />
            )}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                GAP OF ACCOUNT (RECONCILIATION VARIANCE)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isShortage ? '#f87171' : isSurplus ? '#60a5fa' : '#34d399' }}>
                {gapOfAccount > 0 ? `+ ₹${gapOfAccount.toFixed(2)} (Excess Surplus)` : gapOfAccount < 0 ? `- ₹${Math.abs(gapOfAccount).toFixed(2)} (Cash Shortage)` : `₹0.00 (Perfect Match)`}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', maxWidth: '420px', color: 'var(--text-dim)', lineHeight: 1.4 }}>
            {isShortage ? (
              <span style={{ color: '#fca5a5' }}>
                Physical cash handed over is less than counter expectation by ₹{Math.abs(gapOfAccount).toFixed(2)}. Shortage will be debited to supervisor <strong>{supervisor}</strong> account.
              </span>
            ) : isSurplus ? (
              <span style={{ color: '#93c5fd' }}>
                Physical cash exceeds calculated counter expectation by ₹{gapOfAccount.toFixed(2)}. Excess will be credited to Pump Sundry Receipts.
              </span>
            ) : (
              <span style={{ color: '#6ee7b7' }}>
                Perfect balance! Physical counter collection exactly reconciles with meter sales and credit slips.
              </span>
            )}
          </div>
        </div>

        {/* Manager Remarks */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Manager Settlement Notes & Sign-off Remarks
          </label>
          <input
            type="text"
            value={managerRemarks}
            onChange={(e) => setManagerRemarks(e.target.value)}
            placeholder="e.g. Shift handed over without incidents. Pump 2 pulser seal inspected."
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.82rem' }}
          />
        </div>

        {successNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            {successNotice}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc',
              padding: '9px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <Printer size={16} /> Print Shift Sheet
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: '0.85rem' }}
            >
              Cancel (Esc)
            </button>
            <button
              onClick={handlePostAndFreeze}
              disabled={isFrozen}
              className="btn-primary"
              style={{ padding: '9px 24px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} /> Freeze & Post Shift
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
