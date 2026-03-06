import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { formatTimestamp, formatNumber } from '../lib/formatters';

function getRunStatusFromSeverity(run) {
    if (!run.flagged_records || run.flagged_records === 0) return { status: 'success', label: 'Clean' };
    const rate = (run.flagged_records / Math.max(run.total_records, 1)) * 100;
    if (rate > 25) return { status: 'error', label: 'Critical' };
    return { status: 'warning', label: 'Flagged' };
}

export default function RunsTable({ runs, navigate }) {
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    if (!runs || runs.length === 0) {
        return (
            <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p className="text-[#6B7280] text-sm font-medium">No pipeline runs found.</p>
                <p className="text-[#9CA3AF] text-xs mt-1">Runs will appear here after data is processed.</p>
            </div>
        );
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const sorted = [...runs].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const columns = [
        { key: 'run_id', label: 'Run ID' },
        { key: 'created_at', label: 'Timestamp' },
        { key: 'supplier_name', label: 'Supplier' },
        { key: 'total_records', label: 'Records' },
        { key: 'flagged_records', label: 'Flagged' },
        { key: 'status', label: 'Status' },
    ];

    return (
        <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm" style={{ '--delay': '200ms' }}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[#F3F4F6] bg-[#FAFBFC]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => col.key !== 'status' && handleSort(col.key)}
                                className={`px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest ${col.key !== 'status' ? 'cursor-pointer hover:text-[#00529B] transition-colors duration-150' : ''
                                    }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    {col.label}
                                    {sortField === col.key && (
                                        <svg className={`w-3 h-3 text-[#00529B] transition-transform duration-200 ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                        </svg>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((run, i) => {
                        const runStatus = getRunStatusFromSeverity(run);
                        return (
                            <tr
                                key={run.run_id}
                                onClick={() => navigate('run-detail', run.run_id)}
                                className={`table-row-hover cursor-pointer group ${i < sorted.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                            >
                                <td className="px-5 py-3.5">
                                    <span className="font-mono text-xs text-[#00529B] font-semibold bg-[#EBF3FB] px-2 py-0.5 rounded transition-colors duration-150 group-hover:bg-[#00529B] group-hover:text-white">
                                        {run.run_id}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-[#6B7280] text-xs">{formatTimestamp(run.created_at)}</td>
                                <td className="px-5 py-3.5 font-semibold text-[#111827]">{run.supplier_name || run.supplier_id}</td>
                                <td className="px-5 py-3.5 font-semibold tabular-nums">{formatNumber(run.total_records)}</td>
                                <td className="px-5 py-3.5">
                                    <span className={`font-bold tabular-nums ${run.flagged_records > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                                        {formatNumber(run.flagged_records)}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <StatusBadge status={runStatus.status} label={runStatus.label} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
