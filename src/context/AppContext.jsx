import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  STATION_INFO,
  INITIAL_PRICES,
  INITIAL_TANKS,
  INITIAL_DISPENSERS,
  INITIAL_NOZZLES,
  INITIAL_STAFF,
  INITIAL_CURRENT_SHIFT,
  INITIAL_FLEET_ACCOUNTS,
  INITIAL_LUBRICANTS,
  INITIAL_INWARD_DECANTATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_CALIBRATION_TESTS,
  INITIAL_BANK_DEPOSITS,
  INITIAL_FORECOURT_EXPENSES
} from '../constants/initialData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Persistence with localStorage fallback
  const [stationInfo] = useState(STATION_INFO);
  
  // 4 Core Role Viewports from PDF: 'DEALER' | 'MANAGER' | 'SALESMAN' | 'FLEET_PORTAL'
  const [activeAppMode, setActiveAppMode] = useState(() => {
    return localStorage.getItem('svp_app_mode') || 'DEALER';
  });

  const [fuelPrices, setFuelPrices] = useState(() => {
    const saved = localStorage.getItem('svp_prices');
    return saved ? JSON.parse(saved) : INITIAL_PRICES;
  });
  const [tanks, setTanks] = useState(() => {
    const saved = localStorage.getItem('svp_tanks');
    return saved ? JSON.parse(saved) : INITIAL_TANKS;
  });
  const [dispensers] = useState(INITIAL_DISPENSERS);
  const [nozzles, setNozzles] = useState(() => {
    const saved = localStorage.getItem('svp_nozzles');
    return saved ? JSON.parse(saved) : INITIAL_NOZZLES;
  });
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('svp_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [currentShift, setCurrentShift] = useState(() => {
    const saved = localStorage.getItem('svp_shift');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_SHIFT;
  });
  const [fleetAccounts, setFleetAccounts] = useState(() => {
    const saved = localStorage.getItem('svp_fleet');
    return saved ? JSON.parse(saved) : INITIAL_FLEET_ACCOUNTS;
  });
  const [lubricants, setLubricants] = useState(() => {
    const saved = localStorage.getItem('svp_lubes');
    return saved ? JSON.parse(saved) : INITIAL_LUBRICANTS;
  });
  const [decantations, setDecantations] = useState(() => {
    const saved = localStorage.getItem('svp_decantations');
    return saved ? JSON.parse(saved) : INITIAL_INWARD_DECANTATIONS;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('svp_txns');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [calibrationTests, setCalibrationTests] = useState(() => {
    const saved = localStorage.getItem('svp_calibrations');
    return saved ? JSON.parse(saved) : INITIAL_CALIBRATION_TESTS;
  });
  const [bankDeposits, setBankDeposits] = useState(() => {
    const saved = localStorage.getItem('svp_bank_deposits');
    return saved ? JSON.parse(saved) : INITIAL_BANK_DEPOSITS;
  });
  const [forecourtExpenses, setForecourtExpenses] = useState(() => {
    const saved = localStorage.getItem('svp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_FORECOURT_EXPENSES;
  });

  // Active Fleet Selected in Fleet Portal View
  const [activePortalFleetId, setActivePortalFleetId] = useState(INITIAL_FLEET_ACCOUNTS[0]?.id || 'fl-01');

  // Active Salesman Selected in Salesman Mobile View
  const [activeSalesmanId, setActiveSalesmanId] = useState(INITIAL_STAFF[0]?.id || 'staff-1');

  // Edge & Hardware Status
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [activeRole, setActiveRole] = useState('Dealer (Owner)');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeReceiptModal, setActiveReceiptModal] = useState(null);
  const [priceUpdateLog, setPriceUpdateLog] = useState([
    { id: 'pul-1', fuelCode: 'MS', oldPrice: 102.30, newPrice: 102.84, effectiveDate: '2026-10-08 06:00', updatedBy: 'Vijay Sharma (Manager)' },
    { id: 'pul-2', fuelCode: 'HSD', oldPrice: 89.20, newPrice: 89.75, effectiveDate: '2026-10-08 06:00', updatedBy: 'Vijay Sharma (Manager)' }
  ]);

  // IoT Simulation & Live Telemetry
  const [iotStatus, setIotStatus] = useState({
    atgController: 'ONLINE',
    serialPumpBridge: 'ONLINE',
    lastProbeHeartbeat: new Date().toLocaleTimeString(),
    activePulses: 0
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('svp_app_mode', activeAppMode);
  }, [activeAppMode]);

  useEffect(() => {
    localStorage.setItem('svp_prices', JSON.stringify(fuelPrices));
  }, [fuelPrices]);

  useEffect(() => {
    localStorage.setItem('svp_tanks', JSON.stringify(tanks));
  }, [tanks]);

  useEffect(() => {
    localStorage.setItem('svp_nozzles', JSON.stringify(nozzles));
  }, [nozzles]);

  useEffect(() => {
    localStorage.setItem('svp_txns', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('svp_fleet', JSON.stringify(fleetAccounts));
  }, [fleetAccounts]);

  useEffect(() => {
    localStorage.setItem('svp_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('svp_bank_deposits', JSON.stringify(bankDeposits));
  }, [bankDeposits]);

  useEffect(() => {
    localStorage.setItem('svp_expenses', JSON.stringify(forecourtExpenses));
  }, [forecourtExpenses]);

  // Standard ASTM 53B Density Conversion at 15°C
  const calculateDensityAt15C = (observedDensity, observedTemp, fuelType = 'MS') => {
    const coeff = fuelType === 'HSD' ? 0.00075 : 0.00085;
    const tempDelta = observedTemp - 15;
    const density15 = observedDensity / (1 - (coeff * tempDelta));
    return Number(density15.toFixed(1));
  };

  // Petroleum Strapping Table Calculator: Horizontal Cylinder dip mm -> Liters
  const calculateDipToLiters = (tankId, dipMm) => {
    const tank = tanks.find(t => t.id === tankId);
    if (!tank || !tank.diameterMm || tank.diameterMm === 0) {
      // Default fallback linear approximation if CNG
      return Math.round(dipMm * 11.25);
    }

    const R = tank.diameterMm / 2; // radius in mm
    const h = Math.min(dipMm, tank.diameterMm); // fluid height
    const L = tank.lengthMm; // length in mm

    if (h <= 0) return 0;
    if (h >= tank.diameterMm) return tank.capacity;

    // Segment of circle area: R^2 * acos((R - h)/R) - (R - h) * sqrt(2*R*h - h^2)
    const theta = 2 * Math.acos((R - h) / R);
    const crossSectionAreaMm2 = 0.5 * (R * R) * (theta - Math.sin(theta));
    const volumeLiters = (crossSectionAreaMm2 * L) / 1000000; // mm^3 to Liters

    // Add 2% allowance for 2:1 semi-ellipsoidal dished heads
    const totalVolume = volumeLiters * 1.02;
    return Math.min(tank.capacity, Math.round(totalVolume));
  };

  // Record a New Fuel / Lube Sale Transaction
  const recordTransaction = (saleData) => {
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNo = `SV-REC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newTxn = {
      id: txnId,
      receiptNo,
      timestamp,
      nozzleId: saleData.nozzleId,
      nozzleNumber: saleData.nozzleNumber,
      fuelCode: saleData.fuelCode,
      fuelName: saleData.fuelName,
      liters: Number(saleData.liters),
      rate: Number(saleData.rate),
      fuelAmount: Number(saleData.fuelAmount),
      lubeItems: saleData.lubeItems || [],
      lubeAmount: Number(saleData.lubeAmount || 0),
      totalAmount: Number(saleData.totalAmount),
      paymentMode: saleData.paymentMode,
      creditAccountId: saleData.creditAccountId || null,
      slipNo: saleData.slipNo || null,
      driverName: saleData.driverName || null,
      customerVehicle: saleData.customerVehicle || 'WALK-IN',
      customerName: saleData.customerName || 'Retail Customer',
      attendant: saleData.attendant || currentShift.supervisor,
      shiftId: currentShift.id,
      status: 'COMPLETED',
      syncStatus: isOnline ? 'SYNCED' : 'PENDING_OFFLINE'
    };

    // Update Nozzle Totalizer
    setNozzles(prevNozzles =>
      prevNozzles.map(noz => {
        if (noz.id === saleData.nozzleId) {
          return {
            ...noz,
            currentMeter: Number((noz.currentMeter + Number(saleData.liters)).toFixed(2))
          };
        }
        return noz;
      })
    );

    // Decrement Tank Stock
    const targetNozzle = nozzles.find(n => n.id === saleData.nozzleId);
    if (targetNozzle && targetNozzle.tankId) {
      setTanks(prevTanks =>
        prevTanks.map(tank => {
          if (tank.id === targetNozzle.tankId) {
            const newStock = Math.max(0, tank.currentStock - Number(saleData.liters));
            const newAtg = Math.max(0, tank.atgLevel - Number(saleData.liters));
            return {
              ...tank,
              currentStock: Number(newStock.toFixed(2)),
              atgLevel: Number(newAtg.toFixed(2))
            };
          }
          return tank;
        })
      );
    }

    // Decrement Lube Stock
    if (saleData.lubeItems && saleData.lubeItems.length > 0) {
      setLubricants(prevLubes =>
        prevLubes.map(lube => {
          const matchedItem = saleData.lubeItems.find(item => item.id === lube.id);
          if (matchedItem) {
            return {
              ...lube,
              stockQty: Math.max(0, lube.stockQty - matchedItem.qty)
            };
          }
          return lube;
        })
      );
    }

    // Update Shift Totals
    setCurrentShift(prev => {
      const mode = saleData.paymentMode;
      const amt = Number(saleData.totalAmount);
      return {
        ...prev,
        cashCollected: mode === 'CASH' ? prev.cashCollected + amt : prev.cashCollected,
        cardCollected: mode === 'CARD' ? prev.cardCollected + amt : prev.cardCollected,
        upiCollected: mode === 'UPI' ? prev.upiCollected + amt : prev.upiCollected,
        creditIssued: (mode === 'CREDIT' || mode === 'FLEET') ? prev.creditIssued + amt : prev.creditIssued
      };
    });

    // Update Fleet Ledger
    if (saleData.creditAccountId) {
      setFleetAccounts(prevAccounts =>
        prevAccounts.map(acc => {
          if (acc.id === saleData.creditAccountId) {
            return {
              ...acc,
              currentBalance: acc.currentBalance + Number(saleData.totalAmount)
            };
          }
          return acc;
        })
      );
    }

    setTransactions(prev => [newTxn, ...prev]);

    if (!isOnline) {
      setOfflineQueue(prev => [...prev, newTxn]);
    } else {
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.85 } });
    }

    setActiveReceiptModal(newTxn);
    return newTxn;
  };

  // Flag Attendant Cash Shortage
  const recordStaffShortage = (staffId, shortageAmount, shiftId, note) => {
    setStaff(prevStaff =>
      prevStaff.map(st => {
        if (st.id === staffId) {
          const newShortage = (st.totalShortagePending || 0) + Number(shortageAmount);
          const historyEntry = {
            date: new Date().toISOString().split('T')[0],
            shiftId: shiftId || currentShift.id,
            shortage: Number(shortageAmount),
            status: 'UNRECOVERED',
            note: note || 'Cash drop deficit logged at shift closing'
          };
          return {
            ...st,
            totalShortagePending: newShortage,
            shortageHistory: [historyEntry, ...(st.shortageHistory || [])]
          };
        }
        return st;
      })
    );
  };

  // Recover Attendant Shortage (from salary deduction or cash repayment)
  const recoverStaffShortage = (staffId, recoveredAmount, recoveryMode = 'SALARY_DEDUCTION') => {
    setStaff(prevStaff =>
      prevStaff.map(st => {
        if (st.id === staffId) {
          const newShortage = Math.max(0, (st.totalShortagePending || 0) - Number(recoveredAmount));
          return {
            ...st,
            totalShortagePending: newShortage,
            shortageHistory: (st.shortageHistory || []).map(entry => {
              if (entry.status === 'UNRECOVERED') {
                return { ...entry, status: 'RECOVERED_VIA_' + recoveryMode };
              }
              return entry;
            })
          };
        }
        return st;
      })
    );
  };

  // Record Bank Cash Deposit
  const recordBankDeposit = (depositData) => {
    const newDep = {
      id: `DEP-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      bankName: depositData.bankName,
      accountNo: depositData.accountNo,
      amount: Number(depositData.amount),
      depositedBy: depositData.depositedBy || 'Vijay Sharma (Manager)',
      challanNo: depositData.challanNo,
      status: 'CLEARED'
    };
    setBankDeposits(prev => [newDep, ...prev]);
    return newDep;
  };

  // Record Forecourt Petty Cash Expense
  const recordExpense = (expenseData) => {
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      category: expenseData.category,
      amount: Number(expenseData.amount),
      paidTo: expenseData.paidTo,
      approvedBy: expenseData.approvedBy || 'Vijay Sharma (Manager)'
    };
    setForecourtExpenses(prev => [newExp, ...prev]);
    setCurrentShift(prev => ({
      ...prev,
      expenses: prev.expenses + Number(expenseData.amount)
    }));
    return newExp;
  };

  // Calibration Test
  const recordCalibrationTest = (nozzleId, testVolumeL = 5.0, observedVarianceMl = 0) => {
    const targetNozzle = nozzles.find(n => n.id === nozzleId);
    if (!targetNozzle) return;

    const testId = `CAL-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTest = {
      id: testId,
      date: dateStr,
      nozzleId: targetNozzle.id,
      nozzleNumber: targetNozzle.nozzleNumber,
      fuelCode: targetNozzle.fuelCode,
      testMeasureVolumeL: Number(testVolumeL),
      quantityDispensedL: Number(testVolumeL) + (observedVarianceMl / 1000),
      varianceMl: observedVarianceMl,
      toleranceMl: 25,
      status: Math.abs(observedVarianceMl) <= 25 ? 'PASSED' : 'OUT_OF_TOLERANCE',
      pouredBackToTank: targetNozzle.tankId,
      inspector: activeRole.includes('Owner') ? 'Shiva Kumar (Owner)' : 'Vijay Sharma (Manager)',
      weightsAndMeasuresStamp: 'VALID-Q4-2026'
    };

    setNozzles(prev =>
      prev.map(noz => {
        if (noz.id === nozzleId) {
          return {
            ...noz,
            currentMeter: Number((noz.currentMeter + testVolumeL).toFixed(2)),
            testingVolume: Number(((noz.testingVolume || 0) + testVolumeL).toFixed(2))
          };
        }
        return noz;
      })
    );

    setCalibrationTests(prev => [newTest, ...prev]);
    return newTest;
  };

  // Tanker Decantation
  const recordDecantation = (data) => {
    const decId = `DEC-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const converted15 = calculateDensityAt15C(Number(data.observedDensity), Number(data.observedTempC), data.fuelCode);
    const densityVar = Number((converted15 - Number(data.invoiceDensityAt15C)).toFixed(1));
    const shortage = Number(data.invoicedQty) - Number(data.receivedQty);
    const shortagePercent = Number(((shortage / Number(data.invoicedQty)) * 100).toFixed(2));

    const newDec = {
      id: decId,
      invoiceNo: data.invoiceNo,
      tankerTTNo: data.tankerTTNo,
      driverName: data.driverName,
      date: dateStr,
      tankId: data.tankId,
      fuelCode: data.fuelCode,
      fuelName: data.fuelName,
      invoicedQty: Number(data.invoicedQty),
      dipBeforeDecantation: Number(data.dipBeforeDecantation),
      dipAfterDecantation: Number(data.dipAfterDecantation),
      receivedQty: Number(data.receivedQty),
      shortageLiters: shortage,
      shortagePercent,
      invoiceDensityAt15C: Number(data.invoiceDensityAt15C),
      observedTempC: Number(data.observedTempC),
      observedDensity: Number(data.observedDensity),
      convertedDensityAt15C: converted15,
      densityVariance: densityVar,
      status: Math.abs(densityVar) <= 3.0 && shortagePercent <= 0.59 ? 'VERIFIED_OK' : 'VARIANCE_FLAGGED',
      verifiedBy: activeRole.includes('Owner') ? 'Shiva Kumar (Owner)' : 'Vijay Sharma (Manager)'
    };

    setTanks(prev =>
      prev.map(tank => {
        if (tank.id === data.tankId) {
          const addedStock = tank.currentStock + Number(data.receivedQty);
          return {
            ...tank,
            currentStock: addedStock,
            atgLevel: tank.atgLevel + Number(data.receivedQty),
            physicalDipMm: Number(data.dipMmAfter || tank.physicalDipMm + 350),
            densityObserved: Number(data.observedDensity),
            temperatureC: Number(data.observedTempC),
            densityAt15C: converted15,
            lastDipTime: dateStr
          };
        }
        return tank;
      })
    );

    setDecantations(prev => [newDec, ...prev]);
    return newDec;
  };

  // Record Physical Dip with Strapping Table Math
  const recordPhysicalDip = (tankId, physicalDipMm, observedTemp, observedDensity) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const calculatedVol = calculateDipToLiters(tankId, physicalDipMm);

    setTanks(prev =>
      prev.map(tank => {
        if (tank.id === tankId) {
          const converted15 = calculateDensityAt15C(observedDensity, observedTemp, tank.fuelCode);
          return {
            ...tank,
            physicalDipMm: Number(physicalDipMm),
            temperatureC: Number(observedTemp),
            densityObserved: Number(observedDensity),
            densityAt15C: converted15,
            currentStock: calculatedVol,
            lastDipTime: dateStr
          };
        }
        return tank;
      })
    );
  };

  // Update Fuel Prices
  const updateFuelPrice = (fuelCode, newPrice) => {
    const now = new Date();
    const effectiveDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let oldP = 0;
    setFuelPrices(prev =>
      prev.map(item => {
        if (item.code === fuelCode) {
          oldP = item.price;
          return { ...item, price: Number(newPrice) };
        }
        return item;
      })
    );

    setNozzles(prev =>
      prev.map(noz => {
        if (noz.fuelCode === fuelCode) {
          return { ...noz, rate: Number(newPrice) };
        }
        return noz;
      })
    );

    const logEntry = {
      id: `PUL-${Date.now().toString().slice(-6)}`,
      fuelCode,
      oldPrice: oldP,
      newPrice: Number(newPrice),
      effectiveDate,
      updatedBy: activeRole.includes('Owner') ? 'Shiva Kumar (Station Owner)' : 'Vijay Sharma (Manager)'
    };
    setPriceUpdateLog(prev => [logEntry, ...prev]);
  };

  // Fleet Khata Payment Recording
  const recordFleetPayment = (accountId, amount, paymentMode, reference) => {
    setFleetAccounts(prev =>
      prev.map(acc => {
        if (acc.id === accountId) {
          const newBalance = Math.max(0, acc.currentBalance - Number(amount));
          return {
            ...acc,
            currentBalance: newBalance
          };
        }
        return acc;
      })
    );
  };

  // Offline Sync
  const syncOfflineTransactions = () => {
    if (offlineQueue.length === 0) return;
    setTransactions(prev =>
      prev.map(t => ({ ...t, syncStatus: 'SYNCED' }))
    );
    setOfflineQueue([]);
  };

  return (
    <AppContext.Provider
      value={{
        stationInfo,
        activeAppMode,
        setActiveAppMode,
        activePortalFleetId,
        setActivePortalFleetId,
        activeSalesmanId,
        setActiveSalesmanId,
        fuelPrices,
        updateFuelPrice,
        priceUpdateLog,
        tanks,
        recordPhysicalDip,
        calculateDipToLiters,
        recordDecantation,
        decantations,
        dispensers,
        nozzles,
        setNozzles,
        staff,
        setStaff,
        recordStaffShortage,
        recoverStaffShortage,
        bankDeposits,
        recordBankDeposit,
        forecourtExpenses,
        recordExpense,
        currentShift,
        setCurrentShift,
        fleetAccounts,
        recordFleetPayment,
        lubricants,
        setLubricants,
        transactions,
        recordTransaction,
        calibrationTests,
        recordCalibrationTest,
        activeReceiptModal,
        setActiveReceiptModal,
        activeRole,
        setActiveRole,
        activeTab,
        setActiveTab,
        isOnline,
        setIsOnline,
        offlineQueue,
        syncOfflineTransactions,
        iotStatus,
        setIotStatus,
        calculateDensityAt15C
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
