import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Fuel,
  Gauge,
  Database,
  Truck,
  Users2,
  Package,
  FileSpreadsheet,
  Cpu,
  BadgePercent,
  FileText,
  ShieldCheck,
  TrendingUp,
  FileCode,
  CreditCard,
  ArrowLeftRight,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ onOpenModal }) {
  const { activeTab, setActiveTab, offlineQueue, t } = useApp();

  const navItems = [
    { id: 'dashboard', label: t('forecourtMonitor'), icon: LayoutDashboard, badge: null },
    { id: 'pos', label: t('posBilling'), icon: Fuel, badge: 'Live' },
    { id: 'daybook', label: '2-Page Day Book', icon: FileText, badge: 'DSS' },
    { id: 'nozzles', label: t('nozzlesTotalizers'), icon: Gauge, badge: null },
    { id: 'tanks', label: t('wetStockDip'), icon: Database, badge: null },
    { id: 'fleet', label: t('fleetKhata'), icon: Truck, badge: null },
    { id: 'shifts', label: t('shiftsHandover'), icon: Users2, badge: null },
    { id: 'margin', label: 'Dealer Margin & Profit', icon: TrendingUp, badge: '₹/L' },
    { id: 'tax', label: 'LFR & 194Q Tax', icon: ShieldCheck, badge: 'Audit' },
    { id: 'tally', label: 'Tally Prime & CA Export', icon: FileCode, badge: 'XML' },
    { id: 'lubes', label: t('lubesNonFuel'), icon: Package, badge: null },
    { id: 'settlement', label: t('dailySettlement'), icon: FileSpreadsheet, badge: 'Audit' },
    { id: 'iot', label: t('iotPulse'), icon: Cpu, badge: 'Edge' }
  ];

  const quickActions = [
    { name: 'Credit Sale', key: 'F1', modal: 'creditSale', icon: Truck, color: '#fbbf24' },
    { name: 'Cust Payment', key: 'F2', modal: 'paymentReceipt', icon: CreditCard, color: '#34d399' },
    { name: 'Customer Master', key: 'F3', modal: 'customerMaster', icon: Users2, color: '#38bdf8' },
    { name: 'Rate Master', key: 'F4', modal: 'rateMaster', icon: TrendingUp, color: '#f59e0b' },
    { name: 'Contra Transfer', key: 'F6', modal: 'transferEntry', icon: ArrowLeftRight, color: '#a78bfa' },
    { name: 'Purchase 8 Seals', key: 'F7', modal: 'purchaseEntry', icon: Database, color: '#f472b6' },
    { name: 'Tank DIP Reg', key: 'F8', modal: 'dipRegister', icon: Fuel, color: '#34d399' },
    { name: 'Shift Account', key: 'F9', modal: 'shiftSettlement', icon: FileSpreadsheet, color: '#e879f9' },
    { name: '44 Master Reports', key: 'F10', modal: 'masterReports', icon: BookOpen, color: '#60a5fa' },
    { name: 'W&M Stamping', key: 'Esc', modal: 'stamping', icon: ShieldCheck, color: '#f87171' }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '4px 12px 10px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 800 }}>
        Automation Modules
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '12px',
              border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: isActive 
                ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)' 
                : 'transparent',
              color: isActive ? '#fbbf24' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.88rem',
              transition: 'all 0.15s ease',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon size={18} color={isActive ? '#fbbf24' : '#94a3b8'} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '6px',
                background: item.badge === 'Live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: item.badge === 'Live' ? '#34d399' : '#60a5fa',
                border: item.badge === 'Live' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* Fast Desk Modals / Shortcuts */}
      {onOpenModal && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '0 12px 8px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fbbf24', fontWeight: 800 }}>
            Fast Desk Vouchers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {quickActions.map(qa => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.modal}
                  onClick={() => onOpenModal(qa.modal)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={14} color={qa.color} />
                    <span>{qa.name}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {qa.key}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cloudflare Edge status card */}
      <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Cloudflare D1 & Edge</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
            30 tables live on D1 Database <code style={{ color: '#38bdf8' }}>petrosoft-d1-db</code> with instant offline sync.
          </div>
        </div>
      </div>
    </aside>
  );
}
