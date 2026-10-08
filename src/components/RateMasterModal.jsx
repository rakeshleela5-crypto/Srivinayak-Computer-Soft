import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Clock, TrendingUp } from 'lucide-react';

export default function RateMasterModal({ isOpen, onClose }) {
  const { fuelPrices, updateFuelPrice, t } = useApp();
  const [selectedItem, setSelectedItem] = useState(fuelPrices[0]?.code || 'MS');
  const [rateInput, setRateInput] = useState(fuelPrices[0]?.price || 102.84);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Rate change audit history
  const [history, setHistory] = useState([
    { productName: 'Motor Spirit (Petrol 91)', rate: 102.84, date: '08 Oct 2026' },
    { productName: 'High Speed Diesel', rate: 89.75, date: '08 Oct 2026' },
    { productName: 'Extra Premium 95', rate: 108.40, date: '08 Oct 2026' },
    { productName: 'Motor Spirit (Petrol 91)', rate: 102.50, date: '07 Oct 2026' },
    { productName: 'High Speed Diesel', rate: 89.45, date: '07 Oct 2026' }
  ]);

  useEffect(() => {
    const cur = fuelPrices.find(f => f.code === selectedItem);
    if (cur) setRateInput(cur.price);
  }, [selectedItem, fuelPrices]);

  // Keyboard shortcut listener: ESC to close, F2 to save, F1 for new entry
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
        setRateInput('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedItem, rateInput, effectiveDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!rateInput || parseFloat(rateInput) <= 0) return;
    const newRate = parseFloat(rateInput);
    updateFuelPrice(selectedItem, newRate);
    const itemObj = fuelPrices.find(f => f.code === selectedItem);
    setHistory(prev => [
      { productName: itemObj ? itemObj.name : selectedItem, rate: newRate, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
      ...prev
    ]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '800px',
        maxWidth: '95vw',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #1e293b, #0f172a)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#c084fc" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Rate Master (06:00 AM Revision)
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Left Form, Right History Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px' }}>
          {/* Left Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Select Item *
              </label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #475569',
                  fontSize: '0.95rem'
                }}
              >
                {fuelPrices.map(f => (
                  <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Rate/Ltr (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #475569',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  fontFamily: 'monospace'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Effective from *
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #475569',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            {saveSuccess && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#4ade80', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} /> Rate updated successfully and logged in D1!
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', color: '#fff', fontWeight: 800 }}
              >
                Save (F2)
              </button>
              <button
                onClick={() => setRateInput('')}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px' }}
              >
                New Entry (F1)
              </button>
            </div>
          </div>

          {/* Right History Table */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="#38bdf8" /> Rate Revision History Log
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>Product Name</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '8px 10px', color: '#f8fafc' }}>{row.productName}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>₹{row.rate.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#94a3b8' }}>{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div style={{
          padding: '10px 20px',
          background: '#0b1120',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#ef4444',
          fontWeight: 700,
          fontFamily: 'monospace'
        }}>
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New</div>
          <div style={{ color: '#64748b' }}>Statutory 06:00 AM Daily Pricing Matrix</div>
        </div>
      </div>
    </div>
  );
}
