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
  Package
} from 'lucide-react';

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
    redeemLoyaltyPoints
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

  // Bundled Lubricants
  const [selectedLubes, setSelectedLubes] = useState([]);
  const [showLubeSelector, setShowLubeSelector] = useState(false);

  const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId) || nozzles[0];

  // Calculate live values
  const rate = selectedNozzle ? selectedNozzle.rate : 100;
  
  let calculatedLiters = 0;
  let calculatedFuelAmount = 0;

  if (billingMode === 'AMOUNT') {
    calculatedFuelAmount = parseFloat(amountInput) || 0;
    calculatedLiters = rate > 0 ? calculatedFuelAmount / rate : 0;
  } else {
    calculatedLiters = parseFloat(litersInput) || 0;
    calculatedFuelAmount = calculatedLiters * rate;
  }

  const lubesTotalAmount = selectedLubes.reduce((sum, item) => sum + item.total, 0);
  const grossTotal = calculatedFuelAmount + lubesTotalAmount;
  const netTotalPayable = Math.max(0, grossTotal - redeemedPoints);

  const matchedLoyaltyMember = customerPhone.trim().length >= 8 
    ? loyaltyCustomers.find(c => c.phone.replace(/\s+/g, '').includes(customerPhone.trim().replace(/\s+/g, '')))
    : null;

  // Selected Fleet Account Check
  const currentFleet = fleetAccounts.find(f => f.id === selectedFleetId);
  const isCreditOverlimit = currentFleet && (currentFleet.currentBalance + netTotalPayable > currentFleet.creditLimit);

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

    const salePayload = {
      nozzleId: selectedNozzle.id,
      nozzleNumber: selectedNozzle.nozzleNumber,
      fuelCode: selectedNozzle.fuelCode,
      fuelName: selectedNozzle.fuelName,
      liters: calculatedLiters,
      rate: rate,
      fuelAmount: calculatedFuelAmount,
      lubeItems: selectedLubes,
      lubeAmount: lubesTotalAmount,
      totalAmount: netTotalPayable,
      paymentMode: paymentMode,
      creditAccountId: paymentMode === 'CREDIT' ? selectedFleetId : null,
      customerVehicle: vehicleNo.trim().toUpperCase() || 'WALK-IN',
      customerName: paymentMode === 'CREDIT' ? currentFleet?.companyName : (customerName || 'Retail Customer'),
      driverName: driverName || null,
      slipNo: slipNo || null,
      attendant: currentShift.supervisor
    };

    recordTransaction(salePayload);

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Truck size={16} color="#f87171" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171' }}>Select Fleet Account (Khata Verification)</span>
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

              {isCreditOverlimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '0.75rem', marginTop: '8px' }}>
                  <AlertCircle size={14} />
                  <span>Warning: This transaction exceeds the fleet credit limit!</span>
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
            <div style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '0.05em' }}>TOTAL SALE AMOUNT</div>
            <div className="led-meter" style={{ fontSize: '2.6rem', padding: '8px 16px', margin: '6px 0', letterSpacing: '0.08em' }}>
              ₹{netTotalPayable.toFixed(2)}
            </div>
            {lubesTotalAmount > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                (Fuel: ₹{calculatedFuelAmount.toFixed(2)} + Lubes: ₹{lubesTotalAmount.toFixed(2)})
              </div>
            )}
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
        <button
          onClick={handleSubmitSale}
          className="btn-action-green"
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}
        >
          <CheckCircle size={22} /> Complete Sale & Print Slip (₹{netTotalPayable.toFixed(2)})
        </button>

      </div>

    </div>
  );
}
