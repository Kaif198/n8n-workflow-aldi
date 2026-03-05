import { neon } from '@neondatabase/serverless';

let sql = null;

function getSQL() {
    if (!sql) {
        const connString = import.meta.env.VITE_NEON_CONNECTION_STRING;
        if (!connString) {
            throw new Error(
                'VITE_NEON_CONNECTION_STRING is not set. Please configure this environment variable with your Neon PostgreSQL connection string.'
            );
        }
        sql = neon(connString);
    }
    return sql;
}

export async function fetchPipelineRuns() {
    const rows = await getSQL()`
    SELECT run_id, created_at, supplier_id, supplier_name,
           total_records, clean_records, flagged_records, duration_ms
    FROM pipeline_runs
    ORDER BY created_at DESC
  `;
    return rows;
}

export async function fetchPipelineRecords(runId) {
    if (runId) {
        const rows = await getSQL()`
      SELECT record_id, run_id, supplier_id, sku_code, delivery_date,
             weight_kg, lead_time_days, origin_country, status,
             flag_reason, flag_severity, created_at
      FROM pipeline_records
      WHERE run_id = ${runId}
      ORDER BY created_at DESC
    `;
        return rows;
    }
    const rows = await getSQL()`
    SELECT record_id, run_id, supplier_id, sku_code, delivery_date,
           weight_kg, lead_time_days, origin_country, status,
           flag_reason, flag_severity, created_at
    FROM pipeline_records
    ORDER BY created_at DESC
  `;
    return rows;
}

export async function fetchFlaggedRecords(runId) {
    if (runId) {
        const rows = await getSQL()`
      SELECT record_id, run_id, supplier_id, sku_code, delivery_date,
             weight_kg, lead_time_days, origin_country, status,
             flag_reason, flag_severity, created_at
      FROM pipeline_records
      WHERE run_id = ${runId} AND status = 'flagged'
      ORDER BY created_at DESC
    `;
        return rows;
    }
    const rows = await getSQL()`
    SELECT record_id, run_id, supplier_id, sku_code, delivery_date,
           weight_kg, lead_time_days, origin_country, status,
           flag_reason, flag_severity, created_at
    FROM pipeline_records
    WHERE status = 'flagged'
    ORDER BY created_at DESC
  `;
    return rows;
}

export async function fetchSupplierStats(dateFrom, dateTo) {
    let rows;
    if (dateFrom && dateTo) {
        rows = await getSQL()`
      SELECT
        pr.supplier_id,
        COALESCE(MAX(r.supplier_name), pr.supplier_id) AS supplier_name,
        COUNT(*) AS total_records,
        COUNT(*) FILTER (WHERE pr.status = 'flagged') AS flagged_records,
        ROUND(
          COUNT(*) FILTER (WHERE pr.status = 'flagged')::numeric / NULLIF(COUNT(*), 0) * 100, 1
        ) AS flag_rate
      FROM pipeline_records pr
      LEFT JOIN pipeline_runs r ON pr.run_id = r.run_id
      WHERE r.created_at >= ${dateFrom}::timestamptz
        AND r.created_at <= ${dateTo}::timestamptz + interval '1 day'
      GROUP BY pr.supplier_id
      ORDER BY flag_rate DESC
    `;
    } else {
        rows = await getSQL()`
      SELECT
        pr.supplier_id,
        COALESCE(MAX(r.supplier_name), pr.supplier_id) AS supplier_name,
        COUNT(*) AS total_records,
        COUNT(*) FILTER (WHERE pr.status = 'flagged') AS flagged_records,
        ROUND(
          COUNT(*) FILTER (WHERE pr.status = 'flagged')::numeric / NULLIF(COUNT(*), 0) * 100, 1
        ) AS flag_rate
      FROM pipeline_records pr
      LEFT JOIN pipeline_runs r ON pr.run_id = r.run_id
      GROUP BY pr.supplier_id
      ORDER BY flag_rate DESC
    `;
    }
    return rows;
}

export async function fetchFlagBreakdown(dateFrom, dateTo) {
    let rows;
    if (dateFrom && dateTo) {
        rows = await getSQL()`
      SELECT
        pr.flag_reason,
        pr.flag_severity,
        ARRAY_AGG(DISTINCT COALESCE(r.supplier_name, pr.supplier_id)) AS affected_suppliers,
        COUNT(*) AS occurrence_count
      FROM pipeline_records pr
      LEFT JOIN pipeline_runs r ON pr.run_id = r.run_id
      WHERE pr.status = 'flagged'
        AND r.created_at >= ${dateFrom}::timestamptz
        AND r.created_at <= ${dateTo}::timestamptz + interval '1 day'
      GROUP BY pr.flag_reason, pr.flag_severity
      ORDER BY occurrence_count DESC
    `;
    } else {
        rows = await getSQL()`
      SELECT
        pr.flag_reason,
        pr.flag_severity,
        ARRAY_AGG(DISTINCT COALESCE(r.supplier_name, pr.supplier_id)) AS affected_suppliers,
        COUNT(*) AS occurrence_count
      FROM pipeline_records pr
      LEFT JOIN pipeline_runs r ON pr.run_id = r.run_id
      WHERE pr.status = 'flagged'
      GROUP BY pr.flag_reason, pr.flag_severity
      ORDER BY occurrence_count DESC
    `;
    }
    return rows;
}

export async function fetchKPIs() {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const [todayStats] = await getSQL()`
    SELECT
      COALESCE(SUM(total_records), 0)  AS total_records,
      COALESCE(SUM(clean_records), 0)  AS clean_records,
      COALESCE(SUM(flagged_records), 0) AS flagged_records,
      COUNT(DISTINCT supplier_id)      AS active_suppliers
    FROM pipeline_runs
    WHERE created_at::date = ${today}::date
  `;

    const [yesterdayStats] = await getSQL()`
    SELECT
      COALESCE(SUM(total_records), 0)  AS total_records,
      COALESCE(SUM(clean_records), 0)  AS clean_records,
      COALESCE(SUM(flagged_records), 0) AS flagged_records,
      COUNT(DISTINCT supplier_id)      AS active_suppliers
    FROM pipeline_runs
    WHERE created_at::date = ${yesterday}::date
  `;

    return { today: todayStats, yesterday: yesterdayStats };
}

export async function fetchDailyVolume() {
    const rows = await getSQL()`
    SELECT
      created_at::date AS day,
      COALESCE(SUM(clean_records), 0)  AS clean,
      COALESCE(SUM(flagged_records), 0) AS flagged
    FROM pipeline_runs
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY created_at::date
    ORDER BY day ASC
  `;
    return rows;
}

export async function fetchRunDetail(runId) {
    const [run] = await getSQL()`
    SELECT run_id, created_at, supplier_id, supplier_name,
           total_records, clean_records, flagged_records, duration_ms
    FROM pipeline_runs
    WHERE run_id = ${runId}
  `;
    return run || null;
}
