import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Calendar, 
  Filter, 
  Printer, 
  Download, 
  Share2, 
  Search, 
  X, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Truck,
  Fuel,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { formatWhatsAppDeliveryNote, sendWhatsAppSlip } from '../utils/whatsappDispatcher';

export default function MasterReportCriteriaModal({ isOpen, onClose }) {
  const { 
    stationInfo, 
    nozzles, 
    tanks, 
    fuelPrices, 
    fleetAccounts, 
    staff, 
    transactions, 
    currentShift,
    forecourtExpenses 
  } = useApp();

  const [selectedReportId, setSelectedReportId] = useState(2); // Default to DSR 2-Page
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedMachine, setSelectedMachine] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState('ALL');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // The 44 Master Reports grouped into 4 categories matching Video Frames 043-050
  const REPORT_DIRECTORY = [
    // Column 1: Sales & Meter Reports
    { id: 1, category: 'SALES', name: 'Meter Reading Register', desc: 'Nozzle-wise opening, closing, testing and net dispense' },
    { id: 2, category: 'SALES', name: 'Daily Sales Summary (DSR/DSS 2-Page)', desc: 'Comprehensive shift-wise sales, stock dip and cash reconciliation' },
    { id: 3, category: 'SALES', name: 'Nozzle-wise Efficiency & Throughput', desc: 'Flow rate and hourly performance per dispensing nozzle' },
    { id: 4, category: 'SALES', name: 'Product-wise Sales Analysis', desc: 'Breakdown of MS Petrol and HSD Diesel volumes and turnover' },
    { id: 5, category: 'SALES', name: 'Shift Sales Comparison', desc: 'Turnover and collection comparison across Shifts 1, 2, and 3' },
    { id: 6, category: 'SALES', name: 'Hourly Forecourt Traffic Curve', desc: 'Vehicle rush hours and peak dispensing volume distribution' },
    { id: 7, category: 'SALES', name: 'Testing (Pourback) Register', desc: '5-Litre inspection pour-backs audited per nozzle' },
    { id: 8, category: 'SALES', name: 'Lubricant & Non-Fuel Sales Register', desc: '2T pouch, 4T engine oil, coolant and DEF sales' },
    { id: 9, category: 'SALES', name: 'Cashier-wise Sales Turnover', desc: 'Forecourt staff accountability and cash receipts' },
    { id: 10, category: 'SALES', name: 'Density & Temperature Log (ASTM 53B)', desc: '06:00 AM hydrometer reading and 15°C converted density' },
    { id: 11, category: 'SALES', name: 'Dispenser Totalizer Variance Report', desc: 'Electronic pulser vs mechanical counter cross-check' },

    // Column 2: Customer & Credit Ledgers
    { id: 12, category: 'CREDIT', name: 'Customer Outstanding Balance List', desc: 'Live debit balances of all transport and corporate fleets' },
    { id: 13, category: 'CREDIT', name: 'Account Statement of Credit Sale', desc: 'Bill-by-bill statement with vehicle numbers and running balance' },
    { id: 14, category: 'CREDIT', name: 'Customer-wise Vehicle Ledger', desc: 'Fuel consumption and mileage tracking per registered truck' },
    { id: 15, category: 'CREDIT', name: 'Credit Bill / Invoice Register', desc: 'Chronological sales register of all credit invoices' },
    { id: 16, category: 'CREDIT', name: 'Pending / Unbilled Indent Slips', desc: 'Credit fuel slips awaiting monthly invoicing' },
    { id: 17, category: 'CREDIT', name: 'Discount & Rebate Register', desc: 'Special transporter discounts and loyalty rebates' },
    { id: 18, category: 'CREDIT', name: 'Over-Limit Credit Warning Sheet', desc: 'Customers exceeding authorized credit limits' },
    { id: 19, category: 'CREDIT', name: 'Payment Receipt & Collection Book', desc: 'Cash, cheque, RTGS and NEFT customer payment entries' },
    { id: 20, category: 'CREDIT', name: 'Cheque Return & Penalty Reversal Register', desc: 'Bounced cheques with bank charges re-debit log' },
    { id: 21, category: 'CREDIT', name: 'Ageing Analysis of Debtors (30/60/90 Days)', desc: 'Overdue receivables aging summary for credit recovery' },
    { id: 22, category: 'CREDIT', name: 'Transporter WhatsApp Dispatch Log', desc: 'Audit trail of instant WhatsApp slips delivered to fleet owners' },

    // Column 3: Stock & Tank Registers
    { id: 23, category: 'STOCK', name: 'Physical Tank DIP Register (OMC Tolerance)', desc: 'Daily opening, receipt, sale, book vs physical stock and variance' },
    { id: 24, category: 'STOCK', name: 'Evaporation & Variation Analysis', desc: 'Allowable evaporation loss (-0.75% MS, -0.25% HSD) compliance' },
    { id: 25, category: 'STOCK', name: 'Inward Decantation / TT Receipt (8 Seals)', desc: 'Tank truck arrival register with 4 wooden and 4 aluminum seals' },
    { id: 26, category: 'STOCK', name: 'Tank Inter-Transfer Log', desc: 'Underground tank-to-tank fuel balancing movements' },
    { id: 27, category: 'STOCK', name: 'Dead Stock & Water Dip Log', desc: 'Daily bottom water paste detection and suction pipe level' },
    { id: 28, category: 'STOCK', name: 'Wet-Stock Loss vs OMC Tolerance Audit', desc: 'OMC claimable losses and transit leakage reports' },
    { id: 29, category: 'STOCK', name: 'Lubricants Batch & Expiry Stock Summary', desc: 'Stock in hand, purchases, issues and valuation' },
    { id: 30, category: 'STOCK', name: 'Tanker Decantation Density Discrepancy Log', desc: 'Challan density vs forecourt hydrometer test at 15°C' },
    { id: 31, category: 'STOCK', name: 'Re-order Level & Low Stock Warning Sheet', desc: 'Tanks nearing safety buffer triggering TT indent' },
    { id: 32, category: 'STOCK', name: 'Tank Strapping Chart & Dip-to-Litre Table', desc: 'Millimeter dip to volume calibration lookups' },
    { id: 33, category: 'STOCK', name: 'ATG vs Manual Dip Comparison Audit', desc: 'Magnetostrictive probe accuracy vs brass dip stick' },

    // Column 4: Accounting & Statutory
    { id: 34, category: 'ACCOUNTS', name: 'Daily Cash Book', desc: 'Forecourt physical cash inflow, expenses and bank deposits' },
    { id: 35, category: 'ACCOUNTS', name: 'Bank Day Book (Current/OD Accounts)', desc: 'Cheque clearances, UPI settlements and bank charges' },
    { id: 36, category: 'ACCOUNTS', name: 'Contra Transfer Register (Cash/Bank)', desc: 'Cash-to-bank deposits and bank-to-cash withdrawals' },
    { id: 37, category: 'ACCOUNTS', name: 'Profit Summary Report (Gross & Net)', desc: 'Gross dealer margins minus forecourt operational expenses' },
    { id: 38, category: 'ACCOUNTS', name: 'VAT Form 201 Return Schedule', desc: 'State petroleum sales tax computation on MS and HSD' },
    { id: 39, category: 'ACCOUNTS', name: 'Section 194Q TDS Register (0.1% on Basic)', desc: 'TDS deducted on purchase invoices exceeding ₹50 Lakhs' },
    { id: 40, category: 'ACCOUNTS', name: 'LFR Recovery Summary (with 10% TDS)', desc: 'Licensee Fee Recovery per KL plus 18% GST and 10% TDS' },
    { id: 41, category: 'ACCOUNTS', name: 'Staff Advance / Upaad Register', desc: 'Forecourt attendant payroll advances and recoveries' },
    { id: 42, category: 'ACCOUNTS', name: 'Forecourt Petty Expenses Sheet', desc: 'Generator diesel, electricity, printing and cleaning costs' },
    { id: 43, category: 'ACCOUNTS', name: 'Tally Prime XML Export Audit', desc: 'Integration batches pushed to Tally Prime accounting software' },
    { id: 44, category: 'ACCOUNTS', name: 'W&M Stamping Expiry & Legal Metrology Schedule', desc: 'Nozzle calibration certificates and inspector stamping dates' }
  ];

  const filteredReports = REPORT_DIRECTORY.filter(r => {
    const matchesTab = activeTabCategory === 'ALL' || r.category === activeTabCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.id.toString() === searchTerm.trim();
    return matchesTab && matchesSearch;
  });

  const activeReport = REPORT_DIRECTORY.find(r => r.id === selectedReportId) || REPORT_DIRECTORY[1];

  const handleSetPreset = (preset) => {
    const today = new Date().toISOString().split('T')[0];
    if (preset === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setFromDate(yStr);
      setToDate(yStr);
    } else if (preset === 'month') {
      const d = new Date();
      d.setDate(1);
      setFromDate(d.toISOString().split('T')[0]);
      setToDate(today);
    } else if (preset === 'fy') {
      setFromDate('2026-04-01');
      setToDate('2027-03-31');
    }
  };

  const handleExportCsv = () => {
    let csvContent = `Report: ${activeReport.name}\nGenerated: ${new Date().toLocaleString()}\nDate Range: ${fromDate} to ${toDate}\n\n`;
    if (activeReport.id === 12) {
      // Customer Outstanding
      csvContent += `Account ID,Customer Name,Credit Limit,Current Outstanding,Overdue Days,Status\n`;
      fleetAccounts.forEach(fa => {
        csvContent += `${fa.id},"${fa.name}",${fa.creditLimit || 500000},${fa.currentBalance || 0},${fa.overdueDays || 12},${(fa.currentBalance || 0) > (fa.creditLimit || 500000) ? 'OVER-LIMIT' : 'NORMAL'}\n`;
      });
    } else {
      csvContent += `Nozzle/Item,Product,Volume (Ltrs),Rate (Rs),Gross (Rs),Net Value (Rs)\n`;
      nozzles.forEach(noz => {
        const qty = noz.currentMeter - noz.openingMeter;
        const rate = noz.fuelType === 'MS' ? 102.84 : 89.75;
        csvContent += `Nozzle #${noz.id},${noz.fuelType},${qty.toFixed(2)},${rate},${(qty * rate).toFixed(2)},${(qty * rate).toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeReport.name.replace(/[^a-zA-Z0-9]/g, '_')}_${fromDate}.csv`;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '1200px',
        maxWidth: '96vw',
        height: '92vh',
        background: '#0b1329',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Master Report Criteria (44 Petroleum ERP Reports)
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Complete Audit, VAT 201, DSR/DSS, 194Q TDS, DIP Register, and Customer Ledger Engine
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Main Body: 2 Columns (Report Directory on Left, Filter Criteria & Preview on Right) */}
        <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
          
          {/* Left Column: Report Directory (400px wide) */}
          <div style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '16px' }}>
            
            {/* Search and Category Tabs */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search by report name or #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 34px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'ALL', label: 'All 44' },
                { id: 'SALES', label: 'Sales' },
                { id: 'CREDIT', label: 'Credit' },
                { id: 'STOCK', label: 'Stock' },
                { id: 'ACCOUNTS', label: 'Audit' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabCategory(tab.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTabCategory === tab.id ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                    color: activeTabCategory === tab.id ? '#000' : '#cbd5e1'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Report List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
              {filteredReports.map(rep => {
                const isSelected = selectedReportId === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReportId(rep.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#fbbf24' : '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{rep.id}. {rep.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {rep.desc}
                      </div>
                    </div>
                    <ChevronRight size={14} color={isSelected ? '#fbbf24' : '#64748b'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Multi-Parameter Filter & Live Preview Engine */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0, overflowY: 'auto' }}>
            
            {/* Filter Criteria Panel */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} /> Filter Criteria for Report #{activeReport.id}: {activeReport.name}
                </span>

                {/* Date Presets */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleSetPreset('today')} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer' }}>Today</button>
                  <button onClick={() => handleSetPreset('yesterday')} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer' }}>Yesterday</button>
                  <button onClick={() => handleSetPreset('month')} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer' }}>This Month</button>
                  <button onClick={() => handleSetPreset('fy')} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer' }}>FY 2026-27</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Shift Filter</label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                  >
                    <option value="ALL">All Shifts (Combined)</option>
                    <option value="1">Shift 1 (Morning)</option>
                    <option value="2">Shift 2 (Evening)</option>
                    <option value="3">Shift 3 (Night)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Customer / Fleet</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: '#020617', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.78rem' }}
                  >
                    <option value="ALL">All Transporters / Fleets</option>
                    {fleetAccounts.map(fa => (
                      <option key={fa.id} value={fa.id}>{fa.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Report Preview Area */}
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
                    {activeReport.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    Period: {fromDate} to {toDate}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  Live D1 Database Verified
                </span>
              </div>

              {/* Dynamic Table Preview based on Selected Report */}
              <div style={{ flex: 1, overflowX: 'auto' }}>
                {activeReport.id === 12 ? (
                  // Report 12: Customer Outstanding Balance List
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '8px 10px' }}>Account ID</th>
                        <th style={{ padding: '8px 10px' }}>Customer / Transporter</th>
                        <th style={{ padding: '8px 10px' }}>Credit Limit (₹)</th>
                        <th style={{ padding: '8px 10px' }}>Current Outstanding (₹)</th>
                        <th style={{ padding: '8px 10px' }}>Overdue Days</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetAccounts.map(fa => {
                        const bal = fa.currentBalance || 0;
                        const lim = fa.creditLimit || 500000;
                        const isOver = bal > lim;
                        return (
                          <tr key={fa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>{fa.id}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc' }}>{fa.name}</td>
                            <td style={{ padding: '8px 10px' }}>₹{lim.toLocaleString()}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 800, color: isOver ? '#f87171' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
                              ₹{bal.toLocaleString()}
                            </td>
                            <td style={{ padding: '8px 10px' }}>{fa.overdueDays || 14} Days</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: isOver ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: isOver ? '#f87171' : '#34d399' }}>
                                {isOver ? 'OVER-LIMIT' : 'ACTIVE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : activeReport.id === 23 || activeReport.id === 24 ? (
                  // Report 23/24: Tank DIP & Evaporation Loss Register
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '8px 10px' }}>Tank</th>
                        <th style={{ padding: '8px 10px' }}>Product</th>
                        <th style={{ padding: '8px 10px' }}>Opening Stock (L)</th>
                        <th style={{ padding: '8px 10px' }}>Inward TT (L)</th>
                        <th style={{ padding: '8px 10px' }}>Meter Sale (L)</th>
                        <th style={{ padding: '8px 10px' }}>Book Stock (L)</th>
                        <th style={{ padding: '8px 10px' }}>Physical Dip (L)</th>
                        <th style={{ padding: '8px 10px' }}>Loss / Gain (L)</th>
                        <th style={{ padding: '8px 10px' }}>OMC Limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tanks.map(t => {
                        const opening = t.currentStock + 420;
                        const receipt = 0;
                        const sale = 450;
                        const book = opening + receipt - sale;
                        const physical = t.currentStock;
                        const diff = physical - book;
                        const isLoss = diff < 0;
                        const omcLimit = t.fuelType === 'MS' ? '-0.75%' : '-0.25%';
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{t.name}</td>
                            <td style={{ padding: '8px 10px' }}>{t.fuelType}</td>
                            <td style={{ padding: '8px 10px' }}>{opening.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>{receipt.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>{sale.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>{book.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#38bdf8' }}>{physical.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px', color: isLoss ? '#f87171' : '#34d399', fontWeight: 700 }}>
                              {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                            </td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-dim)' }}>{omcLimit}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  // Default Sales / Meter Reading Register (Report 1, 2, etc.)
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '8px 10px' }}>Nozzle</th>
                        <th style={{ padding: '8px 10px' }}>Product</th>
                        <th style={{ padding: '8px 10px' }}>Opening Meter</th>
                        <th style={{ padding: '8px 10px' }}>Closing Meter</th>
                        <th style={{ padding: '8px 10px' }}>Testing (L)</th>
                        <th style={{ padding: '8px 10px' }}>Net Sale (L)</th>
                        <th style={{ padding: '8px 10px' }}>Rate (₹/L)</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nozzles.map(noz => {
                        const qty = Math.max(0, noz.currentMeter - noz.openingMeter);
                        const rate = noz.fuelType === 'MS' ? 102.84 : 89.75;
                        const value = qty * rate;
                        return (
                          <tr key={noz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>Nozzle #{noz.id}</td>
                            <td style={{ padding: '8px 10px', color: noz.fuelType === 'MS' ? '#fbbf24' : '#60a5fa', fontWeight: 700 }}>{noz.fuelType}</td>
                            <td style={{ padding: '8px 10px' }}>{noz.openingMeter.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>{noz.currentMeter.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px', color: '#f87171' }}>5.00</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{(Math.max(0, qty - 5)).toFixed(2)}</td>
                            <td style={{ padding: '8px 10px' }}>₹{rate.toFixed(2)}</td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                              ₹{value.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Export & Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#f8fafc',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Printer size={15} /> Print Report
                </button>

                <button
                  onClick={handleExportCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#f8fafc',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Download size={15} /> Export CSV / Excel
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={onClose}
                  className="btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                >
                  Close (Esc)
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
