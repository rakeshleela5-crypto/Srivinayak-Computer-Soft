# 🚀 Cloudflare Pages Deployment Guide
## SHREE VINAYAKA PETROSOFT AI SHIVA

This system is built from the ground up to deploy natively to **Cloudflare Pages** with **Pages Functions (Serverless Edge API)** and **Cloudflare D1 (Edge SQLite Database)** as specified in the engineering blueprint.

---

### 1. Local Edge Emulation (Already Running & Verified)

You can run both the frontend and the Cloudflare edge functions locally using:

```bash
# 1. Build the production assets
npm run build

# 2. Run the Cloudflare Pages edge emulator (functions + D1 + static assets)
npm run pages:dev
```
Local endpoint: `http://127.0.0.1:8788`

---

### 2. One-Command Deploy to Live Cloudflare Pages

To deploy directly to your Cloudflare account using Wrangler:

```bash
# Log in to your Cloudflare account
npx wrangler login

# Deploy the build to Cloudflare Pages
npx wrangler pages deploy dist --project-name=shree-vinayaka-petrosoft
```

---

### 3. Setting up Cloudflare D1 Database on Cloudflare

1. Create the remote D1 database:
```bash
npx wrangler d1 create petrosoft_edge_db
```

2. Copy the `database_id` output and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "petrosoft_edge_db"
database_id = "YOUR_CLOUDFLARE_D1_DATABASE_ID"
```

3. Initialize the schema and seed the initial station data:
```bash
# Apply schema
npx wrangler d1 execute petrosoft_edge_db --remote --file=./schema.sql

# Seed initial forecourt data
npx wrangler d1 execute petrosoft_edge_db --remote --file=./seed.sql
```

---

### 4. Deploying via GitHub to Cloudflare Pages Dashboard

1. Push this repository to GitHub.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select your repository.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Bind the D1 Database:
   - Go to your Pages project **Settings** > **Functions** > **D1 Database bindings**.
   - Add binding named **`DB`** linked to `petrosoft_edge_db`.
5. Click **Save and Deploy**.

---

### 5. Verified Cloudflare Edge API Endpoints

- `GET  /api/billing` — Live transaction history from edge D1
- `POST /api/billing` — Process forecourt transaction, decrement tank stock, validate fleet credit
- `GET  /api/shifts` — Current active shift, cashier totals, cash bag status
- `POST /api/shifts` — Digital dual sign-off shift handover with cash surplus/shortage computation
- `GET  /api/tanks` — Real-time underground storage tank levels, dip mm vs ATG ultrasonic gauge
- `POST /api/tanks` — Inward tanker decantation with ASTM 53B 15°C conversion & 0.59% permissible loss check
- `POST /api/telemetry` — Live webhook endpoint for ESP32 ATG probes and RS-485 serial pump pulses
- `GET  /api/settlement` — Daily Settlement Sheet (DSS) edge reconciliation report
