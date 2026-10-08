import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  CreditCard, 
  Truck, 
  Fuel, 
  Database, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  Users2, 
  FileText, 
  TrendingUp, 
  Clock, 
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ShoppingBag
} from 'lucide-react';

export default function TopRibbon({
  onOpenStamping,
  onOpenCreditSale,
  onOpenCustomerMaster,
  onOpenPaymentReceipt,
  onOpenTransferEntry,
  onOpenPurchaseEntry,
  onOpenDipRegister,
  onOpenRateMaster,
  onOpenShiftSettlement,
  onOpenAttendantHandover,
  onOpenMasterReports,
  onQuickPos
}) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #090e1a 0%, #111a2e 50%, #090e1a 100%)',
      borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
      padding: '6px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      {/* Left Badges: Stamping Countdown & License Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* W&M Stamping Reminder Button */}
        <button
          onClick={onOpenStamping}
          title="Weights & Measures Legal Metrology Stamping Expiry"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <ShieldCheck size={14} color="#f87171" />
          <span>W & M Stamping: <strong>18 Day(s) Left</strong></span>
        </button>

        {/* License Left */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#60a5fa',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 600
        }}>
          <HelpCircle size={13} />
          <span>License: <strong>228 Day(s) Left</strong></span>
        </div>

        {/* Financial Year Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <Calendar size={13} />
          <span>FY: 2026-27</span>
        </div>
      </div>

      {/* Right Quick Action Icons Bar (Matching Video Screen) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {[
          { label: 'Credit Sale', icon: Truck, onClick: onOpenCreditSale, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Cust Master', icon: Users2, onClick: onOpenCustomerMaster, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
          { label: 'Payment', icon: CreditCard, onClick: onOpenPaymentReceipt, color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)' },
          { label: 'Transfer', icon: ArrowLeftRight, onClick: onOpenTransferEntry, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' },
          { label: 'Purchase TT', icon: Database, onClick: onOpenPurchaseEntry, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)' },
          { label: 'Dip Register', icon: Fuel, onClick: onOpenDipRegister, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Rate Master', icon: TrendingUp, onClick: onOpenRateMaster, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
          { label: 'Shift Account', icon: FileSpreadsheet, onClick: onOpenShiftSettlement, color: '#e879f9', bg: 'rgba(232, 121, 249, 0.12)' },
          { label: 'Handover', icon: Users2, onClick: onOpenAttendantHandover, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
          { label: '44 Reports', icon: FileText, onClick: onOpenMasterReports, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', highlight: true },
          { label: 'POS Bill', icon: Zap, onClick: onQuickPos, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', highlight: true }
        ].map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <button
              key={idx}
              onClick={btn.onClick}
              title={btn.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: btn.bg,
                border: btn.highlight ? `1px solid ${btn.color}` : '1px solid rgba(255,255,255,0.08)',
                color: btn.color,
                padding: '4px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.74rem',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 3px 8px ${btn.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Icon size={13} color={btn.color} />
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
