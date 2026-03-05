import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function FlagsTable({ records }) {
    const [sortField, setSortField] = useState('flag_severity');
    const [sortDir, setSortDir] = useState('desc');

    if (!records || records.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-[#16A34A] text-sm font-semibold">No issues detected in this run.</p>
                <p className="text-[#9CA3AF] text-xs mt-1">All records passed validation successfully.</p>
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

    const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    const sorted = [...records].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'flag_severity') {
            aVal = severityOrder[aVal] || 0;
            bVal = severityOrder[bVal] || 0;
        }
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    function extractField(reason) {
        if (!reason) return '—';
        const match = reason.match(/^(\w+)/);
        return match ? match[1] : '—';
    }

    const columns = [
        { key: 'record_id', label: 'Record ID' },
        { key: 'sku_code', label: 'SKU Code' },
        { key: 'field', label: 'Field' },
        { key: 'flag_reason', label: 'Reason' },
        { key: 'flag_severity', label: 'Severity' },
    ];

    return (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[#F3F4F6]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => handleSort(col.key)}
                                className="px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest cursor-pointer hover:text-[#00529B] transition-colors duration-150"
                            >
                                <span className="flex items-center gap-1.5">
                                    {col.label}
                                    {sortField === col.key && (
                                        <span className="text-[#00529B] text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((rec, i) => (
                        <tr
                            key={rec.record_id}
                            className={`border-b border-[#F3F4F6] hover:bg-[#F8F9FC] transition-colors duration-150 ${i === sorted.length - 1 ? 'border-b-0' : ''
                                }`}
                        >
                            <td className="px-5 py-3.5">
                                <span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded font-medium">{rec.record_id}</span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs font-medium">{rec.sku_code || '—'}</td>
                            <td className="px-5 py-3.5">
                                <span className="text-xs font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">{extractField(rec.flag_reason)}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-[#6B7280] max-w-xs truncate" title={rec.flag_reason}>
                                {rec.flag_reason}
                            </td>
                            <td className="px-5 py-3.5">
                                <StatusBadge status={rec.flag_severity} label={rec.flag_severity} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
