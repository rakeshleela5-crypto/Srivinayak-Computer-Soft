import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Truck, 
  CreditCard, 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  User, 
  Fuel,
  TrendingUp,
  Receipt
} from 'lucide-react';

export default function CreditCustomerPortalView() {
  const { 
    fleetAccounts, 
    activePortalFleetId, 
    setActivePortalFleetId,
    transactions,
    stationInfo
  } = useApp();

  const account = fleetAccounts.find(f => f.id === activePortalFleetId) || fleetAccounts[0];
  const myTxns = transactions.filter(t => t.creditAccountId === account.id);

  const utPercent = Math.round((account.currentBalance / account.creditLimit) * 100);
  const availableCredit = Math.max(0, account.creditLimit - account.currentBalance);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #2563eb)', color: '#ffffff', fontWeight: 900, fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px' }}>
              B2B FLEET CUSTOMER PORTAL
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>GSTIN: <strong>{account.gstin}</strong></span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
            {account.companyName}
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Contact: {account.contactPerson} ({account.phone}) • Billing Cycle: {account.billingCycle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Switch Fleet Account</label>
            <select
              value={activePortalFleetId}
              onChange={(e) => setActivePortalFleetId(e.target.value)}
              style={{ display: 'block', marginTop: '4px', fontSize: '0.85rem', background: '#020617', color: '#38bdf8', fontWeight: 700 }}
            >
              {fleetAccounts.map(f => (
                <option key={f.id} value={f.id}>{f.companyName}</option>
              ))}
            </select>
          </div>

          <button onClick={() => window.print()} className="btn-secondary" style={{ marginTop: '16px' }}>
            <Printer size={16} /> Print Monthly Statement
          </button>
        </div>
      </div>

      {/* Credit Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #f87171' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>OUTSTANDING DUES (TO PAY)</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>
            ₹{account.currentBalance.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Payment due in {account.paymentTermsDays} days
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #34d399' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>AVAILABLE CREDIT LIMIT</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>
            ₹{availableCredit.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Approved Limit: ₹{account.creditLimit.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>CREDIT UTILIZATION</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
            {utPercent}%
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ width: `${Math.min(100, utPercent)}%`, height: '100%', background: utPercent > 85 ? '#ef4444' : '#f59e0b' }} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>AUTHORIZED VEHICLES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
            {account.vehicles.length} Trucks
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            With authorized daily quotas
          </div>
        </div>

      </div>

      {/* Fleet Vehicles Roster */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="#38bdf8" /> Enrolled Fleet Vehicles & Daily Indent Quotas
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {account.vehicles.map((v, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', fontSize: '0.95rem' }}>{v.plate}</strong>
                <span className="badge badge-active">{v.allowedFuel.join(', ')}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>{v.type}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                <span>Driver: {v.driver}</span>
                <span>Max Quota: <strong>{v.dailyQuotaLiters} L/day</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fuel Indents & Slips History (Printable Statement) */}
      <div className="glass-card printable-area" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Consolidated Fuel Invoices & Driver Indent Slips
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Verified against vehicle odometer readings and authorized driver signatures
            </span>
          </div>
          <span className="badge badge-active">MONTHLY STATEMENT</span>
        </div>

        {myTxns.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            No credit fuel slips issued in current cycle yet. All previous invoices settled.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '10px 8px' }}>DATE / TIME</th>
                  <th style={{ padding: '10px 8px' }}>SLIP NO</th>
                  <th style={{ padding: '10px 8px' }}>VEHICLE NO</th>
                  <th style={{ padding: '10px 8px' }}>DRIVER NAME</th>
                  <th style={{ padding: '10px 8px' }}>PRODUCT</th>
                  <th style={{ padding: '10px 8px' }}>VOLUME</th>
                  <th style={{ padding: '10px 8px' }}>RATE (₹)</th>
                  <th style={{ padding: '10px 8px' }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {myTxns.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 8px' }}>{t.timestamp}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>{t.slipNo || t.receiptNo}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff' }}>{t.customerVehicle}</td>
                    <td style={{ padding: '10px 8px' }}>{t.driverName || 'Authorized Driver'}</td>
                    <td style={{ padding: '10px 8px' }}>{t.fuelCode}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{t.liters.toFixed(2)} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>₹{t.rate.toFixed(2)}</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f87171' }}>
                      ₹{t.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NEFT / Payment Instructions */}
        <div style={{ marginTop: '24px', padding: '14px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: '#ffffff' }}>Payment Remittance Details:</strong>
          <div>Bank: State Bank of India (SBI) • Account Name: Shree Vinayaka PetroSoft • A/c No: 30819284901 • IFSC: SBIN0004812</div>
          <div>Please cite your company name or invoice reference on NEFT/RTGS transfer.</div>
        </div>
      </div>

    </div>
  );
}
