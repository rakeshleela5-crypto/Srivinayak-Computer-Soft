import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ForecourtPhasingBar() {
  const { 
    currentPhase, 
    setCurrentPhase, 
    forecourtPhases, 
    decantationLock, 
    releaseDecantationSafetyLock,
    syncStatus,
    syncManager,
    offlineQueueLength,
    forceSyncNow
  } = useApp();

  const [expanded, setExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await forceSyncNow();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const activePhaseObj = forecourtPhases.find(p => p.id === currentPhase) || forecourtPhases[1];

  return (
    <div style={{ margin: '8px 16px 0' }}>
      <div 
        className="glass-card" 
        style={{ 
          padding: '10px 16px', 
          border: `1px solid ${activePhaseObj.color}40`,
          background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%)',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Phase Badge & Description */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: `${activePhaseObj.color}20`, 
              color: activePhaseObj.color,
              border: `1px solid ${activePhaseObj.color}60`,
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.78rem'
            }}>
              <Layers size={13} />
              <span>PHASE {activePhaseObj.id}</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
                  {activePhaseObj.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({activePhaseObj.timeWindow})
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                {activePhaseObj.description}
              </div>
            </div>
          </div>

          {/* Safety Interlock Status if Decanting */}
          {decantationLock && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              color: '#f87171',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700
            }}>
              <ShieldAlert size={14} className="animate-pulse" />
              <span>DECANTATION INTERLOCK ACTIVE (Nozzles Secured)</span>
              <button 
                onClick={releaseDecantationSafetyLock}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Release Lock
              </button>
            </div>
          )}

          {/* Right Controls: Phase Switcher & Edge Sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Edge Synchronization Indicator */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                background: syncStatus.syncState === 'SYNCED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: syncStatus.syncState === 'SYNCED' ? '#34d399' : '#fbbf24',
                border: `1px solid ${syncStatus.syncState === 'SYNCED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}
            >
              <span style={{ 
                width: '7px', 
                height: '7px', 
                borderRadius: '50%', 
                background: syncStatus.syncState === 'SYNCED' ? '#34d399' : '#fbbf24',
                display: 'inline-block'
              }} className={syncStatus.syncState === 'SYNCING' ? 'animate-pulse' : ''} />
              <span>{syncStatus.syncState === 'SYNCED' ? 'EDGE SYNCED' : `BUFFERED (${offlineQueueLength})`}</span>
            </div>

            <button 
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Force sync local offline queue with Cloudflare Pages Functions"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            {/* Toggle Stepper Drawer */}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Phases</span>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

          </div>

        </div>

        {/* Expanded 5-Phase Workflow Stepper */}
        {expanded && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {forecourtPhases.map(phase => {
                const isActive = phase.id === currentPhase;
                const isPassed = phase.id < currentPhase;
                return (
                  <div 
                    key={phase.id}
                    onClick={() => setCurrentPhase(phase.id)}
                    style={{
                      background: isActive ? `${phase.color}15` : 'rgba(2, 6, 23, 0.5)',
                      border: `1px solid ${isActive ? phase.color : 'rgba(255,255,255,0.08)'}`,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: phase.color }}>
                        Phase {phase.id}
                      </span>
                      {isPassed ? (
                        <Check size={13} color="#10b981" />
                      ) : isActive ? (
                        <span style={{ fontSize: '0.65rem', background: phase.color, color: '#0f172a', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                          ACTIVE
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>
                      {phase.shortName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {phase.timeWindow}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
