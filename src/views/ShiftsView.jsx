import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users2, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Coins, 
  ShieldCheck, 
  FileCheck,
  UserPlus,
  Briefcase
} from 'lucide-react';

export default function ShiftsView() {
  const { 
    currentShift, 
    setCurrentShift, 
    staff, 
    nozzles, 
    transactions,
    activeRole
  } = useApp();

  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [outgoingCashier, setOutgoingCashier] = useState(staff[0]?.name || '');
  const [incomingCashier, setIncomingCashier] = useState(staff[1]?.name || '');
  const [physicalCashHanded, setPhysicalCashHanded] = useState(currentShift.cashCollected);
  const [handoverNotes, setHandoverNotes] = useState('All forecourt bay meters verified. Nozzles locked for handover.');
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Compute calculated sales from nozzle totalizers for this shift
  const totalVolumeShift = nozzles.reduce((sum, n) => sum + (n.currentMeter - n.openingMeter - (n.testingVolume || 0)), 0);
  const cashShortageSurplus = physicalCashHanded - currentShift.cashCollected;

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    setHandoverSuccess(true);
    setTimeout(() => {
      setHandoverSuccess(false);
      setHandoverModalOpen(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Shift Overview Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">{currentShift.status}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {currentShift.id}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Shift Operations & Digital Handover Protocol
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Attendant bay allocations, physical cash drop reconciliations against nozzle totalizer meters, and digital dual sign-off.
          </p>
        </div>

        <button 
          onClick={() => {
            setPhysicalCashHanded(currentShift.cashCollected);
            setHandoverModalOpen(true);
          }}
          className="btn-primary"
        >
          <RotateCcw size={18} /> Initiate Shift Handover Sign-off
        </button>
      </div>

      {/* Cash Bag Drop Reconciliation Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>CALCULATED CASH SALES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            ₹{currentShift.cashCollected.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Attendant collection target
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DIGITAL UPI & CARD SALES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            ₹{(currentShift.upiCollected + currentShift.cardCollected).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Bank POS & dynamic QR payments
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>CREDIT SLIPS ISSUED</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
            ₹{currentShift.creditIssued.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fleet Khata indents
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>SHIFT PETTY CASH EXPENSES</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e', marginTop: '4px' }}>
            ₹{currentShift.expenses.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tea / forecourt cleaning / misc
          </div>
        </div>

      </div>

      {/* Attendant Island Rostering & Commission Matrix */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users2 size={20} color="#f59e0b" /> Forecourt Attendant Island Allocations & Commissions
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px 10px' }}>ATTENDANT</th>
                <th style={{ padding: '12px 10px' }}>ROLE</th>
                <th style={{ padding: '12px 10px' }}>ALLOCATED ISLAND / BAY</th>
                <th style={{ padding: '12px 10px' }}>ASSIGNED SHIFT</th>
                <th style={{ padding: '12px 10px' }}>PHONE CONTACT</th>
                <th style={{ padding: '12px 10px' }}>LUBE COMMISSION</th>
                <th style={{ padding: '12px 10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: '#f8fafc' }}>
                    {st.name}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{st.role}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                      {st.island}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>{st.shift}</td>
                  <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{st.phone}</td>
                  <td style={{ padding: '12px 10px', color: '#34d399', fontWeight: 700 }}>
                    {st.commissionRate > 0 ? `${st.commissionRate}% per can` : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge badge-active">ON DUTY</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Handover Protocol Modal */}
      {handoverModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90,
          padding: '16px'
        }}>
          <div className="glass-card" style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '26px', background: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <FileCheck size={24} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Digital Shift Handover Sign-Off</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Dual operator verification & cash bag count</div>
              </div>
            </div>

            {handoverSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Handover Successfully Verified!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Totalizers locked, cash drop recorded, and audit certificate generated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleHandoverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outgoing Shift Operator</label>
                    <select
                      value={outgoingCashier}
                      onChange={(e) => setOutgoingCashier(e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      {staff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Incoming Shift Operator</label>
                    <select
                      value={incomingCashier}
                      onChange={(e) => setIncomingCashier(e.target.value)}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      {staff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                    </select>
                  </div>
                </div>

                {/* Cash Reconciliation Box */}
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(2, 6, 23, 0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Totalizer Calculated Cash:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>₹{currentShift.cashCollected.toLocaleString()}</strong>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Physical Cash Counted in Handover Bag (₹)</label>
                    <input
                      type="number"
                      value={physicalCashHanded}
                      onChange={(e) => setPhysicalCashHanded(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', marginTop: '4px', fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
                    <span>Operator Variance:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: cashShortageSurplus === 0 ? '#34d399' : cashShortageSurplus > 0 ? '#38bdf8' : '#f87171' }}>
                      {cashShortageSurplus === 0 ? '₹0.00 (Balanced)' : cashShortageSurplus > 0 ? `+₹${cashShortageSurplus.toFixed(2)} (Surplus)` : `-₹${Math.abs(cashShortageSurplus).toFixed(2)} (Shortage)`}
                    </strong>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supervisor Inspection Notes</label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn-action-green" style={{ flex: 1, justifyContent: 'center' }}>
                    Sign & Execute Handover
                  </button>
                  <button type="button" onClick={() => setHandoverModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
