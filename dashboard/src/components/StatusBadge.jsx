import React from 'react';

const STYLES = {
    clean: { bg: 'bg-[#ECFDF5]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
    LOW: { bg: 'bg-[#FFFBEB]', text: 'text-[#CA8A04]', dot: 'bg-[#CA8A04]' },
    MEDIUM: { bg: 'bg-[#FFF7ED]', text: 'text-[#EA580C]', dot: 'bg-[#EA580C]' },
    HIGH: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
    CRITICAL: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', dot: 'bg-[#991B1B]' },
    success: { bg: 'bg-[#ECFDF5]', text: 'text-[#16A34A]', dot: 'bg-[#16A34A]' },
    warning: { bg: 'bg-[#FFFBEB]', text: 'text-[#CA8A04]', dot: 'bg-[#CA8A04]' },
    error: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', dot: 'bg-[#DC2626]' },
};

export default function StatusBadge({ status, label }) {
    const displayLabel = label || status || '-';
    const s = STYLES[status] || STYLES.clean;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-150 ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {displayLabel}
        </span>
    );
}
