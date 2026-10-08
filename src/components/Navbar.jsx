import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Radio, 
  ShieldCheck, 
  User, 
  Clock, 
  Bell, 
  Sparkles,
  Zap,
  TrendingUp,
  Sliders
} from 'lucide-react';

export default function Navbar() {
  const { 
    stationInfo, 
    fuelPrices, 
    isOnline, 
    setIsOnline, 
    offlineQueue, 
    syncOfflineTransactions,
    activeRole, 
    setActiveRole,
    iotStatus,
    currentShift
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="glass-panel" style={{ margin: '12px 16px 0', padding: '12px 20px', borderRadius: '16px', position: 'sticky', top: '10px', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Brand & Station Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)'
          }}>
            <Fuel size={26} color="#0f172a" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                SHREE VINAYAKA PETROSOFT
              </h1>
              <span style={{ 
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                color: '#0f172a', 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                padding: '2px 6px', 
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}>
                AI SHIVA EDGE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>{stationInfo.roCode}</span>
              <span>•</span>
              <span style={{ color: '#fbbf24' }}>{stationInfo.subtitle}</span>
            </div>
          </div>
        </div>

        {/* Live Fuel Rates Ticker */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          background: 'rgba(2, 6, 23, 0.6)', 
          padding: '6px 14px', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            <TrendingUp size={14} color="#f59e0b" />
            <span>RATES (₹/L):</span>
          </div>
          {fuelPrices.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.code}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                ₹{item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Status Hub: Clock, Edge Connectivity, IoT & Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Live Forecourt Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <Clock size={15} color="#94a3b8" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          {/* IoT Telemetry Indicator */}
          <div 
            title={`ATG & Dispenser Serial Pulse: ${iotStatus.atgController} | Last: ${iotStatus.lastProbeHeartbeat}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.75rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 10px',
              borderRadius: '20px'
            }}
          >
            <Radio size={13} className="animate-pulse" />
            <span>IoT ATG: {iotStatus.atgController}</span>
          </div>

          {/* Edge Network Mode Toggle (Online / Cloudflare Offline PWA) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                const nextState = !isOnline;
                setIsOnline(nextState);
                if (nextState) syncOfflineTransactions();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isOnline ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                color: isOnline ? '#60a5fa' : '#f87171',
                border: `1px solid ${isOnline ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.5)'}`,
                padding: '5px 11px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Click to toggle Cloudflare Edge vs Offline PWA mode"
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'EDGE ONLINE' : 'OFFLINE PWA'}</span>
              {offlineQueue.length > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '10px', fontSize: '0.7rem' }}>
                  {offlineQueue.length}
                </span>
              )}
            </button>

            {offlineQueue.length > 0 && isOnline && (
              <button 
                onClick={syncOfflineTransactions}
                className="btn-primary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                title="Sync offline cached transactions"
              >
                <RefreshCw size={12} /> Sync
              </button>
            )}
          </div>

          {/* Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '8px' }}>
            <User size={14} color="#f59e0b" />
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              style={{ 
                padding: '4px 8px', 
                fontSize: '0.78rem', 
                background: 'transparent', 
                border: 'none', 
                color: '#fbbf24', 
                fontWeight: 700, 
                cursor: 'pointer' 
              }}
            >
              <option value="Owner" style={{ background: '#0f172a', color: '#fbbf24' }}>Shiva Kumar (Station Owner)</option>
              <option value="Manager" style={{ background: '#0f172a', color: '#60a5fa' }}>Vijay Sharma (Manager)</option>
              <option value="Attendant" style={{ background: '#0f172a', color: '#34d399' }}>Ramesh Kumar (Forecourt Attendant)</option>
            </select>
          </div>

        </div>

      </div>
    </header>
  );
}
