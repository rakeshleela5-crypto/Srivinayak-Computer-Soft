// Comprehensive Initial Station Data for Shree Vinayaka PetroSoft AI Shiva
// Complies with Petroleum Ministry & OMC standard guidelines (IOCL/BPCL/HPCL/Nayara)

export const STATION_INFO = {
  name: "SHREE VINAYAKA PETROSOFT FUEL JUNCTION",
  subtitle: "Indian Oil Corporation Ltd. Retail Outlet",
  roCode: "IOCL-RO-849201",
  dealerCode: "DEALER-SVP-09",
  gstin: "29AAAAA0000A1Z5",
  vatTin: "29783921890",
  address: "NH-48 Bypass, Near Industrial Corridor, Shiva Krupa Complex, Bangalore Rural - 562123",
  phone: "+91 98450 12345 / 080-27901122",
  email: "contact@shreevinayakapetro.com",
  currency: "₹",
  densityStandardTemp: 15, // degrees Celsius standard reference
  maxPermissibleLossPercent: 0.59, // Standard OMC allowable handling & evaporation loss threshold
  // OMC LFR (License Fee Recovery) Rates per KL
  lfrRates: {
    MS: 460.00, // ₹460 per KL
    XP95: 480.00,
    HSD: 390.00  // ₹390 per KL
  },
  // Government / OMC Benchmark Dealer Margins (₹/Litre or ₹/Kg)
  dealerMargins: {
    MS: 3.82,    // ₹3.82 per Liter
    XP95: 4.25,  // ₹4.25 per Liter
    HSD: 2.60,   // ₹2.60 per Liter
    CNG: 3.20,   // ₹3.20 per Kg
    EV: 2.50     // ₹2.50 per kWh
  },
  // Section 194Q Financial Year Cumulative Purchases from OMC (IOCL)
  fyPurchasesOMC: 18450000.00, // ₹1.845 Crores YTD (exceeds ₹50L statutory threshold)
  strictCreditLockDefault: true,
  managerOverridePin: "9999"
};

export const INITIAL_PRICES = [
  { id: "fuel-ms", code: "MS", name: "Motor Spirit (Petrol 91)", price: 102.84, taxPercent: 18, color: "#f97316", unit: "L" },
  { id: "fuel-xp95", code: "XP95", name: "Extra Premium 95", price: 108.40, taxPercent: 18, color: "#ec4899", unit: "L" },
  { id: "fuel-hsd", code: "HSD", name: "High Speed Diesel", price: 89.75, taxPercent: 18, color: "#3b82f6", unit: "L" },
  { id: "fuel-cng", code: "CNG", name: "Compressed Natural Gas", price: 85.50, taxPercent: 12, color: "#10b981", unit: "Kg" },
  { id: "fuel-ev", code: "EV", name: "EV Fast Charger (DC 60kW)", price: 18.50, taxPercent: 18, color: "#8b5cf6", unit: "kWh" }
];

export const INITIAL_TANKS = [
  {
    id: "tank-1",
    tankNumber: "UST-01",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    capacity: 25000,
    currentStock: 18450,
    deadStock: 1200,
    reorderLevel: 5000,
    atgLevel: 18420,
    physicalDipMm: 1640,
    diameterMm: 2500,
    lengthMm: 5200,
    temperatureC: 28.5,
    densityObserved: 742.8,
    densityAt15C: 753.2,
    waterBottomMm: 4,
    lastDipTime: "2026-10-08 06:00",
    color: "#f97316"
  },
  {
    id: "tank-2",
    tankNumber: "UST-02",
    fuelCode: "XP95",
    fuelName: "Extra Premium 95",
    capacity: 15000,
    currentStock: 10800,
    deadStock: 800,
    reorderLevel: 3000,
    atgLevel: 10790,
    physicalDipMm: 1420,
    diameterMm: 2200,
    lengthMm: 4000,
    temperatureC: 28.2,
    densityObserved: 746.1,
    densityAt15C: 756.9,
    waterBottomMm: 2,
    lastDipTime: "2026-10-08 06:00",
    color: "#ec4899"
  },
  {
    id: "tank-3",
    tankNumber: "UST-03",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel (Tank A)",
    capacity: 30000,
    currentStock: 22150,
    deadStock: 1500,
    reorderLevel: 6000,
    atgLevel: 22190,
    physicalDipMm: 1850,
    diameterMm: 2600,
    lengthMm: 5800,
    temperatureC: 29.0,
    densityObserved: 828.4,
    densityAt15C: 837.6,
    waterBottomMm: 5,
    lastDipTime: "2026-10-08 06:00",
    color: "#3b82f6"
  },
  {
    id: "tank-4",
    tankNumber: "UST-04",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel (Tank B - Commercial)",
    capacity: 35000,
    currentStock: 14600,
    deadStock: 1800,
    reorderLevel: 7000,
    atgLevel: 14580,
    physicalDipMm: 1390,
    diameterMm: 2800,
    lengthMm: 5900,
    temperatureC: 29.1,
    densityObserved: 829.1,
    densityAt15C: 838.2,
    waterBottomMm: 3,
    lastDipTime: "2026-10-08 06:00",
    color: "#0284c7"
  },
  {
    id: "tank-5",
    tankNumber: "CNG-CASCADE-01",
    fuelCode: "CNG",
    fuelName: "CNG Cascade Bank",
    capacity: 4500,
    currentStock: 3200,
    deadStock: 300,
    reorderLevel: 800,
    atgLevel: 3200,
    physicalDipMm: 0,
    diameterMm: 0,
    lengthMm: 0,
    pressureBar: 220,
    temperatureC: 27.5,
    densityObserved: 0.72,
    densityAt15C: 0.72,
    waterBottomMm: 0,
    lastDipTime: "2026-10-08 06:00",
    color: "#10b981"
  }
];

export const INITIAL_DISPENSERS = [
  { id: "disp-1", name: "Dispenser 01 (Island 1 - Two Wheeler & Light)", island: "Island 1", model: "Gilbarco Encore 500S", status: "ONLINE" },
  { id: "disp-2", name: "Dispenser 02 (Island 2 - Four Wheeler Cars)", island: "Island 2", model: "Tokheim Quantium 510", status: "ONLINE" },
  { id: "disp-3", name: "Dispenser 03 (Island 3 - Commercial Fleet High-Flow)", island: "Island 3", model: "Wayne Ovation Turbo 120 LPM", status: "ONLINE" },
  { id: "disp-4", name: "Dispenser 04 (Island 4 - Green Clean Fuel)", island: "Island 4", model: "Compac CNG Dual + Delta EV 60kW", status: "ONLINE" }
];

export const INITIAL_NOZZLES = [
  {
    id: "noz-1",
    nozzleNumber: "N-01",
    dispenserId: "disp-1",
    island: "Island 1",
    tankId: "tank-1",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    flowRate: 38,
    openingMeter: 1254820.50,
    currentMeter: 1255140.75, // dispensed 320.25 L this shift
    testingVolume: 10.0, // 2 x 5L calibration pours
    status: "IDLE",
    rate: 102.84,
    color: "#f97316"
  },
  {
    id: "noz-2",
    nozzleNumber: "N-02",
    dispenserId: "disp-1",
    island: "Island 1",
    tankId: "tank-2",
    fuelCode: "XP95",
    fuelName: "XP95 Premium",
    flowRate: 35,
    openingMeter: 482100.10,
    currentMeter: 482215.30,
    testingVolume: 5.0,
    status: "IDLE",
    rate: 108.40,
    color: "#ec4899"
  },
  {
    id: "noz-3",
    nozzleNumber: "N-03",
    dispenserId: "disp-1",
    island: "Island 1",
    tankId: "tank-3",
    fuelCode: "HSD",
    fuelName: "Diesel (HSD)",
    flowRate: 45,
    openingMeter: 948210.00,
    currentMeter: 948490.40,
    testingVolume: 5.0,
    status: "IDLE",
    rate: 89.75,
    color: "#3b82f6"
  },
  {
    id: "noz-4",
    nozzleNumber: "N-04",
    dispenserId: "disp-2",
    island: "Island 2",
    tankId: "tank-1",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    flowRate: 40,
    openingMeter: 812400.25,
    currentMeter: 812780.80,
    testingVolume: 5.0,
    status: "IDLE",
    rate: 102.84,
    color: "#f97316"
  },
  {
    id: "noz-5",
    nozzleNumber: "N-05",
    dispenserId: "disp-2",
    island: "Island 2",
    tankId: "tank-3",
    fuelCode: "HSD",
    fuelName: "Diesel (HSD)",
    flowRate: 45,
    openingMeter: 1540100.00,
    currentMeter: 1540620.50,
    testingVolume: 10.0,
    status: "IDLE",
    rate: 89.75,
    color: "#3b82f6"
  },
  {
    id: "noz-6",
    nozzleNumber: "N-06",
    dispenserId: "disp-3",
    island: "Island 3",
    tankId: "tank-4",
    fuelCode: "HSD",
    fuelName: "Diesel High-Flow",
    flowRate: 90,
    openingMeter: 2410800.00,
    currentMeter: 2411950.00,
    testingVolume: 10.0,
    status: "IDLE",
    rate: 89.75,
    color: "#0284c7"
  },
  {
    id: "noz-7",
    nozzleNumber: "N-07",
    dispenserId: "disp-4",
    island: "Island 4",
    tankId: "tank-5",
    fuelCode: "CNG",
    fuelName: "CNG Fast Fill",
    flowRate: 20,
    openingMeter: 345100.00,
    currentMeter: 345380.20,
    testingVolume: 0.0,
    status: "IDLE",
    rate: 85.50,
    color: "#10b981"
  },
  {
    id: "noz-8",
    nozzleNumber: "N-08",
    dispenserId: "disp-4",
    island: "Island 4",
    tankId: "tank-5",
    fuelCode: "EV",
    fuelName: "EV DC Fast 60kW",
    flowRate: 60,
    openingMeter: 18450.00,
    currentMeter: 18575.40,
    testingVolume: 0.0,
    status: "IDLE",
    rate: 18.50,
    color: "#8b5cf6"
  }
];

export const INITIAL_STAFF = [
  { 
    id: "staff-1", 
    name: "Ramesh Kumar", 
    role: "Pump Attendant", 
    island: "Island 1", 
    shift: "Morning", 
    phone: "+91 98451 11223", 
    commissionRate: 1.5, 
    active: true,
    totalShortagePending: 800.00, // Shortage flagged against Ramesh Kumar (as in PDF page 14)
    shortageHistory: [
      { date: "2026-10-07", shiftId: "SHIFT-20261007-02", calculatedSales: 50000, depositedCash: 49200, shortage: 800, status: "UNRECOVERED", note: "Shift cash bag shortage flagged" }
    ]
  },
  { 
    id: "staff-2", 
    name: "Suresh Patil", 
    role: "Pump Attendant", 
    island: "Island 2", 
    shift: "Morning", 
    phone: "+91 98452 22334", 
    commissionRate: 1.5, 
    active: true,
    totalShortagePending: 150.00,
    shortageHistory: [
      { date: "2026-10-06", shiftId: "SHIFT-20261006-01", calculatedSales: 62400, depositedCash: 62250, shortage: 150, status: "UNRECOVERED", note: "UPI cash exchange variance" }
    ]
  },
  { 
    id: "staff-3", 
    name: "Ganesh Rao", 
    role: "Senior Attendant", 
    island: "Island 3", 
    shift: "Morning", 
    phone: "+91 98453 33445", 
    commissionRate: 1.5, 
    active: true,
    totalShortagePending: 0.00,
    shortageHistory: []
  },
  { 
    id: "staff-4", 
    name: "Manjunath Hegde", 
    role: "CNG Operator", 
    island: "Island 4", 
    shift: "Morning", 
    phone: "+91 98454 44556", 
    commissionRate: 1.2, 
    active: true,
    totalShortagePending: 50.00,
    shortageHistory: [
      { date: "2026-10-05", shiftId: "SHIFT-20261005-01", calculatedSales: 28900, depositedCash: 28850, shortage: 50, status: "UNRECOVERED", note: "Coins shortfall" }
    ]
  },
  { 
    id: "staff-5", 
    name: "Vijay Sharma", 
    role: "Station Manager", 
    island: "Control Room", 
    shift: "General", 
    phone: "+91 98455 55667", 
    commissionRate: 0, 
    active: true,
    totalShortagePending: 0.00,
    shortageHistory: []
  },
  { 
    id: "staff-6", 
    name: "Shiva Kumar (Owner)", 
    role: "Station Owner", 
    island: "Office", 
    shift: "Executive", 
    phone: "+91 98450 12345", 
    commissionRate: 0, 
    active: true,
    totalShortagePending: 0.00,
    shortageHistory: []
  }
];

export const INITIAL_CURRENT_SHIFT = {
  id: "SHIFT-20261008-01",
  shiftNumber: "Shift-1 (Morning)",
  date: "2026-10-08",
  startTime: "06:00 AM",
  endTime: "02:00 PM",
  status: "ACTIVE",
  supervisor: "Vijay Sharma",
  cashCollected: 168450,
  cardCollected: 84200,
  upiCollected: 112350,
  creditIssued: 78500,
  expenses: 1200
};

export const INITIAL_FLEET_ACCOUNTS = [
  {
    id: "fl-01",
    companyName: "Shree Balaji Logistics & Movers",
    contactPerson: "Rajendra Prasad",
    phone: "+91 98860 77112",
    gstin: "29AABCU9603R1ZM",
    creditLimit: 500000,
    currentBalance: 342150,
    billingCycle: "Monthly (1st-30th)",
    paymentTermsDays: 15,
    status: "ACTIVE",
    discountPerLiter: 0.75, // ₹0.75/L contractual fleet rebate
    hardLockEnabled: true, // Strict Credit Limit Hard-Lock
    allowCashAdvance: true, // Driver Kharcha enabled
    maxCashAdvance: 2000, // Up to ₹2,000 cash advance per trip
    vehicles: [
      { plate: "KA-01-AK-4455", type: "BharatBenz Heavy Tipper", driver: "Ramu Gowda", allowedFuel: ["HSD"], dailyQuotaLiters: 350 },
      { plate: "KA-04-MB-1290", type: "Tata Prima 4028.S", driver: "Shankar Lal", allowedFuel: ["HSD"], dailyQuotaLiters: 400 },
      { plate: "KA-51-C-8891", type: "Eicher Pro 3015", driver: "Naveen K", allowedFuel: ["HSD"], dailyQuotaLiters: 200 }
    ]
  },
  {
    id: "fl-02",
    companyName: "Shiva Transport Corporation",
    contactPerson: "Anand Murthy",
    phone: "+91 99001 22889",
    gstin: "29AABCS8810K1ZZ",
    creditLimit: 350000,
    currentBalance: 185600,
    billingCycle: "Fortnightly",
    paymentTermsDays: 10,
    status: "ACTIVE",
    discountPerLiter: 1.00, // ₹1.00/L contractual rebate
    hardLockEnabled: true,
    allowCashAdvance: true,
    maxCashAdvance: 3000,
    vehicles: [
      { plate: "KA-02-AA-9988", type: "Ashok Leyland 2820", driver: "Basavaraj", allowedFuel: ["HSD"], dailyQuotaLiters: 300 },
      { plate: "KA-53-MN-3344", type: "Tata Signa 4825", driver: "Syed Imran", allowedFuel: ["HSD"], dailyQuotaLiters: 450 }
    ]
  },
  {
    id: "fl-03",
    companyName: "City Express Cabs & Travels",
    contactPerson: "Kavitha R",
    phone: "+91 97400 44556",
    gstin: "29AADFC5500J1ZO",
    creditLimit: 150000,
    currentBalance: 68400,
    billingCycle: "Weekly",
    paymentTermsDays: 7,
    status: "ACTIVE",
    discountPerLiter: 0.50, // ₹0.50/L rebate
    hardLockEnabled: true,
    allowCashAdvance: false, // No cash advance for taxi cabs
    maxCashAdvance: 0,
    vehicles: [
      { plate: "KA-05-AG-6712", type: "Toyota Innova Crysta", driver: "Prakash V", allowedFuel: ["HSD"], dailyQuotaLiters: 65 },
      { plate: "KA-01-MJ-8801", type: "Maruti Dzire CNG", driver: "Harish S", allowedFuel: ["CNG", "MS"], dailyQuotaLiters: 30 },
      { plate: "KA-03-NB-4411", type: "Maruti Ertiga CNG", driver: "Dilip Kumar", allowedFuel: ["CNG", "MS"], dailyQuotaLiters: 35 }
    ]
  },
  {
    id: "fl-04",
    companyName: "Apex Infra Roadways Ltd",
    contactPerson: "Col. Sanjeev Nair",
    phone: "+91 94480 33221",
    gstin: "29AACCA9081B1ZU",
    creditLimit: 800000,
    currentBalance: 792500, // Near limit to test hard-lock!
    billingCycle: "Monthly",
    paymentTermsDays: 20,
    status: "ALERT",
    discountPerLiter: 1.25, // ₹1.25/L contractual rebate
    hardLockEnabled: true, // Hard-Lock Active!
    allowCashAdvance: true,
    maxCashAdvance: 2500,
    vehicles: [
      { plate: "KA-04-D-9900", type: "Volvo FMX 460 Dumper", driver: "Mallikarjun", allowedFuel: ["HSD"], dailyQuotaLiters: 500 },
      { plate: "KA-04-D-9901", type: "JCB Excavator 205", driver: "Subhash", allowedFuel: ["HSD"], dailyQuotaLiters: 300 }
    ]
  }
];

export const INITIAL_LUBRICANTS = [
  { id: "lube-1", code: "LUB-4T-1L", name: "SERVO 4T Super 20W-40 (1L)", category: "Bike 4T Engine Oil", brand: "Servo / IOCL", price: 385, stockQty: 48, minReorder: 15, gstPercent: 18 },
  { id: "lube-2", code: "LUB-2T-500", name: "SERVO 2T Supreme (500ml)", category: "Two-Stroke Oil", brand: "Servo / IOCL", price: 165, stockQty: 32, minReorder: 10, gstPercent: 18 },
  { id: "lube-3", code: "LUB-SYN-3.5L", name: "SERVO Futura Synth 5W-30 (3.5L)", category: "Car Synthetic Engine Oil", brand: "Servo / IOCL", price: 1650, stockQty: 18, minReorder: 5, gstPercent: 18 },
  { id: "lube-4", code: "LUB-HSD-5L", name: "SERVO Pride TC 15W-40 (5L)", category: "Heavy Diesel Engine Oil", brand: "Servo / IOCL", price: 1480, stockQty: 24, minReorder: 8, gstPercent: 18 },
  { id: "lube-5", code: "DEF-20L", name: "ClearBlue AdBlue / DEF Bucket (20L)", category: "Diesel Exhaust Fluid", brand: "IOCL Green", price: 950, stockQty: 55, minReorder: 20, gstPercent: 18 },
  { id: "lube-6", code: "COOL-1L", name: "SERVO Kool Plus Coolant (1L)", category: "Radiator Coolant", brand: "Servo / IOCL", price: 240, stockQty: 40, minReorder: 12, gstPercent: 18 },
  { id: "lube-7", code: "BRK-DOT4", name: "SERVO Brake Fluid DOT 4 (250ml)", category: "Brake & Clutch Fluid", brand: "Servo / IOCL", price: 125, stockQty: 30, minReorder: 10, gstPercent: 18 },
  { id: "lube-8", code: "ACC-WASH", name: "3M Car Shampoo Concentrated (500ml)", category: "Car Care & Polish", brand: "3M Retail", price: 310, stockQty: 15, minReorder: 6, gstPercent: 18 }
];

export const INITIAL_BANK_DEPOSITS = [
  { id: "DEP-1008-01", date: "2026-10-08", bankName: "State Bank of India (SBI)", accountNo: "30819284901", amount: 150000, depositedBy: "Vijay Sharma", challanNo: "CHL-SBI-8812", status: "CLEARED" },
  { id: "DEP-1007-02", date: "2026-10-07", bankName: "HDFC Bank Cash Credit", accountNo: "502000849281", amount: 220000, depositedBy: "Vijay Sharma", challanNo: "CHL-HDFC-9914", status: "CLEARED" }
];

export const INITIAL_FORECOURT_EXPENSES = [
  { id: "EXP-1008-01", date: "2026-10-08", category: "Generator Diesel", amount: 650, paidTo: "Station Backup GenSet", approvedBy: "Vijay Sharma" },
  { id: "EXP-1008-02", date: "2026-10-08", category: "Staff Tea & Snacks", amount: 350, paidTo: "Udupi Sri Krishna Hotel", approvedBy: "Vijay Sharma" },
  { id: "EXP-1008-03", date: "2026-10-08", category: "Forecourt Cleaning Materials", amount: 200, paidTo: "Sri Balaji Stores", approvedBy: "Vijay Sharma" }
];

export const INITIAL_INWARD_DECANTATIONS = [
  {
    id: "DEC-20261007-01",
    invoiceNo: "IOCL-INV-998412",
    tankerTTNo: "KA-01-E-7890",
    driverName: "Bhimanna Gowda",
    date: "2026-10-07 14:30",
    tankId: "tank-1",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    invoicedQty: 12000,
    dipBeforeDecantation: 7200,
    dipAfterDecantation: 19180,
    receivedQty: 11980,
    shortageLiters: 20,
    shortagePercent: 0.17,
    invoiceDensityAt15C: 752.5,
    observedTempC: 29.2,
    observedDensity: 742.0,
    convertedDensityAt15C: 752.4,
    densityVariance: -0.1,
    status: "VERIFIED_OK",
    verifiedBy: "Vijay Sharma"
  },
  {
    id: "DEC-20261006-02",
    invoiceNo: "IOCL-INV-997815",
    tankerTTNo: "KA-04-F-3211",
    driverName: "Ranganath",
    date: "2026-10-06 10:15",
    tankId: "tank-3",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel",
    invoicedQty: 20000,
    dipBeforeDecantation: 5400,
    dipAfterDecantation: 25370,
    receivedQty: 19970,
    shortageLiters: 30,
    shortagePercent: 0.15,
    invoiceDensityAt15C: 837.0,
    observedTempC: 28.5,
    observedDensity: 827.8,
    convertedDensityAt15C: 837.2,
    densityVariance: 0.2,
    status: "VERIFIED_OK",
    verifiedBy: "Vijay Sharma"
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-84091",
    receiptNo: "SV-REC-1008-001",
    timestamp: "2026-10-08 06:14:22",
    nozzleId: "noz-1",
    nozzleNumber: "N-01",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    liters: 15.56,
    rate: 102.84,
    fuelAmount: 1600.00,
    lubeItems: [],
    lubeAmount: 0,
    totalAmount: 1600.00,
    paymentMode: "UPI",
    customerVehicle: "KA-04-ME-1122",
    customerName: "Sanjay Gowda",
    attendant: "Ramesh Kumar",
    shiftId: "SHIFT-20261008-01",
    status: "COMPLETED",
    syncStatus: "SYNCED"
  },
  {
    id: "TXN-84092",
    receiptNo: "SV-REC-1008-002",
    timestamp: "2026-10-08 06:32:05",
    nozzleId: "noz-6",
    nozzleNumber: "N-06",
    fuelCode: "HSD",
    fuelName: "Diesel High-Flow",
    liters: 120.00,
    rate: 89.75,
    fuelAmount: 10770.00,
    lubeItems: [{ id: "DEF-20L", name: "ClearBlue AdBlue 20L", qty: 1, price: 950, total: 950 }],
    lubeAmount: 950.00,
    totalAmount: 11720.00,
    paymentMode: "CREDIT",
    creditAccountId: "fl-01",
    customerVehicle: "KA-01-AK-4455",
    driverName: "Ramu Gowda",
    customerName: "Shree Balaji Logistics",
    slipNo: "SLIP-BALAJI-901",
    attendant: "Ganesh Rao",
    shiftId: "SHIFT-20261008-01",
    status: "COMPLETED",
    syncStatus: "SYNCED"
  },
  {
    id: "TXN-84093",
    receiptNo: "SV-REC-1008-003",
    timestamp: "2026-10-08 07:05:40",
    nozzleId: "noz-4",
    nozzleNumber: "N-04",
    fuelCode: "MS",
    fuelName: "Petrol (MS-91)",
    liters: 29.17,
    rate: 102.84,
    fuelAmount: 3000.00,
    lubeItems: [{ id: "lube-1", name: "SERVO 4T Super 1L", qty: 1, price: 385, total: 385 }],
    lubeAmount: 385.00,
    totalAmount: 3385.00,
    paymentMode: "CARD",
    customerVehicle: "KA-53-Z-9002",
    customerName: "Dr. Arvind Rao",
    attendant: "Suresh Patil",
    shiftId: "SHIFT-20261008-01",
    status: "COMPLETED",
    syncStatus: "SYNCED"
  },
  {
    id: "TXN-84094",
    receiptNo: "SV-REC-1008-004",
    timestamp: "2026-10-08 07:42:15",
    nozzleId: "noz-7",
    nozzleNumber: "N-07",
    fuelCode: "CNG",
    fuelName: "CNG Fast Fill",
    liters: 9.35,
    rate: 85.50,
    fuelAmount: 799.43,
    lubeItems: [],
    lubeAmount: 0,
    totalAmount: 800.00,
    paymentMode: "CASH",
    customerVehicle: "KA-05-AG-6712",
    customerName: "City Express Cabs",
    attendant: "Manjunath Hegde",
    shiftId: "SHIFT-20261008-01",
    status: "COMPLETED",
    syncStatus: "SYNCED"
  }
];

export const INITIAL_CALIBRATION_TESTS = [
  {
    id: "CAL-20261008-01",
    date: "2026-10-08 06:10",
    nozzleId: "noz-1",
    nozzleNumber: "N-01",
    fuelCode: "MS",
    testMeasureVolumeL: 5.0,
    quantityDispensedL: 5.0,
    varianceMl: 0,
    toleranceMl: 25,
    status: "PASSED",
    pouredBackToTank: "tank-1",
    inspector: "Vijay Sharma",
    weightsAndMeasuresStamp: "VALID-Q4-2026"
  },
  {
    id: "CAL-20261008-02",
    date: "2026-10-08 06:12",
    nozzleId: "noz-5",
    nozzleNumber: "N-05",
    fuelCode: "HSD",
    testMeasureVolumeL: 5.0,
    quantityDispensedL: 5.005,
    varianceMl: 5,
    toleranceMl: 25,
    status: "PASSED",
    pouredBackToTank: "tank-3",
    inspector: "Vijay Sharma",
    weightsAndMeasuresStamp: "VALID-Q4-2026"
  }
];

export const INITIAL_LOYALTY_CUSTOMERS = [
  { id: "loy-1", name: "Rahul S. Verma", phone: "+91 98450 11223", vehicleNo: "KA-04-MB-4512", points: 340, tier: "GOLD", totalLiters: 3400, lastVisit: "2026-10-08" },
  { id: "loy-2", name: "Dr. Priya Patel", phone: "+91 99800 22334", vehicleNo: "KA-01-EQ-9011", points: 180, tier: "SILVER", totalLiters: 1800, lastVisit: "2026-10-07" },
  { id: "loy-3", name: "Kiran Gowda", phone: "+91 97420 55667", vehicleNo: "KA-03-JJ-3344", points: 620, tier: "PLATINUM", totalLiters: 6200, lastVisit: "2026-10-08" },
  { id: "loy-4", name: "Suresh Babu", phone: "+91 94481 99001", vehicleNo: "KA-05-D-8821", points: 95, tier: "SILVER", totalLiters: 950, lastVisit: "2026-10-06" }
];

export const INITIAL_AUTOMATED_ALERTS = [
  {
    id: "alt-01",
    type: "WHATSAPP",
    recipient: "Ramesh Hegde (Dealer Owner)",
    phone: "+91 98450 99881",
    category: "DAILY_SETTLEMENT",
    subject: "Shift 1 Close Financial Summary",
    message: "⛽ *SHREE VINAYAKA PETROSOFT AI SHIVA*\n📋 *Shift 1 Closing Alert*\n• Total Liters: 3,925.35 L\n• Gross Sales: ₹3,75,400\n• Cash In Hand: ₹1,85,200\n• Credit Slips: ₹1,25,400\n• UPI / Digital: ₹64,800\n• Shortage: ₹200 (Raju M)\n• Dip Stock: 41,200 L\nStatus: BALANCED (Audit Passed)",
    timestamp: "2026-10-08 14:02",
    status: "SENT"
  },
  {
    id: "alt-02",
    type: "WHATSAPP",
    recipient: "Col. Sanjeev Nair (Apex Infra)",
    phone: "+91 94480 33221",
    category: "CREDIT_LIMIT",
    subject: "Credit Limit Utilization Alert (90%)",
    message: "⚠️ *SHREE VINAYAKA PETROSOFT - CREDIT ALERT*\nDear Apex Infra Roadways,\nYour credit outstanding has reached *₹7,20,500* against sanctioned limit of *₹8,00,000* (90.1% utilized).\nPlease remit bank NEFT/RTGS to avoid dispensing hold on fleet KA-04-D-9900.",
    timestamp: "2026-10-08 11:15",
    status: "SENT"
  },
  {
    id: "alt-03",
    type: "SMS",
    recipient: "Vijay Sharma (Forecourt Manager)",
    phone: "+91 98450 12345",
    category: "LOW_STOCK",
    subject: "Tank Low Stock Warning",
    message: "🚨 SVP ALERT: Tank 2 (HSD Diesel) dip reading 2,960 L (14.8% capacity). Reorder TT tanker immediately from IOCL terminal.",
    timestamp: "2026-10-08 09:30",
    status: "DELIVERED"
  }
];

export const INITIAL_DIGITAL_INDENTS = [
  {
    id: "IND-801",
    indentNumber: "IND-2026-801",
    fleetId: "fl-01",
    companyName: "Shree Balaji Logistics & Movers",
    vehiclePlate: "KA-01-AK-4455",
    driverName: "Ramu Gowda",
    driverPhone: "+91 98450 11223",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel",
    maxLiters: 150,
    maxAmount: 13462.50,
    cashAdvanceKharcha: 1000.00, // Pre-authorized Driver Cash Advance / Kharcha
    createdAt: "2026-10-08 08:30",
    expiresAt: "2026-10-09 08:30",
    status: "ACTIVE",
    securityPin: "4829",
    qrPayload: "INDENT|fl-01|KA-01-AK-4455|HSD|150|1000|4829",
    notes: "Highway long-haul Bangalore-Pune route (₹1,000 toll kharcha authorized)"
  },
  {
    id: "IND-802",
    indentNumber: "IND-2026-802",
    fleetId: "fl-02",
    companyName: "Shiva Transport Corporation",
    vehiclePlate: "KA-02-AA-9988",
    driverName: "Basavaraj",
    driverPhone: "+91 97654 32109",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel",
    maxLiters: 100,
    maxAmount: 8975.00,
    cashAdvanceKharcha: 500.00,
    createdAt: "2026-10-08 09:15",
    expiresAt: "2026-10-09 09:15",
    status: "ACTIVE",
    securityPin: "7391",
    qrPayload: "INDENT|fl-02|KA-02-AA-9988|HSD|100|500|7391",
    notes: "Interstate delivery transit (₹500 driver food kharcha)"
  },
  {
    id: "IND-803",
    indentNumber: "IND-2026-803",
    fleetId: "fl-04",
    companyName: "Apex Infra Roadways",
    vehiclePlate: "KA-04-D-9900",
    driverName: "Mallikarjun",
    driverPhone: "+91 94480 44556",
    fuelCode: "HSD",
    fuelName: "High Speed Diesel",
    maxLiters: 200,
    maxAmount: 17950.00,
    cashAdvanceKharcha: 1500.00,
    createdAt: "2026-10-07 14:00",
    expiresAt: "2026-10-08 14:00",
    status: "REDEEMED",
    securityPin: "1940",
    qrPayload: "INDENT|fl-04|KA-04-D-9900|HSD|200|1500|1940",
    redeemedReceipt: "SV-REC-892102",
    notes: "Quarry dumper fuel allocation + ₹1,500 advance"
  }
];

export const TRANSLATIONS = {
  en: {
    brandName: "SHREE VINAYAKA PETROSOFT",
    dealerApp: "Dealer App",
    managerApp: "Manager App",
    salesmanApp: "Salesman App",
    creditCustomerApp: "Credit Customer App",
    forecourtMonitor: "Forecourt Monitor",
    posBilling: "Forecourt POS Billing",
    nozzlesTotalizers: "Nozzles & Totalizers",
    wetStockDip: "Wet-Stock & ATG Dip",
    fleetKhata: "Fleet & Khata Credit",
    shiftsHandover: "Shifts & Handover",
    lubesNonFuel: "Lubes & Non-Fuel",
    dailySettlement: "Daily Settlement (DSS)",
    iotPulse: "IoT Pulse & Sensors",
    mismatchRadar: "5-Step Mismatch Radar",
    loyaltyClub: "Customer Loyalty",
    whatsappAlerts: "WhatsApp & SMS Center",
    quickTender: "Quick Tender",
    fullTank: "Full Tank",
    dispenseFuel: "Dispense Fuel",
    cashInHand: "Cash In Hand",
    totalizerReading: "Meter Reading",
    shortageAlert: "Shortage Alert",
    offlineMode: "Offline Forecourt Ready",
    driverKharcha: "Driver Cash Advance (Kharcha)",
    creditLimitLock: "Credit Limit Hard-Lock",
    transporterRebate: "Transporter Discount (₹/L)",
    dayBook2Page: "2-Page Petroleum Day Book",
    lfrTdsReport: "LFR & TDS 10%/2% Report",
    dealerMarginReport: "Per-Liter Margin & Profit",
    section194QReport: "Section 194Q TDS (0.1%)",
    tallyXmlExport: "Tally Prime XML & CA Export"
  },
  hi: {
    brandName: "श्री विनायक पेट्रोसॉफ्ट",
    dealerApp: "डीलर ऐप (मालिक)",
    managerApp: "मैनेजर ऐप",
    salesmanApp: "सेल्समैन ऐप",
    creditCustomerApp: "क्रेडिट ग्राहक पोर्टल",
    forecourtMonitor: "फोरकोर्ट मॉनिटर",
    posBilling: "फोरकोर्ट पीओएस बिलिंग",
    nozzlesTotalizers: "नोजल व मीटर रीडिंग",
    wetStockDip: "टैंक डिप व स्टॉक",
    fleetKhata: "खाता व फ्लीट क्रेडिट",
    shiftsHandover: "शिफ्ट व हैंडओवर",
    lubesNonFuel: "इंजन ऑयल व ल्यूब्स",
    dailySettlement: "दैनिक हिसाब (DSS)",
    iotPulse: "आईओटी सेंसर",
    mismatchRadar: "5-स्टेप स्टॉक मिलान रडार",
    loyaltyClub: "ग्राहक लॉयल्टी क्लब",
    whatsappAlerts: "व्हाट्सएप व एसएमएस अलर्ट",
    quickTender: "त्वरित भुगतान",
    fullTank: "फुल टैंक",
    dispenseFuel: "ईंधन भरें",
    cashInHand: "नकद संकलन",
    totalizerReading: "मीटर रीडिंग",
    shortageAlert: "कमी / शॉर्टेज चेतावनी",
    offlineMode: "ऑफलाइन मोड सक्रिय",
    driverKharcha: "ड्राइवर नकद खर्चा (कैश एडवांस)",
    creditLimitLock: "क्रेडिट लिमिट हार्ड-लॉक",
    transporterRebate: "ट्रांसपोर्टर डिस्काउंट (₹/ली)",
    dayBook2Page: "2-पेज पेट्रोलियम डे बुक",
    lfrTdsReport: "LFR व TDS 10%/2% रिपोर्ट",
    dealerMarginReport: "डीलर मार्जिन व दैनिक लाभ",
    section194QReport: "धारा 194Q टीडीएस (0.1%)",
    tallyXmlExport: "टैली प्राइम XML व CA डेटा"
  }
};

