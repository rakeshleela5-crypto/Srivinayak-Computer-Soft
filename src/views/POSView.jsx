import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Truck, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Calculator, 
  AlertCircle,
  Receipt,
  Printer,
  Package,
  Scan,
  Camera,
  X,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Coins,
  Tag
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';

export default function POSView() {
  const { 
    nozzles, 
    fuelPrices, 
    fleetAccounts, 
    lubricants, 
    recordTransaction, 
    currentShift,
    activeRole,
    loyaltyCustomers,
    earnLoyaltyPoints,
    redeemLoyaltyPoints,
    digitalIndents,
    redeemDigitalIndent,
    strictCreditLock,
    managerOverridePin,
    checkFleetCreditLimit
  } = useApp();

  // Active Dispensing Form State
  const [selectedNozzleId, setSelectedNozzleId] = useState(nozzles[0]?.id || '');
  const [billingMode, setBillingMode] = useState('AMOUNT'); // 'AMOUNT' or 'VOLUME'
  const [amountInput, setAmountInput] = useState('');
  const [litersInput, setLitersInput] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // CASH, CARD, UPI, CREDIT
  const [vehicleNo, setVehicleNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [selectedFleetId, setSelectedFleetId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [slipNo, setSlipNo] = useState('');
  const [indentScannerOpen, setIndentScannerOpen] = useState(false);

  // Driver Cash Advance ("Driver Kharcha")
  const [driverKharcha, setDriverKharcha] = useState('');

  // Manager Override Modal for Credit Limit Hard-Lock
  const [managerOverrideModalOpen, setManagerOverrideModalOpen] = useState(false);
  const [managerPinInput, setManagerPinInput] = useState('');
  const [isManagerOverrideActive, setIsManagerOverrideActive] = useState(false);
  const [managerOverrideError, setManagerOverrideError] = useState('');

  const handlePickIndent = (indent) => {
    audioFX.playQrBeep();
    setPaymentMode('CREDIT');
    setSelectedFleetId(indent.fleetId);
    setVehicleNo(indent.vehiclePlate);
    setDriverName(indent.driverName);
    setSlipNo(indent.indentNumber);
    
    // Auto-fill authorized driver cash advance if present in indent
    if (indent.cashAdvanceKharcha > 0) {
      setDriverKharcha(indent.cashAdvanceKharcha.toString());
    }
    
    const targetNoz = nozzles.find(n => n.fuelCode === indent.fuelCode);
    if (targetNoz) {
      setSelectedNozzleId(targetNoz.id);
    }
    setBillingMode('VOLUME');
    setLitersInput(indent.maxLiters.toString());
    setIndentScannerOpen(false);
  };

  // Bundled Lubricants
  const [selectedLubes, setSelectedLubes] = useState([]);
  const [showLubeSelector, setShowLubeSelector] = useState(false);

  const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId) || nozzles[0];

  // Base Pump Rate
  const rate = selectedNozzle ? selectedNozzle.rate : 100;

  // Selected Fleet Account Check & Contractual Discount per Liter (Rebate)
  const currentFleet = fleetAccounts.find(f => f.id === selectedFleetId);
  const discountPerLiter = (paymentMode === 'CREDIT' && currentFleet?.discountPerLiter) 
    ? Number(currentFleet.discountPerLiter) 
    : 0;
  const effectiveFuelRate = Math.max(1, rate - discountPerLiter);

  // Calculate live values with Transporter Rebate
  let calculatedLiters = 0;
  let calculatedFuelAmount = 0;
  let discountAmount = 0;

  if (billingMode === 'AMOUNT') {
    calculatedFuelAmount = parseFloat(amountInput) || 0;
    calculatedLiters = effectiveFuelRate > 0 ? calculatedFuelAmount / effectiveFuelRate : 0;
    discountAmount = calculatedLiters * discountPerLiter;
  } else {
    calculatedLiters = parseFloat(litersInput) || 0;
    const baseAmount = calculatedLiters * rate;
    discountAmount = calculatedLiters * discountPerLiter;
    calculatedFuelAmount = Math.max(0, baseAmount - discountAmount);
  }

  // Driver Cash Advance ("Kharcha")
  const cashAdvanceAmount = (paymentMode === 'CREDIT') ? (parseFloat(driverKharcha) || 0) : 0;
  const lubesTotalAmount = selectedLubes.reduce((sum, item) => sum + item.total, 0);
  const grossTotal = calculatedFuelAmount + lubesTotalAmount + cashAdvanceAmount;
  const netTotalPayable = Math.max(0, grossTotal - redeemedPoints);

  const matchedLoyaltyMember = customerPhone.trim().length >= 8 
    ? loyaltyCustomers.find(c => c.phone.replace(/\s+/g, '').includes(customerPhone.trim().replace(/\s+/g, '')))
    : null;

  // Credit Limit Hard-Lock Validation
  const creditCheck = paymentMode === 'CREDIT' && selectedFleetId
    ? checkFleetCreditLimit(selectedFleetId, netTotalPayable)
    : { allowed: true, hardLocked: false, isOverlimit: false };

  const isHardLockedNow = creditCheck.hardLocked && !isManagerOverrideActive;

  // Quick Amount Buttons
  const setQuickAmount = (val) => {
    setBillingMode('AMOUNT');
    setAmountInput(val.toString());
  };

  // Add Lube to cart
  const handleAddLube = (lube) => {
    const existing = selectedLubes.find(item => item.id === lube.id);
    if (existing) {
      setSelectedLubes(selectedLubes.map(item => 
        item.id === lube.id 
          ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
          : item
      ));
    } else {
      setSelectedLubes([...selectedLubes, {
        id: lube.id,
        name: lube.name,
        price: lube.price,
        qty: 1,
        total: lube.price
      }]);
    }
  };

  const handleRemoveLube = (lubeId) => {
    setSelectedLubes(selectedLubes.filter(item => item.id !== lubeId));
  };

  const handleManagerPinSubmit = (e) => {
    e.preventDefault();
    if (managerPinInput.trim() === managerOverridePin) {
      setIsManagerOverrideActive(true);
      setManagerOverrideModalOpen(false);
      setManagerPinInput('');
      setManagerOverrideError('');
      audioFX.playCashRegister();
    } else {
      setManagerOverrideError('Invalid Manager Security PIN. Authorization denied.');
    }
  };

  // Submit Transaction
  const handleSubmitSale = (e) => {
    e.preventDefault();
    if (calculatedLiters <= 0 && lubesTotalAmount <= 0) {
      alert('Please specify a valid fuel dispense amount or add a product.');
      return;
    }

    if (paymentMode === 'CREDIT' && !selectedFleetId) {
      alert('Please select a fleet credit account.');
      return;
    }

    // Check strict credit hard-lock
    if (isHardLockedNow) {
      setManagerOverrideModalOpen(true);
      return;
    }

    const salePayload = {
      nozzleId: selectedNozzle.id,
      nozzleNumber: selectedNozzle.nozzleNumber,
      fuelCode: selectedNozzle.fuelCode,
      fuelName: selectedNozzle.fuelName,
      liters: calculatedLiters,
      rate: rate,
      fuelAmount: calculatedFuelAmount + discountAmount, // Base Fuel before rebate
      discountPerLiter: discountPerLiter,
      discountAmount: discountAmount,
      lubeItems: selectedLubes,
      lubeAmount: lubesTotalAmount,
      cashAdvance: cashAdvanceAmount, // Driver Cash Advance (Kharcha)
      totalAmount: netTotalPayable,
      paymentMode: paymentMode,
      creditAccountId: paymentMode === 'CREDIT' ? selectedFleetId : null,
      customerVehicle: vehicleNo.trim().toUpperCase() || 'WALK-IN',
      customerName: paymentMode === 'CREDIT' ? currentFleet?.companyName : (customerName || 'Retail Customer'),
      driverName: driverName || null,
      slipNo: slipNo || null,
      attendant: currentShift.supervisor
    };

    const newTxn = recordTransaction(salePayload);
    audioFX.playCashRegister();

    if (slipNo) {
      const matched = (digitalIndents || []).find(i => i.indentNumber === slipNo);
      if (matched) {
        redeemDigitalIndent(matched.id, newTxn?.receiptNo || 'POS-REC');
      }
    }

    // Credit loyalty points and redeem if applicable (PDF Page 1 & 3)
    if (redeemedPoints > 0 && customerPhone) {
      redeemLoyaltyPoints(customerPhone, redeemedPoints);
    }
    if (customerPhone && calculatedLiters > 0) {
      earnLoyaltyPoints(customerPhone, calculatedLiters, customerName, vehicleNo);
    }

    // Reset Form
    setAmountInput('');
    setLitersInput('');
    setVehicleNo('');
    setCustomerName('');
    setCustomerPhone('');
    setRedeemedPoints(0);
    setSelectedLubes([]);
    setSlipNo('');
    setDriverName('');
    setDriverKharcha('');
    setIsManagerOverrideActive(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.4fr) minmax(300px, 1fr)', gap: '20px' }}>
      
      {/* Left Column: Rapid Forecourt POS Terminal */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fuel size={24} color="#f59e0b" /> Forecourt Rapid Dispenser POS
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Operator: <strong>{currentShift.supervisor}</strong> • Island 1-4 Terminal
            </div>
          </div>
          <span className="badge badge-active">NOZZLE READY</span>
        </div>

        {/* 1. Step: Select Dispensing Nozzle */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. Select Active Dispenser Nozzle
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '8px' }}>
            {nozzles.map((noz) => {
              const isSelected = selectedNozzleId === noz.id;
              return (
                <button
                  key={noz.id}
                  type="button"
                  onClick={() => setSelectedNozzleId(noz.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isSelected ? '#fbbf24' : '#f8fafc' }}>
                      {noz.nozzleNumber}
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: noz.color }}>
                      {noz.fuelCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {noz.island}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
                    ₹{noz.rate.toFixed(2)}/L
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Step: Billing Mode & Preset Liters / Amount */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              2. Dispense Preset (Amount or Liters)
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setBillingMode('AMOUNT')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: billingMode === 'AMOUNT' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                  color: billingMode === 'AMOUNT' ? '#0f172a' : '#f8fafc',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ₹ Amount
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('VOLUME')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: billingMode === 'VOLUME' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                  color: billingMode === 'VOLUME' ? '#0f172a' : '#f8fafc',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Liters / Qty
              </button>
            </div>
          </div>

          {billingMode === 'AMOUNT' ? (
            <div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 500, 1000)"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 40px',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    borderRadius: '12px'
                  }}
                />
              </div>

              {/* Quick Amount Chips */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {[100, 200, 500, 1000, 2000, 3500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickAmount(amt)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter Liters (e.g. 20.00)"
                  value={litersInput}
                  onChange={(e) => setLitersInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    borderRadius: '12px'
                  }}
                />
                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Liters
                </span>
              </div>

              {/* Quick Liter Chips */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {[5, 10, 15, 20, 35, 50].map(lt => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => {
                      setBillingMode('VOLUME');
                      setLitersInput(lt.toString());
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {lt} L
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Step: Vehicle Details, Mobile & Customer Loyalty (PDF Page 1 & 3) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vehicle Plate Number</label>
            <input
              type="text"
              placeholder="KA-04-MB-1234"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              style={{ width: '100%', marginTop: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer Name</label>
            <input
              type="text"
              placeholder="Optional / Retail"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Customer Mobile (Loyalty & SMS)</label>
            <input
              type="tel"
              placeholder="+91 98450 11223"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        {/* Loyalty Member Live Recognition Card (PDF Page 1: Customer & Loyalty) */}
        {matchedLoyaltyMember && (
          <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '0.65rem' }}>
                  {matchedLoyaltyMember.tier} CLUB MEMBER
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{matchedLoyaltyMember.name}</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#fbbf24', marginTop: '3px' }}>
                Available Balance: <strong>{matchedLoyaltyMember.points} Points</strong> (₹{matchedLoyaltyMember.points} value • 1 pt per 10L)
              </div>
            </div>
            <div>
              {matchedLoyaltyMember.points >= 50 && (
                <button
                  type="button"
                  onClick={() => setRedeemedPoints(prev => prev > 0 ? 0 : Math.min(100, matchedLoyaltyMember.points))}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#f59e0b', color: '#fbbf24', fontWeight: 800 }}
                >
                  {redeemedPoints > 0 ? 'Cancel Discount' : 'Redeem ₹100 Off'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Step: Multi-Tender Payment Method */}
        <div>
          <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            4. Tender / Payment Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
            {[
              { id: 'UPI', label: 'QR / UPI', icon: QrCode, color: '#38bdf8' },
              { id: 'CASH', label: 'Cash Bag', icon: Banknote, color: '#fbbf24' },
              { id: 'CARD', label: 'POS Card', icon: CreditCard, color: '#a78bfa' },
              { id: 'CREDIT', label: 'Fleet Khata', icon: Truck, color: '#f87171' }
            ].map((pm) => {
              const Icon = pm.icon;
              const isSelected = paymentMode === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMode(pm.id)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '10px',
                    background: isSelected ? `${pm.color}20` : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? `2px solid ${pm.color}` : '1px solid rgba(255,255,255,0.08)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.15s'
                  }}
                >
                  <Icon size={20} color={pm.color} />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fleet / Khata Credit Account Selector if CREDIT chosen */}
          {paymentMode === 'CREDIT' && (
            <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} color="#f87171" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171' }}>Select Fleet Account (Khata Verification)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIndentScannerOpen(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                >
                  <Scan size={13} /> Scan Driver QR Slip
                </button>
              </div>
              <select
                value={selectedFleetId}
                onChange={(e) => setSelectedFleetId(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
                required
              >
                <option value="">-- Choose Corporate / Fleet Customer --</option>
                {fleetAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.companyName} (Bal: ₹{acc.currentBalance.toLocaleString()} / Limit: ₹{acc.creditLimit.toLocaleString()})
                  </option>
                ))}
              </select>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authorized Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramu Gowda"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Company Indent / Slip No</label>
                  <input
                    type="text"
                    placeholder="e.g. SLIP-9921"
                    value={slipNo}
                    onChange={(e) => setSlipNo(e.target.value)}
                    style={{ width: '100%', marginTop: '2px' }}
                  />
                </div>
              </div>

              {/* Driver Cash Advance ("Cash Credit / Driver Kharcha") */}
              <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={15} /> Driver Cash Advance ("Driver Kharcha")
                  </label>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                    Disbursed from till & debited to Khata
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#fbbf24', fontWeight: 800 }}>₹</span>
                    <input
                      type="number"
                      placeholder="0.00 (e.g. 500, 1000)"
                      value={driverKharcha}
                      onChange={(e) => setDriverKharcha(e.target.value)}
                      style={{ width: '100%', paddingLeft: '26px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}
                    />
                  </div>
                  <button type="button" onClick={() => setDriverKharcha('500')} className="btn-secondary" style={{ padding: '6px 8px', fontSize: '0.7rem' }}>+500</button>
                  <button type="button" onClick={() => setDriverKharcha('1000')} className="btn-secondary" style={{ padding: '6px 8px', fontSize: '0.7rem' }}>+1000</button>
                  <button type="button" onClick={() => setDriverKharcha('2000')} className="btn-secondary" style={{ padding: '6px 8px', fontSize: '0.7rem' }}>+2000</button>
                  {driverKharcha && (
                    <button type="button" onClick={() => setDriverKharcha('')} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>Clear</button>
                  )}
                </div>
              </div>

              {/* Transporter Contractual Rebate Tag */}
              {discountPerLiter > 0 && (
                <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#34d399' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} />
                    <span>Contractual Fleet Rebate: <strong>-₹{discountPerLiter.toFixed(2)}/L</strong></span>
                  </div>
                  <span>Savings: <strong>-₹{discountAmount.toFixed(2)}</strong></span>
                </div>
              )}

              {/* Credit Limit Hard-Lock / Overlimit Status */}
              {creditCheck.hardLocked && (
                <div style={{ marginTop: '10px', padding: '12px', borderRadius: '10px', background: isManagerOverrideActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)', border: isManagerOverrideActive ? '1px solid #10b981' : '1px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isManagerOverrideActive ? <Unlock size={18} color="#10b981" /> : <Lock size={18} color="#ef4444" />}
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isManagerOverrideActive ? '#34d399' : '#f87171' }}>
                          {isManagerOverrideActive ? 'MANAGER OVERRIDE ACTIVE: Emergency Dispensing Authorized' : 'STRICT CREDIT LIMIT HARD-LOCK: BILLING BLOCKED'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Balance: ₹{currentFleet.currentBalance.toLocaleString()} + Ticket: ₹{netTotalPayable.toLocaleString()} exceeds Sanctioned Limit ₹{currentFleet.creditLimit.toLocaleString()} (Excess: ₹{creditCheck.excessAmount.toLocaleString()})
                        </div>
                      </div>
                    </div>

                    {!isManagerOverrideActive && (
                      <button
                        type="button"
                        onClick={() => setManagerOverrideModalOpen(true)}
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '4px 10px', color: '#fbbf24', borderColor: '#f59e0b' }}
                      >
                        <KeyRound size={13} /> Manager Override PIN
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!creditCheck.hardLocked && creditCheck.isOverlimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.75rem', marginTop: '8px', padding: '6px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                  <AlertCircle size={14} />
                  <span>Notice: Fleet balance exceeds credit limit by ₹{creditCheck.excessAmount.toLocaleString()} (Soft Warning - Hard-lock disabled).</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Bundled Lubes & Packaged Items */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} color="#38bdf8" /> Bundled Lubes & Convenience Items ({selectedLubes.length})
            </span>
            <button
              type="button"
              onClick={() => setShowLubeSelector(!showLubeSelector)}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {showLubeSelector ? 'Hide Lubes' : '+ Add Lube'}
            </button>
          </div>

          {/* Selected Lubes List */}
          {selectedLubes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              {selectedLubes.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 6, 23, 0.4)', padding: '6px 10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#f8fafc' }}>{item.name} × {item.qty}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8' }}>
                      ₹{item.total.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLube(item.id)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Lube Add Palette */}
          {showLubeSelector && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '10px' }}>
              {lubricants.slice(0, 6).map((lube) => (
                <div 
                  key={lube.id}
                  onClick={() => handleAddLube(lube)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>{lube.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>₹{lube.price}</div>
                  </div>
                  <Plus size={14} color="#10b981" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Live Meter Simulator & Instant Bill Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Real-Time Totalizer & Pump Dispenser Display */}
        <div className="glass-card" style={{ padding: '22px', background: '#020617', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>
              DISPENSER LIVE TOTALIZER (BAY #{selectedNozzle?.nozzleNumber})
            </span>
            <span className="badge badge-active">SERIAL PULSE READY</span>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.05em' }}>VOLUME DISPENSED</div>
            <div className="led-meter-cyan" style={{ fontSize: '2.4rem', padding: '8px 16px', margin: '6px 0', letterSpacing: '0.08em' }}>
              {calculatedLiters.toFixed(2)} <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>L</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: selectedNozzle?.color, fontWeight: 700 }}>
              {selectedNozzle?.fuelName} @ ₹{rate.toFixed(2)} / L
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.05em' }}>TOTAL NET PAYABLE</div>
            <div className="led-meter" style={{ fontSize: '2.6rem', padding: '8px 16px', margin: '6px 0', letterSpacing: '0.08em' }}>
              ₹{netTotalPayable.toFixed(2)}
            </div>

            {/* Itemized Tender & Product Breakdown */}
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px', padding: '10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fuel ({calculatedLiters.toFixed(2)}L @ ₹{rate.toFixed(2)}):</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(calculatedLiters * rate).toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontWeight: 700 }}>
                  <span>Contractual Rebate (-₹{discountPerLiter.toFixed(2)}/L):</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              {lubesTotalAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
                  <span>Lubes & Specialties:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{lubesTotalAmount.toFixed(2)}</span>
                </div>
              )}

              {cashAdvanceAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 800 }}>
                  <span>Driver Cash Advance (Kharcha):</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>+₹{cashAdvanceAmount.toFixed(2)}</span>
                </div>
              )}

              {redeemedPoints > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Loyalty Discount:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>-₹{redeemedPoints.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Dynamic QR Code Mockup when UPI selected */}
          {paymentMode === 'UPI' && netTotalPayable > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
                Scan to Pay via PhonePe / GPay / Paytm
              </div>
              <div style={{ width: '90px', height: '90px', background: '#ffffff', margin: '0 auto', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={78} color="#0f172a" />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                UPI ID: iocl.shreevinayaka@icici
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Dispense & Generate Bill */}
        {isHardLockedNow ? (
          <button
            type="button"
            onClick={() => setManagerOverrideModalOpen(true)}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: '1px solid #f87171',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.35)'
            }}
          >
            <Lock size={20} /> ⛔ CREDIT HARD-LOCKED (Click to Override)
          </button>
        ) : (
          <button
            onClick={handleSubmitSale}
            className="btn-action-green"
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}
          >
            <CheckCircle size={22} /> Complete Sale & Print Slip (₹{netTotalPayable.toFixed(2)})
          </button>
        )}

      </div>

      {/* Forecourt Terminal Fleet Indent QR Scanner Modal */}
      {indentScannerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '480px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', padding: '24px', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scan size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  POS Driver QR Slip Scanner
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIndentScannerOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Optical Scanner Laser */}
            <div style={{ 
              position: 'relative', 
              height: '130px', 
              background: '#020617', 
              borderRadius: '12px', 
              border: '2px dashed rgba(56, 189, 248, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '2px',
                background: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8'
              }} />
              <Camera size={30} color="#38bdf8" style={{ opacity: 0.6, marginBottom: '4px' }} />
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                Scan Driver Mobile Voucher or Paper Slip
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Or select verified active slip below
              </div>
            </div>

            {/* Queue List */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
              ACTIVE DRIVER INDENT VOUCHERS ({digitalIndents.filter(i => i.status === 'ACTIVE').length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {digitalIndents.filter(i => i.status === 'ACTIVE').length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  No pending fleet indents available.
                </div>
              ) : (
                digitalIndents.filter(i => i.status === 'ACTIVE').map(ind => (
                  <div
                    key={ind.id}
                    onClick={() => handlePickIndent(ind)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(2, 6, 23, 0.6)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.2)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', fontSize: '0.95rem' }}>
                        {ind.vehiclePlate}
                      </strong>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {ind.fuelCode} • {ind.maxLiters}L
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 700, marginTop: '4px' }}>
                      {ind.companyName}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <span>Driver: {ind.driverName}</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>OTP: {ind.securityPin}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              type="button"
              onClick={() => setIndentScannerOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manager Emergency Override PIN Modal for Hard-Lock */}
      {managerOverrideModalOpen && (
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
          <div className="glass-card" style={{ width: '420px', maxWidth: '95vw', padding: '24px', background: '#0f172a', border: '1px solid #ef4444', borderRadius: '16px', boxShadow: '0 20px 50px rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={22} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  Manager Credit Override
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => { setManagerOverrideModalOpen(false); setManagerOverrideError(''); }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', marginBottom: '14px', fontSize: '0.78rem', color: '#fca5a5' }}>
              <strong>Strict Hard-Lock Active:</strong> {currentFleet?.companyName} has an outstanding balance of <strong>₹{currentFleet?.currentBalance.toLocaleString()}</strong> exceeding their limit of <strong>₹{currentFleet?.creditLimit.toLocaleString()}</strong>.
              <div style={{ marginTop: '4px', color: '#fecaca' }}>
                Enter the Master Manager PIN (Default: <code>9999</code>) to authorize an emergency single-ticket billing exemption.
              </div>
            </div>

            <form onSubmit={handleManagerPinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
                  Enter Master Manager Security PIN
                </label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter 4-digit PIN..."
                  value={managerPinInput}
                  onChange={(e) => setManagerPinInput(e.target.value)}
                  style={{ width: '100%', marginTop: '6px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '8px', fontFamily: 'monospace' }}
                  required
                />
              </div>

              {managerOverrideError && (
                <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center' }}>
                  {managerOverrideError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setManagerOverrideModalOpen(false); setManagerOverrideError(''); }}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', background: '#f59e0b', color: '#0f172a', fontWeight: 800 }}
                >
                  Authorize Exemption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
