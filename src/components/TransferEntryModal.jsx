import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ArrowRightLeft, Plus, History } from 'lucide-react';

export default function TransferEntryModal({ isOpen, onClose }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('First');
  const [voucherType, setVoucherType] = useState('Receipt Cash Voucher(Cash Deposit)');
  
  const [fromAccount, setFromAccount] = useState('CASH ON HAND');
  const [toAccount, setToAccount] = useState('HDFC CA 0459');
  const [amount, setAmount] = useState(500000);
  const [narration, setNarration] = useState('IOCL RTGS Oil Indent Fund Transfer');

  // Account live balances map
  const [accountBalances, setAccountBalances] = useState({
    'CASH ON HAND': { bal: 620547.12, type: 'Dr' },
    'HDFC CA 0459': { bal: 26000943.17, type: 'Dr' },
    'BOB CA 115': { bal: 9999.81, type: 'Dr' },
    'PRIME CA 00236': { bal: 159823.09, type: 'Dr' },
    'PAYTM': { bal: 92683.82, type: 'Dr' },
    'M SWIPE': { bal: 799801.26, type: 'Dr' },
    'PETRO CARD': { bal: 3388191.24, type: 'Dr' },
    'YES BANK': { bal: 10373611.98, type: 'Dr' }
  });

  const [vouchersList, setVouchersList] = useState([
    { vchTypeName: 'Receipt Cash Voucher(Cash Deposit)', vchNo: '4332', date: '08 Oct 2026', voucherAmount: 500000.00 },
    { vchTypeName: 'Sales Voucher', vchNo: '3151', date: '08 Oct 2026', voucherAmount: 539107.71 },
    { vchTypeName: 'Receipt Voucher', vchNo: '4673', date: '08 Oct 2026', voucherAmount: 682023.46 },
    { vchTypeName: 'Expense Voucher', vchNo: '1951', date: '08 Oct 2026', voucherAmount: 400.00 },
    { vchTypeName: 'Receipt Voucher', vchNo: '4672', date: '08 Oct 2026', voucherAmount: 50000.00 }
  ]);

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
  }, [isOpen, fromAccount, toAccount, amount, narration]);

  if (!isOpen) return null;

  const handleReset = () => {
    setAmount('');
    setNarration('');
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }

    if (fromAccount === toAccount) {
      alert('Source and destination accounts must be different.');
      return;
    }

    const transferAmt = parseFloat(amount);
    const newVchNo = String(Math.floor(Math.random() * 9000) + 1000);

    const newVch = {
      vchTypeName: voucherType,
      vchNo: newVchNo,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      voucherAmount: transferAmt
    };

    setVouchersList(prev => [newVch, ...prev]);

    // Update local balances
    setAccountBalances(prev => ({
      ...prev,
      [fromAccount]: { ...prev[fromAccount], bal: Math.max(0, (prev[fromAccount]?.bal || 0) - transferAmt) },
      [toAccount]: { ...prev[toAccount], bal: (prev[toAccount]?.bal || 0) + transferAmt }
    }));

    // Post to Edge API
    fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        shift,
        voucherType,
        fromAccount,
        toAccount,
        amount: transferAmt,
        narration
      })
    }).catch(err => console.warn('D1 error:', err));

    alert(`Contra Voucher #${newVchNo} recorded! ₹${transferAmt.toLocaleString('en-IN')} transferred from ${fromAccount} to ${toAccount}.`);
    handleReset();
  };

  const fromBal = accountBalances[fromAccount] || { bal: 0, type: 'Dr' };
  const toBal = accountBalances[toAccount] || { bal: 0, type: 'Dr' };

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
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightLeft size={18} color="#fb923c" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Transfer Entry / Contra Vouchers (FrmTransfer)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Left Form (55%), Right Vouchers Grid (45%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '20px', overflowY: 'auto' }}>
          
          {/* Left Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Shift</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Voucher Type</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fbbf24', fontWeight: 700, border: '1px solid #475569', fontSize: '0.88rem' }}
              >
                <option value="Receipt Cash Voucher(Cash Deposit)">Receipt Cash Voucher (Cash Deposit to Bank)</option>
                <option value="Contra Voucher">Contra Voucher (Inter-Bank Fund Transfer)</option>
                <option value="Payment Voucher">Payment Voucher (Cash Withdrawal from Bank)</option>
              </select>
            </div>

            {/* Transfer From Account */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Transfer From</label>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                  Current Balance: ₹{fromBal.bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {fromBal.type}
                </span>
              </div>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.88rem' }}
              >
                {Object.keys(accountBalances).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            {/* Transfer To Account */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Transfer To</label>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontFamily: 'monospace' }}>
                  Current Balance: ₹{toBal.bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} {toBal.type}
                </span>
              </div>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.88rem' }}
              >
                {Object.keys(accountBalances).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Narration</label>
              <textarea
                rows={2}
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="e.g. Bank remittance / RTGS fuel payment cash deposit"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleSave}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Save (F2)
              </button>
              <button
                onClick={handleReset}
                style={{ padding: '10px 16px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                New (F1)
              </button>
            </div>
          </div>

          {/* Right Vouchers Audit Table */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} color="#38bdf8" /> Day Vouchers Journal (Audit Trail)
            </div>

            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px', textAlign: 'left' }}>VchTypeName</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Vch#</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchersList.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '6px', color: '#f8fafc', fontWeight: 600 }}>{row.vchTypeName}</td>
                      <td style={{ padding: '6px', color: '#fbbf24', fontFamily: 'monospace' }}>#{row.vchNo}</td>
                      <td style={{ padding: '6px', color: '#94a3b8' }}>{row.date}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>₹{row.voucherAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <div style={{ color: '#64748b' }}>Contra Ledger Vouchers & Bank Reconciliation Active</div>
        </div>
      </div>
    </div>
  );
}
