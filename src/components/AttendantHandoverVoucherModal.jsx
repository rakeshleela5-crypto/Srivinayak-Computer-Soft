import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users2, 
  Coins, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Fuel, 
  FileText, 
  Calendar, 
  Calculator,
  ArrowRight
} from 'lucide-react';

export default function AttendantHandoverVoucherModal({ isOpen, onClose }) {
  const { staff, nozzles, fuelPrices, stationInfo } = useApp();

  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || 'staff-1');
  const [selectedMachine, setSelectedMachine] = useState('MPD-01 (Island 1)');
  const [handoverDate, setHandoverDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftPeriod, setShiftPeriod] = useState('Morning (06:00 - 14:00)');

  // Nozzle meters for this attendant
  const [meterReadings, setMeterReadings] = useState([
    { nozzleId: 1, product: 'MS', open: 148200.50, close: 148650.20, test: 5.0, rate: 102.84 },
    { nozzleId: 2, product: 'HSD', open: 219100.80, close: 219890.30, test: 5.0, rate: 89.75 }
  ]);

  const [lubeAmount, setLubeAmount] = useState(850);
  const [creditSlipsAmt, setCreditSlipsAmt] = useState(4200);
  const [cardSlipsAmt, setCardSlipsAmt] = useState(6500);
  const [staffAdvanceUpaad, setStaffAdvanceUpaad] = useState(500);

  // Denominations
  const [notes, setNotes] = useState({
    2000: 0,
    500: 12,
    200: 10,
    100: 15,
    50: 8,
    20: 10,
    10: 15,
    coins: 150
  });

  const [attendantRemarks, setAttendantRemarks] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentAttendant = staff.find(s => s.id === selectedStaffId) || staff[0];

  // Calculations
  const rowsCalculated = meterReadings.map(r => {
    const grossQty = Math.max(0, r.close - r.open);
    const netQty = Math.max(0, grossQty - r.test);
    const amount = netQty * r.rate;
    return { ...r, grossQty, netQty, amount };
  });

  const totalFuelQty = rowsCalculated.reduce((acc, r) => acc + r.netQty, 0);
  const totalFuelAmt = rowsCalculated.reduce((acc, r) => acc + r.amount, 0);
  const totalGrossDuty = totalFuelAmt + Number(lubeAmount || 0);

  const totalDeductions = Number(creditSlipsAmt || 0) + Number(cardSlipsAmt || 0) + Number(staffAdvanceUpaad || 0);
  const expectedCashHandover = totalGrossDuty - totalDeductions;

  const physicalCashCounted = 
    (notes[2000] * 2000) +
    (notes[500] * 500) +
    (notes[200] * 200) +
    (notes[100] * 100) +
    (notes[50] * 50) +
    (notes[20] * 20) +
    (notes[10] * 10) +
    Number(notes.coins || 0);

  const cashVariance = physicalCashCounted - expectedCashHandover;
  const isShortage = cashVariance < -5;
  const isSurplus = cashVariance > 5;

  const handleDenomChange = (denom, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setNotes(prev => ({ ...prev, [denom]: num }));
  };

  const handleMeterChange = (index, field, val) => {
    const num = parseFloat(val) || 0;
    setMeterReadings(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: num };
      return copy;
    });
  };

  const handleSaveVoucher = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 2000);
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
        width: '1000px',
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
              <Users2 size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Machine-wise Attendant Handover Voucher (FrmLi)
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Individual Dispenser Nozzle Settlement & Cash Denomination Clearance Slip
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

        {/* Attendant & Machine Filter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Attendant / Operator</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.role || 'Attendant'})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Assigned Dispenser</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <option value="MPD-01 (Island 1)">MPD-01 (Island 1 - Wayne 4-Nozzle)</option>
              <option value="MPD-02 (Island 2)">MPD-02 (Island 2 - Wayne 4-Nozzle)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Date</label>
            <input
              type="date"
              value={handoverDate}
              onChange={(e) => setHandoverDate(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Shift Timing</label>
            <input
              type="text"
              value={shiftPeriod}
              onChange={(e) => setShiftPeriod(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
        </div>

        {/* Meter Readings Table */}
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>
            Assigned Nozzle Meter Totalizers
          </h4>
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '8px 12px' }}>Nozzle</th>
                  <th style={{ padding: '8px 12px' }}>Fuel</th>
                  <th style={{ padding: '8px 12px' }}>Opening Meter</th>
                  <th style={{ padding: '8px 12px' }}>Closing Meter</th>
                  <th style={{ padding: '8px 12px' }}>Testing (L)</th>
                  <th style={{ padding: '8px 12px' }}>Net Sale (L)</th>
                  <th style={{ padding: '8px 12px' }}>Rate (₹/L)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {rowsCalculated.map((row, idx) => (
                  <tr key={row.nozzleId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700 }}>Nozzle #{row.nozzleId}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: row.product === 'MS' ? '#fbbf24' : '#60a5fa', fontWeight: 700 }}>{row.product}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={row.open}
                        onChange={(e) => handleMeterChange(idx, 'open', e.target.value)}
                        style={{ width: '110px', padding: '3px 6px', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={row.close}
                        onChange={(e) => handleMeterChange(idx, 'close', e.target.value)}
                        style={{ width: '110px', padding: '3px 6px', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={row.test}
                        onChange={(e) => handleMeterChange(idx, 'test', e.target.value)}
                        style={{ width: '50px', padding: '3px 6px', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#f87171', fontSize: '0.78rem' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                      {row.netQty.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#94a3b8' }}>
                      ₹{row.rate.toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      ₹{row.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2 Column Split: Deductions & Duty | Currency Denominations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
          
          {/* Left Column: Settlement Duty & Non-Cash */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700 }}>
              Duty & Deductions Summary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fuel Dispensed Value:</span>
                <strong style={{ color: '#f8fafc' }}>₹{totalFuelAmt.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Lubricant / 2T Sales:</span>
                <input
                  type="number"
                  value={lubeAmount}
                  onChange={(e) => setLubeAmount(e.target.value)}
                  style={{ width: '85px', padding: '3px 6px', textAlign: 'right', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#34d399' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontWeight: 700, color: '#f8fafc' }}>Total Gross Shift Duty:</span>
                <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>₹{totalGrossDuty.toFixed(2)}</strong>
              </div>

              <div style={{ margin: '6px 0', borderTop: '1px dashed rgba(255,255,255,0.1)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Sale Slips Submitted:</span>
                <input
                  type="number"
                  value={creditSlipsAmt}
                  onChange={(e) => setCreditSlipsAmt(e.target.value)}
                  style={{ width: '85px', padding: '3px 6px', textAlign: 'right', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#f87171' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Card / UPI Slips Submitted:</span>
                <input
                  type="number"
                  value={cardSlipsAmt}
                  onChange={(e) => setCardSlipsAmt(e.target.value)}
                  style={{ width: '85px', padding: '3px 6px', textAlign: 'right', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Attendant Advance (Upaad):</span>
                <input
                  type="number"
                  value={staffAdvanceUpaad}
                  onChange={(e) => setStaffAdvanceUpaad(e.target.value)}
                  style={{ width: '85px', padding: '3px 6px', textAlign: 'right', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fbbf24' }}
                />
              </div>

              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '2px dashed rgba(255,255,255,0.12)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>EXPECTED CASH TO HANDOVER</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  ₹{expectedCashHandover.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Denominations Matrix */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Physical Currency Handover</span>
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
                    style={{ width: '44px', padding: '2px 4px', textAlign: 'center', borderRadius: '4px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.75rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    = {item.denom === 'coins' ? `₹${notes.coins}` : `₹${notes[item.denom] * item.denom}`}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Physical Handover:</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                ₹{physicalCashCounted.toFixed(2)}
              </span>
            </div>

            {/* Variance indicator */}
            <div style={{
              marginTop: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: isShortage ? 'rgba(239, 68, 68, 0.15)' : isSurplus ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: isShortage ? '1px solid rgba(239, 68, 68, 0.3)' : isSurplus ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isShortage ? '#f87171' : isSurplus ? '#60a5fa' : '#34d399' }}>
                {isShortage ? 'Shortage (Attendant Recoverable):' : isSurplus ? 'Surplus:' : 'Balance Status:'}
              </span>
              <strong style={{ fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: isShortage ? '#f87171' : isSurplus ? '#60a5fa' : '#34d399' }}>
                {cashVariance > 0 ? `+ ₹${cashVariance.toFixed(2)}` : cashVariance < 0 ? `- ₹${Math.abs(cashVariance).toFixed(2)}` : '₹0.00 Exact'}
              </strong>
            </div>

          </div>

        </div>

        {isSaved && (
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
            Handover Voucher for {currentAttendant.name} saved and verified!
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button
            onClick={() => window.print()}
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
            <Printer size={16} /> Print Handover Slip
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
              onClick={handleSaveVoucher}
              className="btn-primary"
              style={{ padding: '9px 24px', fontSize: '0.85rem' }}
            >
              Save Voucher (F2)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
