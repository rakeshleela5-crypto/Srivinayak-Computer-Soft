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
  Receipt,
  QrCode,
  Plus,
  Share2,
  Send,
  Smartphone,
  X,
  Sparkles
} from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { audioFX } from '../utils/audioFX';

export default function CreditCustomerPortalView() {
  const { 
    fleetAccounts, 
    activePortalFleetId, 
    setActivePortalFleetId,
    transactions,
    stationInfo,
    digitalIndents,
    createDigitalIndent
  } = useApp();

  const account = fleetAccounts.find(f => f.id === activePortalFleetId) || fleetAccounts[0];
  const myTxns = transactions.filter(t => t.creditAccountId === account.id);
  const myIndents = digitalIndents.filter(i => i.fleetId === account.id);

  const [indentModalOpen, setIndentModalOpen] = useState(false);
  const [selectedIndentForQr, setSelectedIndentForQr] = useState(null);

  // Form State for New Indent
  const [newVehiclePlate, setNewVehiclePlate] = useState(account.vehicles[0]?.plate || '');
  const [newDriverName, setNewDriverName] = useState(account.vehicles[0]?.driver || '');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 98450 00000');
  const [newFuelCode, setNewFuelCode] = useState('HSD');
  const [newMaxLiters, setNewMaxLiters] = useState(account.vehicles[0]?.dailyQuotaLiters || 150);
  const [newNotes, setNewNotes] = useState('Authorized transport transit trip');

  const utPercent = Math.round((account.currentBalance / account.creditLimit) * 100);
  const availableCredit = Math.max(0, account.creditLimit - account.currentBalance);

  const handleVehicleSelect = (plate) => {
    setNewVehiclePlate(plate);
    const matchedVeh = account.vehicles.find(v => v.plate === plate);
    if (matchedVeh) {
      setNewDriverName(matchedVeh.driver || '');
      setNewMaxLiters(matchedVeh.dailyQuotaLiters || 150);
      setNewFuelCode(matchedVeh.allowedFuel[0] || 'HSD');
    }
  };

  const handleCreateIndent = (e) => {
    e.preventDefault();
    const created = createDigitalIndent({
      fleetId: account.id,
      companyName: account.companyName,
      vehiclePlate: newVehiclePlate,
      driverName: newDriverName,
      driverPhone: newDriverPhone,
      fuelCode: newFuelCode,
      maxLiters: parseFloat(newMaxLiters) || 100,
      notes: newNotes
    });
    audioFX.playCashRegister();
    setIndentModalOpen(false);
    setSelectedIndentForQr(created);
  };

  const shareIndentWhatsApp = (indent) => {
    const text = `⛽ *SHREE VINAYAKA PETROSOFT - FUEL INDENT SLIP*
📄 Indent No: *${indent.indentNumber}*
🏢 Fleet: ${indent.companyName}
🚛 Vehicle: *${indent.vehiclePlate}*
👤 Driver: ${indent.driverName}
🛢️ Product: *${indent.fuelCode}*
📊 Authorized Limit: *${indent.maxLiters} Liters*
🔐 Security PIN: *${indent.securityPin}*
⏳ Valid Till: ${indent.expiresAt}

_Present this Digital QR at Shree Vinayaka PetroSoft forecourt for immediate fueling._`;
    audioFX.playQrBeep();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

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

          <button 
            onClick={() => setIndentModalOpen(true)} 
            className="btn-primary" 
            style={{ marginTop: '16px' }}
          >
            <Plus size={16} /> Issue Driver QR Indent Slip
          </button>

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

      {/* Active Digital Fleet Indents & Driver QR Slips */}
      <div className="glass-card" style={{ padding: '22px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={18} color="#38bdf8" /> Active Fleet Fuel Indents & Cryptographic QR Slips ({myIndents.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Tamper-proof digital vouchers issued to drivers with max liters and OTP validation.
            </span>
          </div>

          <button 
            onClick={() => setIndentModalOpen(true)}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Plus size={15} /> Issue New Indent
          </button>
        </div>

        {myIndents.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            No active digital indents issued for this fleet. Click "Issue New Indent" to generate one.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {myIndents.map((indent) => {
              const isRedeemed = indent.status === 'REDEEMED';
              return (
                <div 
                  key={indent.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: isRedeemed ? 'rgba(15, 23, 42, 0.4)' : 'rgba(2, 6, 23, 0.65)',
                    border: isRedeemed ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>{indent.indentNumber}</span>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                        {indent.vehiclePlate}
                      </div>
                    </div>
                    <span className={isRedeemed ? 'badge' : 'badge badge-active'} style={{ fontSize: '0.68rem' }}>
                      {indent.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Driver: <strong>{indent.driverName}</strong> ({indent.driverPhone})
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                    <span>Product: <strong>{indent.fuelCode}</strong></span>
                    <span>Max Quota: <strong style={{ color: '#38bdf8' }}>{indent.maxLiters} L</strong></span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    <span>Expires: {indent.expiresAt}</span>
                    <span>PIN: <strong style={{ color: '#34d399' }}>{indent.securityPin}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndentForQr(indent)}
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px' }}
                    >
                      <QrCode size={14} color="#38bdf8" /> View QR Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => shareIndentWhatsApp(indent)}
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '6px', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                    >
                      <Share2 size={14} /> WhatsApp Driver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* Modal 1: Create Digital Driver Indent */}
      {indentModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 95,
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Issue Driver Digital QR Indent
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIndentModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIndent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Enrolled Vehicle</label>
                <select
                  value={newVehiclePlate}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                  required
                >
                  {account.vehicles.map((v, i) => (
                    <option key={i} value={v.plate}>{v.plate} — {v.driver} ({v.type})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Driver Name</label>
                  <input
                    type="text"
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver WhatsApp Mobile</label>
                  <input
                    type="text"
                    value={newDriverPhone}
                    onChange={(e) => setNewDriverPhone(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fuel Product</label>
                  <select
                    value={newFuelCode}
                    onChange={(e) => setNewFuelCode(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="HSD">High Speed Diesel (HSD)</option>
                    <option value="MS">Motor Spirit Petrol (MS)</option>
                    <option value="XP95">Extra Premium 95 (XP)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Authorized Liters</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newMaxLiters}
                    onChange={(e) => setNewMaxLiters(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transit Trip / Route Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bangalore to Hubli Highway transit"
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-action-green" style={{ flex: 1, justifyContent: 'center' }}>
                  Generate & Encrypt QR Indent
                </button>
                <button type="button" onClick={() => setIndentModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View High-Res QR Indent Voucher */}
      {selectedIndentForQr && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '420px', maxWidth: '95vw', padding: '26px', background: '#020617', border: '2px solid rgba(56, 189, 248, 0.4)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="badge badge-active" style={{ background: '#38bdf8', color: '#0f172a' }}>DIGITAL FUEL INDENT</span>
              <button 
                type="button" 
                onClick={() => setSelectedIndentForQr(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedIndentForQr.companyName}</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {selectedIndentForQr.vehiclePlate}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '16px' }}>
              Authorized: {selectedIndentForQr.maxLiters}L of {selectedIndentForQr.fuelCode}
            </div>

            {/* Offline SVG QR Display */}
            <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
              <QRCodeDisplay 
                value={selectedIndentForQr.qrPayload}
                size={190}
                title={`VOUCHER #${selectedIndentForQr.indentNumber}`}
                subtitle={`SECURITY OTP PIN: ${selectedIndentForQr.securityPin}`}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Driver:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedIndentForQr.driverName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Valid Until:</span>
                <strong style={{ color: '#f8fafc' }}>{selectedIndentForQr.expiresAt}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Forecourt Terminal:</span>
                <strong style={{ color: '#34d399' }}>Shree Vinayaka PetroSoft</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => shareIndentWhatsApp(selectedIndentForQr)}
                className="btn-action-green"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Share2 size={16} /> Send via WhatsApp
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
              >
                <Printer size={16} /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
