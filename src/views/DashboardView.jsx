import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  TrendingUp, 
  Layers, 
  Coins, 
  CreditCard, 
  Smartphone, 
  Truck, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Zap,
  Droplets,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit3
} from 'lucide-react';

export default function DashboardView() {
  const { 
    stationInfo, 
    fuelPrices, 
    updateFuelPrice, 
    tanks, 
    nozzles, 
    dispensers, 
    currentShift, 
    transactions,
    setActiveTab,
    setActiveReceiptModal
  } = useApp();

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedFuelForPrice, setSelectedFuelForPrice] = useState(fuelPrices[0]);
  const [newRateInput, setNewRateInput] = useState(fuelPrices[0]?.price || 100);

  // Compute live aggregates
  const totalVolumeDispensed = nozzles.reduce((acc, noz) => acc + (noz.currentMeter - noz.openingMeter), 0);
  const totalSalesRevenue = currentShift.cashCollected + currentShift.cardCollected + currentShift.upiCollected + currentShift.creditIssued;
  const totalTankStock = tanks.reduce((acc, t) => acc + t.currentStock, 0);
  const totalTankCapacity = tanks.reduce((acc, t) => acc + t.capacity, 0);
  const overallStockPercent = Math.round((totalTankStock / totalTankCapacity) * 100);

  const handlePriceUpdateSubmit = (e) => {
    e.preventDefault();
    if (selectedFuelForPrice && newRateInput > 0) {
      updateFuelPrice(selectedFuelForPrice.code, parseFloat(newRateInput));
      setPriceModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Station Banner & Quick Actions */}
      <div className="glass-card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">RO FORECOURT ACTIVE</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shift: <strong>{currentShift.shiftNumber}</strong></span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Supervisor: {currentShift.supervisor}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '6px', color: '#ffffff' }}>
            Live Forecourt Command & Wet-Stock Monitor
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('pos')}
            className="btn-primary"
          >
            <Fuel size={18} /> Quick POS Billing
          </button>
          <button 
            onClick={() => {
              setSelectedFuelForPrice(fuelPrices[0]);
              setNewRateInput(fuelPrices[0].price);
              setPriceModalOpen(true);
            }}
            className="btn-secondary"
          >
            <Edit3 size={16} /> Update Daily Rates
          </button>
        </div>
      </div>

      {/* Top 4 Key Telemetry Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Total Volume Dispensed */}
        <div className="glass-card" style={{ padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISPENSED SHIFT VOLUME</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {totalVolumeDispensed.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Ltrs</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gauge size={22} color="#f59e0b" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.78rem', color: '#34d399' }}>
            <ArrowUpRight size={15} />
            <span>Across 8 Active Nozzles on 4 Islands</span>
          </div>
        </div>

        {/* Metric 2: Total Shift Sales Revenue */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHIFT REVENUE COLLECTED</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={22} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>Cash: ₹{currentShift.cashCollected.toLocaleString()}</span>
            <span>UPI: ₹{currentShift.upiCollected.toLocaleString()}</span>
            <span>Credit: ₹{currentShift.creditIssued.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 3: Total Underground Tank Wet-Stock */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL UST WET-STOCK</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {(totalTankStock / 1000).toFixed(1)}k <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {(totalTankCapacity / 1000).toFixed(0)}k L</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={22} color="#38bdf8" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${overallStockPercent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>{overallStockPercent}% Fuel Tank Fill Level</span>
              <span style={{ color: '#34d399' }}>ATG Sensors: Normal</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Fleet Credit & Khata Outstanding */}
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FLEET KHATA OUTSTANDING</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                ₹{currentShift.creditIssued.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={22} color="#f87171" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>4 Fleets Enrolled</span>
            <button 
              onClick={() => setActiveTab('fleet')}
              style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 700, padding: 0 }}
            >
              View Ledgers →
            </button>
          </div>
        </div>

      </div>

      {/* Forecourt Islands & Nozzle Bays (Interactive Grid) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Fuel size={20} color="#f59e0b" /> Forecourt Dispenser Islands & Live Nozzles
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click any nozzle to launch immediate rapid billing
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {dispensers.map((disp) => {
            const dispNozzles = nozzles.filter(n => n.dispenserId === disp.id);
            return (
              <div key={disp.id} className="glass-card" style={{ padding: '18px', borderTop: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{disp.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{disp.model}</span>
                  </div>
                  <span className="badge badge-active">{disp.status}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {dispNozzles.map((noz) => {
                    const dispensedLiters = (noz.currentMeter - noz.openingMeter).toFixed(2);
                    return (
                      <div 
                        key={noz.id}
                        onClick={() => setActiveTab('pos')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(2, 6, 23, 0.5)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '8px', 
                            background: `${noz.color}20`, 
                            color: noz.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            border: `1px solid ${noz.color}40`
                          }}>
                            {noz.nozzleNumber}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{noz.fuelName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              Rate: <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{noz.rate.toFixed(2)}/L</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="led-meter" style={{ fontSize: '0.82rem', padding: '3px 8px' }}>
                            {dispensedLiters} L
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                            Total: {noz.currentMeter.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Underground Tank Wet-Stock Level Gauges Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={20} color="#38bdf8" /> Underground Storage Tanks (UST) Real-Time Levels
          </h3>
          <button 
            onClick={() => setActiveTab('tanks')}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
          >
            Full Wet-Stock & Dip Analysis →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {tanks.map((tank) => {
            const pct = Math.round((tank.currentStock / tank.capacity) * 100);
            const isLow = tank.currentStock <= tank.reorderLevel;

            return (
              <div key={tank.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{tank.tankNumber}</span>
                    <span style={{ fontSize: '0.75rem', color: tank.color, fontWeight: 700, marginLeft: '6px' }}>({tank.fuelCode})</span>
                  </div>
                  {isLow ? (
                    <span className="badge badge-alert"><AlertTriangle size={12} /> REORDER</span>
                  ) : (
                    <span className="badge badge-active"><CheckCircle2 size={12} /> OK</span>
                  )}
                </div>

                {/* Animated Tank Visualizer */}
                <div className="tank-visual">
                  <div 
                    className={`tank-liquid tank-liquid-${tank.fuelCode.toLowerCase()}`}
                    style={{ height: `${pct}%` }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '12px',
                    right: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>ATG: {tank.atgLevel.toLocaleString()} L</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffffff' }}>{pct}%</span>
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '12px',
                    zIndex: 2,
                    fontSize: '0.7rem',
                    color: '#e2e8f0',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                  }}>
                    Dip: {tank.physicalDipMm} mm | Water: {tank.waterBottomMm} mm
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Stock: <strong style={{ color: '#ffffff' }}>{tank.currentStock.toLocaleString()} L</strong></span>
                  <span>Cap: {tank.capacity.toLocaleString()} L</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Forecourt Transactions Ticker */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#10b981" /> Recent Forecourt Fuel & Lube Dispenses
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Showing latest {transactions.slice(0, 5).length} slips
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <th style={{ padding: '10px 8px' }}>SLIP / TIME</th>
                <th style={{ padding: '10px 8px' }}>NOZZLE</th>
                <th style={{ padding: '10px 8px' }}>PRODUCT</th>
                <th style={{ padding: '10px 8px' }}>VEHICLE</th>
                <th style={{ padding: '10px 8px' }}>VOLUME</th>
                <th style={{ padding: '10px 8px' }}>AMOUNT (₹)</th>
                <th style={{ padding: '10px 8px' }}>TENDER</th>
                <th style={{ padding: '10px 8px' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 6).map((txn) => (
                <tr key={txn.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{txn.receiptNo}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{txn.timestamp.split(' ')[1]}</div>
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: '#fbbf24' }}>{txn.nozzleNumber}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ fontWeight: 600 }}>{txn.fuelCode}</span>
                    {txn.lubeItems && txn.lubeItems.length > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#38bdf8', marginLeft: '6px' }}>+Lube</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {txn.customerVehicle}
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {txn.liters.toFixed(2)} L
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                    ₹{txn.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span className={`badge ${txn.paymentMode === 'CASH' ? 'badge-warning' : txn.paymentMode === 'CREDIT' ? 'badge-alert' : 'badge-blue'}`}>
                      {txn.paymentMode}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <button
                      onClick={() => setActiveReceiptModal(txn)}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Print Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Update Modal */}
      {priceModalOpen && (
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
          <div className="glass-card" style={{ width: '380px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff' }}>
              Update Petroleum Board Rates
            </h3>
            <form onSubmit={handlePriceUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select Fuel Grade</label>
                <select 
                  value={selectedFuelForPrice?.code}
                  onChange={(e) => {
                    const found = fuelPrices.find(f => f.code === e.target.value);
                    setSelectedFuelForPrice(found);
                    setNewRateInput(found?.price || 100);
                  }}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {fuelPrices.map(fp => (
                    <option key={fp.id} value={fp.code}>{fp.name} (Current: ₹{fp.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>New Revised Price (₹ per Liter)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  style={{ width: '100%', marginTop: '6px', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Confirm & Sync
                </button>
                <button type="button" onClick={() => setPriceModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
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
