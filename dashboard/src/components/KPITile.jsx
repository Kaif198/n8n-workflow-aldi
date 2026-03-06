import React, { useState, useEffect, useRef } from 'react';
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
    'Total Records Processed': { bg: 'bg-[#EBF3FB]', text: 'text-[#00529B]', ring: 'ring-[#00529B]/10', shadow: 'hover:shadow-[#00529B]/8' },
    'Clean Records': { bg: 'bg-[#ECFDF5]', text: 'text-[#16A34A]', ring: 'ring-[#16A34A]/10', shadow: 'hover:shadow-[#16A34A]/8' },
    'Flagged Records': { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', ring: 'ring-[#DC2626]/10', shadow: 'hover:shadow-[#DC2626]/8' },
    'Active Suppliers': { bg: 'bg-[#FFFBEB]', text: 'text-[#CA8A04]', ring: 'ring-[#CA8A04]/10', shadow: 'hover:shadow-[#CA8A04]/8' },
};

function useCountUp(target, duration = 600) {
    const [value, setValue] = useState(0);
    const prevTarget = useRef(0);

    useEffect(() => {
        const start = prevTarget.current;
        const diff = target - start;
        if (diff === 0) { setValue(target); return; }

        const startTime = performance.now();
        let rafId;

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + diff * eased));
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        }

        rafId = requestAnimationFrame(tick);
        prevTarget.current = target;
        return () => cancelAnimationFrame(rafId);
    }, [target, duration]);

    return value;
}

export default function KPITile({ title, value, trend, delay = 0 }) {
    const trendUp = trend !== null && trend !== undefined && trend > 0;
    const trendDown = trend !== null && trend !== undefined && trend < 0;
    const trendNeutral = trend === null || trend === undefined || trend === 0;

    const icon = ICONS[title] || ICONS['Total Records Processed'];
    const accent = ACCENT_COLORS[title] || ACCENT_COLORS['Total Records Processed'];

    const animatedValue = useCountUp(value);

    return (
        <div
            className={`animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3 min-w-[200px] flex-1 card-hover group`}
            style={{ '--delay': `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${accent.bg} ${accent.text} flex items-center justify-center ring-1 ${accent.ring} transition-transform duration-200 group-hover:scale-110`}>
                    {icon}
                </div>
                {!trendNeutral && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200
            ${trendUp ? 'bg-[#ECFDF5] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'}`}>
                        <svg className={`w-3 h-3 ${trendDown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                        {formatPercent(Math.abs(trend))}
                    </div>
                )}
                {trendNeutral && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#9CA3AF] text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                        No change
                    </div>
                )}
            </div>
            <div>
                <span className="text-3xl font-extrabold text-[#111827] tracking-tight tabular-nums">
                    {formatNumber(animatedValue)}
                </span>
            </div>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
                {title}
            </span>
        </div>
    );
}
