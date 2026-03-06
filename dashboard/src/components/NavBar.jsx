import React from 'react';

export default function NavBar({ currentView, navigate, onRefresh, isLoading }) {
    const links = [
        { id: 'overview', label: 'Overview' },
        { id: 'supplier-performance', label: 'Suppliers' },
        { id: 'workflow', label: 'Workflow' },
        { id: 'run-detail', label: 'Run Detail' },
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-50">
            <div className="max-w-[1280px] mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('overview')}>
                        <div className="relative">
                            <img
                                src="/aldi-logo.svg"
                                alt="ALDI SÜD"
                                className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#16A34A] rounded-full border-2 border-white animate-pulse-dot" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#111827] tracking-tight leading-tight">
                                ALDI SÜD
                            </span>
                            <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-widest leading-tight">
                                Supply Chain Intelligence
                            </span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center bg-[#F3F4F6] rounded-xl p-1 gap-0.5">
                        {links.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => navigate(link.id)}
                                className={`relative flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 cursor-pointer
                  ${currentView === link.id
                                        ? 'bg-white text-[#00529B] shadow-sm'
                                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-white/50'
                                    }`}
                            >
                                {link.label}
                                {currentView === link.id && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00529B] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-medium text-[#9CA3AF] hidden md:block tracking-wide">
                            Created by Mohammed Kaif Ahmed
                        </span>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#D1FAE5]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse-dot" />
                            <span className="text-[11px] font-semibold text-[#16A34A]">Live</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#00529B] rounded-lg hover:bg-[#003C73] hover:shadow-lg hover:shadow-[#00529B]/15 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            )}
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
            {/* Bottom gradient accent */}
            <div className="h-[2px] bg-gradient-to-r from-[#00529B] via-[#00529B]/60 to-[#FFD700]" />
        </nav>
    );
}
