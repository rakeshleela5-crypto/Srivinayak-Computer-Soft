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
import DayBookView from './views/DayBookView';
import TaxComplianceView from './views/TaxComplianceView';
import DealerMarginView from './views/DealerMarginView';
import TallyExportView from './views/TallyExportView';
import DealerPortalView from './views/DealerPortalView';
import SalesmanAppView from './views/SalesmanAppView';
import CreditCustomerPortalView from './views/CreditCustomerPortalView';

export default function App() {
  const { activeTab, activeAppMode } = useApp();

  const renderManagerModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <POSView />;
      case 'daybook':
        return <DayBookView />;
      case 'nozzles':
        return <NozzlesView />;
      case 'tanks':
        return <TanksView />;
      case 'fleet':
        return <FleetKhataView />;
      case 'shifts':
        return <ShiftsView />;
      case 'margin':
        return <DealerMarginView />;
      case 'tax':
        return <TaxComplianceView />;
      case 'tally':
        return <TallyExportView />;
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

  const renderMainContent = () => {
    switch (activeAppMode) {
      case 'DEALER':
        return <DealerPortalView />;
      case 'SALESMAN':
        return <SalesmanAppView />;
      case 'FLEET_PORTAL':
        return <CreditCustomerPortalView />;
      case 'MANAGER':
      default:
        return (
          <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
            <Sidebar />
            <main style={{ flex: 1, minWidth: 0 }}>
              {renderManagerModule()}
            </main>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navigation & Status Bar */}
      <Navbar />

      {/* Main Body Layout */}
      <div style={{ flex: 1, padding: '12px 16px' }}>
        {renderMainContent()}
      </div>

      {/* Thermal Print Receipt Modal */}
      <ReceiptModal />
    </div>
  );
}
