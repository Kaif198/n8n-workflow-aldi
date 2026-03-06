import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { formatPercent, formatNumber } from '../lib/formatters';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs font-bold text-[#111827] mb-1">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill || p.color }} />
                    <span className="font-bold tabular-nums">{p.value}%</span>
                </div>
            ))}
        </div>
    );
};

export default function SupplierPerformance({ supplierStats, flagBreakdown, onDateFilter }) {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleFilter = () => onDateFilter(dateFrom || null, dateTo || null);
    const handleClear = () => { setDateFrom(''); setDateTo(''); onDateFilter(null, null); };

    const chartData = (supplierStats || []).map((s) => ({
        name: s.supplier_name || s.supplier_id,
        flagRate: Number(s.flag_rate) || 0,
    }));

    const getBarColor = (rate) => {
        if (rate > 25) return '#DC2626';
        if (rate > 10) return '#CA8A04';
        return '#00529B';
    };

    return (
        <div className="space-y-6">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Supplier Performance</h1>
                <p className="text-sm text-[#6B7280] mt-0.5">Data quality analysis by supplier - flag rates and issue breakdown</p>
            </div>

            {/* Date Filter */}
            <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm" style={{ '--delay': '80ms' }}>
                <div className="flex items-end gap-4">
                    <div className="flex-1 max-w-[200px]">
                        <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">From</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-white focus-ring" />
                    </div>
                    <div className="flex-1 max-w-[200px]">
                        <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">To</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-white focus-ring" />
                    </div>
                    <button onClick={handleFilter}
                        className="px-5 py-2.5 bg-[#00529B] text-white text-sm font-semibold rounded-xl hover:bg-[#003C73] hover:shadow-lg hover:shadow-[#00529B]/15 active:scale-[0.97] transition-all duration-200 cursor-pointer">
                        Apply
                    </button>
                    <button onClick={handleClear}
                        className="px-5 py-2.5 border border-[#E5E7EB] text-sm font-medium text-[#6B7280] rounded-xl hover:bg-[#F8F9FC] hover:border-[#D1D5DB] transition-all duration-200 cursor-pointer">
                        Clear
                    </button>
                </div>
            </div>

            {/* Supplier Flag Rate Chart */}
            <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm card-hover" style={{ '--delay': '160ms' }}>
                <div className="mb-5">
                    <h2 className="text-sm font-bold text-[#111827]">Supplier Flag Rate</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                        Flagged records as percentage of total:
                        <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-[#00529B]" /> 10% or less</span>
                        <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-[#CA8A04]" /> 10-25%</span>
                        <span className="inline-flex items-center gap-1 ml-2"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> above 25%</span>
                    </p>
                </div>
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-14 h-14 mb-3 rounded-2xl bg-[#F3F4F6] flex items-center justify-center">
                            <svg className="w-7 h-7 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-sm text-[#6B7280]">No supplier data available.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 56)}>
                        <BarChart data={chartData} layout="vertical" barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#111827', fontWeight: 600 }} width={200} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 6 }} />
                            <Bar dataKey="flagRate" radius={[0, 6, 6, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.flagRate)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Flag Breakdown Table */}
            <div className="animate-fade-in-up" style={{ '--delay': '240ms' }}>
                <div className="mb-3">
                    <h2 className="text-sm font-bold text-[#111827]">Flag Reason Breakdown</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">All distinct validation failures, sorted by frequency</p>
                </div>
                {!flagBreakdown || flagBreakdown.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
                            <svg className="w-7 h-7 text-[#16A34A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-[#6B7280]">No flag reasons recorded.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#F3F4F6] bg-[#FAFBFC]">
                                    <th className="px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest">Flag Reason</th>
                                    <th className="px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest">Severity</th>
                                    <th className="px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest">Affected Suppliers</th>
                                    <th className="px-5 py-3.5 text-left font-semibold text-[#9CA3AF] text-[11px] uppercase tracking-widest">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flagBreakdown.map((row, i) => (
                                    <tr key={i} className={`table-row-hover ${i < flagBreakdown.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                                        <td className="px-5 py-3.5 text-xs max-w-xs truncate text-[#111827]" title={row.flag_reason}>{row.flag_reason}</td>
                                        <td className="px-5 py-3.5"><StatusBadge status={row.flag_severity} label={row.flag_severity} /></td>
                                        <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                                            {Array.isArray(row.affected_suppliers) ? row.affected_suppliers.join(', ') : row.affected_suppliers || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 font-extrabold text-[#111827] tabular-nums">{formatNumber(row.occurrence_count)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
