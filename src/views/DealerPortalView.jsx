import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Crown, 
  Coins, 
  Database, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  ShieldAlert, 
  Landmark, 
  Plus, 
  CheckCircle2, 
  Receipt, 
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  DollarSign
} from 'lucide-react';

export default function DealerPortalView() {
  const { 
    stationInfo, 
    fuelPrices, 
    tanks, 
    nozzles, 
    staff, 
    currentShift, 
    fleetAccounts, 
    bankDeposits, 
    recordBankDeposit, 
    forecourtExpenses, 
    recordExpense,
    recoverStaffShortage
  } = useApp();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [selectedStaffForRecovery, setSelectedStaffForRecovery] = useState(staff[0]);
  const [recoveryAmount, setRecoveryAmount] = useState(100);

  // Bank Deposit Form
  const [depositForm, setDepositForm] = useState({
    bankName: "State Bank of India (SBI)",
    accountNo: "30819284901",
    amount: 100000,
    challanNo: "CHL-" + Math.floor(1000 + Math.random() * 9000),
    depositedBy: "Vijay Sharma (Manager)"
  });

  // Expense Form
  const [expenseForm, setExpenseForm] = useState({
    category: "Forecourt Maintenance",
    amount: 500,
    paidTo: "Local Supplier",
    approvedBy: "Shiva Kumar (Owner)"
  });

  // 1. Calculate Capital Valuation of Fuel in Underground Storage Tanks (UST)
  const totalWetStockValue = tanks.reduce((sum, tank) => {
    const priceObj = fuelPrices.find(p => p.code === tank.fuelCode);
    const rate = priceObj ? priceObj.price : 90;
    return sum + (tank.currentStock * rate);
  }, 0);

  // 2. Total Credit Outstanding Across All B2B Fleets
  const totalCreditDebt = fleetAccounts.reduce((sum, f) => sum + f.currentBalance, 0);
  const totalCreditLimit = fleetAccounts.reduce((sum, f) => sum + f.creditLimit, 0);

  // 3. Total Unrecovered Shortages Across Attendants
  const totalPendingShortages = staff.reduce((sum, s) => sum + (s.totalShortagePending || 0), 0);

  // 4. Forecourt Cash in Office Safe
  const totalBankDepositsAmount = bankDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalExpensesAmount = forecourtExpenses.reduce((sum, e) => sum + e.amount, 0);
  const cashInSafe = Math.max(0, currentShift.cashCollected - totalExpensesAmount);

  // 5. Total Daily Turnover (Gross Sales)
  const grossTurnover = currentShift.cashCollected + currentShift.cardCollected + currentShift.upiCollected + currentShift.creditIssued;

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    recordBankDeposit(depositForm);
    setDepositModalOpen(false);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    recordExpense(expenseForm);
    setExpenseModalOpen(false);
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (selectedStaffForRecovery) {
      recoverStaffShortage(selectedStaffForRecovery.id, parseFloat(recoveryAmount), 'SALARY_DEDUCTION');
      setRecoveryModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Dealer Header Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: 'linear-gradient(90deg, #f59e0b, #d97706)', color: '#0f172a', fontWeight: 900, fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px' }}>
              DEALER / OWNER PORTAL
            </span>
            <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700 }}>Shiva Kumar (RO Licensee)</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>RO Code: {stationInfo.roCode}</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
            Executive Station Control, Cash Flow & Net Assets
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            High-level oversight of forecourt bank deposits, underground wet-stock valuation, employee shortages, and corporate credit exposure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setDepositModalOpen(true)} className="btn-primary">
            <Landmark size={18} /> Record Bank Cash Deposit
          </button>
          <button onClick={() => setExpenseModalOpen(true)} className="btn-secondary">
            <Receipt size={16} /> Add Forecourt Expense
          </button>
        </div>
      </div>

      {/* Top 4 Executive Asset Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Underground Tank Fuel Asset Valuation */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>UNDERGROUND FUEL CAPITAL VALUE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
            ₹{(totalWetStockValue / 100000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Lakhs</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Total 5 USTs: {tanks.reduce((s, t) => s + t.currentStock, 0).toLocaleString()} L liquid inventory
          </div>
        </div>

        {/* Metric 2: Today's Gross Forecourt Turnover */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>TODAY'S FORECOURT TURNOVER</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            ₹{(grossTurnover / 100000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Lakhs</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Shift Cash: ₹{currentShift.cashCollected.toLocaleString()} • Digital: ₹{(currentShift.cardCollected + currentShift.upiCollected).toLocaleString()}
          </div>
        </div>

        {/* Metric 3: Fleet Credit Outstanding */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f87171' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>TOTAL B2B FLEET CREDIT DEBT</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>
            ₹{(totalCreditDebt / 100000).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Lakhs</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Across 4 corporate fleet khatas (Limit: ₹{(totalCreditLimit / 100000).toFixed(1)}L)
          </div>
        </div>

        {/* Metric 4: Forecourt Cash in Safe */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700 }}>PHYSICAL CASH IN OFFICE SAFE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', marginTop: '4px' }}>
            ₹{cashInSafe.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Shift collections minus forecourt expenses
          </div>
        </div>

      </div>

      {/* Discrepancy & Loss Prevention Radar (The Heart of the PDF) */}
      <div className="glass-card" style={{ padding: '22px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#f87171" /> Forecourt Discrepancy & Profit Leakage Radar
          </h3>
          <span className="badge badge-alert">ACTIVE SENTINEL</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          
          {/* Sentinel Item 1: Attendant Cash Shortage */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>Attendant Cash Shortages Flagged</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#f87171', fontSize: '0.95rem' }}>
                ₹{totalPendingShortages.toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Ramesh Kumar has <strong>₹800</strong> pending shortage from Morning shift bag deficit.
            </div>
            <button
              onClick={() => {
                setSelectedStaffForRecovery(staff.find(s => (s.totalShortagePending || 0) > 0) || staff[0]);
                setRecoveryModalOpen(true);
              }}
              style={{
                marginTop: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Recover from Salary Deduction →
            </button>
          </div>

          {/* Sentinel Item 2: Tank Evaporation & Handling Variance */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>Wet-Stock Evaporation Allowance</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#34d399', fontSize: '0.9rem' }}>
                0.17% (Limit &lt; 0.59%)
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              All 5 tanks operating within government permissible handling loss limit of 0.59%. Zero leakage detected.
            </div>
          </div>

          {/* Sentinel Item 3: Fleet Credit Limit Breach */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>Fleet Credit Limit Warning</span>
              <span className="badge badge-warning">Apex Infra (90%)</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '6px' }}>
              Apex Infra Roadways has utilized ₹7.20L out of ₹8.00L limit. Indents require owner authorization.
            </div>
          </div>

        </div>
      </div>

      {/* Two Column Layout: Bank Deposits Ledger & Forecourt Expense Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Bank Deposits */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} color="#38bdf8" /> Bank Cash Remittances Log
            </h3>
            <button onClick={() => setDepositModalOpen(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              + Record Deposit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bankDeposits.map((dep) => (
              <div key={dep.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>{dep.bankName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Challan: {dep.challanNo} • By: {dep.depositedBy} • {dep.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8', fontSize: '1rem' }}>
                    ₹{dep.amount.toLocaleString()}
                  </div>
                  <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>{dep.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecourt Expenses */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="#fbbf24" /> Station Petty Cash Expenses
            </h3>
            <button onClick={() => setExpenseModalOpen(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              + Add Expense
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {forecourtExpenses.map((exp) => (
              <div key={exp.id} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem' }}>{exp.category}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Paid to: {exp.paidTo} • Approved by: {exp.approvedBy} • {exp.date}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f43f5e', fontSize: '1rem' }}>
                    -₹{exp.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Record Bank Deposit Modal */}
      {depositModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
          <div className="glass-card" style={{ width: '420px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
              Record Bank Cash Deposit
            </h3>
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bank Name</label>
                <select 
                  value={depositForm.bankName} 
                  onChange={(e) => setDepositForm({ ...depositForm, bankName: e.target.value })}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="State Bank of India (SBI)">State Bank of India (SBI) - A/c 30819284901</option>
                  <option value="HDFC Bank Cash Credit">HDFC Bank Cash Credit - A/c 502000849281</option>
                  <option value="ICICI Bank Forecourt">ICICI Bank - A/c 00192847291</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deposit Amount (₹)</label>
                <input 
                  type="number" 
                  value={depositForm.amount} 
                  onChange={(e) => setDepositForm({ ...depositForm, amount: parseFloat(e.target.value) || 0 })} 
                  style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bank Deposit Slip / Challan No</label>
                <input 
                  type="text" 
                  value={depositForm.challanNo} 
                  onChange={(e) => setDepositForm({ ...depositForm, challanNo: e.target.value })} 
                  style={{ width: '100%', marginTop: '4px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Confirm Bank Remittance
                </button>
                <button type="button" onClick={() => setDepositModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {expenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
              Add Forecourt Petty Cash Expense
            </h3>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</label>
                <select 
                  value={expenseForm.category} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="Generator Diesel">Generator Backup Diesel</option>
                  <option value="Staff Tea & Snacks">Staff Tea & Refreshments</option>
                  <option value="Forecourt Maintenance">Forecourt Maintenance & Cleaning</option>
                  <option value="Printing Rolls & Paper">Thermal Printing Rolls</option>
                  <option value="Electricity / Water">Utility Bill Payment</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount (₹)</label>
                <input 
                  type="number" 
                  value={expenseForm.amount} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })} 
                  style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paid To</label>
                <input 
                  type="text" 
                  value={expenseForm.paidTo} 
                  onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })} 
                  style={{ width: '100%', marginTop: '4px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Record Expense
                </button>
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recover Shortage Modal */}
      {recoveryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90 }}>
          <div className="glass-card" style={{ width: '420px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Recover Cash Shortage from Salary
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '14px' }}>
              Attendant: <strong>{selectedStaffForRecovery?.name}</strong> • Current Shortage: <strong style={{ color: '#f87171' }}>₹{selectedStaffForRecovery?.totalShortagePending}</strong>
            </p>

            <form onSubmit={handleRecoverySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deduction / Recovery Amount (₹)</label>
                <input 
                  type="number" 
                  value={recoveryAmount} 
                  onChange={(e) => setRecoveryAmount(parseFloat(e.target.value) || 0)} 
                  style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-action-green" style={{ flex: 1, justifyContent: 'center' }}>
                  Apply Salary Deduction
                </button>
                <button type="button" onClick={() => setRecoveryModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
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
