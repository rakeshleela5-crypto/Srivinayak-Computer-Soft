import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  Zap, 
  Coins, 
  CreditCard, 
  QrCode, 
  Truck, 
  Printer, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import QRCodeDisplay from './QRCodeDisplay';
import { audioFX } from '../utils/audioFX';

export default function CashPOSBillModal({ isOpen, onClose, onOpenFullTerminal }) {
  const { 
    nozzles, 
    fuelPrices, 
    recordTransaction, 
    setActiveReceiptModal,
    stationInfo,
    currentShift
  } = useApp();

  const [selectedNozzleId, setSelectedNozzleId] = useState(nozzles[0]?.id || 1);
  const [billingMode, setBillingMode] = useState('AMOUNT'); // 'AMOUNT' or 'VOLUME'
  const [amountInput, setAmountInput] = useState('500');
  const [litersInput, setLitersInput] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH', 'UPI', 'CARD'
  const [vehicleNo, setVehicleNo] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId) || nozzles[0];
  const fuelPrice = fuelPrices.find(p => p.code === selectedNozzle.fuelType)?.price || selectedNozzle.rate || 100;

  // Real-time calculation
  let finalLiters = 0;
  let finalAmount = 0;

  if (billingMode === 'AMOUNT') {
    finalAmount = parseFloat(amountInput) || 0;
    finalLiters = fuelPrice > 0 ? (finalAmount / fuelPrice) : 0;
  } else {
    finalLiters = parseFloat(litersInput) || 0;
    finalAmount = finalLiters * fuelPrice;
  }

  const handlePresetAmount = (amt) => {
    setBillingMode('AMOUNT');
    setAmountInput(amt.toString());
    try { audioFX.playBeep(); } catch (_) {}
  };

  const handlePresetVolume = (vol) => {
    setBillingMode('VOLUME');
    setLitersInput(vol.toString());
    try { audioFX.playBeep(); } catch (_) {}
  };

  const handleSubmitBill = (e) => {
    e.preventDefault();
    if (finalAmount <= 0 || finalLiters <= 0) return;

    const receiptNo = `SVP-${Date.now().toString().slice(-6)}`;
    const newTxn = {
      id: `pos-${Date.now()}`,
      receiptNo,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' }),
      nozzleNumber: selectedNozzle.id,
      nozzleName: `Nozzle #${selectedNozzle.id} (${selectedNozzle.fuelType})`,
      dispenserId: selectedNozzle.dispenserId,
      fuelCode: selectedNozzle.fuelType,
      fuelName: selectedNozzle.fuelType === 'MS' ? 'Petrol (MS-91)' : 'Diesel (HSD)',
      rate: fuelPrice,
      liters: finalLiters,
      fuelAmount: finalAmount,
      totalAmount: finalAmount,
      paymentMode,
      customerVehicle: vehicleNo.trim().toUpperCase() || 'WALK-IN',
      customerPhone: customerPhone.trim() || 'N/A',
      stationName: stationInfo.name,
      gstin: stationInfo.gstin,
      supervisor: currentShift.supervisor || 'Forecourt Manager',
      status: 'COMPLETED'
    };

    recordTransaction(newTxn);
    try { audioFX.playPrintChime(); } catch (_) {}
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setActiveReceiptModal(newTxn);
    }, 1200);
  };

  const upiQrPayload = `upi://pay?pa=shreevinayaka@icici&pn=ShreeVinayakaPetroSoft&am=${finalAmount.toFixed(2)}&cu=INR&tn=FuelBill`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '880px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#0b1329',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} color="#10b981" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Rapid POS Fuel Billing Terminal</span>
                <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800 }}>LIVE COUNTER</span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Instant Cash, UPI Dynamic QR, and Card Fuel Dispensing Receipt
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenFullTerminal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullTerminal();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <Maximize2 size={13} /> Full Screen POS
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Nozzle Selector Bay */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
            1. Select Dispensing Nozzle
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {nozzles.map(noz => {
              const isSelected = noz.id === selectedNozzleId;
              const price = fuelPrices.find(p => p.code === noz.fuelType)?.price || noz.rate || 100;
              const isMS = noz.fuelType === 'MS';

              return (
                <button
                  key={noz.id}
                  type="button"
                  onClick={() => setSelectedNozzleId(noz.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isSelected 
                      ? (isMS ? '2px solid #fbbf24' : '2px solid #60a5fa')
                      : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected 
                      ? (isMS ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)')
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc' }}>
                      Nozzle #{noz.id}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: isMS ? '#fbbf24' : '#60a5fa',
                      color: '#000'
                    }}>
                      {noz.fuelType}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isMS ? '#fbbf24' : '#60a5fa', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    ₹{price.toFixed(2)}/L
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 Column Layout: Amount/Volume Presets | Tender & Preview */}
        <form onSubmit={handleSubmitBill} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>
          
          {/* Left Column: Preset Controls & Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Amount / Volume Mode Switcher */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setBillingMode('AMOUNT')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: billingMode === 'AMOUNT' ? '#10b981' : 'rgba(255,255,255,0.06)',
                    color: billingMode === 'AMOUNT' ? '#000' : '#cbd5e1'
                  }}
                >
                  By Rupees (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingMode('VOLUME')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: billingMode === 'VOLUME' ? '#10b981' : 'rgba(255,255,255,0.06)',
                    color: billingMode === 'VOLUME' ? '#000' : '#cbd5e1'
                  }}
                >
                  By Volume (Liters)
                </button>
              </div>

              {/* Input Field */}
              {billingMode === 'AMOUNT' ? (
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Enter Fuel Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="e.g. 500"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#020617',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)'
                    }}
                    required
                  />
                  {/* Preset Amount Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[100, 200, 500, 1000, 2000, 3000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePresetAmount(amt)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#f8fafc',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Enter Dispensed Volume (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={litersInput}
                    onChange={(e) => setLitersInput(e.target.value)}
                    placeholder="e.g. 10.00"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#020617',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)'
                    }}
                    required
                  />
                  {/* Preset Volume Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[1, 2, 5, 10, 20, 35, 50].map(vol => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => handlePresetVolume(vol)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#f8fafc',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {vol} L
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle & Customer Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vehicle Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. KA01AB1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Customer Mobile (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9845012345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                Payment Tender
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'CASH', label: 'Cash Currency', icon: Coins, color: '#fbbf24' },
                  { id: 'UPI', label: 'UPI QR (GPay/PhonePe)', icon: QrCode, color: '#34d399' },
                  { id: 'CARD', label: 'Card Swiped', icon: CreditCard, color: '#60a5fa' }
                ].map(tender => {
                  const Icon = tender.icon;
                  const isSelected = paymentMode === tender.id;
                  return (
                    <button
                      key={tender.id}
                      type="button"
                      onClick={() => setPaymentMode(tender.id)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: isSelected ? `2px solid ${tender.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? `${tender.color}22` : 'rgba(255,255,255,0.02)',
                        color: isSelected ? tender.color : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon size={18} color={isSelected ? tender.color : '#94a3b8'} />
                      <span>{tender.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Live Meter & Calculation Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                DISPENSING SUMMARY
              </div>

              {/* Big Liter & Amount Card */}
              <div style={{ background: '#020617', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Net Volume:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {finalLiters.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>L</span>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Total Payable:</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    ₹{finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <div>• Product: <strong style={{ color: '#fff' }}>{selectedNozzle.fuelType === 'MS' ? 'Petrol (MS-91)' : 'Diesel (HSD)'}</strong></div>
                <div>• Unit Rate: <strong style={{ color: '#fbbf24' }}>₹{fuelPrice.toFixed(2)} per Liter</strong></div>
                <div>• Dispenser Island: <strong style={{ color: '#fff' }}>{selectedNozzle.island || 'Island 1'}</strong></div>
                <div>• Payment Tender: <strong style={{ color: '#34d399' }}>{paymentMode}</strong></div>
              </div>

              {/* UPI Dynamic QR Code if UPI is selected */}
              {paymentMode === 'UPI' && finalAmount > 0 && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', textAlign: 'center', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                    <QRCodeDisplay value={upiQrPayload} size={110} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                    Scan & Pay ₹{finalAmount.toFixed(2)} via Any UPI App
                  </div>
                </div>
              )}
            </div>

            {/* Success message */}
            {isSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                borderRadius: '8px',
                padding: '10px',
                color: '#34d399',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px'
              }}>
                <CheckCircle2 size={18} />
                Transaction recorded! Printing thermal slip...
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
              >
                Cancel (Esc)
              </button>
              <button
                type="submit"
                disabled={finalAmount <= 0}
                className="btn-primary"
                style={{ flex: 1.5, justifyContent: 'center', padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Printer size={16} /> Print & Bill (Enter)
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
