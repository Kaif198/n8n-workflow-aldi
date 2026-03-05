import React from 'react';
import KPITile from '../components/KPITile';
import RunsTable from '../components/RunsTable';
import { calcTrend } from '../lib/formatters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
        <div className="bg-white/95 backdrop-blur-sm border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs font-bold text-[#111827] mb-1.5">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span className="text-[#6B7280]">{p.name}:</span>
                    <span className="font-bold text-[#111827]">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function Overview({ kpis, dailyVolume, runs, navigate }) {
    const today = kpis?.today || {};
    const yesterday = kpis?.yesterday || {};

    const tiles = [
        {
            title: 'Total Records Processed',
            value: Number(today.total_records) || 0,
            trend: calcTrend(Number(today.total_records) || 0, Number(yesterday.total_records) || 0),
        },
        {
            title: 'Clean Records',
            value: Number(today.clean_records) || 0,
            trend: calcTrend(Number(today.clean_records) || 0, Number(yesterday.clean_records) || 0),
        },
        {
            title: 'Flagged Records',
            value: Number(today.flagged_records) || 0,
            trend: calcTrend(Number(today.flagged_records) || 0, Number(yesterday.flagged_records) || 0),
        },
        {
            title: 'Active Suppliers',
            value: Number(today.active_suppliers) || 0,
            trend: calcTrend(Number(today.active_suppliers) || 0, Number(yesterday.active_suppliers) || 0),
        },
    ];

    const chartData = (dailyVolume || []).map((d) => ({
        day: new Date(d.day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        Clean: Number(d.clean) || 0,
        Flagged: Number(d.flagged) || 0,
    }));

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Pipeline Overview</h1>
                <p className="text-sm text-[#6B7280] mt-0.5">Real-time pipeline health and record processing status</p>
            </div>

            {/* KPI Tiles */}
            <div className="grid grid-cols-4 gap-4">
                {tiles.map((tile) => (
                    <KPITile key={tile.title} {...tile} />
                ))}
            </div>

            {/* 7-Day Volume Chart */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-sm font-bold text-[#111827]">Daily Record Volume</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">Last 7 days — clean vs flagged breakdown</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-[#16A34A]" />
                            <span className="text-[11px] font-medium text-[#6B7280]">Clean</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-[#DC2626]" />
                            <span className="text-[11px] font-medium text-[#6B7280]">Flagged</span>
                        </div>
                    </div>
                </div>
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-4xl mb-2">📈</div>
                        <p className="text-sm text-[#6B7280]">No data available for the past 7 days.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} barGap={4} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6', radius: 8 }} />
                            <Bar dataKey="Clean" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Flagged" stackId="a" fill="#DC2626" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Recent Pipeline Runs */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-sm font-bold text-[#111827]">Recent Pipeline Runs</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">Click a row to view run details</p>
                    </div>
                </div>
                <RunsTable runs={runs} navigate={navigate} />
            </div>
        </div>
    );
}
