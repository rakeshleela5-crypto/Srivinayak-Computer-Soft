import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Database, 
  Droplets, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Gauge, 
  Thermometer, 
  ArrowDownRight,
  TrendingDown,
  Info
} from 'lucide-react';

export default function TanksView() {
  const { 
    tanks, 
    decantations, 
    recordDecantation, 
    recordPhysicalDip,
    stationInfo,
    calculateDensityAt15C,
    activeRole,
    get5StepMismatchAudit
  } = useApp();

  const [auditTankId, setAuditTankId] = useState(tanks[0]?.id || 'tank-1');
  const audit = get5StepMismatchAudit(auditTankId);

  const [decantationModalOpen, setDecantationModalOpen] = useState(false);
  const [dipModalOpen, setDipModalOpen] = useState(false);
  const [selectedTankForDip, setSelectedTankForDip] = useState(tanks[0]?.id || '');
  const [dipMmInput, setDipMmInput] = useState(1650);
  const [tempInput, setTempInput] = useState(28.5);
  const [densityInput, setDensityInput] = useState(742.0);

  // Decantation Form State
  const [decForm, setDecForm] = useState({
    invoiceNo: 'IOCL-INV-' + Math.floor(100000 + Math.random() * 900000),
    tankerTTNo: 'KA-01-E-8899',
    driverName: 'Basavaraj Gowda',
    tankId: tanks[0]?.id || '',
    fuelCode: tanks[0]?.fuelCode || 'MS',
    fuelName: tanks[0]?.fuelName || 'Petrol (MS-91)',
    invoicedQty: 12000,
    dipBeforeDecantation: 7500,
    dipAfterDecantation: 19480,
    receivedQty: 11980,
    invoiceDensityAt15C: 752.5,
    observedTempC: 28.5,
    observedDensity: 742.0
  });

  const handleDecantationSubmit = (e) => {
    e.preventDefault();
    recordDecantation(decForm);
    setDecantationModalOpen(false);
  };

  const handleDipSubmit = (e) => {
    e.preventDefault();
    recordPhysicalDip(selectedTankForDip, parseFloat(dipMmInput), parseFloat(tempInput), parseFloat(densityInput));
    setDipModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner & Actions */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">ATG TELEMETRY STREAMING</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ASTM 53B 15°C Normalized</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Underground Tanks Wet-Stock, Dip vs ATG & Decantation Logistics
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Dual-measurement tracking (Brass Dip Stick vs Ultrasonic ATG Probes), permissible loss threshold &lt;0.59%, and TT decantation density verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setDecantationModalOpen(true)}
            className="btn-primary"
          >
            <Truck size={18} /> Inward Tanker Decantation
          </button>
          <button 
            onClick={() => setDipModalOpen(true)}
            className="btn-secondary"
          >
            <Droplets size={18} /> Record Physical Dip Stick
          </button>
        </div>
      </div>

      {/* Tanks Wet-Stock Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {tanks.map((tank) => {
          const pct = Math.round((tank.currentStock / tank.capacity) * 100);
          const atgVariance = tank.atgLevel - tank.currentStock;
          const isLow = tank.currentStock <= tank.reorderLevel;
          const isWaterAlert = tank.waterBottomMm > 8;

          return (
            <div key={tank.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Tank Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>{tank.tankNumber}</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: tank.color, background: `${tank.color}20`, padding: '2px 6px', borderRadius: '4px' }}>
                      {tank.fuelCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{tank.fuelName}</div>
                </div>

                {isLow ? (
                  <span className="badge badge-alert"><AlertTriangle size={12} /> REORDER</span>
                ) : (
                  <span className="badge badge-active"><CheckCircle size={12} /> NORMAL</span>
                )}
              </div>

              {/* Liquid Visual Fill */}
              <div className="tank-visual" style={{ height: '160px' }}>
                <div 
                  className={`tank-liquid tank-liquid-${tank.fuelCode.toLowerCase()}`}
                  style={{ height: `${pct}%` }}
                />
                
                {/* Foreground Overlay */}
                <div style={{ position: 'absolute', top: '12px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', zIndex: 3, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700 }}>ATG SENSOR LEVEL</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                      {tank.atgLevel.toLocaleString()} L
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 700 }}>CAPACITY FILL</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>{pct}%</div>
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', zIndex: 3, fontSize: '0.75rem', color: '#f1f5f9', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                  <span>Physical Dip: <strong>{tank.physicalDipMm} mm</strong></span>
                  <span style={{ color: isWaterAlert ? '#f87171' : '#f1f5f9' }}>
                    Water: <strong>{tank.waterBottomMm} mm</strong>
                  </span>
                </div>
              </div>

              {/* Tank Telemetry Metrics: Dip vs ATG, Temp, Density */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'rgba(2, 6, 23, 0.5)', padding: '12px', borderRadius: '10px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Book Stock</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                    {tank.currentStock.toLocaleString()} L
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Dip vs ATG Variance</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: Math.abs(atgVariance) <= 50 ? '#34d399' : '#f87171' }}>
                    {atgVariance >= 0 ? `+${atgVariance}` : atgVariance} L
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Observed Density / Temp</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                    {tank.densityObserved} kg/m³ @ {tank.temperatureC}°C
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Std Density @ 15°C</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                    {tank.densityAt15C} kg/m³
                  </div>
                </div>
              </div>

              {/* Dead stock & Safe margin */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <span>Dead Stock Margin: {tank.deadStock.toLocaleString()} L</span>
                <span>Reorder Trigger: {tank.reorderLevel.toLocaleString()} L</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Tanker Decantation & Inward Logistics History */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="#f59e0b" /> Tanker Decantation Logistics (Inward TT Receipts)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Verifies invoice qty vs physical dip received, standard temperature 15°C hydrometer density, and permissible loss (&lt; 0.59%).
            </span>
          </div>
          <span className="badge badge-active">OMC COMPLIANT</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <th style={{ padding: '10px 8px' }}>INVOICE / DATE</th>
                <th style={{ padding: '10px 8px' }}>TANKER TT / DRIVER</th>
                <th style={{ padding: '10px 8px' }}>TANK / FUEL</th>
                <th style={{ padding: '10px 8px' }}>INVOICED QTY</th>
                <th style={{ padding: '10px 8px' }}>RECEIVED QTY</th>
                <th style={{ padding: '10px 8px' }}>SHORTAGE / LOSS</th>
                <th style={{ padding: '10px 8px' }}>STD DENSITY @15°C</th>
                <th style={{ padding: '10px 8px' }}>DENSITY VAR</th>
                <th style={{ padding: '10px 8px' }}>AUDIT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {decantations.map((dec) => (
                <tr key={dec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{dec.invoiceNo}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{dec.date}</div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{dec.tankerTTNo}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{dec.driverName}</div>
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: '#fbbf24' }}>
                    {dec.fuelCode} ({dec.tankId})
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>
                    {dec.invoicedQty.toLocaleString()} L
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                    {dec.receivedQty.toLocaleString()} L
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ color: dec.shortagePercent <= 0.59 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                      -{dec.shortageLiters} L ({dec.shortagePercent}%)
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>
                    {dec.convertedDensityAt15C} kg/m³
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ color: Math.abs(dec.densityVariance) <= 3.0 ? '#34d399' : '#f87171', fontWeight: 700 }}>
                      {dec.densityVariance > 0 ? `+${dec.densityVariance}` : dec.densityVariance}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <span className="badge badge-active">{dec.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Step Fuel Stock Mismatch Diagnostic Radar (PDF Pages 5 & 6) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-alert" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                PDF AUDIT RADAR
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                5-Step Fuel Stock Mismatch & Variation Diagnostics
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              "Why don't your numbers match?" — Automated forecourt reconciliation across physical dip, dispenser meters, tanker decantations, shift entries, and temperature shrinkage.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 700 }}>SELECT TANK:</label>
            <select
              value={auditTankId}
              onChange={(e) => setAuditTankId(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {tanks.map(t => (
                <option key={t.id} value={t.id} style={{ background: '#0f172a' }}>
                  {t.tankNumber} - {t.fuelCode} ({t.fuelName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit High Level Comparison Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>SYSTEM BOOK STOCK</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {audit.expectedBookStock.toLocaleString()} L
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Opening + Received - Sold - Loss</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>ACTUAL PHYSICAL DIP STOCK</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {audit.currentDipStock.toLocaleString()} L
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>Brass Rod Dip Chart Reading</div>
          </div>

          <div style={{ background: audit.isBalanced ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '12px', border: `1px solid ${audit.isBalanced ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
            <div style={{ fontSize: '0.72rem', color: audit.isBalanced ? '#34d399' : '#f87171', fontWeight: 700 }}>NET VARIATION (VARIANCE)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: audit.isBalanced ? '#34d399' : '#f87171', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {audit.stockDiscrepancyLiters > 0 ? `+${audit.stockDiscrepancyLiters.toLocaleString()}` : audit.stockDiscrepancyLiters.toLocaleString()} L
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Valued at ₹{audit.discrepancyAmount.toLocaleString()} ({audit.isBalanced ? 'Within Legal Metrology Norm' : 'Investigate Root Cause'})
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>DIAGNOSTIC STATUS</div>
            <span className={`badge ${audit.isBalanced ? 'badge-active' : 'badge-alert'}`} style={{ marginTop: '6px', alignSelf: 'flex-start' }}>
              {audit.isBalanced ? 'AUDIT PASSED (BALANCED)' : 'VARIANCE INVESTIGATION NEEDED'}
            </span>
          </div>
        </div>

        {/* 5-Step Diagnostic Checklist (Exact PDF Page 5 Replication) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>STEP 01: Verify Tank Stock</span>
              {audit.step1.passed ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{audit.step1.desc}</p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>STEP 02: Check Dispenser Meters</span>
              {audit.step2.passed ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{audit.step2.desc}</p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>STEP 03: Confirm Tanker Decantations</span>
              {audit.step3.passed ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{audit.step3.desc}</p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>STEP 04: Review Shift Closing & Tests</span>
              {audit.step4.passed ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{audit.step4.desc}</p>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>STEP 05: Check Evaporation & Density</span>
              {audit.step5.passed ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{audit.step5.desc}</p>
          </div>

        </div>
      </div>

      {/* Record Physical Dip Modal */}
      {dipModalOpen && (
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
          <div className="glass-card" style={{ width: '420px', padding: '24px', background: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Droplets size={22} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Record Manual Dip Stick Reading</h3>
            </div>
            
            <form onSubmit={handleDipSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Underground Tank</label>
                <select 
                  value={selectedTankForDip} 
                  onChange={(e) => setSelectedTankForDip(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.tankNumber} - {t.fuelName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Physical Dip Depth (mm)</label>
                <input 
                  type="number" 
                  value={dipMmInput} 
                  onChange={(e) => setDipMmInput(e.target.value)} 
                  style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fuel Temp (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={tempInput} 
                    onChange={(e) => setTempInput(e.target.value)} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hydrometer Density</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={densityInput} 
                    onChange={(e) => setDensityInput(e.target.value)} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Update Dip Chart
                </button>
                <button type="button" onClick={() => setDipModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Decantation Modal */}
      {decantationModalOpen && (
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
          <div className="glass-card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', background: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Truck size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>Tanker Decantation Entry (Inward Receipt)</h3>
            </div>

            <form onSubmit={handleDecantationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OMC Invoice No</label>
                  <input 
                    type="text" 
                    value={decForm.invoiceNo} 
                    onChange={(e) => setDecForm({ ...decForm, invoiceNo: e.target.value })} 
                    style={{ width: '100%', marginTop: '4px' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanker TT Plate No</label>
                  <input 
                    type="text" 
                    value={decForm.tankerTTNo} 
                    onChange={(e) => setDecForm({ ...decForm, tankerTTNo: e.target.value })} 
                    style={{ width: '100%', marginTop: '4px', textTransform: 'uppercase' }}
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Storage Tank</label>
                <select 
                  value={decForm.tankId}
                  onChange={(e) => {
                    const sel = tanks.find(t => t.id === e.target.value);
                    setDecForm({
                      ...decForm,
                      tankId: sel.id,
                      fuelCode: sel.fuelCode,
                      fuelName: sel.fuelName,
                      dipBeforeDecantation: sel.currentStock
                    });
                  }}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.tankNumber} - {t.fuelName} (Current: {t.currentStock} L)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Challan / Invoice Qty (L)</label>
                  <input 
                    type="number" 
                    value={decForm.invoicedQty} 
                    onChange={(e) => setDecForm({ ...decForm, invoicedQty: parseFloat(e.target.value) })} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual Received Dip Qty (L)</label>
                  <input 
                    type="number" 
                    value={decForm.receivedQty} 
                    onChange={(e) => setDecForm({ ...decForm, receivedQty: parseFloat(e.target.value) })} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Invoice Dens @15°C</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={decForm.invoiceDensityAt15C} 
                    onChange={(e) => setDecForm({ ...decForm, invoiceDensityAt15C: parseFloat(e.target.value) })} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Observed Temp (°C)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={decForm.observedTempC} 
                    onChange={(e) => setDecForm({ ...decForm, observedTempC: parseFloat(e.target.value) })} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Observed Dens (Hydrometer)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={decForm.observedDensity} 
                    onChange={(e) => setDecForm({ ...decForm, observedDensity: parseFloat(e.target.value) })} 
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Verify & Decant Tanker
                </button>
                <button type="button" onClick={() => setDecantationModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
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
