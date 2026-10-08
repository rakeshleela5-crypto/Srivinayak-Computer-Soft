import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, 
  Radio, 
  Activity, 
  Send, 
  Database, 
  Wifi, 
  Server, 
  CheckCircle, 
  RefreshCw,
  Terminal,
  Play,
  Pause
} from 'lucide-react';

export default function IoTView() {
  const { 
    iotStatus, 
    setIotStatus, 
    tanks, 
    nozzles, 
    isOnline, 
    setIsOnline, 
    offlineQueue, 
    syncOfflineTransactions 
  } = useApp();

  const [simRunning, setSimRunning] = useState(true);
  const [pulseSpeed, setPulseSpeed] = useState(50); // pulses per sec
  const [activeNozzleSim, setActiveNozzleSim] = useState(nozzles[0]?.id || '');
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, time: '11:34:10', type: 'ATG_PROBE', msg: 'UST-01 ultrasonic depth: 1640mm, water: 4mm, temp: 28.5C' },
    { id: 2, time: '11:34:15', type: 'SERIAL_PULSE', msg: 'Dispenser 01 (N-01) pulse stream: 100 pulses/L detected' },
    { id: 3, time: '11:34:20', type: 'EDGE_WEBHOOK', msg: 'Cloudflare Pages Function /api/shifts status 200 OK' }
  ]);

  useEffect(() => {
    if (!simRunning) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomTank = tanks[Math.floor(Math.random() * tanks.length)];
      const randomTemp = (28.0 + Math.random() * 1.5).toFixed(1);
      
      const newLog = {
        id: Date.now(),
        time: timeStr,
        type: Math.random() > 0.5 ? 'ATG_PROBE' : 'SERIAL_PULSE',
        msg: Math.random() > 0.5 
          ? `[ATG-ESP32] ${randomTank.tankNumber} level: ${randomTank.atgLevel}L, temp: ${randomTemp}°C`
          : `[SERIAL-RS485] Pump pulse heartbeat: 0x55AA OK, flow rate: ${35 + Math.floor(Math.random() * 10)} LPM`
      };

      setTelemetryLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [simRunning, tanks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">CLOUDFLARE EDGE TELEMETRY</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RS-485 / IFSF / ATG ESP32 Bridge</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            IoT Hardware & Cloudflare Pages Edge Simulator
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Simulates physical serial pump pulses (Gilbarco / Tokheim 2-Wire), ATG ultrasonic probes, and Cloudflare Pages webhook endpoints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setSimRunning(!simRunning)}
            className="btn-primary"
          >
            {simRunning ? <Pause size={18} /> : <Play size={18} />}
            {simRunning ? 'Pause Live Stream' : 'Resume Telemetry'}
          </button>
        </div>
      </div>

      {/* Edge Architecture Map */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={20} color="#38bdf8" /> Edge-to-Forecourt Architecture Flow
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          
          {/* Node 1: Browser PWA */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline ? '#10b981' : '#f59e0b' }} />
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>1. Local Forecourt PWA</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              React + Vite running on station counter. Stores pending fuel transactions into local browser IndexedDB if station Wi-Fi drops.
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#38bdf8' }}>
              Mode: {isOnline ? 'Online Synced' : 'Offline Buffer Active'}
            </div>
          </div>

          {/* Node 2: Local Hardware Serial Daemon */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Cpu size={18} color="#f59e0b" />
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>2. Station Hardware Bridge</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Low-cost station computer / ESP32 connected via RS-485 to Gilbarco / Tokheim dispenser automation controllers & ATG dip sensors.
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#fbbf24' }}>
              Port: COM3 / /dev/ttyUSB0 (9600 baud)
            </div>
          </div>

          {/* Node 3: Cloudflare Pages Functions */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Server size={18} color="#34d399" />
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>3. Cloudflare Edge API</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Pages Functions (<code>/functions/api/shifts</code> and <code>/api/billing</code>) executing on Cloudflare global edge network with zero server downtime.
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#34d399' }}>
              Latency: &lt; 15ms Edge Execution
            </div>
          </div>

          {/* Node 4: Edge Database */}
          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Database size={18} color="#818cf8" />
              <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>4. Edge D1 / Hyperdrive</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Cloudflare D1 Serverless SQLite or PostgreSQL via Hyperdrive connection pooling. Guarantees ACID transactional ledger updates.
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#818cf8' }}>
              Status: Replicated Globally
            </div>
          </div>

        </div>
      </div>

      {/* Live Hardware Telemetry Stream Console */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="#10b981" /> Live Forecourt Serial & Probe Telemetry Terminal
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Status: {simRunning ? 'STREAMING' : 'PAUSED'}
          </span>
        </div>

        <div style={{
          background: '#020617',
          padding: '16px',
          borderRadius: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          height: '240px',
          overflowY: 'auto',
          border: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {telemetryLogs.map((log) => (
            <div key={log.id} style={{ display: 'flex', gap: '12px' }}>
              <span style={{ color: '#64748b' }}>[{log.time}]</span>
              <span style={{ 
                color: log.type === 'ATG_PROBE' ? '#38bdf8' : log.type === 'SERIAL_PULSE' ? '#fbbf24' : '#34d399',
                fontWeight: 700
              }}>
                {log.type}:
              </span>
              <span style={{ color: '#e2e8f0' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
