import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Coins, 
  Layers, 
  FileText,
  Calendar,
  Share2
} from 'lucide-react';

export default function SettlementView() {
  const { 
    stationInfo, 
    tanks, 
    nozzles, 
    currentShift, 
    transactions, 
    decantations, 
    calibrationTests 
  } = useApp();

  const [selectedDate, setSelectedDate] = useState('2026-10-08');

  // Compute Fuel-Wise DSS Metrics
  const fuelDssRows = tanks.map((tank) => {
    // Find all nozzles attached to this tank
    const attachedNozzles = nozzles.filter(n => n.tankId === tank.id);
    
    // Meter Sales
    const meterDispensed = attachedNozzles.reduce((sum, n) => sum + (n.currentMeter - n.openingMeter), 0);
    const testingDeduction = attachedNozzles.reduce((sum, n) => sum + (n.testingVolume || 0), 0);
    const netMeterSales = meterDispensed - testingDeduction;

    // Inward Receipts
    const inwardReceipts = decantations
      .filter(d => d.tankId === tank.id)
      .reduce((sum, d) => sum + d.receivedQty, 0);

    // Opening Stock (approx currentStock + netMeterSales - inwardReceipts)
    const openingStock = tank.currentStock + netMeterSales - inwardReceipts;
    const closingBookStock = openingStock + inwardReceipts - testingDeduction - netMeterSales;
    const actualDipStock = tank.currentStock;
    const stockVariance = actualDipStock - closingBookStock;
    const throughput = openingStock + inwardReceipts;
    const lossGainPercent = throughput > 0 ? (stockVariance / throughput) * 100 : 0;
    const isLossWithinLimit = Math.abs(lossGainPercent) <= stationInfo.maxPermissibleLossPercent;

    return {
      tankNumber: tank.tankNumber,
      fuelCode: tank.fuelCode,
      fuelName: tank.fuelName,
      openingStock,
      inwardReceipts,
      testingDeduction,
      netMeterSales,
      closingBookStock,
      actualDipStock,
      stockVariance,
      lossGainPercent,
      isLossWithinLimit
    };
  });

  // Financial Reconciliation
  const totalCash = currentShift.cashCollected;
  const totalCards = currentShift.cardCollected;
  const totalUpi = currentShift.upiCollected;
  const totalCredit = currentShift.creditIssued;
  const totalCollections = totalCash + totalCards + totalUpi + totalCredit;

  // Export CSV for Tally ERP
  const handleExportCsv = () => {
    let csv = "DAILY SETTLEMENT SHEET (DSS) - " + stationInfo.name + "\n";
    csv += "Date: " + selectedDate + ", Shift: " + currentShift.shiftNumber + "\n\n";
    csv += "Tank,Product,Opening Stock,Receipts,Testing Vol,Meter Sales,Book Stock,Dip Stock,Variance (L),Loss %\n";
    
    fuelDssRows.forEach(r => {
      csv += `${r.tankNumber},${r.fuelCode},${r.openingStock.toFixed(2)},${r.inwardReceipts.toFixed(2)},${r.testingDeduction.toFixed(2)},${r.netMeterSales.toFixed(2)},${r.closingBookStock.toFixed(2)},${r.actualDipStock.toFixed(2)},${r.stockVariance.toFixed(2)},${r.lossGainPercent.toFixed(2)}%\n`;
    });

    csv += "\nFINANCIAL RECONCILIATION\n";
    csv += `Cash Collected,${totalCash}\n`;
    csv += `Card POS,${totalCards}\n`;
    csv += `UPI QR,${totalUpi}\n`;
    csv += `Fleet Khata Credit,${totalCredit}\n`;
    csv += `Total Shift Revenue,${totalCollections}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DSS_Settlement_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">REGULATORY DSS AUDIT</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {selectedDate} • {currentShift.shiftNumber}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Daily Settlement Sheet (DSS) & Wet-Stock Audit Balance
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Master reconciliation balancing Opening Stock, Tanker Inwards, 5L Testing Deductions, Meter Dispenses, and Cashier Drops.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.print()}
            className="btn-primary"
          >
            <Printer size={18} /> Print Official DSS Sheet
          </button>
          <button 
            onClick={handleExportCsv}
            className="btn-secondary"
          >
            <Download size={18} /> Export Tally / ERP CSV
          </button>
        </div>
      </div>

      {/* Printable Area - The Official Petroleum DSS Table */}
      <div className="glass-card printable-area" style={{ padding: '24px' }}>
        
        {/* Header Branding for Print */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '14px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>{stationInfo.name}</h2>
          <div style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{stationInfo.subtitle}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            RO Code: {stationInfo.roCode} • GSTIN: {stationInfo.gstin} • VAT TIN: {stationInfo.vatTin}
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
            DAILY SETTLEMENT SHEET (DSS) — SHIFT RECONCILIATION REPORT
          </div>
        </div>

        {/* Section 1: Fuel Wet-Stock Balance Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Section A: Product-wise Wet-Stock & Evaporation Variance Balance
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.15)', background: 'rgba(2, 6, 23, 0.4)' }}>
                  <th style={{ padding: '10px 8px' }}>TANK / PROD</th>
                  <th style={{ padding: '10px 8px' }}>OPENING STOCK</th>
                  <th style={{ padding: '10px 8px' }}>INWARD RECEIPTS</th>
                  <th style={{ padding: '10px 8px' }}>TESTING DEDUCT</th>
                  <th style={{ padding: '10px 8px' }}>METER SALES</th>
                  <th style={{ padding: '10px 8px' }}>BOOK CLOSING</th>
                  <th style={{ padding: '10px 8px' }}>ACTUAL DIP</th>
                  <th style={{ padding: '10px 8px' }}>VARIANCE (L)</th>
                  <th style={{ padding: '10px 8px' }}>LOSS % (MAX 0.59%)</th>
                </tr>
              </thead>
              <tbody>
                {fuelDssRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                      <span style={{ color: '#fbbf24' }}>{row.tankNumber}</span> ({row.fuelCode})
                    </td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{row.openingStock.toLocaleString()} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>+{row.inwardReceipts.toLocaleString()} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>-{row.testingDeduction.toFixed(1)} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{row.netMeterSales.toFixed(2)} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)' }}>{row.closingBookStock.toLocaleString()} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>{row.actualDipStock.toLocaleString()} L</td>
                    <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: row.stockVariance >= 0 ? '#34d399' : '#f87171' }}>
                      {row.stockVariance >= 0 ? `+${row.stockVariance.toFixed(1)}` : row.stockVariance.toFixed(1)} L
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: row.isLossWithinLimit ? '#34d399' : '#f87171',
                        background: row.isLossWithinLimit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {row.lossGainPercent.toFixed(2)}% {row.isLossWithinLimit ? '(OK)' : '(EXCESS)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Financial Reconciliation & Tax Audit Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          
          {/* Shift Cash & Digital Collections */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', marginBottom: '12px', textTransform: 'uppercase' }}>
              Section B: Forecourt Tender Settlements
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>1. Cash in Operator Bags:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{totalCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>2. Bank POS Card Swipes:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{totalCards.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>3. UPI / Dynamic QR Payments:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{totalUpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>4. Fleet Khata Credit Indents:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#34d399' }}>
                <span>TOTAL RECONCILED SALES:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>₹{totalCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* GST & VAT Tax Audit Breakdown */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', marginBottom: '12px', textTransform: 'uppercase' }}>
              Section C: Statutory VAT & GST Tax Audit Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Taxable Fuel Base Turnover:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>₹{(totalCollections * 0.82).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>State VAT / Cess Component:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>₹{(totalCollections * 0.15).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Packaged Lubes GST (18%):</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>₹{(totalCollections * 0.03).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Certified that the above readings are taken from calibrated dispenser totalizers and verified physical dip charts conforming to Weights & Measures standards.
              </div>
            </div>
          </div>

        </div>

        {/* Dual Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', width: '180px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Vijay Sharma</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Station Manager / Supervisor</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.3)', width: '180px', marginBottom: '6px' }}></div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Shiva Kumar</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Authorized Dealer / RO Owner</div>
          </div>
        </div>

      </div>

    </div>
  );
}
