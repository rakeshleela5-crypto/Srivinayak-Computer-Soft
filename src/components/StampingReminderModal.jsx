import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Calendar, Clock, Award, CheckCircle2, X, RefreshCw, Plus } from 'lucide-react';

export default function StampingReminderModal({ isOpen, onClose }) {
  const [stampingRecords, setStampingRecords] = useState([
    {
      id: 'STAMP-01',
      dispenser: 'MPD-01 (Island 1)',
      nozzleNumber: 1,
      product: 'MS (Petrol)',
      lastStampedDate: '2025-10-26',
      expiryDate: '2026-10-26',
      daysLeft: 18,
      certNumber: 'LMO/KA/BLR/2025/8921',
      sealSerial: 'W&M-SEAL-90412',
      inspector: 'K. S. Narayana (LMO Bangalore Div-2)',
      status: 'EXPIRING_SOON'
    },
    {
      id: 'STAMP-02',
      dispenser: 'MPD-01 (Island 1)',
      nozzleNumber: 2,
      product: 'MS (Petrol)',
      lastStampedDate: '2025-10-26',
      expiryDate: '2026-10-26',
      daysLeft: 18,
      certNumber: 'LMO/KA/BLR/2025/8922',
      sealSerial: 'W&M-SEAL-90413',
      inspector: 'K. S. Narayana (LMO Bangalore Div-2)',
      status: 'EXPIRING_SOON'
    },
    {
      id: 'STAMP-03',
      dispenser: 'MPD-01 (Island 1)',
      nozzleNumber: 3,
      product: 'HSD (Diesel)',
      lastStampedDate: '2025-11-15',
      expiryDate: '2026-11-15',
      daysLeft: 38,
      certNumber: 'LMO/KA/BLR/2025/9044',
      sealSerial: 'W&M-SEAL-91045',
      inspector: 'K. S. Narayana (LMO Bangalore Div-2)',
      status: 'SAFE'
    },
    {
      id: 'STAMP-04',
      dispenser: 'MPD-01 (Island 1)',
      nozzleNumber: 4,
      product: 'HSD (Diesel)',
      lastStampedDate: '2025-11-15',
      expiryDate: '2026-11-15',
      daysLeft: 38,
      certNumber: 'LMO/KA/BLR/2025/9045',
      sealSerial: 'W&M-SEAL-91046',
      inspector: 'K. S. Narayana (LMO Bangalore Div-2)',
      status: 'SAFE'
    },
    {
      id: 'STAMP-05',
      dispenser: 'MPD-02 (Island 2)',
      nozzleNumber: 5,
      product: 'MS (Petrol)',
      lastStampedDate: '2026-02-10',
      expiryDate: '2027-02-10',
      daysLeft: 125,
      certNumber: 'LMO/KA/BLR/2026/1021',
      sealSerial: 'W&M-SEAL-94511',
      inspector: 'P. R. Hegde (LMO Assistant Controller)',
      status: 'SAFE'
    },
    {
      id: 'STAMP-06',
      dispenser: 'MPD-02 (Island 2)',
      nozzleNumber: 6,
      product: 'MS (Petrol)',
      lastStampedDate: '2026-02-10',
      expiryDate: '2027-02-10',
      daysLeft: 125,
      certNumber: 'LMO/KA/BLR/2026/1022',
      sealSerial: 'W&M-SEAL-94512',
      inspector: 'P. R. Hegde (LMO Assistant Controller)',
      status: 'SAFE'
    },
    {
      id: 'STAMP-07',
      dispenser: 'MPD-02 (Island 2)',
      nozzleNumber: 7,
      product: 'HSD (Diesel)',
      lastStampedDate: '2026-03-01',
      expiryDate: '2027-03-01',
      daysLeft: 144,
      certNumber: 'LMO/KA/BLR/2026/1433',
      sealSerial: 'W&M-SEAL-96102',
      inspector: 'P. R. Hegde (LMO Assistant Controller)',
      status: 'SAFE'
    },
    {
      id: 'STAMP-08',
      dispenser: 'MPD-02 (Island 2)',
      nozzleNumber: 8,
      product: 'HSD (Diesel)',
      lastStampedDate: '2026-03-01',
      expiryDate: '2027-03-01',
      daysLeft: 144,
      certNumber: 'LMO/KA/BLR/2026/1434',
      sealSerial: 'W&M-SEAL-96103',
      inspector: 'P. R. Hegde (LMO Assistant Controller)',
      status: 'SAFE'
    }
  ]);

  const [renewTarget, setRenewTarget] = useState(null);
  const [newCertNumber, setNewCertNumber] = useState('');
  const [newSealSerial, setNewSealSerial] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const urgentCount = stampingRecords.filter(r => r.daysLeft <= 30).length;

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    if (!renewTarget) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];

    setStampingRecords(prev => prev.map(item => {
      if (item.id === renewTarget.id) {
        return {
          ...item,
          lastStampedDate: todayStr,
          expiryDate: nextYearStr,
          daysLeft: 365,
          certNumber: newCertNumber || item.certNumber,
          sealSerial: newSealSerial || item.sealSerial,
          status: 'SAFE'
        };
      }
      return item;
    }));

    setSuccessMsg(`Nozzle #${renewTarget.nozzleNumber} Legal Metrology Stamping updated successfully for 365 days!`);
    setRenewTarget(null);
    setNewCertNumber('');
    setNewSealSerial('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '950px',
        maxWidth: '96vw',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0b1329',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Weights & Measures (W&M) Stamping Reminder
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Legal Metrology Act 2009 & Petroleum Dispensing Unit Annual Stamping Register
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

        {/* Urgent Alert Banner */}
        {urgentCount > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="#f87171" />
              <div>
                <strong style={{ color: '#f87171', fontSize: '0.9rem' }}>Attention: {urgentCount} Nozzle(s) Expiring within 30 Days!</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Legal Metrology Officer (LMO) annual verification and sealing inspection is due before expiration date to avoid penalties or dispensing halt.
                </div>
              </div>
            </div>
            <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px' }}>
              ACTION REQUIRED
            </span>
          </div>
        )}

        {successMsg && (
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
            {successMsg}
          </div>
        )}

        {/* Stamping Grid / Table */}
        <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', background: 'rgba(255,255,255,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Dispenser & Nozzle</th>
                <th style={{ padding: '12px 14px' }}>Product</th>
                <th style={{ padding: '12px 14px' }}>Last Stamped</th>
                <th style={{ padding: '12px 14px' }}>Expiry Due</th>
                <th style={{ padding: '12px 14px' }}>Countdown</th>
                <th style={{ padding: '12px 14px' }}>Seal & Cert #</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stampingRecords.map(rec => {
                const isUrgent = rec.daysLeft <= 30;
                return (
                  <tr key={rec.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isUrgent ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                  }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{rec.dispenser}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Nozzle #{rec.nozzleNumber}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: rec.product.startsWith('MS') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: rec.product.startsWith('MS') ? '#fbbf24' : '#60a5fa'
                      }}>
                        {rec.product}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>
                      {rec.lastStampedDate}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: isUrgent ? '#f87171' : '#cbd5e1' }}>
                      {rec.expiryDate}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: isUrgent ? '#f87171' : '#34d399',
                        border: isUrgent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <Clock size={12} />
                        {rec.daysLeft} Day(s) Left
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>{rec.sealSerial}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{rec.certNumber}</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setRenewTarget(rec);
                          setNewCertNumber(rec.certNumber);
                          setNewSealSerial(rec.sealSerial);
                        }}
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#fbbf24',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        Update Seal
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Sub-Form to Renew/Update Seal */}
        {renewTarget && (
          <div style={{
            marginTop: '20px',
            padding: '18px',
            borderRadius: '12px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#fbbf24', fontWeight: 700 }}>
              Record Annual Stamping Verification for Nozzle #{renewTarget.nozzleNumber} ({renewTarget.dispenser})
            </h4>
            <form onSubmit={handleRenewSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  LMO Verification Certificate No.
                </label>
                <input
                  type="text"
                  value={newCertNumber}
                  onChange={(e) => setNewCertNumber(e.target.value)}
                  placeholder="e.g. LMO/KA/BLR/2026/..."
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  W&M Lead/Aluminum Seal Serial No.
                </label>
                <input
                  type="text"
                  value={newSealSerial}
                  onChange={(e) => setNewSealSerial(e.target.value)}
                  placeholder="e.g. W&M-SEAL-98765"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '9px 16px', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  Save Verification (365d)
                </button>
                <button
                  type="button"
                  onClick={() => setRenewTarget(null)}
                  className="btn-secondary"
                  style={{ padding: '9px 14px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Statutory Rule: Dispenser pulsers and flow meters must be calibrated within +/- 25ml per 5000ml (5 Litre Measure) as per Legal Metrology Standards.
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Close (Esc)
          </button>
        </div>

      </div>
    </div>
  );
}
