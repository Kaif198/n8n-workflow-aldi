import React, { useState } from 'react';

/* ── SVG Icons for each node type ──────────────────────────────── */
const NODE_ICONS = {
    webhook: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
    ),
    manual: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    normalise: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
    ),
    validate: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    enrich: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    store_rec: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
        </svg>
    ),
    store_run: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    if_crit: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    email: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    respond: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 01-4 4H4" />
        </svg>
    ),
};

/* ── Node definitions matching the actual workflow.json ──────────── */
const NODES = [
    { id: 'webhook', label: 'Webhook', sub: 'POST /supply-chain-ingest', color: '#7C3AED', x: 60, y: 100, type: 'trigger' },
    { id: 'manual', label: 'Manual Trigger', sub: 'CSV file upload', color: '#7C3AED', x: 60, y: 260, type: 'trigger' },
    { id: 'normalise', label: 'Normalise Records', sub: 'Function Node', color: '#2563EB', x: 310, y: 180, type: 'function' },
    { id: 'validate', label: 'Validate Records', sub: 'Function Node', color: '#16A34A', x: 560, y: 180, type: 'function' },
    { id: 'enrich', label: 'Enrich — Supplier', sub: 'Postgres Node', color: '#0891B2', x: 810, y: 180, type: 'postgres' },
    { id: 'store_rec', label: 'Store Records', sub: 'Postgres INSERT', color: '#0891B2', x: 1060, y: 110, type: 'postgres' },
    { id: 'store_run', label: 'Store Run Summary', sub: 'Postgres INSERT', color: '#0891B2', x: 1060, y: 260, type: 'postgres' },
    { id: 'if_crit', label: 'IF Critical?', sub: 'Check flag_severity', color: '#CA8A04', x: 1310, y: 110, type: 'logic' },
    { id: 'email', label: 'Send Alert Email', sub: 'SMTP via env vars', color: '#DC2626', x: 1560, y: 50, type: 'email' },
    { id: 'respond', label: 'Respond Webhook', sub: 'HTTP 200 summary', color: '#6B7280', x: 1560, y: 210, type: 'output' },
];

const NODE_W = 200;
const NODE_H = 64;

/* ── Connections between nodes ──────────────────────────────────── */
const CONNECTIONS = [
    { from: 'webhook', to: 'normalise' },
    { from: 'manual', to: 'normalise' },
    { from: 'normalise', to: 'validate' },
    { from: 'validate', to: 'enrich' },
    { from: 'enrich', to: 'store_rec' },
    { from: 'enrich', to: 'store_run' },
    { from: 'store_rec', to: 'if_crit' },
    { from: 'store_run', to: 'if_crit', style: 'dashed' },
    { from: 'if_crit', to: 'email', label: 'yes' },
    { from: 'if_crit', to: 'respond', label: 'all' },
];

/* ── SVG Bezier path between two nodes ──────────────────────────── */
function ConnectionPath({ from, to, dashed, label }) {
    const fromNode = NODES.find(n => n.id === from);
    const toNode = NODES.find(n => n.id === to);
    if (!fromNode || !toNode) return null;

    const x1 = fromNode.x + NODE_W;
    const y1 = fromNode.y + NODE_H / 2;
    const x2 = toNode.x;
    const y2 = toNode.y + NODE_H / 2;

    const dx = Math.abs(x2 - x1) * 0.5;
    const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    return (
        <g>
            <path
                d={path}
                fill="none"
                stroke={dashed ? '#9CA3AF' : '#00529B'}
                strokeWidth={1.5}
                strokeDasharray={dashed ? '6 4' : 'none'}
                opacity={0.4}
            />
            {/* Animated dot traveling along the path */}
            {!dashed && (
                <circle r="3" fill="#00529B" opacity={0.7}>
                    <animateMotion dur="3s" repeatCount="indefinite" path={path} />
                </circle>
            )}
            {/* Arrow head at end */}
            <circle cx={x2} cy={y2} r={3.5} fill={dashed ? '#9CA3AF' : '#00529B'} opacity={0.4} />
            {/* Label */}
            {label && (
                <g>
                    <rect x={midX - 14} y={midY - 16} width={28} height={16} rx={4} fill="white" stroke="#E5E7EB" strokeWidth={1} />
                    <text x={midX} y={midY - 5} fill="#6B7280" fontSize={9} fontWeight={600} textAnchor="middle" fontFamily="Inter, sans-serif">
                        {label}
                    </text>
                </g>
            )}
        </g>
    );
}

/* ── Single workflow node ────────────────────────────────────────── */
function WorkflowNode({ node, isHovered, onHover, onLeave }) {
    const iconSvg = NODE_ICONS[node.id];

    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{ cursor: 'pointer' }}
        >
            {/* Hover glow */}
            {isHovered && (
                <rect
                    x={-3}
                    y={-3}
                    width={NODE_W + 6}
                    height={NODE_H + 6}
                    rx={15}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={1.5}
                    opacity={0.3}
                />
            )}
            {/* Node body — light theme */}
            <rect
                width={NODE_W}
                height={NODE_H}
                rx={12}
                fill="white"
                stroke={isHovered ? node.color : '#E5E7EB'}
                strokeWidth={isHovered ? 1.5 : 1}
                filter={isHovered ? 'url(#nodeShadow)' : 'none'}
            />
            {/* Color accent bar */}
            <rect
                x={0}
                y={0}
                width={4}
                height={NODE_H}
                rx={2}
                fill={node.color}
            />
            {/* Icon circle */}
            <circle
                cx={28}
                cy={NODE_H / 2}
                r={16}
                fill={node.color + '12'}
                stroke={node.color + '30'}
                strokeWidth={1}
            />
            {/* SVG Icon */}
            <g transform={`translate(21, ${NODE_H / 2 - 7})`} style={{ color: node.color }} stroke={node.color}>
                {iconSvg}
            </g>
            {/* Label */}
            <text
                x={54}
                y={NODE_H / 2 - 5}
                fill="#111827"
                fontSize={12}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
            >
                {node.label}
            </text>
            {/* Sub label */}
            <text
                x={54}
                y={NODE_H / 2 + 12}
                fill="#9CA3AF"
                fontSize={10}
                fontFamily="Inter, sans-serif"
            >
                {node.sub}
            </text>
        </g>
    );
}

/* ── Grid dots background pattern (light) ────────────────────────── */
function GridPattern() {
    const dots = [];
    for (let x = 0; x < 1800; x += 24) {
        for (let y = 0; y < 400; y += 24) {
            dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={0.8} fill="#E5E7EB" />);
        }
    }
    return <g>{dots}</g>;
}

/* ── Main Workflow Component ────────────────────────────────────── */
export default function Workflow() {
    const [hoveredNode, setHoveredNode] = useState(null);

    const canvasW = 1790;
    const canvasH = 360;

    return (
        <div className="space-y-6">
            <div className="animate-fade-in-up">
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Pipeline Workflow</h1>
                <p className="text-sm text-[#6B7280] mt-0.5">n8n workflow architecture - visualised exactly as it runs in production</p>
            </div>

            {/* Canvas — light themed editor */}
            <div className="animate-fade-in-up rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm" style={{ '--delay': '100ms' }}>
                {/* Top bar */}
                <div className="bg-white border-b border-[#E5E7EB] px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#FCA5A5]" />
                            <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
                            <div className="w-3 h-3 rounded-full bg-[#86EFAC]" />
                        </div>
                        <span className="text-xs font-semibold text-[#9CA3AF] ml-2 tracking-wide">
                            ALDI_SUD_Supply_Chain_Pipeline - workflow.json
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#D1FAE5]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse-dot" />
                            <span className="text-[11px] font-semibold text-[#16A34A]">Active</span>
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7280]">
                            {NODES.length} nodes · {CONNECTIONS.length} connections
                        </span>
                    </div>
                </div>

                {/* SVG Canvas */}
                <div className="bg-[#FAFBFC] overflow-x-auto">
                    <svg
                        width={canvasW}
                        height={canvasH}
                        viewBox={`0 0 ${canvasW} ${canvasH}`}
                        className="min-w-full"
                        style={{ minHeight: canvasH }}
                    >
                        <defs>
                            <filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="130%">
                                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.06" />
                            </filter>
                        </defs>

                        <GridPattern />

                        {/* Connection lines (render behind nodes) */}
                        {CONNECTIONS.map((conn, i) => (
                            <ConnectionPath
                                key={i}
                                from={conn.from}
                                to={conn.to}
                                dashed={conn.style === 'dashed'}
                                label={conn.label}
                            />
                        ))}

                        {/* Nodes */}
                        {NODES.map((node) => (
                            <WorkflowNode
                                key={node.id}
                                node={node}
                                isHovered={hoveredNode === node.id}
                                onHover={() => setHoveredNode(node.id)}
                                onLeave={() => setHoveredNode(null)}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Legend + Stage Details — 2-column grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Node Type Legend */}
                <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm card-hover" style={{ '--delay': '200ms' }}>
                    <h2 className="text-sm font-bold text-[#111827] mb-3">Node Types</h2>
                    <div className="space-y-2.5">
                        {[
                            { color: '#7C3AED', label: 'Trigger', desc: 'Webhook / Manual CSV' },
                            { color: '#2563EB', label: 'Function', desc: 'Data transformation & validation' },
                            { color: '#0891B2', label: 'Postgres', desc: 'Database read / write' },
                            { color: '#CA8A04', label: 'Logic', desc: 'Conditional branching' },
                            { color: '#DC2626', label: 'Email', desc: 'SMTP alert dispatch' },
                            { color: '#6B7280', label: 'Output', desc: 'HTTP response' },
                        ].map((t) => (
                            <div key={t.label} className="flex items-center gap-3 group">
                                <div className="w-3 h-8 rounded-sm transition-transform duration-150 group-hover:scale-y-110" style={{ backgroundColor: t.color }} />
                                <div>
                                    <span className="text-xs font-bold text-[#111827]">{t.label}</span>
                                    <span className="text-xs text-[#9CA3AF] ml-2">{t.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pipeline Stats */}
                <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm card-hover" style={{ '--delay': '280ms' }}>
                    <h2 className="text-sm font-bold text-[#111827] mb-3">Pipeline Architecture</h2>
                    <div className="space-y-0">
                        {[
                            { label: 'Total Nodes', value: '10', color: null },
                            { label: 'Connections', value: '10', color: null },
                            { label: 'Validation Rules', value: '6', color: null },
                            { label: 'Severity Levels', value: '4 (LOW to CRITICAL)', color: null },
                            { label: 'Alert Trigger', value: 'CRITICAL only', color: '#DC2626' },
                            { label: 'Ingestion Methods', value: 'Webhook + CSV', color: null },
                        ].map((item, i, arr) => (
                            <div key={item.label} className={`flex items-center justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                                <span className="text-xs font-medium text-[#6B7280]">{item.label}</span>
                                <span className={`text-sm font-bold ${item.color ? '' : 'text-[#111827]'}`} style={item.color ? { color: item.color } : {}}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Validation Rules Reference */}
            <div className="animate-fade-in-up bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm" style={{ '--delay': '360ms' }}>
                <div className="px-5 py-3.5 border-b border-[#F3F4F6] bg-[#FAFBFC]">
                    <h2 className="text-sm font-bold text-[#111827]">Validation Rules - Stage 3</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Applied to every record during the Validate stage</p>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#F3F4F6]">
                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Field</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Rule</th>
                            <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { field: 'delivery_date', rule: 'Valid ISO 8601, not >90 days past', severity: 'HIGH', color: '#DC2626' },
                            { field: 'weight_kg', rule: 'Positive number > 0', severity: 'HIGH', color: '#DC2626' },
                            { field: 'sku_code', rule: 'Matches [A-Z]{2}[0-9]{6}', severity: 'LOW', color: '#CA8A04' },
                            { field: 'lead_time_days', rule: 'Integer 1-14 (>14 = CRITICAL)', severity: 'CRITICAL', color: '#991B1B' },
                            { field: 'origin_country', rule: 'ISO 3166-1 alpha-2 code', severity: 'MEDIUM', color: '#EA580C' },
                            { field: 'supplier_id', rule: 'Present and non-null', severity: 'HIGH', color: '#DC2626' },
                        ].map((r, i) => (
                            <tr key={r.field} className={`table-row-hover ${i < 5 ? 'border-b border-[#F3F4F6]' : ''}`}>
                                <td className="px-5 py-3">
                                    <span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded font-medium">{r.field}</span>
                                </td>
                                <td className="px-5 py-3 text-xs text-[#6B7280]">{r.rule}</td>
                                <td className="px-5 py-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                                        style={{ backgroundColor: r.color + '12', color: r.color }}>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                                        {r.severity}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
