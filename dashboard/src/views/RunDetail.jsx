import React from 'react';
import FlagsTable from '../components/FlagsTable';
import { formatTimestamp, formatDuration, formatNumber } from '../lib/formatters';

export default function RunDetail({ runs, selectedRunId, runDetail, flaggedRecords, onSelectRun }) {
    const currentRun = runDetail || (runs || []).find((r) => r.run_id === selectedRunId);

    const cleanRate = currentRun
        ? Math.round((currentRun.clean_records / Math.max(currentRun.total_records, 1)) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Run Detail</h1>
                <p className="text-sm text-[#6B7280] mt-0.5">Detailed inspection of a single pipeline execution</p>
            </div>

            {/* Run Selector */}
            <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm" style={{ '--delay': '80ms' }}>
                <label className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-2">Select Run</label>
                <select
                    value={selectedRunId || ''}
                    onChange={(e) => onSelectRun(e.target.value)}
                    className="w-full max-w-xl px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm bg-white focus-ring appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                >
                    <option value="">Select a pipeline run</option>
                    {(runs || []).map((run) => (
                        <option key={run.run_id} value={run.run_id}>
                            {run.run_id} | {run.supplier_name || run.supplier_id} | {formatTimestamp(run.created_at)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Run Summary */}
            {currentRun ? (
                <>
                    <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm card-hover" style={{ '--delay': '160ms' }}>
                        {/* Gradient top stripe */}
                        <div className="h-1 bg-gradient-to-r from-[#00529B] via-[#00529B]/60 to-[#FFD700]" />
                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Run ID</span>
                                    <span className="text-sm font-mono font-bold text-[#00529B] bg-[#EBF3FB] px-2.5 py-1 rounded-lg inline-block">{currentRun.run_id}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Supplier</span>
                                    <span className="text-sm font-semibold text-[#111827]">{currentRun.supplier_name || currentRun.supplier_id}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Timestamp</span>
                                    <span className="text-sm text-[#6B7280]">{formatTimestamp(currentRun.created_at)}</span>
                                </div>
                                <div>
                                    <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Duration</span>
                                    <span className="text-sm font-medium text-[#6B7280]">{formatDuration(currentRun.duration_ms)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-[#F3F4F6]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#EBF3FB] flex items-center justify-center">
                                        <span className="text-lg font-extrabold text-[#00529B] tabular-nums">{formatNumber(currentRun.total_records)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Total</span>
                                        <span className="text-xs text-[#6B7280]">records</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                                        <span className="text-lg font-extrabold text-[#16A34A] tabular-nums">{formatNumber(currentRun.clean_records)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Clean</span>
                                        <span className="text-xs text-[#16A34A] font-semibold">{cleanRate}% pass rate</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentRun.flagged_records > 0 ? 'bg-[#FEF2F2]' : 'bg-[#ECFDF5]'}`}>
                                        <span className={`text-lg font-extrabold tabular-nums ${currentRun.flagged_records > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                                            {formatNumber(currentRun.flagged_records)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Flagged</span>
                                        <span className="text-xs text-[#6B7280]">issues found</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flagged Records */}
                    <div className="animate-fade-in-up" style={{ '--delay': '240ms' }}>
                        <div className="mb-3">
                            <h2 className="text-sm font-bold text-[#111827]">Flagged Records</h2>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">Records that failed one or more validation rules</p>
                        </div>
                        <FlagsTable records={flaggedRecords} />
                    </div>
                </>
            ) : (
                <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center shadow-sm" style={{ '--delay': '160ms' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#EBF3FB] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#00529B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-[#111827] font-semibold">Select a pipeline run</p>
                    <p className="text-[#9CA3AF] text-sm mt-1">Choose from the dropdown above or click a row in the Pipeline Overview</p>
                </div>
            )}
        </div>
    );
}
