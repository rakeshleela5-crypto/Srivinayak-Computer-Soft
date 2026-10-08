import React, { useState } from 'react';
import { Banknote, Calculator, RotateCcw, Printer, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { audioFX } from '../utils/audioFX';

const NOTE_DENOMINATIONS = [500, 200, 100, 50, 20, 10];

export default function DenominationCounter({ 
  initialDenominations = { 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, coins: 0 },
  expectedAmount = 0,
  onTotalChange = () => {},
  onSave = () => {},
  readOnly = false,
  compact = false
}) {
  const [denoms, setDenoms] = useState(initialDenominations);

  const calculateTotal = (current) => {
    return NOTE_DENOMINATIONS.reduce((sum, d) => sum + ((Number(current[d]) || 0) * d), 0) + (Number(current.coins) || 0);
  };

  const totalCounted = calculateTotal(denoms);
  const variance = totalCounted - expectedAmount;

  const handleCountChange = (denomKey, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = { ...denoms, [denomKey]: num };
    setDenoms(updated);
    audioFX.playDispensePulse();
    const newTotal = calculateTotal(updated);
    onTotalChange(newTotal, updated);
  };

  const handleQuickAdd = (denomKey, delta) => {
    const current = Number(denoms[denomKey]) || 0;
    handleCountChange(denomKey, current + delta);
  };

  const handleClear = () => {
    const reset = { 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, coins: 0 };
    setDenoms(reset);
    onTotalChange(0, reset);
  };

  // Smart Cash Preset: computes note combination to match expected amount
  const handleAutoFillMatch = () => {
    let rem = Math.round(expectedAmount);
    const computed = { 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, coins: 0 };

    NOTE_DENOMINATIONS.forEach(d => {
      if (rem >= d) {
        const count = Math.floor(rem / d);
        // Leave some for smaller notes if 500
        if (d === 500 && count > 10 && rem > 10000) {
          const mainCount = count - 4;
          computed[d] = mainCount;
          rem -= (mainCount * d);
        } else {
          computed[d] = count;
          rem -= (count * d);
        }
      }
    });
    computed.coins = rem;

    setDenoms(computed);
    audioFX.playCashRegister();
    const newTotal = calculateTotal(computed);
    onTotalChange(newTotal, computed);
  };

  const printDenominationSlip = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Handover Denomination Slip</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 15px; font-size: 13px; color: #000; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          td, th { padding: 4px; text-align: right; }
          td:first-child, th:first-child { text-align: left; }
          .bold { font-weight: bold; }
          .border-top { border-top: 1px dashed #000; }
          .signatures { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h3 style="margin: 0;">SHREE VINAYAKA PETROSOFT</h3>
          <p style="margin: 2px 0;">CASH HANDOVER DENOMINATION SLIP</p>
          <small>${new Date().toLocaleString('en-IN')}</small>
        </div>
        <table>
          <thead>
            <tr class="border-top">
              <th>Denom</th>
              <th>Count</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${NOTE_DENOMINATIONS.map(d => `
              <tr>
                <td>₹${d}</td>
                <td>${denoms[d] || 0}</td>
                <td>₹${((denoms[d] || 0) * d).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr>
              <td>Coins</td>
              <td>-</td>
              <td>₹${(denoms.coins || 0).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="border-top bold">
              <td>PHYSICAL TOTAL</td>
              <td>-</td>
              <td>₹${totalCounted.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>METER TARGET</td>
              <td>-</td>
              <td>₹${expectedAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr class="bold">
              <td>VARIANCE</td>
              <td>-</td>
              <td>${variance === 0 ? '₹0.00 (BALANCED)' : variance > 0 ? '+₹' + variance.toLocaleString('en-IN') + ' (SURPLUS)' : '-₹' + Math.abs(variance).toLocaleString('en-IN') + ' (SHORTAGE)'}</td>
            </tr>
          </tbody>
        </table>
        <div class="signatures">
          <div><br><br>____________________<br>Outgoing Attendant</div>
          <div><br><br>____________________<br>Manager / Cashier</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Banknote size={20} color="#fbbf24" />
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            Physical Note Denomination Breakdown
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleAutoFillMatch}
            className="btn-secondary"
            style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
            title="Auto-fill notes to match meter sales"
          >
            <Sparkles size={13} /> Auto-Bundle Match
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary"
            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
            title="Reset counts to 0"
          >
            <RotateCcw size={13} /> Reset
          </button>
          <button
            type="button"
            onClick={printDenominationSlip}
            className="btn-secondary"
            style={{ fontSize: '0.72rem', padding: '4px 8px', color: '#38bdf8' }}
            title="Print Cash Bag Slip"
          >
            <Printer size={13} /> Print Slip
          </button>
        </div>
      </div>

      {/* Note Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {NOTE_DENOMINATIONS.map(denom => {
          const count = Number(denoms[denom]) || 0;
          const subtotal = count * denom;

          return (
            <div 
              key={denom}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr 110px',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: count > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(2, 6, 23, 0.4)',
                border: count > 0 ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(255, 255, 255, 0.04)'
              }}
            >
              {/* Note Badge */}
              <div style={{ 
                fontFamily: 'var(--font-mono)', 
                fontWeight: 900, 
                fontSize: '0.92rem', 
                color: denom >= 200 ? '#fbbf24' : '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>₹</span>{denom}
              </div>

              {/* Stepper & Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(denom, -1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    lineHeight: '1'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={count === 0 ? '' : count}
                  placeholder="0"
                  onChange={(e) => handleCountChange(denom, e.target.value)}
                  style={{
                    width: '65px',
                    textAlign: 'center',
                    padding: '4px',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    background: '#020617',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleQuickAdd(denom, 1)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    lineHeight: '1'
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(denom, 5)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  +5
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: count > 0 ? '#ffffff' : 'var(--text-dim)', fontSize: '0.9rem' }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </div>
            </div>
          );
        })}

        {/* Loose Coins Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr 110px',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(2, 6, 23, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.82rem', color: '#a78bfa' }}>
            COINS
          </div>
          <div>
            <input
              type="number"
              min="0"
              value={denoms.coins === 0 ? '' : denoms.coins}
              placeholder="Total loose coins (₹)"
              onChange={(e) => handleCountChange('coins', e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                background: '#020617',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: '#ffffff'
              }}
            />
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: (denoms.coins || 0) > 0 ? '#ffffff' : 'var(--text-dim)', fontSize: '0.9rem' }}>
            ₹{(denoms.coins || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Summary Matrix Panel */}
      <div style={{ 
        padding: '12px 14px', 
        borderRadius: '10px', 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%)', 
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>Total Counted Physical Cash:</span>
          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', color: '#fbbf24' }}>
            ₹{totalCounted.toLocaleString('en-IN')}
          </strong>
        </div>

        {expectedAmount > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              <span>Meter Totalizer Target:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{expectedAmount.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '4px',
              paddingTop: '6px',
              borderTop: '1px dashed rgba(255,255,255,0.1)',
              fontSize: '0.82rem'
            }}>
              <span style={{ fontWeight: 700 }}>Cash Reconciliation:</span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontWeight: 900,
                color: variance === 0 ? '#34d399' : variance > 0 ? '#38bdf8' : '#f87171'
              }}>
                {variance === 0 
                  ? '₹0.00 (Balanced / Zero Variance) ✓' 
                  : variance > 0 
                  ? `+₹${variance.toLocaleString('en-IN')} (Surplus Cash)` 
                  : `-₹${Math.abs(variance).toLocaleString('en-IN')} (Shortage / Deficit)`
                }
              </span>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
