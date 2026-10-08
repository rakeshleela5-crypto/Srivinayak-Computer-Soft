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
    exportTallyXml, 
    exportCaSalesCsv, 
    exportCaPurchaseCsv 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState('XML'); // 'XML' or 'INSTRUCTIONS'

  // Generate live sample XML string for preview
  const sampleXml = generateTallyPrimeXml(transactions, stationInfo);

  const handleCopyXml = () => {
    navigator.clipboard.writeText(sampleXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            onClick={() => exportTallyXml()}
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
            onClick={() => exportTallyXml()}
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
            onClick={() => exportCaSalesCsv()}
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
            onClick={() => exportCaPurchaseCsv()}
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
                background: previewTab === 'XML' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                border: previewTab === 'XML' ? '1px solid #f59e0b' : 'none',
                color: previewTab === 'XML' ? '#fbbf24' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Live Tally XML Preview
            </button>
            <button
              onClick={() => setPreviewTab('INSTRUCTIONS')}
              style={{
                background: previewTab === 'INSTRUCTIONS' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                border: previewTab === 'INSTRUCTIONS' ? '1px solid #38bdf8' : 'none',
                color: previewTab === 'INSTRUCTIONS' ? '#38bdf8' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              How to Import in Tally Prime
            </button>
          </div>

          {previewTab === 'XML' && (
            <button
              onClick={handleCopyXml}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard!' : 'Copy XML'}
            </button>
          )}
        </div>

        {previewTab === 'XML' ? (
          <div style={{
            background: '#020617',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
            maxHeight: '380px',
            overflowY: 'auto'
          }}>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
              {sampleXml.slice(0, 3500)}
              {sampleXml.length > 3500 ? '\n\n... [Remaining XML Vouchers Truncated for Preview. Click Export to download full file] ...' : ''}
            </pre>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Download Tally XML File</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  Click the <strong>1-Click Tally XML Download</strong> button above. The XML file will be saved to your computer.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Open Tally Prime</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  Open your petroleum company in Tally Prime. Press <kbd style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px', color: '#fff' }}>Alt + O</kbd> (Import menu) from the Gateway of Tally.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
              <div>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Select "Transactions" & Paste File Path</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  Select <strong>Transactions</strong>, enter the file path of the downloaded <code>.xml</code> file, and press Enter. Tally will auto-create all Sales, Purchase 194Q, and Receipt entries instantly!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
