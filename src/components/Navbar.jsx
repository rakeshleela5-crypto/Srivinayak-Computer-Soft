import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Fuel, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Radio, 
  Clock, 
  TrendingUp,
  Crown,
  Briefcase,
  Smartphone,
  Truck
} from 'lucide-react';

export default function Navbar() {
  const { 
    stationInfo, 
    fuelPrices, 
    isOnline, 
    setIsOnline, 
    offlineQueue, 
    syncOfflineTransactions,
    activeAppMode,
    setActiveAppMode,
    iotStatus
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const appModes = [
    { id: 'DEALER', label: 'Dealer App', icon: Crown, color: '#f59e0b' },
    { id: 'MANAGER', label: 'Manager App', icon: Briefcase, color: '#38bdf8' },
    { id: 'SALESMAN', label: 'Salesman App', icon: Smartphone, color: '#10b981' },
    { id: 'FLEET_PORTAL', label: 'Credit Customer App', icon: Truck, color: '#a78bfa' }
  ];

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
              <h1 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
                SHREE VINAYAKA PETROSOFT
              </h1>
              <span style={{ 
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)', 
                color: '#0f172a', 
                fontSize: '0.65rem', 
                fontWeight: 900, 
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

        {/* The 4 Core Role App Portals Switcher (PDF Showcase) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: 'rgba(2, 6, 23, 0.7)', 
          padding: '4px 6px', 
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {appModes.map(mode => {
            const Icon = mode.icon;
            const isSelected = activeAppMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveAppMode(mode.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: isSelected ? `${mode.color}25` : 'transparent',
                  border: isSelected ? `1px solid ${mode.color}` : '1px solid transparent',
                  color: isSelected ? mode.color : 'var(--text-muted)',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isSelected ? mode.color : '#94a3b8'} />
                <span>{mode.label}</span>
              </button>
            );
          })}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            <TrendingUp size={14} color="#f59e0b" />
            <span>RATES:</span>
          </div>
          {fuelPrices.slice(0, 3).map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: item.color }}>{item.code}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                ₹{item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Status Hub: Clock, Edge Connectivity, IoT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <Clock size={15} color="#94a3b8" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>

          <div 
            title={`ATG & Serial Pulse: ${iotStatus.atgController} | Last: ${iotStatus.lastProbeHeartbeat}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.72rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 8px',
              borderRadius: '20px'
            }}
          >
            <Radio size={12} className="animate-pulse" />
            <span>ATG: {iotStatus.atgController}</span>
          </div>

          {/* Edge Online / Offline Toggle */}
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
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Toggle Cloudflare Edge vs Offline PWA mode"
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'EDGE' : 'OFFLINE'}</span>
            {offlineQueue.length > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '10px', fontSize: '0.65rem' }}>
                {offlineQueue.length}
              </span>
            )}
          </button>

          {offlineQueue.length > 0 && isOnline && (
            <button onClick={syncOfflineTransactions} className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}>
              <RefreshCw size={11} /> Sync
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
