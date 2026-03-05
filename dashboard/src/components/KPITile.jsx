import React from 'react';
import { formatNumber, formatPercent } from '../lib/formatters';

const ICONS = {
    'Total Records Processed': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
    ),
    'Clean Records': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    'Flagged Records': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    'Active Suppliers': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

const ACCENT_COLORS = {
    'Total Records Processed': { bg: 'bg-[#EBF3FB]', text: 'text-[#00529B]', ring: 'ring-[#00529B]/10' },
    'Clean Records': { bg: 'bg-[#ECFDF5]', text: 'text-[#16A34A]', ring: 'ring-[#16A34A]/10' },
    'Flagged Records': { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', ring: 'ring-[#DC2626]/10' },
    'Active Suppliers': { bg: 'bg-[#FFFBEB]', text: 'text-[#CA8A04]', ring: 'ring-[#CA8A04]/10' },
};

export default function KPITile({ title, value, trend }) {
    const trendUp = trend !== null && trend !== undefined && trend > 0;
    const trendDown = trend !== null && trend !== undefined && trend < 0;
    const trendNeutral = trend === null || trend === undefined || trend === 0;

    const icon = ICONS[title] || ICONS['Total Records Processed'];
    const accent = ACCENT_COLORS[title] || ACCENT_COLORS['Total Records Processed'];

    return (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3 min-w-[200px] flex-1 hover:shadow-lg hover:shadow-[#00529B]/5 transition-all duration-200 group">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${accent.bg} ${accent.text} flex items-center justify-center ring-1 ${accent.ring}`}>
                    {icon}
                </div>
                {!trendNeutral && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
            ${trendUp ? 'bg-[#ECFDF5] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                        {trendUp ? '↑' : '↓'} {formatPercent(Math.abs(trend))}
                    </div>
                )}
                {trendNeutral && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#9CA3AF] text-xs font-medium">
                        — No change
                    </div>
                )}
            </div>
            <div>
                <span className="text-3xl font-extrabold text-[#111827] tracking-tight">
                    {formatNumber(value)}
                </span>
            </div>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
                {title}
            </span>
        </div>
    );
}
