import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  Building2, 
  Receipt, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { generateTallyPrimeXml } from '../utils/tallyXmlGenerator';

export default function TallyExportView() {
  const { 
    stationInfo, 
    transactions, 
    decantations,
    fleetAccounts,
    currentShift,
    forecourtExpenses,
    exportTallyXml, 
    exportCaSalesCsv, 
    exportCaPurchaseCsv 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState('XML'); // 'XML' or 'INSTRUCTIONS'

  // Generate live sample XML string for preview
  const sampleXml = generateTallyPrimeXml({
    stationInfo: stationInfo || {},
    transactions: Array.isArray(transactions) ? transactions : [],
    decantations: Array.isArray(decantations) ? decantations : [],
    fleetAccounts: Array.isArray(fleetAccounts) ? fleetAccounts : [],
    currentShift: currentShift || {},
    forecourtExpenses: Array.isArray(forecourtExpenses) ? forecourtExpenses : [],
    date: '2026-10-08'
  });

  const handleCopyXml = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(sampleXml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadXml = () => {
    if (exportTallyXml) {
      exportTallyXml();
    }
  };

  const handleDownloadSales = () => {
    if (exportCaSalesCsv) {
      exportCaSalesCsv();
    }
  };

  const handleDownloadPurchases = () => {
    if (exportCaPurchaseCsv) {
      exportCaPurchaseCsv();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '22px 26px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileCode size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                1-Click Tally Prime XML & CA Data Export Engine
              </h2>
              <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                TALLY PRIME COMPATIBLE
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Direct Tally XML Import • CA-Ready Sales/Purchase CSV Registers • Section 194Q TDS Automated Vouchers
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadXml}
            className="btn-action-green"
            style={{ fontSize: '0.85rem' }}
          >
            <Download size={16} /> 1-Click Tally XML Download
          </button>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        
        {/* Card 1: Tally Prime XML */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #f59e0b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileCode size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Tally Prime XML
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Standard Tally XML envelope file containing Sales Vouchers, OMC Inward Purchase Vouchers (with Section 194Q TDS deducted), and Tender Payments.
            </p>
            <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '6px' }}>
              Format: <code>TALLYMESSAGE / VOUCHER</code>
            </div>
          </div>

          <button
            onClick={handleDownloadXml}
            className="btn-primary"
            style={{ marginTop: '16px', justifyContent: 'center', fontSize: '0.82rem' }}
          >
            <Download size={15} /> Export Tally XML
          </button>
        </div>

        {/* Card 2: CA Sales Register */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #38bdf8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FileSpreadsheet size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                CA Sales Register CSV
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Clean Excel-ready CSV for your Chartered Accountant containing receipt dates, vehicle numbers, nozzle fuel codes, liters, contractual rebates, and driver kharcha.
            </p>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '6px' }}>
              Includes: <code>Gross Fuel, Rebate, Kharcha, Net</code>
            </div>
          </div>

          <button
            onClick={handleDownloadSales}
            className="btn-secondary"
            style={{ marginTop: '16px', justifyContent: 'center', fontSize: '0.82rem', borderColor: '#38bdf8', color: '#38bdf8' }}
          >
            <Download size={15} /> Export Sales CSV
          </button>
        </div>

        {/* Card 3: CA Purchase & 194Q Register */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #a855f7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Receipt size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                CA Purchase 194Q CSV
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Audit register of OMC tank truck inward decantations, showing invoice amounts, 0.1% TDS deductions under Section 194Q, and net payable.
            </p>
            <div style={{ fontSize: '0.72rem', color: '#c084fc', marginTop: '6px' }}>
              Includes: <code>OMC Invoice, 194Q TDS, ITNS 281</code>
            </div>
          </div>

          <button
            onClick={handleDownloadPurchases}
            className="btn-secondary"
            style={{ marginTop: '16px', justifyContent: 'center', fontSize: '0.82rem', borderColor: '#a855f7', color: '#c084fc' }}
          >
            <Download size={15} /> Export Purchase CSV
          </button>
        </div>

      </div>

      {/* XML Code Preview & Import Instructions */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setPreviewTab('XML')}
              style={{
                padding: '6px 14px',
                background: previewTab === 'XML' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: previewTab === 'XML' ? '#fbbf24' : 'var(--text-muted)',
                border: previewTab === 'XML' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Live Tally XML Payload Preview
            </button>
            <button
              onClick={() => setPreviewTab('INSTRUCTIONS')}
              style={{
                padding: '6px 14px',
                background: previewTab === 'INSTRUCTIONS' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: previewTab === 'INSTRUCTIONS' ? '#38bdf8' : 'var(--text-muted)',
                border: previewTab === 'INSTRUCTIONS' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Tally Prime Import Instructions
            </button>
          </div>

          {previewTab === 'XML' && (
            <button
              onClick={handleCopyXml}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            >
              {copied ? (
                <>
                  <Check size={14} color="#34d399" /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy XML
                </>
              )}
            </button>
          )}
        </div>

        {previewTab === 'XML' ? (
          <div style={{ position: 'relative' }}>
            <pre style={{
              background: '#090d16',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '16px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: '#38bdf8',
              maxHeight: '380px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}>
              {sampleXml}
            </pre>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.6 }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <strong style={{ color: '#ffffff' }}>Step 1: Download XML File</strong>
              <div>Click the "Export Tally XML" button above to download the daily voucher XML file to your computer.</div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <strong style={{ color: '#ffffff' }}>Step 2: Open Tally Prime</strong>
              <div>Launch Tally Prime on your accountant's computer and select your Fuel Station Company.</div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <strong style={{ color: '#ffffff' }}>Step 3: Import Transactions</strong>
              <div>
                Navigate to <strong>Alt + O (Import) &gt; Transactions</strong>. In the file path prompt, select the downloaded XML file and press Enter.
              </div>
            </div>

            <div style={{ background: 'rgba(52, 211, 153, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
              <strong style={{ color: '#34d399' }}>✓ Automatic Account Mapping</strong>
              <div>
                Tally Prime will automatically create/map Sales Vouchers with party ledgers, fuel revenue accounts, <strong>Section 194Q TDS entries</strong>, transporter discounts, and cash drawer debits.
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
