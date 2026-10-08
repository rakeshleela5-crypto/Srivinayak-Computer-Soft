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
  maxPermissibleLossPercent: 0.59 // Standard OMC allowable handling & evaporation loss threshold
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
    temperatureC: 28.5,
    densityObserved: 742.8,
    densityAt15C: 753.2, // Standard reference
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
    fuelName: "High Speed Diesel (Tank B - Heavy Commercial)",
    capacity: 35000,
    currentStock: 14600,
    deadStock: 1800,
    reorderLevel: 7000,
    atgLevel: 14580,
    physicalDipMm: 1390,
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
    fuelName: "CNG Storage Bank",
    capacity: 4500,
    currentStock: 3200,
    deadStock: 300,
    reorderLevel: 800,
    atgLevel: 3200,
    physicalDipMm: 0,
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
    status: "IDLE", // IDLE, DISPENSING, PAUSED
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
    currentMeter: 482215.30, // 115.20 L
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
    currentMeter: 948490.40, // 280.40 L
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
    currentMeter: 812780.80, // 380.55 L
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
    currentMeter: 1540620.50, // 520.50 L
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
    currentMeter: 2411950.00, // 1150.00 L
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
    currentMeter: 345380.20, // 280.20 Kg
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
    currentMeter: 18575.40, // 125.40 kWh
    testingVolume: 0.0,
    status: "IDLE",
    rate: 18.50,
    color: "#8b5cf6"
  }
];

export const INITIAL_STAFF = [
  { id: "staff-1", name: "Ramesh Kumar", role: "Pump Attendant", island: "Island 1", shift: "Morning", phone: "+91 98451 11223", commissionRate: 1.5, active: true },
  { id: "staff-2", name: "Suresh Patil", role: "Pump Attendant", island: "Island 2", shift: "Morning", phone: "+91 98452 22334", commissionRate: 1.5, active: true },
  { id: "staff-3", name: "Ganesh Rao", role: "Senior Attendant", island: "Island 3", shift: "Morning", phone: "+91 98453 33445", commissionRate: 1.5, active: true },
  { id: "staff-4", name: "Manjunath Hegde", role: "CNG Operator", island: "Island 4", shift: "Morning", phone: "+91 98454 44556", commissionRate: 1.2, active: true },
  { id: "staff-5", name: "Vijay Sharma", role: "Station Manager", island: "Control Room", shift: "General", phone: "+91 98455 55667", commissionRate: 0, active: true },
  { id: "staff-6", name: "Shiva Kumar (Owner)", role: "Station Owner", island: "Office", shift: "Executive", phone: "+91 98450 12345", commissionRate: 0, active: true }
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
    currentBalance: 720500, // Approaching credit limit
    billingCycle: "Monthly",
    paymentTermsDays: 20,
    status: "ALERT",
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
    shortagePercent: 0.17, // Well within 0.59% allowance
    invoiceDensityAt15C: 752.5,
    observedTempC: 29.2,
    observedDensity: 742.0,
    convertedDensityAt15C: 752.4, // Match tolerance: +/- 3.0 kg/m3
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
    paymentMode: "UPI", // CASH, CARD, UPI, CREDIT, FLEET
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
    liters: 9.35, // kg
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
    varianceMl: 0, // 0 ml error
    toleranceMl: 25, // Weights & Measures permissible limit +/- 25 ml for 5L conical measure
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
    varianceMl: 5, // +5ml
    toleranceMl: 25,
    status: "PASSED",
    pouredBackToTank: "tank-3",
    inspector: "Vijay Sharma",
    weightsAndMeasuresStamp: "VALID-Q4-2026"
  }
];
