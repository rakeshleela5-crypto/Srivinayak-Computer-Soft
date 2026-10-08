import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  Smartphone, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Receipt, 
  Coins, 
  Sparkles,
  ArrowRight,
  Camera,
  Scan,
  ShieldCheck,
  X
} from 'lucide-react';
import DenominationCounter from '../components/DenominationCounter';
import { audioFX } from '../utils/audioFX';

export default function SalesmanAppView() {
  const { 
    nozzles, 
    staff, 
    activeSalesmanId, 
    setActiveSalesmanId,
    recordTransaction, 
    fleetAccounts,
    currentShift,
    digitalIndents,
    redeemDigitalIndent,
    shiftDenominations
  } = useApp();

  const activeStaff = staff.find(s => s.id === activeSalesmanId) || staff[0];
  
  // Filter nozzles for this attendant's island (or all if general)
  const myNozzles = nozzles.filter(n => n.island === activeStaff.island);
  const activeNozzleList = myNozzles.length > 0 ? myNozzles : nozzles;

  const [selectedNozzleId, setSelectedNozzleId] = useState(activeNozzleList[0]?.id || nozzles[0]?.id);
  const [quickAmount, setQuickAmount] = useState('500');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [vehicleNo, setVehicleNo] = useState('');
  const [selectedFleetId, setSelectedFleetId] = useState('');
  const [slipNo, setSlipNo] = useState('');
  const [qrIndentModalOpen, setQrIndentModalOpen] = useState(false);
  const [showCashBagDrawer, setShowCashBagDrawer] = useState(false);
  const [scannedIndentAlert, setScannedIndentAlert] = useState(null);

  const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId) || nozzles[0];
  const rate = selectedNozzle?.rate || 100;
  const numAmount = parseFloat(quickAmount) || 0;
  const computedLiters = rate > 0 ? (numAmount / rate).toFixed(2) : '0.00';

  // Attendant Shift Metrics
  const myDispensedLiters = activeNozzleList.reduce((acc, n) => acc + (n.currentMeter - n.openingMeter), 0);
  const myTotalRevenue = myDispensedLiters * rate;

  const handleSelectIndent = (indent) => {
    audioFX.playQrBeep();
    setPaymentMode('CREDIT');
    setSelectedFleetId(indent.fleetId);
    setVehicleNo(indent.vehiclePlate);
    setSlipNo(indent.indentNumber);
    
    const matchedNoz = nozzles.find(n => n.fuelCode === indent.fuelCode) || selectedNozzle;
    if (matchedNoz) {
      setSelectedNozzleId(matchedNoz.id);
    }

    const effectiveRate = matchedNoz?.rate || rate;
    const computedAmt = Math.round(indent.maxLiters * effectiveRate);
    setQuickAmount(computedAmt.toString());
    setScannedIndentAlert(`Verified Driver Indent ${indent.indentNumber} (${indent.companyName}) - Pre-approved ${indent.maxLiters}L`);
    setQrIndentModalOpen(false);
  };

  const handleQuickSaleSubmit = (e) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    const newTxn = recordTransaction({
      nozzleId: selectedNozzle.id,
      nozzleNumber: selectedNozzle.nozzleNumber,
      fuelCode: selectedNozzle.fuelCode,
      fuelName: selectedNozzle.fuelName,
      liters: parseFloat(computedLiters),
      rate: rate,
      fuelAmount: numAmount,
      totalAmount: numAmount,
      paymentMode: paymentMode,
      creditAccountId: paymentMode === 'CREDIT' ? selectedFleetId : null,
      customerVehicle: vehicleNo.trim().toUpperCase() || 'WALK-IN',
      customerName: paymentMode === 'CREDIT' ? 'Fleet Account' : 'Retail Customer',
      attendant: activeStaff.name,
      slipNo: slipNo || null
    });

    if (slipNo) {
      const matched = digitalIndents.find(i => i.indentNumber === slipNo);
      if (matched) {
        redeemDigitalIndent(matched.id, newTxn.receiptNo);
      }
    }
    audioFX.playCashRegister();

    setVehicleNo('');
    setSlipNo('');
    setScannedIndentAlert(null);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Mobile Header Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={22} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>PUMP SALESMAN APP</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>{activeStaff.name}</h3>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <select
              value={activeSalesmanId}
              onChange={(e) => setActiveSalesmanId(e.target.value)}
              style={{ fontSize: '0.75rem', background: '#020617', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '5px 8px', borderRadius: '8px' }}
            >
              {staff.filter(s => s.role.includes('Attendant') || s.role.includes('Operator')).map(st => (
                <option key={st.id} value={st.id}>{st.name} ({st.island})</option>
              ))}
            </select>
            <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>
              Assigned: {activeStaff.island}
            </div>
          </div>
        </div>

        {/* Shortage Alert Badge if staff has pending shortage */}
        {(activeStaff.totalShortagePending || 0) > 0 && (
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#f87171" />
              <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
                Unrecovered Cash Shortage:
              </span>
            </div>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171', fontSize: '0.9rem' }}>
              -₹{activeStaff.totalShortagePending.toFixed(2)}
            </strong>
          </div>
        )}
      </div>

      {/* Attendant Shift Cash Bag Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="glass-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>MY DISPENSED VOLUME</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {myDispensedLiters.toFixed(2)} L
          </div>
        </div>
        <div className="glass-card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>LUBE INCENTIVE EARNED</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
            +₹{(myDispensedLiters * 0.25).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Quick Tool Actions: Scan Indent & Cash Bag Counter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setQrIndentModalOpen(true)}
          className="btn-secondary"
          style={{ padding: '12px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', justifyContent: 'center', fontSize: '0.85rem' }}
        >
          <Scan size={18} /> Scan Driver Indent
        </button>

        <button
          type="button"
          onClick={() => setShowCashBagDrawer(!showCashBagDrawer)}
          className="btn-secondary"
          style={{ padding: '12px', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)', justifyContent: 'center', fontSize: '0.85rem' }}
        >
          <Banknote size={18} /> {showCashBagDrawer ? 'Hide Cash Bag' : 'Count Cash Bag'}
        </button>
      </div>

      {/* Scanned Driver Indent Banner */}
      {scannedIndentAlert && (
        <div style={{ 
          padding: '10px 14px', 
          borderRadius: '10px', 
          background: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid rgba(16, 185, 129, 0.4)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '0.82rem',
          color: '#34d399'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#34d399" />
            <span>{scannedIndentAlert}</span>
          </div>
          <button 
            type="button"
            onClick={() => {
              setScannedIndentAlert(null);
              setSlipNo('');
              setVehicleNo('');
            }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cash Bag Denomination Counter Drawer */}
      {showCashBagDrawer && (
        <div className="glass-card" style={{ padding: '18px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="badge badge-active">SALESMAN BAG RECONCILIATION</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              Handover Note Denomination Counter
            </h4>
          </div>
          <DenominationCounter
            expectedAmount={myTotalRevenue}
            initialDenominations={shiftDenominations}
          />
        </div>
      )}

      {/* Ultra-Fast Mobile Dispenser Terminal Form */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Nozzle Select Horizontal Chips */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SELECT NOZZLE</label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginTop: '6px' }}>
            {activeNozzleList.map(n => {
              const isSel = selectedNozzleId === n.id;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setSelectedNozzleId(n.id)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: isSel ? '#f59e0b' : 'rgba(15, 23, 42, 0.7)',
                    color: isSel ? '#0f172a' : '#f8fafc',
                    border: isSel ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    minWidth: '90px',
                    textAlign: 'center'
                  }}
                >
                  <div>{n.nozzleNumber}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>{n.fuelCode}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Amount Input & Computed Liters */}
        <div style={{ background: '#020617', padding: '14px', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
            <span>SALE AMOUNT (₹)</span>
            <span>RATE: ₹{rate.toFixed(2)}/L</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              ₹<input
                type="number"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fbbf24',
                  fontSize: '1.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  width: '180px',
                  outline: 'none',
                  padding: 0
                }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {computedLiters} L
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Volume to Dispense</div>
            </div>
          </div>
        </div>

        {/* Quick Amount Touch Pad Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {['100', '200', '500', '1000', '2000', '3500'].map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => setQuickAmount(amt)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: quickAmount === amt ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: quickAmount === amt ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                color: quickAmount === amt ? '#fbbf24' : '#f8fafc',
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Vehicle License Plate */}
        <div>
          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VEHICLE NUMBER</label>
          <input
            type="text"
            placeholder="KA-04-MB-1234"
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value)}
            style={{ width: '100%', marginTop: '4px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
          />
        </div>

        {/* Fast Tender Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { id: 'CASH', label: 'Cash', icon: Banknote, color: '#fbbf24' },
            { id: 'UPI', label: 'UPI / QR', icon: QrCode, color: '#38bdf8' },
            { id: 'CARD', label: 'Card', icon: CreditCard, color: '#a78bfa' },
            { id: 'CREDIT', label: 'Khata', icon: Truck, color: '#f87171' }
          ].map(t => {
            const Icon = t.icon;
            const isSel = paymentMode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPaymentMode(t.id)}
                style={{
                  padding: '10px 4px',
                  borderRadius: '8px',
                  background: isSel ? `${t.color}25` : 'rgba(15, 23, 42, 0.6)',
                  border: isSel ? `2px solid ${t.color}` : '1px solid rgba(255,255,255,0.06)',
                  color: isSel ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              >
                <Icon size={18} color={t.color} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* If Khata Selected */}
        {paymentMode === 'CREDIT' && (
          <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
            <label style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700 }}>Select Fleet</label>
            <select
              value={selectedFleetId}
              onChange={(e) => setSelectedFleetId(e.target.value)}
              style={{ width: '100%', marginTop: '4px', marginBottom: '8px' }}
              required
            >
              <option value="">-- Choose Corporate Fleet --</option>
              {fleetAccounts.map(f => (
                <option key={f.id} value={f.id}>{f.companyName}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Driver Indent Slip No"
              value={slipNo}
              onChange={(e) => setSlipNo(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Submit Big Action Button */}
        <button
          onClick={handleQuickSaleSubmit}
          className="btn-action-green"
          style={{ padding: '16px', fontSize: '1.1rem', justifyContent: 'center', borderRadius: '12px' }}
        >
          <CheckCircle size={22} /> Dispense & Print Slip (₹{numAmount.toFixed(2)})
        </button>

      </div>

      {/* Driver QR Indent Scanner Modal */}
      {qrIndentModalOpen && (
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
          <div className="glass-card" style={{ width: '480px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', padding: '22px', background: '#0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Scan size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Scan & Verify Fleet Indent
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setQrIndentModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Simulated Optical Laser Viewfinder */}
            <div style={{ 
              position: 'relative', 
              height: '140px', 
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
              <Camera size={32} color="#38bdf8" style={{ opacity: 0.6, marginBottom: '6px' }} />
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>
                Point Forecourt Scanner at Driver Slip QR
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Or select an authorized queue slip below
              </div>
            </div>

            {/* Active Driver Indents Queue */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
              PENDING AUTHORIZED FLEET INDENTS ({digitalIndents.filter(i => i.status === 'ACTIVE').length})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {digitalIndents.filter(i => i.status === 'ACTIVE').length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                  No pending fleet indents found in active queue.
                </div>
              ) : (
                digitalIndents.filter(i => i.status === 'ACTIVE').map(indent => (
                  <div 
                    key={indent.id}
                    onClick={() => handleSelectIndent(indent)}
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
                        {indent.vehiclePlate}
                      </strong>
                      <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                        {indent.fuelCode} • {indent.maxLiters}L MAX
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 700, marginTop: '4px' }}>
                      {indent.companyName}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      <span>Driver: {indent.driverName}</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>PIN: {indent.securityPin}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              type="button"
              onClick={() => setQrIndentModalOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
