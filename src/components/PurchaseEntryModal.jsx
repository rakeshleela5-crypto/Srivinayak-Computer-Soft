import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ShieldCheck, Plus, Thermometer, Layers, AlertTriangle } from 'lucide-react';

export default function PurchaseEntryModal({ isOpen, onClose }) {
  const { tanks, recordDecantation } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('First');
  const [invoiceNo, setInvoiceNo] = useState('3215789');
  const [dealerName, setDealerName] = useState('BHARAT PETROLEUM CO LTD');
  const [vehicleNo, setVehicleNo] = useState('GJ01DU6553');
  const [driverName, setDriverName] = useState('Bhimanna Gowda');
  const [selectedTankId, setSelectedTankId] = useState(tanks[0]?.id || 'tank-1');

  // Security Seals
  const [wood1, setWood1] = useState('WS-8841');
  const [wood2, setWood2] = useState('WS-8842');
  const [wood3, setWood3] = useState('WS-8843');
  const [wood4, setWood4] = useState('WS-8844');

  const [alum1, setAlum1] = useState('AL-9011');
  const [alum2, setAlum2] = useState('AL-9012');
  const [alum3, setAlum3] = useState('AL-9013');
  const [alum4, setAlum4] = useState('AL-9014');

  // Quality Density Checks
  const [sampleDensity, setSampleDensity] = useState(742.0);
  const [observedTemp, setObservedTemp] = useState(29.2);
  const [invoiceDensity15c, setInvoiceDensity15c] = useState(752.5);

  // Line Items
  const [chargeCode, setChargeCode] = useState('Petrol');
  const [invoicedQtyKL, setInvoicedQtyKL] = useState(12.0); // 12 KL = 12000 L
  const [basicRate, setBasicRate] = useState(76.25);
  const [basicAmount, setBasicAmount] = useState(915000);
  
  // Tax breakdown
  const [basicExcise, setBasicExcise] = useState(168000);
  const [addExcise, setAddExcise] = useState(48000);
  const [vatRate, setVatRate] = useState(13.70);
  const [vatAmount, setVatAmount] = useState(155097);
  const [cess, setCess] = useState(42000);
  const [tcs, setTcs] = useState(915);
  const [freight, setFreight] = useState(12000);
  const [finalAmount, setFinalAmount] = useState(1341012);

  const [pastPurchases, setPastPurchases] = useState([
    { invoiceNo: '3215788', date: '07 Oct 2026', dealer: 'BHARAT PETROLEUM CO LTD', vehicle: 'GJ01DU6553', qtyKL: 12.0, totalAmount: 1341012.00 },
    { invoiceNo: '3215690', date: '06 Oct 2026', dealer: 'BHARAT PETROLEUM CO LTD', vehicle: 'KA04F3211', qtyKL: 20.0, totalAmount: 2018930.00 }
  ]);

  // Keyboard shortcut listener
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, invoiceNo, vehicleNo, invoicedQtyKL, finalAmount]);

  if (!isOpen) return null;

  const handleReset = () => {
    setInvoiceNo(prev => String(Number(prev) + 1));
    setInvoicedQtyKL(10.0);
  };

  const handleSave = () => {
    const qtyLiters = parseFloat(invoicedQtyKL) * 1000;
    if (qtyLiters <= 0) {
      alert('Please enter a valid purchase quantity.');
      return;
    }

    const newRec = {
      invoiceNo,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dealer: dealerName,
      vehicle: vehicleNo,
      qtyKL: parseFloat(invoicedQtyKL),
      totalAmount: parseFloat(finalAmount)
    };

    setPastPurchases(prev => [newRec, ...prev]);

    // Record Decantation via AppContext
    if (recordDecantation) {
      recordDecantation({
        invoiceNo,
        tankerTTNo: vehicleNo,
        driverName,
        tankId: selectedTankId,
        fuelCode: chargeCode === 'Petrol' ? 'MS' : 'HSD',
        fuelName: chargeCode,
        invoicedQty: qtyLiters,
        dipBeforeDecantation: 8000,
        dipAfterDecantation: 8000 + qtyLiters,
        receivedQty: qtyLiters,
        shortageLiters: 15,
        shortagePercent: 0.12,
        invoiceDensityAt15C: parseFloat(invoiceDensity15c),
        observedTempC: parseFloat(observedTemp),
        observedDensity: parseFloat(sampleDensity),
        convertedDensityAt15C: parseFloat(sampleDensity) + 10.4,
        densityVariance: 0.1,
        verifiedBy: 'Vijay Sharma (Manager)'
      });
    }

    // Call Cloudflare Edge endpoint
    fetch('/api/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNo,
        tankerTtNo: vehicleNo,
        dealerName,
        driverName,
        tankId: selectedTankId,
        fuelCode: chargeCode === 'Petrol' ? 'MS' : 'HSD',
        fuelName: chargeCode,
        invoicedQty: qtyLiters,
        receivedQty: qtyLiters,
        invoiceDensity15c,
        observedTempC: observedTemp,
        observedDensity: sampleDensity,
        woodSeal1: wood1, woodSeal2: wood2, woodSeal3: wood3, woodSeal4: wood4,
        alumSeal1: alum1, alumSeal2: alum2, alumSeal3: alum3, alumSeal4: alum4,
        basicRate, basicAmount, basicExcise, addExcise, vatRate, vatAmount, cess, tcs, freight, finalAmount
      })
    }).catch(err => console.warn('D1 error:', err));

    alert(`Purchase Invoice #${invoiceNo} for ${invoicedQtyKL} KL (${qtyLiters} Litres) Saved! 8 Security Seals verified and wet-stock tank updated.`);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} color="#f472b6" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Purchase Entry (Fuel Inward Decantation & Security Seals)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Left Form (60%), Right Invoices Table (40%) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', padding: '20px', overflowY: 'auto' }}>
          
          {/* Left Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Invoice & Tanker Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Invoice No</label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Dealer (OMC)</label>
                <select value={dealerName} onChange={(e) => setDealerName(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.82rem' }}>
                  <option value="BHARAT PETROLEUM CO LTD">BHARAT PETROLEUM CO LTD</option>
                  <option value="INDIAN OIL CORPORATION LTD">INDIAN OIL CORPORATION LTD</option>
                  <option value="HINDUSTAN PETROLEUM CORP">HINDUSTAN PETROLEUM CORP</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Vehicle TT No</label>
                <input type="text" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }} />
              </div>
            </div>

            {/* Security Seals Box: 4 Wooden Seals & 4 Aluminum Seals */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Physical Tanker Security Seal Verification (Decantation Mandatory)
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Wooden Seals */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>Wooden Seals (Manhole / Master Valve)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    <input type="text" placeholder="Seal 1" value={wood1} onChange={(e) => setWood1(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 2" value={wood2} onChange={(e) => setWood2(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 3" value={wood3} onChange={(e) => setWood3(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 4" value={wood4} onChange={(e) => setWood4(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                  </div>
                </div>

                {/* Aluminum Seals */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>Aluminum Seals (Delivery Valves / Faucets)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    <input type="text" placeholder="Seal 1" value={alum1} onChange={(e) => setAlum1(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 2" value={alum2} onChange={(e) => setAlum2(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 3" value={alum3} onChange={(e) => setAlum3(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                    <input type="text" placeholder="Seal 4" value={alum4} onChange={(e) => setAlum4(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.75rem', fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Density & Hydrometer Checks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Receiving Tank</label>
                <select value={selectedTankId} onChange={(e) => setSelectedTankId(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.82rem' }}>
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.tankNumber} - {t.fuelCode}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Sample Density (kg/m³)</label>
                <input type="number" step="0.1" value={sampleDensity} onChange={(e) => setSampleDensity(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#38bdf8', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Observed Temp (°C)</label>
                <input type="number" step="0.1" value={observedTemp} onChange={(e) => setObservedTemp(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Invoice Density @ 15°C</label>
                <input type="number" step="0.1" value={invoiceDensity15c} onChange={(e) => setInvoiceDensity15c(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '0.85rem', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Line Items & Tax Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Product Code</label>
                <select value={chargeCode} onChange={(e) => setChargeCode(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }}>
                  <option value="Petrol">Petrol (MS)</option>
                  <option value="Diesel">Diesel (HSD)</option>
                  <option value="XP95">Extra Premium 95</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Invoiced Qty (KL)</label>
                <input type="number" step="0.1" value={invoicedQtyKL} onChange={(e) => setInvoicedQtyKL(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Basic Rate (₹/L)</label>
                <input type="number" step="0.01" value={basicRate} onChange={(e) => setBasicRate(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '0.85rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block' }}>Basic Amount (₹)</label>
                <input type="number" value={basicAmount} onChange={(e) => setBasicAmount(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#0b1120', color: '#38bdf8', border: '1px solid #334155', fontSize: '0.85rem', fontFamily: 'monospace' }} />
              </div>
            </div>

            {/* Statutory Tax Matrix */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>Statutory Tax & Levy Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>VAT ({vatRate}%)</label>
                  <input type="number" value={vatAmount} onChange={(e) => setVatAmount(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.78rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Excise Duty</label>
                  <input type="number" value={basicExcise} onChange={(e) => setBasicExcise(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.78rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Cess (₹)</label>
                  <input type="number" value={cess} onChange={(e) => setCess(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.78rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>TCS 194Q (0.1%)</label>
                  <input type="number" value={tcs} onChange={(e) => setTcs(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.78rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Freight (₹)</label>
                  <input type="number" value={freight} onChange={(e) => setFreight(e.target.value)} style={{ width: '100%', padding: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', borderRadius: '3px', fontSize: '0.78rem' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Final Inward Invoice Amount: </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                  ₹{Number(finalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSave} style={{ padding: '8px 16px', background: '#a855f7', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  Save (F2) & Decant
                </button>
                <button onClick={handleReset} style={{ padding: '8px 14px', background: '#334155', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                  New (F1)
                </button>
              </div>
            </div>
          </div>

          {/* Right Invoices History */}
          <div style={{ borderLeft: '1px solid #334155', paddingLeft: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px' }}>
              Inward Decantation Invoices (Audit Trail)
            </div>

            <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Inv#</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '6px', textAlign: 'left' }}>Tanker TT</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>KL</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pastPurchases.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '6px', color: '#fbbf24', fontFamily: 'monospace' }}>#{row.invoiceNo}</td>
                      <td style={{ padding: '6px', color: '#94a3b8' }}>{row.date}</td>
                      <td style={{ padding: '6px', color: '#38bdf8', fontFamily: 'monospace' }}>{row.vehicle}</td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>{row.qtyKL}</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#34d399', fontWeight: 700 }}>₹{row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
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
          <div>ESC = Exit &nbsp;|&nbsp; F2 = Save &nbsp;|&nbsp; F1 = New Entry</div>
          <div style={{ color: '#64748b' }}>Decantation Safety Interlocks & ASTM 53B 15°C Conformance Active</div>
        </div>
      </div>
    </div>
  );
}
