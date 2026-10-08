import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  Coins, 
  Fuel, 
  BarChart3, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  Zap, 
  Users, 
  CreditCard, 
  Droplet, 
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { calculateDealerProfitAndMargin } from '../utils/petroleumTaxEngine';

export default function DealerMarginView() {
  const { 
    transactions, 
    dealerMargins, 
    updateDealerMargins,
    stationInfo 
  } = useApp();

  const [editingMargins, setEditingMargins] = useState(false);
  const [tempMargins, setTempMargins] = useState({ ...dealerMargins });
  
  // Operational overheads state for the day
  const [dailyExpenses, setDailyExpenses] = useState({
    electricity: 1650,
    wages: 2100,
    posCharges: 420,
    forecourtMaintenance: 350,
    evaporationLossCost: 680
  });

  const totalOverheads = Object.values(dailyExpenses).reduce((a, b) => a + b, 0);

  // Compute live profit report
  const profitReport = calculateDealerProfitAndMargin(transactions, dealerMargins, totalOverheads);

  const handleSaveMargins = (e) => {
    e.preventDefault();
    updateDealerMargins(tempMargins);
    setEditingMargins(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                Per-Liter Dealer Margin & Daily Net Profit Engine
              </h2>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                OMC BENCHMARK MARGINS
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Real-time Commission Tracking (₹/L) • Product Profitability • Overhead Deductions • Blended Unit Margin
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditingMargins(!editingMargins)}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', borderColor: '#10b981', color: '#34d399' }}
        >
          <Edit3 size={15} /> {editingMargins ? 'Cancel Margin Edit' : 'Edit Statutory Margins'}
        </button>
      </div>

      {/* Hero Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        
        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Fuel Dispensed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            {profitReport.totalLiters.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>L</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>Across MS, HSD, XP95, CNG</div>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Gross Commission Earned</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            ₹{profitReport.grossCommission.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Pre-overhead dealer revenue</div>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #f87171' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Daily Operating Expenses</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            -₹{totalOverheads.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Power, Staff, EDC, Evap loss</div>
        </div>

        <div className="glass-card" style={{ padding: '18px', borderLeft: '4px solid #34d399', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
          <div style={{ fontSize: '0.72rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800 }}>Net Daily Profit & Blended Rate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            ₹{profitReport.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 700, marginTop: '4px' }}>
            ⚡ Blended Margin: ₹{profitReport.blendedMarginPerLiter.toFixed(2)} / Liter
          </div>
        </div>

      </div>

      {/* Margin Configuration Modal / In-line Editor */}
      {editingMargins && (
        <div className="glass-card" style={{ padding: '22px', border: '1px solid #10b981', background: 'rgba(6, 78, 59, 0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
            ⚙️ Customize Product Dealer Commission (₹ / Liter)
          </h3>

          <form onSubmit={handleSaveMargins} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MS Petrol (₹/L)</label>
              <input
                type="number"
                step="0.01"
                value={tempMargins.MS}
                onChange={(e) => setTempMargins({ ...tempMargins, MS: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HSD Diesel (₹/L)</label>
              <input
                type="number"
                step="0.01"
                value={tempMargins.HSD}
                onChange={(e) => setTempMargins({ ...tempMargins, HSD: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>XP95 Premium (₹/L)</label>
              <input
                type="number"
                step="0.01"
                value={tempMargins.XP95}
                onChange={(e) => setTempMargins({ ...tempMargins, XP95: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CNG Gas (₹/KG)</label>
              <input
                type="number"
                step="0.01"
                value={tempMargins.CNG}
                onChange={(e) => setTempMargins({ ...tempMargins, CNG: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              />
            </div>

            <div style={{ gridColumn: 'span 4', display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="submit" className="btn-action-green">
                <Check size={16} /> Save Commission Rates
              </button>
              <button type="button" onClick={() => setEditingMargins(false)} className="btn-secondary">
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.4fr) minmax(300px, 1fr)', gap: '20px' }}>
        
        {/* Product Commission Ledger Table */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Fuel size={18} color="#38bdf8" /> Commission Earned By Fuel Product
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 8px' }}>PRODUCT</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>VOLUME (L/KG)</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>DEALER MARGIN</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>COMMISSION (₹)</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>SHARE</th>
                </tr>
              </thead>
              <tbody>
                {profitReport.items.map(item => {
                  const share = profitReport.grossCommission > 0 ? ((item.marginEarned / profitReport.grossCommission) * 100).toFixed(1) : 0;
                  return (
                    <tr key={item.fuelCode} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 800, color: '#ffffff' }}>
                        {item.fuelCode}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {item.liters.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                        ₹{item.marginPerLiter.toFixed(2)} / L
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399' }}>
                        ₹{item.marginEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        {share}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Deductions Tracker */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingDown size={18} color="#f87171" /> Daily Overhead Expenses (₹)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <Zap size={14} color="#fbbf24" /> Electricity & DG Backup
              </div>
              <input
                type="number"
                value={dailyExpenses.electricity}
                onChange={(e) => setDailyExpenses({ ...dailyExpenses, electricity: parseFloat(e.target.value) || 0 })}
                style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '4px 6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <Users size={14} color="#38bdf8" /> Attendant Wages & Shift Incentives
              </div>
              <input
                type="number"
                value={dailyExpenses.wages}
                onChange={(e) => setDailyExpenses({ ...dailyExpenses, wages: parseFloat(e.target.value) || 0 })}
                style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '4px 6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <CreditCard size={14} color="#a78bfa" /> EDC Card Machine Fees (MDR)
              </div>
              <input
                type="number"
                value={dailyExpenses.posCharges}
                onChange={(e) => setDailyExpenses({ ...dailyExpenses, posCharges: parseFloat(e.target.value) || 0 })}
                style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '4px 6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <Droplet size={14} color="#f87171" /> Evaporation Loss Cost
              </div>
              <input
                type="number"
                value={dailyExpenses.evaporationLossCost}
                onChange={(e) => setDailyExpenses({ ...dailyExpenses, evaporationLossCost: parseFloat(e.target.value) || 0 })}
                style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '4px 6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <Sparkles size={14} color="#34d399" /> Forecourt Facilities & Free Air/Water
              </div>
              <input
                type="number"
                value={dailyExpenses.forecourtMaintenance}
                onChange={(e) => setDailyExpenses({ ...dailyExpenses, forecourtMaintenance: parseFloat(e.target.value) || 0 })}
                style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '4px 6px' }}
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Total Daily Overheads:</span>
              <strong style={{ fontSize: '1.1rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                ₹{totalOverheads.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
