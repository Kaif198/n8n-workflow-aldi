-- ============================================================
-- ALDI SUD Supply Chain Intelligence Pipeline — Seed Script
-- ============================================================

-- 1. Schema
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id        TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supplier_id   TEXT NOT NULL,
  supplier_name TEXT,
  total_records INTEGER NOT NULL DEFAULT 0,
  clean_records INTEGER NOT NULL DEFAULT 0,
  flagged_records INTEGER NOT NULL DEFAULT 0,
  duration_ms   INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_records (
  record_id      TEXT PRIMARY KEY,
  run_id         TEXT NOT NULL REFERENCES pipeline_runs(run_id),
  supplier_id    TEXT NOT NULL,
  sku_code       TEXT,
  delivery_date  DATE,
  weight_kg      NUMERIC,
  lead_time_days INTEGER,
  origin_country TEXT,
  status         TEXT NOT NULL CHECK (status IN ('clean', 'flagged')),
  flag_reason    TEXT,
  flag_severity  TEXT CHECK (flag_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier reference table (for Stage 4 enrichment)
CREATE TABLE IF NOT EXISTS supplier_reference (
  supplier_id   TEXT PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  region        TEXT NOT NULL,
  country       TEXT NOT NULL
);

-- 2. Supplier Reference Data
-- --------------------------------------------------------

INSERT INTO supplier_reference (supplier_id, supplier_name, region, country) VALUES
  ('SUP-AT-001', 'Alpenfrische GmbH',        'Central Europe', 'AT'),
  ('SUP-DE-002', 'Rheinland Logistik AG',     'Western Europe', 'DE'),
  ('SUP-NL-003', 'HollandFresh B.V.',         'Benelux',        'NL'),
  ('SUP-FR-004', 'Provence Distribution SAS',  'Southern Europe','FR'),
  ('SUP-IT-005', 'Adige Alimentari S.r.l.',   'Southern Europe', 'IT')
ON CONFLICT (supplier_id) DO NOTHING;

-- 3. Pipeline Runs (5 runs across 4 suppliers, over two days)
-- --------------------------------------------------------

INSERT INTO pipeline_runs (run_id, created_at, supplier_id, supplier_name, total_records, clean_records, flagged_records, duration_ms) VALUES
  ('RUN-20260305-001', '2026-03-05 08:12:00+01', 'SUP-AT-001', 'Alpenfrische GmbH',        8, 6, 2, 1240),
  ('RUN-20260305-002', '2026-03-05 09:45:00+01', 'SUP-DE-002', 'Rheinland Logistik AG',     7, 5, 2, 980),
  ('RUN-20260305-003', '2026-03-05 14:30:00+01', 'SUP-NL-003', 'HollandFresh B.V.',         6, 6, 0, 870),
  ('RUN-20260304-001', '2026-03-04 10:00:00+01', 'SUP-FR-004', 'Provence Distribution SAS', 5, 3, 2, 1100),
  ('RUN-20260304-002', '2026-03-04 16:20:00+01', 'SUP-AT-001', 'Alpenfrische GmbH',        6, 4, 2, 1350)
ON CONFLICT (run_id) DO NOTHING;

-- 4. Pipeline Records (32 records — mix of clean and flagged)
-- --------------------------------------------------------

-- === RUN-20260305-001  (SUP-AT-001, Alpenfrische GmbH) ===
INSERT INTO pipeline_records (record_id, run_id, supplier_id, sku_code, delivery_date, weight_kg, lead_time_days, origin_country, status, flag_reason, flag_severity, created_at) VALUES
  ('REC-001', 'RUN-20260305-001', 'SUP-AT-001', 'AT100234', '2026-03-12', 450.5,  5,  'AT', 'clean',   NULL, NULL, '2026-03-05 08:12:01+01'),
  ('REC-002', 'RUN-20260305-001', 'SUP-AT-001', 'AT100235', '2026-03-14', 320.0,  3,  'AT', 'clean',   NULL, NULL, '2026-03-05 08:12:01+01'),
  ('REC-003', 'RUN-20260305-001', 'SUP-AT-001', 'AT100236', '2026-03-10', 180.2,  7,  'AT', 'clean',   NULL, NULL, '2026-03-05 08:12:01+01'),
  ('REC-004', 'RUN-20260305-001', 'SUP-AT-001', 'AT100237', '2026-03-11', 520.8,  4,  'DE', 'clean',   NULL, NULL, '2026-03-05 08:12:02+01'),
  ('REC-005', 'RUN-20260305-001', 'SUP-AT-001', 'AT100238', '2026-03-18', 275.0, 10,  'AT', 'clean',   NULL, NULL, '2026-03-05 08:12:02+01'),
  ('REC-006', 'RUN-20260305-001', 'SUP-AT-001', 'AT100239', '2026-03-20', 410.3,  6,  'AT', 'clean',   NULL, NULL, '2026-03-05 08:12:02+01'),
  -- CRITICAL: lead_time_days = 18 exceeds 14-day SLA
  ('REC-007', 'RUN-20260305-001', 'SUP-AT-001', 'AT100240', '2026-03-25', 390.0, 18,  'AT', 'flagged', 'lead_time_days exceeds 14-day SLA limit (value: 18)', 'CRITICAL', '2026-03-05 08:12:03+01'),
  -- LOW: SKU format invalid
  ('REC-008', 'RUN-20260305-001', 'SUP-AT-001', 'at-bad',   '2026-03-15', 200.0,  5,  'AT', 'flagged', 'sku_code does not match pattern [A-Z]{2}[0-9]{6}', 'LOW', '2026-03-05 08:12:03+01')
ON CONFLICT (record_id) DO NOTHING;

-- === RUN-20260305-002  (SUP-DE-002, Rheinland Logistik AG) ===
INSERT INTO pipeline_records (record_id, run_id, supplier_id, sku_code, delivery_date, weight_kg, lead_time_days, origin_country, status, flag_reason, flag_severity, created_at) VALUES
  ('REC-009', 'RUN-20260305-002', 'SUP-DE-002', 'DE200100', '2026-03-13', 610.0,  4,  'DE', 'clean',   NULL, NULL, '2026-03-05 09:45:01+01'),
  ('REC-010', 'RUN-20260305-002', 'SUP-DE-002', 'DE200101', '2026-03-14', 540.5,  6,  'DE', 'clean',   NULL, NULL, '2026-03-05 09:45:01+01'),
  ('REC-011', 'RUN-20260305-002', 'SUP-DE-002', 'DE200102', '2026-03-16', 480.0,  3,  'DE', 'clean',   NULL, NULL, '2026-03-05 09:45:01+01'),
  ('REC-012', 'RUN-20260305-002', 'SUP-DE-002', 'DE200103', '2026-03-17', 350.3,  8,  'NL', 'clean',   NULL, NULL, '2026-03-05 09:45:02+01'),
  ('REC-013', 'RUN-20260305-002', 'SUP-DE-002', 'DE200104', '2026-03-19', 290.0,  5,  'DE', 'clean',   NULL, NULL, '2026-03-05 09:45:02+01'),
  -- HIGH: missing supplier_id (simulated as empty)
  ('REC-014', 'RUN-20260305-002', 'SUP-DE-002', 'DE200105', '2026-03-20',  95.0,  7,  'DE', 'flagged', 'weight_kg is not a positive number (value: -12.5)', 'HIGH', '2026-03-05 09:45:02+01'),
  -- CRITICAL: lead_time_days = 21
  ('REC-015', 'RUN-20260305-002', 'SUP-DE-002', 'DE200106', '2026-03-28', 430.0, 21,  'DE', 'flagged', 'lead_time_days exceeds 14-day SLA limit (value: 21)', 'CRITICAL', '2026-03-05 09:45:03+01')
ON CONFLICT (record_id) DO NOTHING;

-- === RUN-20260305-003  (SUP-NL-003, HollandFresh B.V.  — all clean) ===
INSERT INTO pipeline_records (record_id, run_id, supplier_id, sku_code, delivery_date, weight_kg, lead_time_days, origin_country, status, flag_reason, flag_severity, created_at) VALUES
  ('REC-016', 'RUN-20260305-003', 'SUP-NL-003', 'NL300400', '2026-03-12', 710.0,  2,  'NL', 'clean', NULL, NULL, '2026-03-05 14:30:01+01'),
  ('REC-017', 'RUN-20260305-003', 'SUP-NL-003', 'NL300401', '2026-03-13', 665.5,  3,  'NL', 'clean', NULL, NULL, '2026-03-05 14:30:01+01'),
  ('REC-018', 'RUN-20260305-003', 'SUP-NL-003', 'NL300402', '2026-03-14', 580.0,  4,  'NL', 'clean', NULL, NULL, '2026-03-05 14:30:01+01'),
  ('REC-019', 'RUN-20260305-003', 'SUP-NL-003', 'NL300403', '2026-03-15', 490.2,  5,  'BE', 'clean', NULL, NULL, '2026-03-05 14:30:02+01'),
  ('REC-020', 'RUN-20260305-003', 'SUP-NL-003', 'NL300404', '2026-03-16', 830.0,  6,  'NL', 'clean', NULL, NULL, '2026-03-05 14:30:02+01'),
  ('REC-021', 'RUN-20260305-003', 'SUP-NL-003', 'NL300405', '2026-03-17', 420.0,  3,  'NL', 'clean', NULL, NULL, '2026-03-05 14:30:02+01')
ON CONFLICT (record_id) DO NOTHING;

-- === RUN-20260304-001  (SUP-FR-004, Provence Distribution SAS) ===
INSERT INTO pipeline_records (record_id, run_id, supplier_id, sku_code, delivery_date, weight_kg, lead_time_days, origin_country, status, flag_reason, flag_severity, created_at) VALUES
  ('REC-022', 'RUN-20260304-001', 'SUP-FR-004', 'FR400500', '2026-03-08', 310.0,  4,  'FR', 'clean',   NULL, NULL, '2026-03-04 10:00:01+01'),
  ('REC-023', 'RUN-20260304-001', 'SUP-FR-004', 'FR400501', '2026-03-09', 275.5,  6,  'FR', 'clean',   NULL, NULL, '2026-03-04 10:00:01+01'),
  ('REC-024', 'RUN-20260304-001', 'SUP-FR-004', 'FR400502', '2026-03-10', 190.0,  3,  'FR', 'clean',   NULL, NULL, '2026-03-04 10:00:02+01'),
  -- MEDIUM: origin_country invalid format
  ('REC-025', 'RUN-20260304-001', 'SUP-FR-004', 'FR400503', '2026-03-11', 400.0,  5,  'FRA','flagged', 'origin_country is not a valid ISO 3166-1 alpha-2 code (value: FRA)', 'MEDIUM', '2026-03-04 10:00:02+01'),
  -- HIGH: delivery_date more than 90 days in the past
  ('REC-026', 'RUN-20260304-001', 'SUP-FR-004', 'FR400504', '2025-11-01', 350.0,  7,  'FR', 'flagged', 'delivery_date is more than 90 days in the past (value: 2025-11-01)', 'HIGH', '2026-03-04 10:00:02+01')
ON CONFLICT (record_id) DO NOTHING;

-- === RUN-20260304-002  (SUP-AT-001, Alpenfrische GmbH — second run) ===
INSERT INTO pipeline_records (record_id, run_id, supplier_id, sku_code, delivery_date, weight_kg, lead_time_days, origin_country, status, flag_reason, flag_severity, created_at) VALUES
  ('REC-027', 'RUN-20260304-002', 'SUP-AT-001', 'AT100241', '2026-03-09', 510.0,  4,  'AT', 'clean',   NULL, NULL, '2026-03-04 16:20:01+01'),
  ('REC-028', 'RUN-20260304-002', 'SUP-AT-001', 'AT100242', '2026-03-10', 330.0,  5,  'AT', 'clean',   NULL, NULL, '2026-03-04 16:20:01+01'),
  ('REC-029', 'RUN-20260304-002', 'SUP-AT-001', 'AT100243', '2026-03-11', 620.5,  3,  'AT', 'clean',   NULL, NULL, '2026-03-04 16:20:01+01'),
  ('REC-030', 'RUN-20260304-002', 'SUP-AT-001', 'AT100244', '2026-03-12', 440.0,  6,  'DE', 'clean',   NULL, NULL, '2026-03-04 16:20:02+01'),
  -- LOW: weight_kg is zero
  ('REC-031', 'RUN-20260304-002', 'SUP-AT-001', 'AT100245', '2026-03-13',   0.0,  5,  'AT', 'flagged', 'weight_kg must be a positive number greater than zero (value: 0)', 'LOW', '2026-03-04 16:20:02+01'),
  -- MEDIUM: sku_code empty
  ('REC-032', 'RUN-20260304-002', 'SUP-AT-001', '',          '2026-03-14', 280.0,  4,  'AT', 'flagged', 'sku_code is empty or does not match pattern [A-Z]{2}[0-9]{6}', 'MEDIUM', '2026-03-04 16:20:02+01')
ON CONFLICT (record_id) DO NOTHING;
