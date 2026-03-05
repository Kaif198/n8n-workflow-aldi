# ALDI SÜD Supply Chain Intelligence Pipeline

Automated supply chain data pipeline with n8n workflow orchestration, Neon PostgreSQL, and a React operations dashboard.

## Live Deployment

| Service | URL |
|---------|-----|
| **Dashboard** | [n8n-workflow-aldi.vercel.app](https://n8n-workflow-aldi.vercel.app) |
| **Webhook Endpoint** | `POST https://kaif198.app.n8n.cloud/webhook/supply-chain-ingest` |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────────────┐
│  Supplier Data   │────▶│  n8n Workflow (Railway)                     │
│  (Webhook/CSV)   │     │                                             │
└─────────────────┘     │  ┌─────────┐  ┌───────────┐  ┌──────────┐  │
                        │  │ Ingest  │─▶│ Normalise │─▶│ Validate │  │
                        │  └─────────┘  └───────────┘  └──────────┘  │
                        │                                    │        │
                        │  ┌─────────┐  ┌───────────┐  ┌────▼─────┐  │
                        │  │  Alert  │◀─│   Store   │◀─│ Enrich   │  │
                        │  └─────────┘  └───────────┘  └──────────┘  │
                        └──────────────────┬──────────────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │ Neon Postgres│
                                    │ (Serverless) │
                                    └──────┬──────┘
                                           │
                                    ┌──────▼──────┐
                                    │  Dashboard   │
                                    │  (Vercel)    │
                                    └─────────────┘
```

---

## Technology Stack

| Layer            | Technology               |
|------------------|--------------------------|
| Orchestration    | n8n (self-hosted)        |
| Database         | Neon PostgreSQL          |
| Frontend         | React + Vite             |
| Styling          | Tailwind CSS             |
| Charts           | Recharts                 |
| n8n Hosting      | Railway                  |
| Dashboard Hosting| Vercel                   |

---

## Railway Deployment (n8n)

### 1. Create a Railway Project

- Go to [railway.app](https://railway.app) and create a new project
- Add a new service using the official n8n Docker image: `n8nio/n8n`

### 2. Set Environment Variables

Set the following environment variables in the Railway service:

| Variable                   | Description                        |
|----------------------------|------------------------------------|
| `N8N_BASIC_AUTH_ACTIVE`    | `true`                             |
| `N8N_BASIC_AUTH_USER`      | Your n8n admin username            |
| `N8N_BASIC_AUTH_PASSWORD`  | Your n8n admin password            |
| `DB_TYPE`                  | `postgresdb`                       |
| `DB_POSTGRESDB_HOST`       | Neon host (e.g. `ep-xxx.us-east-2.aws.neon.tech`) |
| `DB_POSTGRESDB_DATABASE`   | Neon database name                 |
| `DB_POSTGRESDB_USER`       | Neon username                      |
| `DB_POSTGRESDB_PASSWORD`   | Neon password                      |
| `N8N_SMTP_HOST`            | SMTP server hostname               |
| `N8N_SMTP_PORT`            | SMTP port (typically `587`)        |
| `N8N_SMTP_USER`            | SMTP account username              |
| `N8N_SMTP_PASSWORD`        | SMTP account password              |
| `N8N_SMTP_SENDER`          | From address for alert emails      |
| `N8N_ALERT_RECIPIENT`      | To address for CRITICAL alerts     |

### 3. Deploy and Import Workflow

1. Deploy the service on Railway
2. Open the n8n web UI via the Railway-provided URL
3. Go to **Workflows → Import from File**
4. Upload `workflow.json` from this repository
5. Configure the **Neon Postgres** credential in n8n (Settings → Credentials)
6. Activate the workflow

The webhook URL will be: `https://kaif198.app.n8n.cloud/webhook/supply-chain-ingest`

---

## Vercel Deployment (Dashboard)

### 1. Connect Repository

- Go to [vercel.com](https://vercel.com) and import this repository
- Set the **Root Directory** to `dashboard`
- Framework Preset: **Vite**

### 2. Set Environment Variable

| Variable                    | Description                                  |
|-----------------------------|----------------------------------------------|
| `VITE_NEON_CONNECTION_STRING` | Full Neon connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`) |

### 3. Deploy

Click Deploy. The dashboard will be available at your Vercel URL.

---

## Database Setup

Run the `seed.sql` file against your Neon PostgreSQL database to create tables and insert seed data:

```bash
psql "postgresql://user:password@host/database?sslmode=require" -f seed.sql
```

This creates:
- `pipeline_runs` — pipeline run log
- `pipeline_records` — individual records (clean + flagged)
- `supplier_reference` — supplier lookup table for enrichment
- Seed data: 5 runs, 32 records, 5 suppliers

---

## Webhook Payload Format

**Endpoint:** `POST https://kaif198.app.n8n.cloud/webhook/supply-chain-ingest`

**Content-Type:** `application/json`

**Payload structure:**

```json
{
  "supplier_id": "SUP-AT-001",
  "records": [
    {
      "sku_code": "AT100250",
      "delivery_date": "2026-03-15",
      "weight_kg": 450.5,
      "lead_time_days": 5,
      "origin_country": "AT"
    },
    {
      "sku_code": "AT100251",
      "delivery_date": "2026-03-18",
      "weight_kg": 320.0,
      "lead_time_days": 18,
      "origin_country": "AT"
    }
  ]
}
```

**Example curl command:**

```bash
curl -X POST https://kaif198.app.n8n.cloud/webhook/supply-chain-ingest \
  -H "Content-Type: application/json" \
  -d '{
    "supplier_id": "SUP-AT-001",
    "records": [
      {
        "sku_code": "AT100250",
        "delivery_date": "2026-03-15",
        "weight_kg": 450.5,
        "lead_time_days": 5,
        "origin_country": "AT"
      },
      {
        "sku_code": "AT100251",
        "delivery_date": "2026-03-18",
        "weight_kg": 320.0,
        "lead_time_days": 18,
        "origin_country": "AT"
      }
    ]
  }'
```

**Success response (200):**

```json
{
  "status": "success",
  "runId": "RUN-20260305-A1B2C",
  "totalRecords": 2,
  "cleanRecords": 1,
  "flaggedRecords": 1,
  "criticalFlags": 1,
  "duration_ms": 1240
}
```

---

## CSV Format (Manual Trigger)

The manual trigger in n8n accepts CSV files with the following **exact** column headers:

| CSV Column Header  | Internal Field Name | Description                     |
|--------------------|---------------------|---------------------------------|
| `Supplier_ID`      | `supplier_id`       | Supplier identifier             |
| `SKU_Code`         | `sku_code`          | Product SKU (e.g. `AT100234`)   |
| `Delivery_Date`    | `delivery_date`     | ISO 8601 date (e.g. `2026-03-15`) |
| `Weight_KG`        | `weight_kg`         | Weight in kilograms             |
| `Lead_Time_Days`   | `lead_time_days`    | Lead time in days (1-14)        |
| `Origin_Country`   | `origin_country`    | ISO 3166-1 alpha-2 code (e.g. `AT`) |

**All six columns must be present.** If any header is missing, the entire CSV run is rejected.

**Example CSV:**

```csv
Supplier_ID,SKU_Code,Delivery_Date,Weight_KG,Lead_Time_Days,Origin_Country
SUP-AT-001,AT100250,2026-03-15,450.5,5,AT
SUP-AT-001,AT100251,2026-03-18,320.0,18,AT
SUP-AT-001,AT100252,2026-03-20,180.2,7,DE
```

---

## Validation Rules

| Rule | Field | Condition | Severity |
|------|-------|-----------|----------|
| 1 | `delivery_date` | Valid ISO 8601, not >90 days past | HIGH |
| 2 | `weight_kg` | Positive number > 0 | HIGH |
| 3 | `sku_code` | Non-empty, matches `[A-Z]{2}[0-9]{6}` | LOW |
| 4 | `lead_time_days` | Integer 1-14 (>14 = CRITICAL) | CRITICAL |
| 5 | `origin_country` | 2-char ISO 3166-1 alpha-2 | MEDIUM |
| 6 | `supplier_id` | Present and non-null | HIGH |

---

## Repository Structure

```
/
  README.md
  workflow.json
  seed.sql
  /dashboard
    index.html
    vite.config.js
    package.json
    /src
      main.jsx
      App.jsx
      index.css
      /views
        Overview.jsx
        SupplierPerformance.jsx
        RunDetail.jsx
      /components
        NavBar.jsx
        KPITile.jsx
        RunsTable.jsx
        FlagsTable.jsx
        StatusBadge.jsx
      /lib
        db.js
        formatters.js
```
 Created by: Mohammed Kaif Ahmed
