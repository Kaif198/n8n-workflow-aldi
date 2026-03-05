/**
 * Format an integer with thousand separators.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format a number as a percentage with one decimal place.
 * @param {number} n - value already in percent form (e.g. 12.3)
 * @returns {string}
 */
export function formatPercent(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toFixed(1) + '%';
}

/**
 * Format an ISO date string into a readable format.
 * @param {string} d - ISO date/datetime string
 * @returns {string}
 */
export function formatDate(d) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format an ISO datetime string into a readable timestamp.
 * @param {string} d - ISO datetime string
 * @returns {string}
 */
export function formatTimestamp(d) {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format duration in milliseconds into a human-readable string.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
    if (ms === null || ms === undefined) return '—';
    if (ms < 1000) return ms + 'ms';
    const seconds = (ms / 1000).toFixed(1);
    return seconds + 's';
}

/**
 * Calculate percentage change between two values.
 * Returns null if yesterday is 0 (no data to compare).
 * @param {number} today
 * @param {number} yesterday
 * @returns {number|null}
 */
export function calcTrend(today, yesterday) {
    if (!yesterday || yesterday === 0) return null;
    return ((today - yesterday) / yesterday) * 100;
}
