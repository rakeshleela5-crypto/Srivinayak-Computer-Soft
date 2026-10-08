import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  CreditCard, 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Download, 
  Printer, 
  Coins,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function FleetKhataView() {
  const { 
    fleetAccounts, 
    recordFleetPayment, 
    transactions,
    activeRole
  } = useApp();

  const [selectedAccount, setSelectedAccount] = useState(fleetAccounts[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('NEFT');
  const [payRef, setPayRef] = useState('');

  // Filter accounts
  const filteredAccounts = fleetAccounts.filter(acc => 
    acc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get transactions for selected account
  const accountTxns = transactions.filter(t => t.creditAccountId === selectedAccount?.id);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedAccount || !payAmount) return;
    recordFleetPayment(selectedAccount.id, parseFloat(payAmount), payMode, payRef);
    setPaymentModalOpen(false);
    setPayAmount('');
    setPayRef('');
  };

  const utilizationPercent = selectedAccount ? Math.round((selectedAccount.currentBalance / selectedAccount.creditLimit) * 100) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 2fr)', gap: '20px' }}>
      
      {/* Left Column: Fleet Directory & Search */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={22} color="#f59e0b" /> Fleet & Khata Ledgers
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Corporate credit accounts & vehicle authorizations
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search company or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* Account Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '600px' }}>
          {filteredAccounts.map((acc) => {
            const isSelected = selectedAccount?.id === acc.id;
            const utPct = Math.round((acc.currentBalance / acc.creditLimit) * 100);
            const isHighUsage = utPct >= 85;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccount(acc)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#fbbf24' : '#f8fafc' }}>
                    {acc.companyName}
                  </h4>
                  {isHighUsage ? (
                    <span className="badge badge-alert" style={{ fontSize: '0.65rem' }}>HIGH BAL</span>
                  ) : (
                    <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>ACTIVE</span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  {acc.contactPerson} • {acc.vehicles.length} Vehicles
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due Balance:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.92rem', color: '#f87171' }}>
                    ₹{acc.currentBalance.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Limit Progress */}
                <div style={{ marginTop: '6px' }}>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, utPct)}%`, height: '100%', background: isHighUsage ? '#ef4444' : '#f59e0b' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    <span>Limit: ₹{acc.creditLimit.toLocaleString()}</span>
                    <span>{utPct}% used</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Account Details, Vehicles & Ledger Invoicing */}
      {selectedAccount && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Card */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="badge badge-blue">CREDIT ACCOUNT: {selectedAccount.id}</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                  {selectedAccount.companyName}
                </h2>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>GSTIN: <strong>{selectedAccount.gstin}</strong></span>
                  <span>Contact: {selectedAccount.contactPerson} ({selectedAccount.phone})</span>
                  <span>Terms: {selectedAccount.billingCycle}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setPaymentModalOpen(true)}
                  className="btn-primary"
                >
                  <Coins size={18} /> Record Payment Received
                </button>
                <button 
                  onClick={() => window.print()}
                  className="btn-secondary"
                >
                  <Printer size={16} /> Print Ledger
                </button>
              </div>
            </div>

            {/* Credit Status Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px' }}>
              <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>OUTSTANDING BALANCE</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                  ₹{selectedAccount.currentBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CREDIT LIMIT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
                  ₹{selectedAccount.creditLimit.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>AVAILABLE CREDIT</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                  ₹{Math.max(0, selectedAccount.creditLimit - selectedAccount.currentBalance).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Fleet Vehicles List */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="#38bdf8" /> Authorized Fleet Vehicles & Driver Indents ({selectedAccount.vehicles.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              {selectedAccount.vehicles.map((veh, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                      {veh.plate}
                    </span>
                    <span className="badge badge-active">{veh.allowedFuel.join(', ')}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {veh.type}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    <span>Driver: <strong>{veh.driver}</strong></span>
                    <span>Daily Quota: <strong>{veh.dailyQuotaLiters} L</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Ledger Transactions */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#10b981" /> Fuel Indents & Credit Slips Ledger
            </h3>

            {accountTxns.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No credit fuel slips issued in current active shift for this account yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      <th style={{ padding: '8px' }}>SLIP / DATE</th>
                      <th style={{ padding: '8px' }}>VEHICLE</th>
                      <th style={{ padding: '8px' }}>DRIVER / SLIP NO</th>
                      <th style={{ padding: '8px' }}>PRODUCT</th>
                      <th style={{ padding: '8px' }}>LITERS</th>
                      <th style={{ padding: '8px' }}>RATE (₹)</th>
                      <th style={{ padding: '8px' }}>AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountTxns.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px' }}>
                          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{t.receiptNo}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.timestamp}</div>
                        </td>
                        <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                          {t.customerVehicle}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <div>{t.driverName || 'Authorized Driver'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.slipNo || 'INDENT'}</div>
                        </td>
                        <td style={{ padding: '8px' }}>{t.fuelCode}</td>
                        <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{t.liters.toFixed(2)} L</td>
                        <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>₹{t.rate.toFixed(2)}</td>
                        <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f87171' }}>
                          ₹{t.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Receive Payment from {selectedAccount?.companyName}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
              Current Outstanding Balance: <strong style={{ color: '#f87171' }}>₹{selectedAccount?.currentBalance.toLocaleString()}</strong>
            </p>

            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Amount Received (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="NEFT">Bank NEFT / RTGS</option>
                  <option value="CHEQUE">Bank Cheque</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="CASH">Cash Collection</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Transaction UTR / Cheque Ref No</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-HDFC998124"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-action-green" style={{ flex: 1, justifyContent: 'center' }}>
                  Confirm Receipt
                </button>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
