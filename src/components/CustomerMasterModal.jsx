import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Search, Plus, Truck, BookOpen, Eye, EyeOff } from 'lucide-react';

export default function CustomerMasterModal({ isOpen, onClose }) {
  const { fleetAccounts, addFleetAccount } = useApp();

  const [customerCode, setCustomerCode] = useState(25);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [gstNo, setGstNo] = useState('');
  const [panNo, setPanNo] = useState('');
  
  // Toggles / Checkboxes
  const [ndcRequired, setNdcRequired] = useState(false);
  const [isB2c, setIsB2c] = useState(false);
  const [tdsApply, setTdsApply] = useState(true);
  const [isTanker, setIsTanker] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const [billPeriod, setBillPeriod] = useState('30 day');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [remarks, setRemarks] = useState('');

  // Account Related
  const [password, setPassword] = useState('8624');
  const [showPassword, setShowPassword] = useState(false);
  const [opBal, setOpBal] = useState(0);
  const [creditLimit, setCreditLimit] = useState(100000);
  const [discount, setDiscount] = useState(0.50);
  const [charges, setCharges] = useState(0.0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  // Sub-modals for vehicles and slipbooks
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Truck / Dumper');

  // Keyboard shortcut listener
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
  }, [isOpen, customerName, mobileNo, creditLimit, opBal]);

  if (!isOpen) return null;

  const handleReset = () => {
    setCustomerCode(prev => prev + 1);
    setCustomerName('');
    setAddress('');
    setGstNo('');
    setPanNo('');
    setMobileNo('');
    setEmail('');
    setRemarks('');
    setOpBal(0);
    setCreditLimit(100000);
    setDiscount(0.50);
    setCharges(0.0);
    setStatusMsg(null);
  };

  const handleSave = () => {
    if (!customerName || !mobileNo) {
      alert('Customer Name and Mobile No are mandatory.');
      return;
    }

    const newAcc = {
      id: `fl-${Date.now().toString().slice(-4)}`,
      customerCode,
      companyName: customerName,
      contactPerson: customerName,
      phone: mobileNo.startsWith('+91') ? mobileNo : `+91 ${mobileNo}`,
      address,
      city,
      state,
      gstin: gstNo,
      panNo,
      ndcRequired,
      isB2c,
      tdsApply,
      isTanker,
      isBlocked,
      billPeriod,
      driverPin: password,
      creditLimit: parseFloat(creditLimit) || 0,
      openingBalance: parseFloat(opBal) || 0,
      currentBalance: parseFloat(opBal) || 0,
      billingCycle: billPeriod,
      discountPerLiter: parseFloat(discount) || 0,
      chargePct: parseFloat(charges) || 0,
      status: isBlocked ? 'LOCKED' : 'ACTIVE',
      vehicles: []
    };

    if (addFleetAccount) {
      addFleetAccount(newAcc);
    }

    // Call Cloudflare D1 endpoint
    fetch('/api/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'REGISTER_CUSTOMER',
        ...newAcc
      })
    }).catch(err => console.warn('D1 Sync warning:', err));

    setStatusMsg(`Customer ${customerName} saved successfully!`);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const filteredCustomers = fleetAccounts.filter(c => 
    c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

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
        maxHeight: '92vh',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          background: 'linear-gradient(90deg, #1e293b, #0f172a)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#38bdf8' }}>Customer Master</span> / Credit Customer Register
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Grid: Left Form (60%), Right Directory (40%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', padding: '20px', overflowY: 'auto' }}>
          
          {/* Left Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>CUSTOMER REGISTER</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Customer Code: <strong style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{customerCode}</strong>
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Customer Name *
              </label>
              <input
                type="text"
                placeholder="e.g. LIVAVATI TRANSPORTY"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Address
              </label>
              <textarea
                rows={2}
                placeholder="Transporter depot / yard address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>GST NO</label>
                <input
                  type="text"
                  placeholder="24AAACL1234F1Z9"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>PAN NO *</label>
                <input
                  type="text"
                  placeholder="AAACL1234F"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Statutory & Operational Checkboxes */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input type="checkbox" checked={ndcRequired} onChange={(e) => setNdcRequired(e.target.checked)} />
                NDC ?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input type="checkbox" checked={isB2c} onChange={(e) => setIsB2c(e.target.checked)} />
                B2C ?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input type="checkbox" checked={tdsApply} onChange={(e) => setTdsApply(e.target.checked)} />
                TDS Apply ??
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#f8fafc', cursor: 'pointer' }}>
                <input type="checkbox" checked={isTanker} onChange={(e) => setIsTanker(e.target.checked)} />
                Is It Tanker ?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} />
                Block ?
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  Mobile No * (WhatsApp)
                </label>
                <div style={{ display: 'flex' }}>
                  <span style={{ padding: '8px 10px', background: '#334155', color: '#fff', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px', fontSize: '0.85rem' }}>+91</span>
                  <input
                    type="text"
                    placeholder="9274781188"
                    value={mobileNo}
                    onChange={(e) => setMobileNo(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Bill Period</label>
                <select
                  value={billPeriod}
                  onChange={(e) => setBillPeriod(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  <option value="30 day">30 day</option>
                  <option value="15 day">15 day</option>
                  <option value="7 day">7 day</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
            </div>

            {/* Account Related Information Strip */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px' }}>
                Account Related Information & Financial Terms
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Password / PIN</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: '70px', padding: '6px 8px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.8rem', fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Op Bal (₹)</label>
                  <input
                    type="number"
                    value={opBal}
                    onChange={(e) => setOpBal(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', background: '#1e293b', color: '#f87171', border: '1px solid #475569', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Dis. (₹/L) | Chg %</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      style={{ width: '50px', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '0.78rem' }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={charges}
                      onChange={(e) => setCharges(e.target.value)}
                      style={{ width: '50px', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#f59e0b', border: '1px solid #475569', fontSize: '0.78rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {statusMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', borderRadius: '6px', color: '#4ade80', fontSize: '0.85rem' }}>
                {statusMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                onClick={handleSave}
                style={{ padding: '8px 14px', background: '#2563eb', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Save (F2)
              </button>
              <button
                onClick={handleReset}
                style={{ padding: '8px 14px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                New Entry (F1)
              </button>
              <button
                onClick={() => setVehicleModalOpen(true)}
                style={{ padding: '8px 14px', background: '#475569', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Truck size={14} /> Add Vehicle
              </button>
              <button
                onClick={() => alert(`Pre-printed indent slip book allocated to ${customerName || 'Customer'}`)}
                style={{ padding: '8px 14px', background: '#475569', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <BookOpen size={14} /> Add SlipBook
              </button>
            </div>
          </div>

          {/* Right Search Directory */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.82rem' }}
              />
            </div>

            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>CustomerName</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>City</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>MobileNo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, idx) => (
                    <tr
                      key={c.id || idx}
                      onClick={() => {
                        setCustomerName(c.companyName);
                        setAddress(c.address || '');
                        setCity(c.city || 'Bangalore');
                        setGstNo(c.gstin || '');
                        setPanNo(c.panNo || '');
                        setMobileNo(c.phone ? c.phone.replace('+91', '').trim() : '');
                        setCreditLimit(c.creditLimit || 100000);
                        setOpBal(c.openingBalance || 0);
                        setDiscount(c.discountPerLiter || 0);
                      }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                    >
                      <td style={{ padding: '8px', color: '#38bdf8', fontFamily: 'monospace' }}>{c.customerCode || idx + 1}</td>
                      <td style={{ padding: '8px', color: '#f8fafc', fontWeight: 600 }}>{c.companyName}</td>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>{c.city || 'Bangalore'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#e2e8f0', fontFamily: 'monospace' }}>{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
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
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New Entry</div>
          <div style={{ color: '#64748b' }}>B2B Fleet Credit Account Register & Hard-Lock</div>
        </div>
      </div>
    </div>
  );
}
