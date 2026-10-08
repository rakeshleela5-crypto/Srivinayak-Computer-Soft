# SHREE VINAYAKA PETROSOFT AI SHIVA
## Enterprise Petrol Pump Management System & Edge Cloudflare Pages Architecture

An edge-native, offline-first Petroleum Forecourt Automation & Point of Sale (POS) system designed for Indian Oil Corporation Ltd (IOCL), BPCL, HPCL, and Nayara retail outlets. Built using the engineering blueprint from `petrol_pump_software_guide.pdf`.

---

## 🌟 Six Core Operational Pillars Implemented

### 1. Fuel Dispensing & Nozzle Operations
- **Nozzle-to-Tank Mapping**: 8 physical nozzles mapped across 4 forecourt islands to underground storage tanks (Petrol MS-91, Extra Premium XP95, High Speed Diesel HSD, CNG Cascade, and DC Fast EV 60kW).
- **Meter & Mechanical Totalizer Readings**: Shift-opening and closing counter readings to calculate actual volume dispensed versus sold.
- **Weights & Measures (W&M) 5-Liter Calibration Tests**: Non-sale nozzle calibration pours verified with ±25 ml tolerance and poured back into storage tanks without registering as sales revenue.
- **Dynamic Board Re-Pricing**: Scheduled price updates with audit history and timestamps.

### 2. Tank Inventory & Wet-Stock Management
- **Physical Dip Stick vs. ATG Ultrasonic Sensor**: Compares physical brass dip chart readings against automated electronic probe outputs.
- **Permissible Loss & Evaporation Limits**: Real-time handling loss verification against standard OMC allowable loss threshold (< 0.59%).
- **Inward Tanker Decantation Logistics**: Inward TT reception tracking, challan vs received volume, and ASTM 53B hydrometer density conversion standardized to 15°C.
- **Safety Margins**: Dead-stock buffer warnings and reorder alerts.

### 3. Point of Sale (POS) & Payment Handling
- **Multi-Tender Checkout**: Instant billing with split support for Cash Bag, Bank Cards, Dynamic UPI / QR Scan, and Fleet Khata Credit.
- **Credit / Fleet Accounts**: Corporate credit limits, authorized vehicle license plates, driver indent slips, and 30/60/90 day aging balances.
- **Thermal Receipt Printing**: 58mm / 80mm ESC/POS thermal receipt formatting with pump details, vehicle numbers, and tax breakdown.

### 4. Employee & Shift Operations
- **Island Bay Rostering**: Forecourt attendant assignments (Morning, Evening, Night).
- **Shift Cash Drop Reconciliation**: Operator cash collected compared against calculated nozzle sales, automatically flagging surpluses or shortages.
- **Digital Handover Protocol**: Dual digital sign-off between outgoing and incoming pump operators.

### 5. Non-Fuel Retail (Lubes & Convenience)
- **Packaged Lubes Master**: 2T/4T engine oils (Servo / Castrol), AdBlue / DEF buckets, coolants, brake fluids, and accessories.
- **Bundled Forecourt Billing**: Simultaneously bill fuel and packaged oils on a single GST invoice.

### 6. Daily Settlement Sheet (DSS) & Tax Compliance
- **Petroleum Master DSS**: Balance sheet reconciling `Opening Stock + Inward Receipts - 5L Testing Deductions - Totalizer Sales = Closing Book Stock vs Actual Dip Stock`.
- **Statutory VAT / GST Breakdown**: Tax audit reports and one-click CSV export formatted for Tally ERP / SAP integration.

---

## ⚡ Cloudflare Pages Edge Architecture

```
┌────────────────────────────────────────────────────────┐
│                   CLOUDFLARE PLATFORM                  │
│                                                        │
│  [Browser / PWA] ───> Cloudflare Pages (React / Vite)   │
│                            │                           │
│                            ▼                           │
│                   Pages Edge Functions                 │
│         (/api/billing, /api/shifts, /api/tanks, etc.)  │
│                            │                           │
│                            ▼                           │
│              Cloudflare D1 (Edge SQLite DB)            │
└────────────────────────────────────────────────────────┘
                             ▲
                             │ HTTPS Webhooks / JSON
              ┌──────────────┴──────────────┐
              │    LOCAL FORECOURT BRIDGE   │
              │                             │
              │  ESP32 Ultrasonic Probes    │
              │  RS-485 Serial Dispensers   │
              └─────────────────────────────┘
```

- **Cloudflare Pages Functions**: Serverless edge handlers in `/functions/api/` with sub-15ms execution latency.
- **Cloudflare D1 Database**: Edge SQLite database (`schema.sql`) providing ACID transactional guarantees.
- **Offline-First PWA**: Browser IndexedDB caching allowing uninterrupted forecourt fueling during internet or network dropouts.

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start Vite live development
npm run dev

# Start local Cloudflare Pages Edge Emulator (Pages Functions + D1 + Assets)
npm run pages:dev
```
The application runs locally on:
- Vite Dev Server: `http://localhost:5173`
- Cloudflare Pages Edge Emulator: `http://127.0.0.1:8788`
