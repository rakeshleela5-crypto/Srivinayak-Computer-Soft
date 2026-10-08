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

class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Module Error Boundary Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: '#f87171', fontSize: '1.2rem', marginBottom: '8px', fontWeight: 800 }}>Module Recovery Engine</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {this.state.error?.message || 'An unexpected state occurred while rendering this module.'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Retry Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
              <ModuleErrorBoundary key={activeTab}>
                {renderManagerModule()}
              </ModuleErrorBoundary>
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
        <ModuleErrorBoundary key={activeAppMode}>
          {renderMainContent()}
        </ModuleErrorBoundary>
      </div>

      {/* Thermal Print Receipt Modal */}
      <ReceiptModal />
    </div>
  );
}
