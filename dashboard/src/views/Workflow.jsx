import React, { useState } from 'react';

/* ── Node definitions matching the actual workflow.json ──────────── */
const NODES = [
    { id: 'webhook', label: 'Webhook', sub: 'POST /supply-chain-ingest', icon: '🌐', color: '#7C3AED', x: 60, y: 100, type: 'trigger' },
    { id: 'manual', label: 'Manual Trigger', sub: 'CSV file upload', icon: '📄', color: '#7C3AED', x: 60, y: 260, type: 'trigger' },
    { id: 'normalise', label: 'Normalise Records', sub: 'Function Node', icon: '🔄', color: '#2563EB', x: 310, y: 180, type: 'function' },
    { id: 'validate', label: 'Validate Records', sub: 'Function Node', icon: '✅', color: '#16A34A', x: 560, y: 180, type: 'function' },
    { id: 'enrich', label: 'Enrich — Supplier', sub: 'Postgres Node', icon: '🗄️', color: '#0891B2', x: 810, y: 180, type: 'postgres' },
    { id: 'store_rec', label: 'Store Records', sub: 'Postgres INSERT', icon: '💾', color: '#0891B2', x: 1060, y: 110, type: 'postgres' },
    { id: 'store_run', label: 'Store Run Summary', sub: 'Postgres INSERT', icon: '📊', color: '#0891B2', x: 1060, y: 260, type: 'postgres' },
    { id: 'if_crit', label: 'IF Critical?', sub: 'Check flag_severity', icon: '⚡', color: '#CA8A04', x: 1310, y: 110, type: 'logic' },
    { id: 'email', label: 'Send Alert Email', sub: 'SMTP via env vars', icon: '📧', color: '#DC2626', x: 1560, y: 50, type: 'email' },
    { id: 'respond', label: 'Respond Webhook', sub: 'HTTP 200 summary', icon: '↩️', color: '#6B7280', x: 1560, y: 210, type: 'output' },
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
                stroke={dashed ? '#4B5563' : '#6366F1'}
                strokeWidth={2}
                strokeDasharray={dashed ? '6 4' : 'none'}
                opacity={0.6}
            />
            {/* Animated dot traveling along the path */}
            {!dashed && (
                <circle r="3" fill="#818CF8" opacity={0.9}>
                    <animateMotion dur="3s" repeatCount="indefinite" path={path} />
                </circle>
            )}
            {/* Arrow head at end */}
            <circle cx={x2} cy={y2} r={4} fill={dashed ? '#4B5563' : '#6366F1'} opacity={0.6} />
            {/* Label */}
            {label && (
                <text x={midX} y={midY - 8} fill="#9CA3AF" fontSize={10} fontWeight={600} textAnchor="middle" fontFamily="Inter, sans-serif">
                    {label}
                </text>
            )}
        </g>
    );
}

/* ── Single workflow node ────────────────────────────────────────── */
function WorkflowNode({ node, isHovered, onHover, onLeave }) {
    return (
        <g
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{ cursor: 'pointer' }}
        >
            {/* Glow effect on hover */}
            {isHovered && (
                <rect
                    x={-4}
                    y={-4}
                    width={NODE_W + 8}
                    height={NODE_H + 8}
                    rx={16}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2}
                    opacity={0.4}
                />
            )}
            {/* Node body */}
            <rect
                width={NODE_W}
                height={NODE_H}
                rx={12}
                fill="#1E1E2E"
                stroke={isHovered ? node.color : '#2D2D3F'}
                strokeWidth={isHovered ? 2 : 1}
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
                fill={node.color + '20'}
                stroke={node.color + '40'}
                strokeWidth={1}
            />
            <text
                x={28}
                y={NODE_H / 2 + 5}
                textAnchor="middle"
                fontSize={14}
            >
                {node.icon}
            </text>
            {/* Label */}
            <text
                x={54}
                y={NODE_H / 2 - 5}
                fill="#E5E7EB"
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
                fill="#6B7280"
                fontSize={10}
                fontFamily="Inter, sans-serif"
            >
                {node.sub}
            </text>
        </g>
    );
}

/* ── Grid dots background pattern ────────────────────────────────── */
function GridPattern() {
    const dots = [];
    for (let x = 0; x < 1800; x += 24) {
        for (let y = 0; y < 400; y += 24) {
            dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="#2D2D3F" />);
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
            <div>
                <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Pipeline Workflow</h1>
                <p className="text-sm text-[#6B7280] mt-0.5">n8n workflow architecture — visualised exactly as it runs in production</p>
            </div>

            {/* Canvas — n8n-style dark editor */}
            <div className="rounded-2xl overflow-hidden border border-[#2D2D3F] shadow-xl">
                {/* Top bar mimicking n8n editor */}
                <div className="bg-[#13131D] border-b border-[#2D2D3F] px-5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#DC2626]" />
                            <div className="w-3 h-3 rounded-full bg-[#CA8A04]" />
                            <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                        </div>
                        <span className="text-xs font-semibold text-[#9CA3AF] ml-2 tracking-wide">
                            ALDI_SUD_Supply_Chain_Pipeline — workflow.json
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse-dot" />
                            <span className="text-[11px] font-semibold text-[#16A34A]">Active</span>
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7280]">
                            {NODES.length} nodes · {CONNECTIONS.length} connections
                        </span>
                    </div>
                </div>

                {/* SVG Canvas */}
                <div className="bg-[#181825] overflow-x-auto">
                    <svg
                        width={canvasW}
                        height={canvasH}
                        viewBox={`0 0 ${canvasW} ${canvasH}`}
                        className="min-w-full"
                        style={{ minHeight: canvasH }}
                    >
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
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
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
                            <div key={t.label} className="flex items-center gap-3">
                                <div className="w-3 h-8 rounded-sm" style={{ backgroundColor: t.color }} />
                                <div>
                                    <span className="text-xs font-bold text-[#111827]">{t.label}</span>
                                    <span className="text-xs text-[#9CA3AF] ml-2">{t.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pipeline Stats */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-[#111827] mb-3">Pipeline Architecture</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Total Nodes</span>
                            <span className="text-sm font-bold text-[#111827]">10</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Connections</span>
                            <span className="text-sm font-bold text-[#111827]">10</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Validation Rules</span>
                            <span className="text-sm font-bold text-[#111827]">6</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Severity Levels</span>
                            <span className="text-sm font-bold text-[#111827]">4 (LOW → CRITICAL)</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-[#F3F4F6]">
                            <span className="text-xs font-medium text-[#6B7280]">Alert Trigger</span>
                            <span className="text-sm font-bold text-[#DC2626]">CRITICAL only</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-xs font-medium text-[#6B7280]">Ingestion Methods</span>
                            <span className="text-sm font-bold text-[#111827]">Webhook + CSV</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation Rules Reference */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-[#F3F4F6]">
                    <h2 className="text-sm font-bold text-[#111827]">Validation Rules — Stage 3</h2>
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
                            { field: 'lead_time_days', rule: 'Integer 1–14 (>14 = CRITICAL)', severity: 'CRITICAL', color: '#991B1B' },
                            { field: 'origin_country', rule: 'ISO 3166-1 alpha-2 code', severity: 'MEDIUM', color: '#EA580C' },
                            { field: 'supplier_id', rule: 'Present and non-null', severity: 'HIGH', color: '#DC2626' },
                        ].map((r, i) => (
                            <tr key={r.field} className={`border-b border-[#F3F4F6] ${i === 5 ? 'border-b-0' : ''}`}>
                                <td className="px-5 py-3">
                                    <span className="font-mono text-xs bg-[#F3F4F6] px-2 py-0.5 rounded font-medium">{r.field}</span>
                                </td>
                                <td className="px-5 py-3 text-xs text-[#6B7280]">{r.rule}</td>
                                <td className="px-5 py-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                                        style={{ backgroundColor: r.color + '15', color: r.color }}>
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
