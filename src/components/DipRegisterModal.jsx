import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Database, AlertTriangle, TrendingDown } from 'lucide-react';

export default function DipRegisterModal({ isOpen, onClose }) {
  const { tanks, recordPhysicalDip } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('First');
  const [selectedTankCode, setSelectedTankCode] = useState('MS');
  
  const [openingDip, setOpeningDip] = useState(1640.0);
  const [openingStock, setOpeningStock] = useState(18450.0);
  const [receiptLtr, setReceiptLtr] = useState(0.0);
  const [closingDip, setClosingDip] = useState(1420.0);
  const [closingStock, setClosingStock] = useState(15150.0);

  const [meterWiseSale, setMeterWiseSale] = useState(3164.0);
  const [openDipAllow, setOpenDipAllow] = useState(false);

  // Computed values
  const dipWiseSale = (parseFloat(openingStock) || 0) + (parseFloat(receiptLtr) || 0) - (parseFloat(closingStock) || 0);
  const variation = dipWiseSale - (parseFloat(meterWiseSale) || 0);
  
  // OMC allowable loss limits (-0.75% for MS, -0.25% for HSD)
  const tolerancePct = selectedTankCode === 'MS' ? 0.0075 : 0.0025;
  const asPerLimit = -1 * ((parseFloat(openingStock) || 0) * tolerancePct);

  const [dipHistory, setDipHistory] = useState([
    { date: '08 Oct 2026', shift: 'First', tank: 'MS', opDip: 1.00, opStock: 18450.0, receipt: 0.0, clDip: 1.00, clStock: 15150.0, variation: -136.0 },
    { date: '08 Oct 2026', shift: 'First', tank: 'HSD', opDip: 1.00, opStock: 22150.0, receipt: 0.0, clDip: 1.00, clStock: 18360.0, variation: -264.0 },
    { date: '07 Oct 2026', shift: 'First', tank: 'HSD', opDip: 1.00, opStock: 17345.0, receipt: 4000.0, clDip: 1.00, clStock: 16890.0, variation: -220.0 },
    { date: '06 Oct 2026', shift: 'First', tank: 'MS', opDip: 1.00, opStock: 11524.0, receipt: 4000.0, clDip: 1.00, clStock: 13150.0, variation: -89.0 }
  ]);

  useEffect(() => {
    if (selectedTankCode === 'MS') {
      setOpeningStock(18450.0);
      setClosingStock(15150.0);
      setMeterWiseSale(3164.0);
    } else {
      setOpeningStock(22150.0);
      setClosingStock(18360.0);
      setMeterWiseSale(3526.0);
    }
  }, [selectedTankCode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'F2') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'F1') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedTankCode, openingStock, closingStock, receiptLtr]);

  if (!isOpen) return null;

  const handleReset = () => {
    setReceiptLtr(0);
  };

  const handleSave = () => {
    const activeTank = tanks.find(t => t.fuelCode === selectedTankCode) || tanks[0];
    
    const newEntry = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shift,
      tank: selectedTankCode,
      opDip: 1.00,
      opStock: parseFloat(openingStock),
      receipt: parseFloat(receiptLtr),
      clDip: 1.00,
      clStock: parseFloat(closingStock),
      variation
    };

    setDipHistory(prev => [newEntry, ...prev]);

    // Record via context
    if (recordPhysicalDip && activeTank) {
      recordPhysicalDip(activeTank.id, parseFloat(closingDip), parseFloat(closingStock));
    }

    // Call Cloudflare Edge endpoint
    fetch('/api/dips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        shift,
        tankId: activeTank?.id || 'tank-1',
        fuelCode: selectedTankCode,
        openingDip,
        openingStock,
        receiptQty: receiptLtr,
        closingDip,
        closingStock,
        meterSale: meterWiseSale
      })
    }).catch(err => console.warn('D1 error:', err));

    alert(`DIP Register Entry Saved! Tank ${selectedTankCode} Variation: ${variation.toFixed(2)} L (OMC Limit: ${asPerLimit.toFixed(2)} L).`);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '980px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Ribbon */}
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(90deg, #1e293b, #0f172a)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              DIP Register (Physical Dip vs Meter Sale & OMC Tolerance)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          
          {/* Top Selection Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Select Tank</label>
              <select value={selectedTankCode} onChange={(e) => setSelectedTankCode(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', fontWeight: 700, border: '1px solid #475569', fontSize: '0.85rem' }}>
                <option value="MS">Tank 01 - Motor Spirit (MS)</option>
                <option value="HSD">Tank 03 - High Speed Diesel (HSD)</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f59e0b', cursor: 'pointer' }}>
                <input type="checkbox" checked={openDipAllow} onChange={(e) => setOpenDipAllow(e.target.checked)} />
                Open Dip Allow
              </label>
            </div>
          </div>

          {/* Dips & Stock Measurement Inputs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Opening Dip (mm)</label>
                <input type="number" step="0.1" value={openingDip} onChange={(e) => setOpeningDip(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Opening Stock (L)</label>
                <input type="number" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Inward Receipt (L)</label>
                <input type="number" value={receiptLtr} onChange={(e) => setReceiptLtr(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Closing Dip (mm)</label>
                <input type="number" step="0.1" value={closingDip} onChange={(e) => setClosingDip(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Closing Stock (L)</label>
                <input type="number" value={closingStock} onChange={(e) => setClosingStock(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontWeight: 700 }} />
              </div>
            </div>
          </div>

          {/* Reconciliation & OMC Loss Tolerance Formula Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dip Wise Sale (Ltr)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', marginTop: '4px' }}>
                {dipWiseSale.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Opening + Receipt - Closing</div>
            </div>

            <div style={{ background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Meter Wise Sale (Ltr)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace', marginTop: '4px' }}>
                {Number(meterWiseSale).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Total Nozzle Totalizers</div>
            </div>

            <div style={{ background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>As Per Dip Variation (Ltr)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: variation < 0 ? '#f87171' : '#34d399', fontFamily: 'monospace', marginTop: '4px' }}>
                {variation.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Dip Sale - Meter Sale</div>
            </div>

            <div style={{ background: '#0b1120', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>As Per OMC Limit (Tolerance)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace', marginTop: '4px' }}>
                {asPerLimit.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{selectedTankCode === 'MS' ? '-0.75%' : '-0.25%'} Statutory Norm</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
              Save (F2) Dip Entry
            </button>
            <button onClick={handleReset} style={{ padding: '10px 18px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
              New Entry (F1)
            </button>
          </div>

          {/* Past Dips Table */}
          <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: '#1e293b', fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
              Historical Dip & Variation Records
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Shift</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Tank</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Opening Stock</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Receipt</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Closing Stock</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Variation (L)</th>
                </tr>
              </thead>
              <tbody>
                {dipHistory.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '6px', color: '#94a3b8' }}>{row.date}</td>
                    <td style={{ padding: '6px', color: '#f8fafc' }}>{row.shift}</td>
                    <td style={{ padding: '6px', color: '#38bdf8', fontWeight: 700 }}>{row.tank}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{row.opStock.toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#34d399' }}>{row.receipt.toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{row.clStock.toFixed(2)}</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: row.variation < 0 ? '#f87171' : '#34d399', fontWeight: 700 }}>{row.variation.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 20px',
          background: '#0b1120',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#ef4444',
          fontWeight: 700,
          fontFamily: 'monospace'
        }}>
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New</div>
          <div style={{ color: '#64748b' }}>OMC Statutory Loss Limit Computation Engine Active</div>
        </div>
      </div>
    </div>
  );
}
