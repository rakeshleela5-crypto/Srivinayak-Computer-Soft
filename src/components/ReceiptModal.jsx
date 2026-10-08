import React from 'react';
import { useApp } from '../context/AppContext';
import { Printer, X, CheckCircle, Share2, Download } from 'lucide-react';

export default function ReceiptModal() {
  const { activeReceiptModal, setActiveReceiptModal, stationInfo } = useApp();

  if (!activeReceiptModal) return null;

  const txn = activeReceiptModal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div className="glass-card" style={{
        background: '#0f172a',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>Fuel Dispense Receipt</h3>
          </div>
          <button 
            onClick={() => setActiveReceiptModal(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Authentic ESC/POS 58mm/80mm Thermal Receipt Layout */}
        <div className="thermal-receipt printable-area">
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #475569', paddingBottom: '8px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '0.04em' }}>{stationInfo.name}</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{stationInfo.subtitle}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>RO CODE: {stationInfo.roCode}</div>
            <div style={{ fontSize: '10px' }}>GSTIN: {stationInfo.gstin}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{stationInfo.address}</div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>TEL: {stationInfo.phone}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span>REC NO: <strong>{txn.receiptNo}</strong></span>
            <span>DATE: {txn.timestamp.split(' ')[0]}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '6px' }}>
            <span>TIME: {txn.timestamp.split(' ')[1]}</span>
            <span>SHIFT: {txn.shiftId}</span>
          </div>

          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            <div>VEHICLE NO: <strong style={{ letterSpacing: '0.05em' }}>{txn.customerVehicle}</strong></div>
            {txn.customerName && <div>CUSTOMER: {txn.customerName}</div>}
            {txn.driverName && <div>DRIVER: {txn.driverName}</div>}
            {txn.slipNo && <div>KHATA SLIP: {txn.slipNo}</div>}
            <div>BAY/NOZZLE: <strong>{txn.nozzleNumber}</strong> ({txn.fuelName})</div>
            <div>OPERATOR: {txn.attendant}</div>
          </div>

          <div style={{ borderTop: '1px solid #111827', borderBottom: '1px solid #111827', padding: '6px 0', margin: '8px 0', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>PRODUCT</span>
              <span>RATE (₹)</span>
              <span>QTY</span>
              <span>TOTAL (₹)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span>{txn.fuelCode}</span>
              <span>{txn.rate.toFixed(2)}</span>
              <span>{txn.liters.toFixed(2)} L</span>
              <span>{txn.fuelAmount.toFixed(2)}</span>
            </div>

            {txn.lubeItems && txn.lubeItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '10px', color: '#334155' }}>
                <span>{item.name}</span>
                <span>{item.price.toFixed(2)}</span>
                <span>{item.qty} pcs</span>
                <span>{item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '13px', fontWeight: 900, display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
            <span>NET PAYABLE:</span>
            <span>₹{txn.totalAmount.toFixed(2)}</span>
          </div>

          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>PAY MODE:</span>
              <strong>{txn.paymentMode}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
              <span>INCL. VAT / GST:</span>
              <span>₹{(txn.totalAmount * 0.18 / 1.18).toFixed(2)}</span>
            </div>
          </div>

          {/* Barcode representation */}
          <div style={{ textAlign: 'center', marginTop: '12px', borderTop: '1px dashed #475569', paddingTop: '8px' }}>
            <div style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
              ||| | |||| | || |||| |
            </div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
              {txn.id} • THANK YOU! SAVE FUEL & DRIVE SAFE!
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={handlePrint}
            className="btn-primary" 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Printer size={18} /> Print Thermal Slip
          </button>
          <button 
            onClick={() => setActiveReceiptModal(null)}
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
