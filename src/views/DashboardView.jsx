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
  Edit3,
  Radio,
  Volume2,
  VolumeX,
  Eye,
  ArrowLeftRight,
  Database,
  Users2,
  FileSpreadsheet,
  BookOpen,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { audioFX } from '../utils/audioFX';

export default function DashboardView({
  onOpenCreditSale,
  onOpenCustomerMaster,
  onOpenPaymentReceipt,
  onOpenTransferEntry,
  onOpenPurchaseEntry,
  onOpenDipRegister,
  onOpenRateMaster,
  onOpenShiftSettlement,
  onOpenAttendantHandover,
  onOpenMasterReports,
  onOpenStamping,
  onOpenPosBill
}) {
  const { 
    stationInfo, 
    fuelPrices, 
    updateFuelPrice, 
    tanks, 
    nozzles, 
    dispensers, 
    currentShift, 
    transactions,
    fleetAccounts,
    setActiveTab,
    setActiveReceiptModal
  } = useApp();

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedFuelForPrice, setSelectedFuelForPrice] = useState(fuelPrices[0]);
  const [newRateInput, setNewRateInput] = useState(fuelPrices[0]?.price || 100);
  const [selectedTwinTank, setSelectedTwinTank] = useState(tanks[0] || null);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

      {/* Fast Desk ERP Action Strip (Matching Video Shortcut Operations) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '10px 14px',
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', marginRight: '4px' }}>
          Fast Desk:
        </span>

        {[
          { label: 'POS Cash Bill', key: 'F5', icon: Zap, onClick: onOpenPosBill, color: '#10b981' },
          { label: 'Credit Sale', key: 'F1', icon: Truck, onClick: onOpenCreditSale, color: '#fbbf24' },
          { label: 'Payment Receipt', key: 'F2', icon: CreditCard, onClick: onOpenPaymentReceipt, color: '#34d399' },
          { label: 'Customer Master', key: 'F3', icon: Users2, onClick: onOpenCustomerMaster, color: '#38bdf8' },
          { label: 'Rate Master', key: 'F4', icon: TrendingUp, onClick: onOpenRateMaster, color: '#f59e0b' },
          { label: 'Contra Transfer', key: 'F6', icon: ArrowLeftRight, onClick: onOpenTransferEntry, color: '#a78bfa' },
          { label: 'Decantation (8 Seals)', key: 'F7', icon: Database, onClick: onOpenPurchaseEntry, color: '#f472b6' },
          { label: 'Tank Dip Register', key: 'F8', icon: Fuel, onClick: onOpenDipRegister, color: '#10b981' },
          { label: 'Shift Reconciliation', key: 'F9', icon: FileSpreadsheet, onClick: onOpenShiftSettlement, color: '#e879f9' },
          { label: '44 Master Reports', key: 'F10', icon: BookOpen, onClick: onOpenMasterReports, color: '#60a5fa' },
          { label: 'W&M Stamping', key: 'Esc', icon: ShieldCheck, onClick: onOpenStamping, color: '#f87171' }
        ].map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <button
              key={idx}
              onClick={btn.onClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: btn.color,
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = btn.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <Icon size={14} color={btn.color} />
              <span>{btn.label}</span>
              <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {btn.key}
              </span>
            </button>
          );
        })}
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

      {/* 3D FORECOURT DIGITAL TWIN & UNDERGROUND TANK FLUID VISUALIZER */}
      <div className="twin-canopy-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: 'linear-gradient(90deg, #f59e0b, #ec4899)', color: '#000', fontWeight: 900, fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                DIGITAL TWIN V2
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#38bdf8" /> 3D Sub-Surface Forecourt & Liquid Hydrodynamics
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Real-time digital twin visualization of physical canopy dispensers and underground wet-stock fluid levels with ATG telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                audioFX.enabled = next;
                if (next) audioFX.playCashRegister();
              }}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Forecourt Sound Effects"
            >
              {soundEnabled ? <Volume2 size={14} color="#34d399" /> : <VolumeX size={14} color="#94a3b8" />}
              <span>{soundEnabled ? 'FX SOUND ON' : 'MUTED'}</span>
            </button>
            <span className="badge badge-active" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} className="animate-pulse" /> TELEMETRY STREAMING
            </span>
          </div>
        </div>

        {/* Level A: Upper Forecourt Islands & Nozzle Bays */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '10px' }}>
            Canopy Level: 4 Dispensing Islands (Layer 1 Automations)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {dispensers.map((disp, idx) => {
              const islandNozzles = nozzles.filter(n => n.dispenserId === disp.id);
              return (
                <div 
                  key={disp.id} 
                  style={{ 
                    background: 'rgba(2, 6, 23, 0.7)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px', 
                    padding: '14px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>ISLAND 0{idx + 1}</span>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      DUAL NOZZLE
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{disp.name}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    {islandNozzles.map(noz => (
                      <button
                        key={noz.id}
                        onClick={() => {
                          if (soundEnabled) audioFX.playDispensePulse();
                          setActiveTab('pos');
                        }}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          background: `${noz.color}15`,
                          border: `1px solid ${noz.color}40`,
                          color: '#fff',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ color: noz.color, fontWeight: 900 }}>{noz.nozzleNumber}</span>
                        <span>{noz.fuelCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level B: Sub-Surface Underground Storage Tanks (UST) Liquid Hydrodynamics */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
              Sub-Surface Level: Transparent Underground Tanks & Fluid Hydrodynamics
            </div>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Click any tank for ultrasonic sensor inspection</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            {tanks.map((tank) => {
              const fillPct = Math.round((tank.currentStock / tank.capacity) * 100);
              const isSelected = selectedTwinTank?.id === tank.id;
              
              // Fuel color themes
              const fluidGradients = {
                MS: 'linear-gradient(180deg, rgba(249, 115, 22, 0.9) 0%, rgba(194, 65, 12, 0.95) 100%)',
                XP95: 'linear-gradient(180deg, rgba(236, 72, 153, 0.9) 0%, rgba(190, 24, 93, 0.95) 100%)',
                HSD: 'linear-gradient(180deg, rgba(59, 130, 246, 0.9) 0%, rgba(29, 78, 216, 0.95) 100%)',
                CNG: 'linear-gradient(180deg, rgba(16, 185, 129, 0.9) 0%, rgba(4, 120, 87, 0.95) 100%)'
              };
              const fluidBg = fluidGradients[tank.fuelCode] || fluidGradients.MS;

              return (
                <div
                  key={tank.id}
                  onClick={() => {
                    setSelectedTwinTank(tank);
                    if (soundEnabled) audioFX.playTelemetryPing();
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                    border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>{tank.tankNumber}</span>
                      <span style={{ fontSize: '0.72rem', color: tank.color, fontWeight: 800, marginLeft: '6px' }}>{tank.fuelCode}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{fillPct}%</span>
                  </div>

                  {/* Glass Cylinder Capsule with Animated Sloshing Fuel */}
                  <div className="tank-capsule">
                    <div 
                      className="tank-fluid-layer" 
                      style={{ 
                        height: `${fillPct}%`,
                        background: fluidBg
                      }}
                    >
                      <div className="tank-fluid-wave" style={{ background: fluidBg }} />
                    </div>

                    {/* Sensor Overlay Readings */}
                    <div style={{ position: 'absolute', inset: '8px', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#f1f5f9', fontWeight: 700 }}>
                        DIP: {tank.physicalDipMm} mm
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                          {tank.currentStock.toLocaleString()} L
                        </div>
                        <div style={{ fontSize: '0.62rem', color: '#cbd5e1' }}>
                          Cap: {tank.capacity.toLocaleString()} L
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Water Sensor & Status Indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    <span>Water: <strong style={{ color: tank.waterBottomMm > 8 ? '#f87171' : '#34d399' }}>{tank.waterBottomMm} mm</strong></span>
                    <span>15°C Dens: <strong style={{ color: '#fff' }}>{tank.density15C}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Tank Ultrasonics Inspection Drawer */}
        {selectedTwinTank && (
          <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${selectedTwinTank.color}25`, border: `1px solid ${selectedTwinTank.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedTwinTank.color, fontWeight: 900, fontSize: '0.9rem' }}>
                {selectedTwinTank.fuelCode}
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                  {selectedTwinTank.tankNumber} • {selectedTwinTank.fuelName}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  ATG Probe: <strong>{selectedTwinTank.atgLevel.toLocaleString()} L</strong> • Brass Dip: <strong>{selectedTwinTank.currentStock.toLocaleString()} L</strong> • Variance: <strong style={{ color: '#34d399' }}>{selectedTwinTank.atgLevel - selectedTwinTank.currentStock} L (OK)</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveTab('tanks')}
                className="btn-primary" 
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
              >
                Open Full Dip Diagnostics →
              </button>
            </div>
          </div>
        )}

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

      {/* Dual Ledgers Section (Matching Video Frames 003-006): Customer Outstanding & Cash/Bank Books */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Ledger Panel 1: Credit Customer Outstanding */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#fbbf24" /> Credit Customer Outstanding Ledger
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Live receivables balance, credit limits, and WhatsApp delivery slips
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {onOpenCreditSale && (
                <button
                  onClick={onOpenCreditSale}
                  className="btn-primary"
                  style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Truck size={13} /> + Credit Bill (F1)
                </button>
              )}
              {onOpenPaymentReceipt && (
                <button
                  onClick={onOpenPaymentReceipt}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <CreditCard size={13} /> Settle (F2)
                </button>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                  <th style={{ padding: '8px 6px' }}>CUSTOMER / FLEET</th>
                  <th style={{ padding: '8px 6px' }}>PHONE</th>
                  <th style={{ padding: '8px 6px' }}>CREDIT LIMIT</th>
                  <th style={{ padding: '8px 6px' }}>CURRENT BALANCE</th>
                  <th style={{ padding: '8px 6px' }}>STATUS</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {(fleetAccounts || []).map(fa => {
                  const bal = fa.currentBalance || 0;
                  const limit = fa.creditLimit || 500000;
                  const isOver = bal > limit;
                  return (
                    <tr key={fa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '9px 6px' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>{fa.companyName || fa.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>ID: {fa.id}</div>
                      </td>
                      <td style={{ padding: '9px 6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        {fa.phone || '+91 98860 00000'}
                      </td>
                      <td style={{ padding: '9px 6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        ₹{limit.toLocaleString()}
                      </td>
                      <td style={{ padding: '9px 6px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: isOver ? '#f87171' : '#fbbf24' }}>
                        ₹{bal.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Dr</span>
                      </td>
                      <td style={{ padding: '9px 6px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isOver ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                          color: isOver ? '#f87171' : '#34d399',
                          border: isOver ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          {isOver ? 'OVER-LIMIT' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '9px 6px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              const phoneClean = (fa.phone || '919845012345').replace(/[^0-9]/g, '');
                              const text = encodeURIComponent(`*SHREE VINAYAKA PETROSOFT AI*\nDear ${fa.companyName || fa.name},\nYour outstanding fuel balance is *Rs. ${bal.toLocaleString()} Dr*.\nPlease arrange settlement at earliest.`);
                              window.open(`https://wa.me/${phoneClean}?text=${text}`, '_blank');
                            }}
                            title="Send WhatsApp Statement"
                            style={{
                              background: 'rgba(37, 211, 102, 0.15)',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              color: '#25d366',
                              padding: '3px 7px',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            WhatsApp
                          </button>
                          {onOpenPaymentReceipt && (
                            <button
                              onClick={onOpenPaymentReceipt}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f8fafc',
                                padding: '3px 7px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '0.72rem'
                              }}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Panel 2: Cash & Bank Accounts (Contra Ledgers) */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={18} color="#38bdf8" /> Cash & Bank Ledgers
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                Counter cash, current accounts, and OD facilities
              </div>
            </div>

            {onOpenTransferEntry && (
              <button
                onClick={onOpenTransferEntry}
                className="btn-primary"
                style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <ArrowLeftRight size={13} /> Contra (F6)
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'b-1', name: 'Cash on Hand Counter', type: 'Cash A/c', acNo: 'CASH-RO-01', balance: 142500, flag: 'Dr', color: '#10b981' },
              { id: 'b-2', name: 'State Bank of India (SBI)', type: 'Current A/c', acNo: '30981249821', balance: 489200, flag: 'Dr', color: '#38bdf8' },
              { id: 'b-3', name: 'HDFC Bank Cash Credit / OD', type: 'OD / CC A/c', acNo: '502000192841', balance: 215000, flag: 'Cr', color: '#f87171' },
              { id: 'b-4', name: 'ICICI Bank Digital POS Settled', type: 'UPI/Card A/c', acNo: '002905018291', balance: 84350, flag: 'Dr', color: '#a78bfa' }
            ].map(bank => (
              <div
                key={bank.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.82rem' }}>{bank.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    {bank.type} • A/c: {bank.acNo}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: bank.color }}>
                    ₹{bank.balance.toLocaleString()} <span style={{ fontSize: '0.72rem', color: bank.flag === 'Dr' ? '#34d399' : '#f87171' }}>{bank.flag}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {bank.flag === 'Dr' ? 'Available Asset' : 'Overdraft Facility'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Liquid Book Position:</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              ₹5,01,050.00 <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Dr</span>
            </span>
          </div>
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
