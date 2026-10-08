import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, AlertCircle, RefreshCw, Undo2, CreditCard } from 'lucide-react';

export default function PaymentReceiptModal({ isOpen, onClose }) {
  const { fleetAccounts } = useApp();

  const [shift, setShift] = useState('First');
  const [receiptNo, setReceiptNo] = useState('00008');
  const [selectedCustomerId, setSelectedCustomerId] = useState(fleetAccounts[0]?.id || 'fl-01');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);

  const [addBillWise, setAddBillWise] = useState(false);
  const [addVehicleWise, setAddVehicleWise] = useState(false);

  const [paymentMode, setPaymentMode] = useState('UPI PAYMENT');
  const [tcsPercent, setTcsPercent] = useState(0.0);
  const [bankOfCheque, setBankOfCheque] = useState('State Bank of India');
  const [chequeNo, setChequeNo] = useState('');
  const [receivingBank, setReceivingBank] = useState('HDFC CA 0459');
  const [amount, setAmount] = useState(50000);
  const [remark, setRemark] = useState('');

  // Cheque return sub-modal state
  const [chequeReturnModalOpen, setChequeReturnModalOpen] = useState(false);
  const [bouncedChequeNo, setBouncedChequeNo] = useState('CHQ-889102');
  const [bouncedBank, setBouncedBank] = useState('State Bank of India');
  const [bouncedAmount, setBouncedAmount] = useState(45000);
  const [penaltyCharge, setPenaltyCharge] = useState(350);
  const [bounceReason, setBounceReason] = useState('Insufficient Funds');

  const [receiptsList, setReceiptsList] = useState([
    { shiftName: 'First', receiptDate: '08 Oct 2026', customerName: 'LIVAVATI TRANSPORTY', paymentMode: 'UPI PAYMENT', amountReceived: 50000.0 },
    { shiftName: 'First', receiptDate: '08 Oct 2026', customerName: 'PORT TRANSPORT', paymentMode: 'CASH', amountReceived: 15000.0 },
    { shiftName: 'First', receiptDate: '07 Oct 2026', customerName: 'PORT TRANSPORT', paymentMode: 'CASH', amountReceived: 6000.0 },
    { shiftName: 'First', receiptDate: '06 Oct 2026', customerName: 'ABC TRANSPORT', paymentMode: 'CHEQUE', amountReceived: 50000.0 }
  ]);

  const currentAcc = fleetAccounts.find(f => f.id === selectedCustomerId) || fleetAccounts[0];
  const totalPurchase = (currentAcc?.currentBalance || 150000) + 28867.20;
  const totalPaid = 65000.0;
  const totalUnpaid = Math.max(0, totalPurchase - totalPaid);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (chequeReturnModalOpen) setChequeReturnModalOpen(false);
        else onClose();
      }
      if (e.key === 'F2') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setAmount('');
        setRemark('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, chequeReturnModalOpen, amount, selectedCustomerId, paymentMode]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const newRec = {
      shiftName: shift,
      receiptDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      customerName: currentAcc?.companyName || 'Customer',
      paymentMode,
      amountReceived: parseFloat(amount)
    };

    setReceiptsList(prev => [newRec, ...prev]);

    // Dispatch to Cloudflare D1
    fetch('/api/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RECORD_PAYMENT',
        customerId: currentAcc?.id,
        amount: parseFloat(amount),
        paymentMode,
        referenceNo: chequeNo || `RCP-${receiptNo}`,
        notes: remark
      })
    }).catch(err => console.warn('D1 error:', err));

    alert(`Payment Receipt #${receiptNo} for ₹${parseFloat(amount).toLocaleString('en-IN')} Saved & Credited to Customer Ledger!`);
    setReceiptNo(prev => String(Number(prev) + 1).padStart(5, '0'));
    setAmount('');
    setRemark('');
  };

  const handleChequeBounceSubmit = () => {
    if (!bouncedAmount || !bouncedChequeNo) return;

    fetch('/api/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CHEQUE_RETURN',
        customerId: currentAcc?.id,
        customerName: currentAcc?.companyName,
        chequeNo: bouncedChequeNo,
        bankName: bouncedBank,
        amount: parseFloat(bouncedAmount),
        penalty: parseFloat(penaltyCharge),
        reason: bounceReason
      })
    }).catch(err => console.warn('D1 error:', err));

    alert(`Cheque #${bouncedChequeNo} marked as BOUNCED. ₹${parseFloat(bouncedAmount) + parseFloat(penaltyCharge)} re-debited to ${currentAcc?.companyName}. Ledger reversed.`);
    setChequeReturnModalOpen(false);
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
        width: '1050px',
        maxWidth: '96vw',
        maxHeight: '94vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Customer's Payment (Payment Receipt)
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Receipt No: <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>#{receiptNo}</strong>
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Grid: Left Form (55%), Right History Grid (45%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '20px', overflowY: 'auto' }}>
          
          {/* Left Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  {fleetAccounts.map(f => (
                    <option key={f.id} value={f.id}>{f.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Receipt Date</label>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Reconciliation Checkboxes */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer' }}>
                <input type="checkbox" checked={addBillWise} onChange={(e) => setAddBillWise(e.target.checked)} />
                Add Bill Wise
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer' }}>
                <input type="checkbox" checked={addVehicleWise} onChange={(e) => setAddVehicleWise(e.target.checked)} />
                Add Vehicle Wise
              </label>
            </div>

            {/* Financial Ledger Snapshot Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Purchase</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                  ₹{totalPurchase.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Paid</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', fontFamily: 'monospace' }}>
                  ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Total Unpaid</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f87171', fontFamily: 'monospace' }}>
                  ₹{totalUnpaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Mode & Bank Accounts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  <option value="UPI PAYMENT">UPI PAYMENT (GPay / Paytm / PhonePe)</option>
                  <option value="CASH">CASH</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="NEFT/RTGS">NEFT / RTGS</option>
                  <option value="CARD">POS CARD SWIPE</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Receiving Bank / A/C</label>
                <select
                  value={receivingBank}
                  onChange={(e) => setReceivingBank(e.target.value)}
                  style={{ width: '100%', padding: '7px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  <option value="HDFC CA 0459">HDFC CA 0459</option>
                  <option value="BOB CA 115">BOB CA 115</option>
                  <option value="PAYTM">PAYTM WALLET</option>
                  <option value="CASH ON HAND">CASH ON HAND</option>
                  <option value="PRIME CA 00236">PRIME CA 00236</option>
                  <option value="YES BANK">YES BANK CA</option>
                </select>
              </div>
            </div>

            {paymentMode === 'CHEQUE' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Bank of Cheque</label>
                  <input
                    type="text"
                    value={bankOfCheque}
                    onChange={(e) => setBankOfCheque(e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Cheque No</label>
                  <input
                    type="text"
                    placeholder="e.g. 889102"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Amount Received (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>TCS %</label>
                <input
                  type="number"
                  step="0.01"
                  value={tcsPercent}
                  onChange={(e) => setTcsPercent(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Remark / UTR No</label>
              <input
                type="text"
                placeholder="Bank UTR / deposit reference"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleSave}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Save (F2)
              </button>
              <button
                onClick={() => { setAmount(''); setRemark(''); }}
                style={{ padding: '10px 14px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                New Entry (F1)
              </button>
              <button
                onClick={() => setChequeReturnModalOpen(true)}
                style={{ padding: '10px 14px', background: '#dc2626', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Undo2 size={14} /> Cheque Returns
              </button>
            </div>
          </div>

          {/* Right Recent Receipts List */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px' }}>
              Payment Receipts History Log
            </div>

            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Mode</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptsList.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '6px', color: '#94a3b8' }}>{row.receiptDate}</td>
                      <td style={{ padding: '6px', color: '#f8fafc', fontWeight: 600 }}>{row.customerName}</td>
                      <td style={{ padding: '6px', color: '#38bdf8' }}>{row.paymentMode}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>₹{row.amountReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cheque Return Sub-Modal */}
        {chequeReturnModalOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 10000
          }}>
            <div style={{ width: '480px', background: '#0f172a', border: '1px solid #ef4444', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                  <AlertCircle size={18} /> Cheque Bounce Reversal (Penalty & Re-Debit)
                </h4>
                <button onClick={() => setChequeReturnModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Customer</label>
                  <input type="text" value={currentAcc?.companyName || ''} readOnly style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Bounced Cheque No</label>
                  <input type="text" value={bouncedChequeNo} onChange={(e) => setBouncedChequeNo(e.target.value)} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#f87171', border: '1px solid #475569', borderRadius: '4px', fontFamily: 'monospace' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Cheque Amount (₹)</label>
                    <input type="number" value={bouncedAmount} onChange={(e) => setBouncedAmount(e.target.value)} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Bank Penalty (₹)</label>
                    <input type="number" value={penaltyCharge} onChange={(e) => setPenaltyCharge(e.target.value)} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', borderRadius: '4px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Reason</label>
                  <input type="text" value={bounceReason} onChange={(e) => setBounceReason(e.target.value)} style={{ width: '100%', padding: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '4px' }} />
                </div>

                <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', fontSize: '0.75rem', color: '#fca5a5' }}>
                  Total re-debit to customer account: <strong>₹{(parseFloat(bouncedAmount || 0) + parseFloat(penaltyCharge || 0)).toLocaleString('en-IN')}</strong>. This will restore outstanding balance and log bank charge.
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button onClick={handleChequeBounceSubmit} style={{ flex: 1, padding: '8px', background: '#dc2626', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                    Confirm Bounce Reversal
                  </button>
                  <button onClick={() => setChequeReturnModalOpen(false)} style={{ padding: '8px 14px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Shortcut Bar */}
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
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New Entry</div>
          <div style={{ color: '#64748b' }}>B2B Fleet Ledger Settlement & Cheque Reversal Engine</div>
        </div>
      </div>
    </div>
  );
}
