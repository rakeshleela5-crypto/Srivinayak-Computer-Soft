import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ForecourtPhasingBar from './components/ForecourtPhasingBar';
import TopRibbon from './components/TopRibbon';
import Sidebar from './components/Sidebar';
import ReceiptModal from './components/ReceiptModal';
import RateMasterModal from './components/RateMasterModal';
import CustomerMasterModal from './components/CustomerMasterModal';
import CreditCustomerSaleModal from './components/CreditCustomerSaleModal';
import PaymentReceiptModal from './components/PaymentReceiptModal';
import TransferEntryModal from './components/TransferEntryModal';
import PurchaseEntryModal from './components/PurchaseEntryModal';
import DipRegisterModal from './components/DipRegisterModal';
import ShiftSettlementModal from './components/ShiftSettlementModal';
import AttendantHandoverVoucherModal from './components/AttendantHandoverVoucherModal';
import MasterReportCriteriaModal from './components/MasterReportCriteriaModal';
import StampingReminderModal from './components/StampingReminderModal';
import CashPOSBillModal from './components/CashPOSBillModal';

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
  const { activeTab, activeAppMode, setActiveTab, setActiveAppMode } = useApp();

  // ERP Modals State Controller
  const [modals, setModals] = useState({
    stamping: false,
    rateMaster: false,
    customerMaster: false,
    creditSale: false,
    paymentReceipt: false,
    transferEntry: false,
    purchaseEntry: false,
    dipRegister: false,
    shiftSettlement: false,
    attendantHandover: false,
    masterReports: false,
    posBill: false
  });

  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  // Global Keyboard Shortcuts (F1-F12 matching video software)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't hijack input typing unless it's Escape
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        openModal('creditSale');
      } else if (e.key === 'F2') {
        e.preventDefault();
        openModal('paymentReceipt');
      } else if (e.key === 'F3') {
        e.preventDefault();
        openModal('customerMaster');
      } else if (e.key === 'F4') {
        e.preventDefault();
        openModal('rateMaster');
      } else if (e.key === 'F5' || e.key === 'F12') {
        e.preventDefault();
        openModal('posBill');
      } else if (e.key === 'F6') {
        e.preventDefault();
        openModal('transferEntry');
      } else if (e.key === 'F7') {
        e.preventDefault();
        openModal('purchaseEntry');
      } else if (e.key === 'F8') {
        e.preventDefault();
        openModal('dipRegister');
      } else if (e.key === 'F9') {
        e.preventDefault();
        openModal('shiftSettlement');
      } else if (e.key === 'F10') {
        e.preventDefault();
        openModal('masterReports');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderManagerModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            onOpenCreditSale={() => openModal('creditSale')}
            onOpenCustomerMaster={() => openModal('customerMaster')}
            onOpenPaymentReceipt={() => openModal('paymentReceipt')}
            onOpenTransferEntry={() => openModal('transferEntry')}
            onOpenPurchaseEntry={() => openModal('purchaseEntry')}
            onOpenDipRegister={() => openModal('dipRegister')}
            onOpenRateMaster={() => openModal('rateMaster')}
            onOpenShiftSettlement={() => openModal('shiftSettlement')}
            onOpenAttendantHandover={() => openModal('attendantHandover')}
            onOpenMasterReports={() => openModal('masterReports')}
            onOpenStamping={() => openModal('stamping')}
            onOpenPosBill={() => openModal('posBill')}
          />
        );
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
        return (
          <DashboardView 
            onOpenCreditSale={() => openModal('creditSale')}
            onOpenCustomerMaster={() => openModal('customerMaster')}
            onOpenPaymentReceipt={() => openModal('paymentReceipt')}
            onOpenTransferEntry={() => openModal('transferEntry')}
            onOpenPurchaseEntry={() => openModal('purchaseEntry')}
            onOpenDipRegister={() => openModal('dipRegister')}
            onOpenRateMaster={() => openModal('rateMaster')}
            onOpenShiftSettlement={() => openModal('shiftSettlement')}
            onOpenAttendantHandover={() => openModal('attendantHandover')}
            onOpenMasterReports={() => openModal('masterReports')}
            onOpenStamping={() => openModal('stamping')}
            onOpenPosBill={() => openModal('posBill')}
          />
        );
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
            <Sidebar onOpenModal={openModal} />
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

      {/* Forecourt Phasing & Timing Coordination Banner */}
      <ForecourtPhasingBar />

      {/* Top Desktop Ribbon with Weights & Measures Countdown, License, and Quick Action Buttons */}
      <TopRibbon 
        onOpenStamping={() => openModal('stamping')}
        onOpenCreditSale={() => openModal('creditSale')}
        onOpenCustomerMaster={() => openModal('customerMaster')}
        onOpenPaymentReceipt={() => openModal('paymentReceipt')}
        onOpenTransferEntry={() => openModal('transferEntry')}
        onOpenPurchaseEntry={() => openModal('purchaseEntry')}
        onOpenDipRegister={() => openModal('dipRegister')}
        onOpenRateMaster={() => openModal('rateMaster')}
        onOpenShiftSettlement={() => openModal('shiftSettlement')}
        onOpenAttendantHandover={() => openModal('attendantHandover')}
        onOpenMasterReports={() => openModal('masterReports')}
        onQuickPos={() => openModal('posBill')}
      />

      {/* Main Body Layout */}
      <div style={{ flex: 1, padding: '12px 16px' }}>
        <ModuleErrorBoundary key={activeAppMode}>
          {renderMainContent()}
        </ModuleErrorBoundary>
      </div>

      {/* Thermal Print Receipt Modal */}
      <ReceiptModal />

      {/* Video Dissection ERP Dialogs & Modals */}
      <StampingReminderModal 
        isOpen={modals.stamping} 
        onClose={() => closeModal('stamping')} 
      />

      <RateMasterModal 
        isOpen={modals.rateMaster} 
        onClose={() => closeModal('rateMaster')} 
      />

      <CustomerMasterModal 
        isOpen={modals.customerMaster} 
        onClose={() => closeModal('customerMaster')} 
      />

      <CreditCustomerSaleModal 
        isOpen={modals.creditSale} 
        onClose={() => closeModal('creditSale')} 
      />

      <PaymentReceiptModal 
        isOpen={modals.paymentReceipt} 
        onClose={() => closeModal('paymentReceipt')} 
      />

      <TransferEntryModal 
        isOpen={modals.transferEntry} 
        onClose={() => closeModal('transferEntry')} 
      />

      <PurchaseEntryModal 
        isOpen={modals.purchaseEntry} 
        onClose={() => closeModal('purchaseEntry')} 
      />

      <DipRegisterModal 
        isOpen={modals.dipRegister} 
        onClose={() => closeModal('dipRegister')} 
      />

      <ShiftSettlementModal 
        isOpen={modals.shiftSettlement} 
        onClose={() => closeModal('shiftSettlement')} 
      />

      <AttendantHandoverVoucherModal 
        isOpen={modals.attendantHandover} 
        onClose={() => closeModal('attendantHandover')} 
      />

      <MasterReportCriteriaModal 
        isOpen={modals.masterReports} 
        onClose={() => closeModal('masterReports')} 
      />

      {/* Instant Cash/Card/UPI Rapid POS Bill Modal */}
      <CashPOSBillModal 
        isOpen={modals.posBill} 
        onClose={() => closeModal('posBill')} 
        onOpenFullTerminal={() => {
          setActiveAppMode('MANAGER');
          setActiveTab('pos');
        }}
      />

    </div>
  );
}
