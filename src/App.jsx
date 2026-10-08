import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ReceiptModal from './components/ReceiptModal';
import DashboardView from './views/DashboardView';
import POSView from './views/POSView';
import NozzlesView from './views/NozzlesView';
import TanksView from './views/TanksView';
import FleetKhataView from './views/FleetKhataView';
import ShiftsView from './views/ShiftsView';
import LubesView from './views/LubesView';
import SettlementView from './views/SettlementView';
import IoTView from './views/IoTView';

export default function App() {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <POSView />;
      case 'nozzles':
        return <NozzlesView />;
      case 'tanks':
        return <TanksView />;
      case 'fleet':
        return <FleetKhataView />;
      case 'shifts':
        return <ShiftsView />;
      case 'lubes':
        return <LubesView />;
      case 'settlement':
        return <SettlementView />;
      case 'iot':
        return <IoTView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navigation & Status Bar */}
      <Navbar />

      {/* Main Body Layout: Sidebar + Active View Content */}
      <div style={{ display: 'flex', flex: 1, padding: '12px 16px', gap: '16px' }}>
        <Sidebar />
        
        <main style={{ flex: 1, minWidth: 0 }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Thermal Print Receipt Modal */}
      <ReceiptModal />
    </div>
  );
}
