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
  TrendingDown,
  PlusCircle,
  Calendar,
  Receipt
} from 'lucide-react';
import { calculateDealerProfitAndMargin } from '../utils/petroleumTaxEngine';

export default function DealerMarginView() {
  const { 
    transactions, 
    dealerMargins, 
    updateDealerMargins,
    stationInfo,
    forecourtExpenses,
    recordExpense,
    decantations
  } = useApp();

  const [editingMargins, setEditingMargins] = useState(false);
  const [tempMargins, setTempMargins] = useState({ ...dealerMargins });
  const [newExpenseModal, setNewExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Electricity & DG Backup',
    amount: '',
    paidTo: '',
    approvedBy: 'Vijay Sharma (Manager)'
  });

  // Dynamic Calculation of Overheads
  // 1. Dynamic Card MDR Fees (0.20% on all card payments)
  const cardTxnTotal = transactions
    .filter(t => t.paymentMode === 'CARD')
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const dynamicMdrFee = Math.round(cardTxnTotal * 0.0020);

  // 2. Dynamic Evaporation & Transit Loss Cost (based on decantation shortage liters)
  const decantationShortageLiters = decantations.reduce((acc, d) => acc + (d.shortageLiters || 0), 0);
  const dynamicEvaporationCost = Math.round(decantationShortageLiters * 95) || 580;

  // 3. Recorded Forecourt Expenses from live database
  const recordedExpensesTotal = forecourtExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  // Total Live Overheads
  const totalOverheads = recordedExpensesTotal + dynamicMdrFee + dynamicEvaporationCost;

  // Compute live profit report
  const profitReport = calculateDealerProfitAndMargin(transactions, dealerMargins, totalOverheads);

  const handleSaveMargins = (e) => {
    e.preventDefault();
    updateDealerMargins(tempMargins);
    setEditingMargins(false);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;
    recordExpense({
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      paidTo: expenseForm.paidTo || 'Station Operational Vendor',
      approvedBy: expenseForm.approvedBy
    });
    setExpenseForm({
      category: 'Staff Tea & Snacks',
      amount: '',
      paidTo: '',
      approvedBy: 'Vijay Sharma (Manager)'
    });
    setNewExpenseModal(false);
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
                OMC BENCHMARK MARGINS (LIVE)
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Real-time Commission Tracking (₹/L) • Product Profitability • Live Forecourt Overheads • Blended Unit Margin
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setNewExpenseModal(true)}
            className="btn-action-green"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <PlusCircle size={15} /> Record Operational Expense
          </button>
          <button
            onClick={() => setEditingMargins(!editingMargins)}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', borderColor: '#10b981', color: '#34d399' }}
          >
            <Edit3 size={15} /> {editingMargins ? 'Cancel Margin Edit' : 'Edit Statutory Margins'}
          </button>
        </div>
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
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Live Operating Overheads</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            -₹{totalOverheads.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>Forecourt + MDR Fee + Evaporation</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.3fr) minmax(320px, 1.1fr)', gap: '20px' }}>
        
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f87171', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={18} color="#f87171" /> Live Overheads & Expenses (₹)
            </h3>
            <button
              onClick={() => setNewExpenseModal(true)}
              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: '#f87171', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
            >
              + Add Expense
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Dynamic System Overheads */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <CreditCard size={14} color="#a78bfa" /> EDC Card Machine Fees (0.20% MDR)
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                ₹{dynamicMdrFee.toLocaleString('en-IN')}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#e2e8f0' }}>
                <Droplet size={14} color="#f87171" /> Evaporation & Handling Loss
              </div>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                ₹{dynamicEvaporationCost.toLocaleString('en-IN')}
              </strong>
            </div>

            {/* Live Forecourt Expenses */}
            {forecourtExpenses.map((exp) => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>{exp.category}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Paid to: {exp.paidTo} • {exp.date}</div>
                </div>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                  ₹{(exp.amount || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Total Daily Overheads:</span>
              <strong style={{ fontSize: '1.15rem', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                ₹{totalOverheads.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* Record Expense Modal */}
      {newExpenseModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#f87171" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Record Forecourt Expense</h3>
              </div>
              <button onClick={() => setNewExpenseModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Electricity & DG Backup">Electricity & DG Backup</option>
                  <option value="Attendant Wages & Shift Incentives">Attendant Wages & Shift Incentives</option>
                  <option value="Forecourt Maintenance & Cleaning">Forecourt Maintenance & Cleaning</option>
                  <option value="Staff Tea & Refreshments">Staff Tea & Refreshments</option>
                  <option value="Drinking Water & Facility Sanitation">Drinking Water & Facility Sanitation</option>
                  <option value="Printing Rolls & Office Stationery">Printing Rolls & Office Stationery</option>
                  <option value="Miscellaneous Daily Petty Cash">Miscellaneous Daily Petty Cash</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="e.g. 500"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Paid To / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. BESCOM / Local Store"
                  value={expenseForm.paidTo}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewExpenseModal(false)}
                  style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action-green"
                  style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Save & Deduct from Profit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
