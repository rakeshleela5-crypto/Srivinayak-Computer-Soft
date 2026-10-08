import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Printer, Send, MessageSquare, Trash2, Plus, Fuel } from 'lucide-react';
import { openWhatsAppWebDispatch, formatWhatsAppDeliveryNote } from '../utils/whatsappDispatcher';

export default function CreditCustomerSaleModal({ isOpen, onClose }) {
  const { fleetAccounts, nozzles, fuelPrices, recordTransaction, currentShift, stationInfo } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('First');
  const [fillingDate, setFillingDate] = useState(new Date().toISOString().split('T')[0]);
  const [billNo, setBillNo] = useState(38);
  const [slipNo, setSlipNo] = useState('0');
  const [code, setCode] = useState('844911');
  const [outSideSale, setOutSideSale] = useState(false);

  // Selected values
  const [selectedNozzle, setSelectedNozzle] = useState(nozzles[0]?.id || 'noz-1');
  const [selectedCustomer, setSelectedCustomer] = useState(fleetAccounts[0]?.id || 'fl-01');
  const [selectedVehicle, setSelectedVehicle] = useState('KA-01-AK-4455');
  const [selectedItem, setSelectedItem] = useState('Diesel');

  const [rate, setRate] = useState(89.75);
  const [qty, setQty] = useState(160.0);
  const [discountPerLtr, setDiscountPerLtr] = useState(0.0);
  const [discountAmt, setDiscountAmt] = useState(0.0);
  const [amount, setAmount] = useState(14360.0);
  const [cashCreditSplit, setCashCreditSplit] = useState(0.0);
  const [remark, setRemark] = useState('');

  // Items list on this credit slip
  const [lineItems, setLineItems] = useState([]);
  const [pastSlips, setPastSlips] = useState([
    { date: '08 Oct 2026', shiftName: 'First', slipNo: '0', billNo: '37', customerName: 'LIVAVATI TRANSPORTY', vehicleNo: 'GJ15AS7487', qty: 160.0, totalAmount: 14433.60 },
    { date: '08 Oct 2026', shiftName: 'First', slipNo: '0', billNo: '36', customerName: 'PORT TRANSPORT', vehicleNo: 'GJ19AS1454', qty: 160.0, totalAmount: 15072.00 },
    { date: '07 Oct 2026', shiftName: 'First', slipNo: '0', billNo: '35', customerName: 'HINESHBHAI', vehicleNo: 'MH14AS2545', qty: 177.29, totalAmount: 16000.00 }
  ]);

  const [whatsappSent, setWhatsappSent] = useState(false);

  // Find active customer and vehicles
  const currentAcc = fleetAccounts.find(f => f.id === selectedCustomer) || fleetAccounts[0];
  const currentOutstanding = currentAcc ? (currentAcc.currentBalance || 0) : 0;
  const customerVehicles = currentAcc?.vehicles || [];

  useEffect(() => {
    if (customerVehicles.length > 0) {
      setSelectedVehicle(customerVehicles[0].plate);
    } else {
      setSelectedVehicle('GJ15AS7487');
    }
  }, [selectedCustomer]);

  // Recalculate amount when rate/qty/discount changes
  useEffect(() => {
    const r = parseFloat(rate) || 0;
    const q = parseFloat(qty) || 0;
    const d = parseFloat(discountPerLtr) || 0;
    const totalDis = d * q;
    setDiscountAmt(totalDis);
    const tot = (r * q) - totalDis;
    setAmount(tot > 0 ? tot : 0);
  }, [rate, qty, discountPerLtr]);

  // Hotkey listener: ESC, F2, F1, CTRL+A
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'F2') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'F1') {
        e.preventDefault();
        handleReset();
      }
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleAddItemToList();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lineItems, amount, selectedCustomer, selectedVehicle]);

  if (!isOpen) return null;

  const handleAddItemToList = () => {
    if (amount <= 0 || qty <= 0) return;
    const newItem = {
      itemName: selectedItem,
      qty: parseFloat(qty),
      unitName: 'Ltr',
      rate: parseFloat(rate),
      amount: parseFloat(amount)
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const handleReset = () => {
    setBillNo(prev => prev + 1);
    setLineItems([]);
    setQty(100);
    setRemark('');
  };

  const handleSave = () => {
    const finalTotal = lineItems.length > 0 
      ? lineItems.reduce((acc, it) => acc + it.amount, 0)
      : parseFloat(amount);

    const finalQty = lineItems.length > 0
      ? lineItems.reduce((acc, it) => acc + it.qty, 0)
      : parseFloat(qty);

    if (finalTotal <= 0) {
      alert('Please enter a valid sale quantity and amount.');
      return;
    }

    const newSlip = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      shiftName: shift,
      slipNo,
      billNo: String(billNo),
      customerName: currentAcc?.companyName || 'Fleet Transporter',
      vehicleNo: selectedVehicle,
      qty: finalQty,
      totalAmount: finalTotal
    };

    setPastSlips(prev => [newSlip, ...prev]);

    // Dispatch transaction to AppContext
    if (recordTransaction) {
      recordTransaction({
        fuelCode: selectedItem === 'Diesel' ? 'HSD' : 'MS',
        fuelName: selectedItem,
        liters: finalQty,
        rate: parseFloat(rate),
        fuelAmount: finalTotal,
        paymentMode: 'FLEET',
        customerVehicle: selectedVehicle,
        customerName: currentAcc?.companyName,
        creditAccountId: currentAcc?.id,
        slipNo
      });
    }

    // Auto trigger WhatsApp
    if (currentAcc?.phone) {
      openWhatsAppWebDispatch({
        stationName: stationInfo?.name || "Shree Vinayaka PetroSoft AI Shiva",
        deliveryDate: date,
        slipNo: String(billNo),
        vehicleNo: selectedVehicle,
        product: selectedItem,
        qty: finalQty,
        rate: parseFloat(rate),
        amount: finalTotal,
        availableBalance: currentOutstanding + finalTotal
      }, currentAcc.phone);
      setWhatsappSent(true);
      setTimeout(() => setWhatsappSent(false), 3000);
    }

    alert(`Credit Sale Bill #${billNo} Saved Successfully! WhatsApp delivery note dispatched to ${currentAcc?.phone || 'Fleet'}.`);
    handleReset();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        width: '1100px',
        maxWidth: '96vw',
        maxHeight: '94vh',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Ribbon */}
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(90deg, #1e293b, #0f172a)',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Credit Customer Sale
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>Date: <strong>{date}</strong></span>
              <span>•</span>
              <span>Shift: <strong style={{ color: '#38bdf8' }}>{shift}</strong></span>
              <span>•</span>
              <span>Bill No: <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>#{billNo}</strong></span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body Grid: Left Entry Form (55%), Right Filterable Slip Grid (45%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', padding: '20px', overflowY: 'auto' }}>
          
          {/* Left Entry Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Slip No</label>
                <input
                  type="text"
                  value={slipNo}
                  onChange={(e) => setSlipNo(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Bill No</label>
                <input
                  type="text"
                  value={billNo}
                  readOnly
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#0b1120', color: '#fbbf24', border: '1px solid #334155', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Nozzle</label>
                <select
                  value={selectedNozzle}
                  onChange={(e) => setSelectedNozzle(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  {nozzles.map(n => (
                    <option key={n.id} value={n.id}>{n.nozzleNumber} ({n.fuelCode})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#38bdf8', cursor: 'pointer' }}>
                  <input type="checkbox" checked={outSideSale} onChange={(e) => setOutSideSale(e.target.checked)} />
                  Out Side Sale ?
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  {fleetAccounts.map(f => (
                    <option key={f.id} value={f.id}>{f.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Vehicle</label>
                <input
                  type="text"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Item Name</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
                >
                  <option value="Diesel">Diesel (HSD)</option>
                  <option value="Petrol">Petrol (MS)</option>
                  <option value="XP95">Extra Premium 95</option>
                  <option value="Engine Oil">SERVO 15W-40 (Lube)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Rate (₹/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Qty (Litres)</label>
                <input
                  type="number"
                  step="0.01"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Dis. (₹/L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={discountPerLtr}
                  onChange={(e) => setDiscountPerLtr(e.target.value)}
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Dis. Amt (₹)</label>
                <input
                  type="number"
                  value={discountAmt.toFixed(2)}
                  readOnly
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#0b1120', color: '#34d399', border: '1px solid #334155', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>OutStanding (₹)</label>
                <input
                  type="text"
                  value={currentOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  readOnly
                  style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#0b1120', color: '#f87171', border: '1px solid #334155', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 800 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Cash Credit (Split)</label>
                <input
                  type="number"
                  value={cashCreditSplit}
                  onChange={(e) => setCashCreditSplit(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Remark</label>
              <input
                type="text"
                placeholder="Driver slip note / indent remarks"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}
              />
            </div>

            {/* Add To List Button */}
            <button
              type="button"
              onClick={handleAddItemToList}
              style={{
                padding: '8px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Add To List (CTRL+A)
            </button>

            {/* Line Items Sub-table */}
            {lineItems.length > 0 && (
              <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#94a3b8' }}>
                      <th style={{ padding: '4px 6px', textAlign: 'left' }}>Item Name</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Rate</th>
                      <th style={{ padding: '4px 6px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '4px 6px', textAlign: 'center' }}>X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '4px 6px', color: '#f8fafc' }}>{it.itemName}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{it.qty}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>₹{it.rate}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{it.amount}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                          <button onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={handleSave}
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Save (F2) & WhatsApp
              </button>
              <button
                onClick={handleReset}
                style={{ padding: '10px 14px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                New Entry (F1)
              </button>
            </div>
          </div>

          {/* Right Past Slips Ledger */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px' }}>
              Credit Bills Registry (Double Click to View / Reprint)
            </div>

            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Bill#</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Vehicle</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pastSlips.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '6px', color: '#fbbf24', fontFamily: 'monospace' }}>#{row.billNo}</td>
                      <td style={{ padding: '6px', color: '#f8fafc', fontWeight: 600 }}>{row.customerName}</td>
                      <td style={{ padding: '6px', color: '#38bdf8', fontFamily: 'monospace' }}>{row.vehicleNo}</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>{row.qty}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>₹{row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div style={{
          padding: '8px 20px',
          background: '#0b1120',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#ef4444',
          fontWeight: 700,
          fontFamily: 'monospace'
        }}>
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New &nbsp;|&nbsp; CTRL+A = Add To List</div>
          <div style={{ color: '#64748b' }}>Automated Fleet PDF Invoice & WhatsApp Dispatch Active</div>
        </div>
      </div>
    </div>
  );
}
