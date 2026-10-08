import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Gauge, 
  FlaskConical, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Settings, 
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function NozzlesView() {
  const { 
    nozzles, 
    tanks, 
    calibrationTests, 
    recordCalibrationTest, 
    priceUpdateLog, 
    fuelPrices,
    activeRole
  } = useApp();

  const [calModalOpen, setCalModalOpen] = useState(false);
  const [selectedNozzleForCal, setSelectedNozzleForCal] = useState(nozzles[0]?.id || '');
  const [testMeasureVol, setTestMeasureVol] = useState(5.0); // Standard 5L test measure
  const [varianceMl, setVarianceMl] = useState(0);

  const handleCalibrationSubmit = (e) => {
    e.preventDefault();
    if (!selectedNozzleForCal) return;
    recordCalibrationTest(selectedNozzleForCal, parseFloat(testMeasureVol), parseFloat(varianceMl));
    setCalModalOpen(false);
    setVarianceMl(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">TOTALIZERS ACTIVE</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>8 Calibrated Dispensers</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Nozzle Totalizers & Weights & Measures Calibration (5L Measure)
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Associates physical nozzles with underground storage tanks, tracks mechanical counter readings, and logs non-sale 5L calibration pours.
          </p>
        </div>

        <button 
          onClick={() => setCalModalOpen(true)}
          className="btn-primary"
        >
          <FlaskConical size={18} /> Record 5L Calibration Check
        </button>
      </div>

      {/* Nozzles & Meter Totalizer Table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gauge size={20} color="#f59e0b" /> Forecourt Dispenser Mechanical Counter Readings
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px 10px' }}>NOZZLE</th>
                <th style={{ padding: '12px 10px' }}>BAY / ISLAND</th>
                <th style={{ padding: '12px 10px' }}>MAPPED TANK</th>
                <th style={{ padding: '12px 10px' }}>PRODUCT</th>
                <th style={{ padding: '12px 10px' }}>OPENING METER</th>
                <th style={{ padding: '12px 10px' }}>CURRENT TOTALIZER</th>
                <th style={{ padding: '12px 10px' }}>5L TESTING VOL</th>
                <th style={{ padding: '12px 10px' }}>NET SOLD VOLUME</th>
                <th style={{ padding: '12px 10px' }}>RATE (₹/L)</th>
              </tr>
            </thead>
            <tbody>
              {nozzles.map((noz) => {
                const mappedTank = tanks.find(t => t.id === noz.tankId);
                const dispensedGross = noz.currentMeter - noz.openingMeter;
                const netSold = dispensedGross - (noz.testingVolume || 0);

                return (
                  <tr key={noz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ 
                        background: `${noz.color}25`, 
                        color: noz.color, 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {noz.nozzleNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{noz.island}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px' }}>
                        {mappedTank?.tankNumber || noz.tankId}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#f8fafc' }}>{noz.fuelName}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>
                      {noz.openingMeter.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="led-meter" style={{ fontSize: '0.85rem' }}>
                        {noz.currentMeter.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                      {noz.testingVolume.toFixed(2)} L
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                      {netSold.toFixed(2)} L
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                      ₹{noz.rate.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weights & Measures (W&M) 5-Liter Calibration Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.4fr) minmax(280px, 1fr)', gap: '20px' }}>
        
        {/* Calibration Logs */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="#38bdf8" /> Weights & Measures (5L Conical Measure) Verification History
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Permissible: ±25 ml</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {calibrationTests.map((test) => (
              <div key={test.id} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#fbbf24' }}>{test.nozzleNumber} ({test.fuelCode})</span>
                    <span className="badge badge-active">{test.status}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{test.date}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Dispensed: <strong>{test.quantityDispensedL.toFixed(3)} L</strong> into 5.0L Conical Measure • Variance: <strong style={{ color: test.varianceMl >= 0 ? '#34d399' : '#f87171' }}>{test.varianceMl > 0 ? `+${test.varianceMl}` : test.varianceMl} ml</strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Poured back to: {test.pouredBackToTank} (0 sales impact) • Inspected by: {test.inspector}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {test.weightsAndMeasuresStamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Re-pricing & Audit History */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#f59e0b" /> Daily Price Revision Audit Logs
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {priceUpdateLog.map((log) => (
              <div key={log.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc' }}>{log.fuelCode} Daily Revision</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{log.effectiveDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)', textDecoration: 'line-through' }}>₹{log.oldPrice.toFixed(2)}</span>
                  <span>→</span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>₹{log.newPrice.toFixed(2)} / L</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Authorized by: {log.updatedBy}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Record 5L Calibration Modal */}
      {calModalOpen && (
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
              <FlaskConical size={22} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Record 5L Calibration Dispense
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
              Non-sale nozzle calibration or density check. Poured back into tank without registering as sales revenue.
            </p>

            <form onSubmit={handleCalibrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select Dispensing Nozzle</label>
                <select
                  value={selectedNozzleForCal}
                  onChange={(e) => setSelectedNozzleForCal(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {nozzles.map(n => (
                    <option key={n.id} value={n.id}>{n.nozzleNumber} - {n.fuelName} ({n.island})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Test Measure Vol (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testMeasureVol}
                    onChange={(e) => setTestMeasureVol(e.target.value)}
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Variance (ml error)</label>
                  <input
                    type="number"
                    step="1"
                    value={varianceMl}
                    onChange={(e) => setVarianceMl(e.target.value)}
                    placeholder="e.g. +5 or -10"
                    style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', fontSize: '0.75rem', color: '#38bdf8' }}>
                Note: Weights & Measures tolerance is ±25 ml. Fuel is poured back into the underground tank and deducted from shift sales volume.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Calibration Pour
                </button>
                <button type="button" onClick={() => setCalModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
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
