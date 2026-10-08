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
  BadgePercent
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, offlineQueue } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Forecourt Monitor', icon: LayoutDashboard, badge: null },
    { id: 'pos', label: 'Forecourt POS Billing', icon: Fuel, badge: 'Live' },
    { id: 'nozzles', label: 'Nozzles & Totalizers', icon: Gauge, badge: null },
    { id: 'tanks', label: 'Wet-Stock & ATG Dip', icon: Database, badge: null },
    { id: 'fleet', label: 'Fleet & Khata Credit', icon: Truck, badge: null },
    { id: 'shifts', label: 'Shifts & Handover', icon: Users2, badge: null },
    { id: 'lubes', label: 'Lubes & Non-Fuel', icon: Package, badge: null },
    { id: 'settlement', label: 'Daily Settlement (DSS)', icon: FileSpreadsheet, badge: 'Audit' },
    { id: 'iot', label: 'IoT Pulse & Sensors', icon: Cpu, badge: 'Edge' }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      padding: '16px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ padding: '8px 12px 14px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 800 }}>
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
              padding: '11px 14px',
              borderRadius: '12px',
              border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
              background: isActive 
                ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)' 
                : 'transparent',
              color: isActive ? '#fbbf24' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.9rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Icon size={19} color={isActive ? '#fbbf24' : '#94a3b8'} strokeWidth={isActive ? 2.2 : 1.8} />
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

      {/* Cloudflare Edge status card */}
      <div style={{ marginTop: 'auto', padding: '14px', borderRadius: '12px', background: 'rgba(2, 6, 23, 0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Cloudflare Edge Worker</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Pages Functions active at <code style={{ color: '#38bdf8' }}>/api/shifts</code> and <code style={{ color: '#38bdf8' }}>/api/billing</code> with edge IndexedDB sync.
        </div>
      </div>
    </aside>
  );
}
