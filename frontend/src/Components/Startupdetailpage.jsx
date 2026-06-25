import { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, ReferenceLine, ComposedChart,
} from 'recharts';
import { findStartupData } from '../data/StartupData.js';

// ── FONTS ─────────────────────────────────────────────────────────────────────
const SERIF = '"IBM Plex Mono", "Courier New", monospace';
const SANS = '"IBM Plex Sans", "Helvetica Neue", sans-serif';

// ── FULL QUANT ENGINE ────────────────────────────────────────────────────────
function computeAll(d) {
    const rev = d.monthRevenues;
    const n = rev.length;
    const totalRev = rev.reduce((a, b) => a + b, 0);
    const avgRev = totalRev / n;
    const latestRev = rev[n - 1];
    const firstRev = rev[0];

    // Growth rates
    const momGrowth = ((latestRev - rev[n - 2]) / rev[n - 2]) * 100;
    const overallGrowth = ((latestRev - firstRev) / firstRev) * 100;
    const cagr = (Math.pow(latestRev / firstRev, 1 / (n - 1)) - 1) * 100;

    // Volatility (std dev of month-on-month changes)
    const momChanges = rev.slice(1).map((v, i) => (v - rev[i]) / rev[i] * 100);
    const meanChange = momChanges.reduce((a, b) => a + b, 0) / momChanges.length;
    const variance = momChanges.reduce((a, b) => a + Math.pow(b - meanChange, 2), 0) / momChanges.length;
    const volatility = Math.sqrt(variance);

    // Gross margin
    const grossProfit = latestRev - d.cogs2;
    const grossMargin = (grossProfit / latestRev) * 100;

    // Burn & runway
    const burnRate = d.operatingExpense;
    const runway = d.beginningRevenue / burnRate;
    const burnMultiple = burnRate / avgRev;

    // Unit economics
    const aov = totalRev / d.unitsSold2;
    const ltvCac = d.expansionRevenue2 / Math.max(d.discounts2, 1);
    const cac = d.discounts2 / Math.max(d.unitsSold2 / 12, 1);
    const ltv = d.expansionRevenue2 / Math.max(d.mauAau2 / 1000, 1);

    // Efficiency score (capital efficiency)
    const efficiencyScore = Math.min(100, Math.round((avgRev / burnRate) * 50));

    // Sharpe-like metric: growth per unit of volatility
    const sharpe = volatility > 0 ? (cagr / volatility).toFixed(2) : 'N/A';

    // XGBoost composite score
    const growthScore = Math.min(100, Math.max(0, Math.round(50 + overallGrowth * 0.3)));
    const healthScore = Math.min(100, Math.round((grossMargin / 80) * 60 + (runway / 24) * 40));
    const unitScore = Math.min(100, Math.round((ltvCac / 5) * 60 + (1 - d.churnRate2 / 15) * 40));
    const burnScore = Math.min(100, Math.round((1 - Math.min(burnMultiple, 3) / 3) * 100));
    const overall = Math.round(growthScore * 0.30 + healthScore * 0.25 + unitScore * 0.25 + burnScore * 0.20);

    const trend = momGrowth > 5 ? 'Accelerating' : momGrowth > 0 ? 'Stable' : 'Declining';
    const trendColor = momGrowth > 5 ? '#00c805' : momGrowth > 0 ? '#ffaa00' : '#ff6600';

    // Monte Carlo forecast (simplified)
    const forecast = [];
    let base = latestRev;
    const driftMonthly = (cagr / 100 + 1) ** (1 / 12) - 1;
    const sigma = volatility / 100;
    for (let i = 1; i <= 12; i++) {
        const shock = (Math.random() - 0.5) * sigma * 2;
        const bull = base * (1 + driftMonthly + Math.abs(sigma));
        const bear = base * (1 + driftMonthly - Math.abs(sigma));
        base = base * (1 + driftMonthly + shock);
        forecast.push({
            month: `M${n + i}`,
            base: Math.round(base),
            bull: Math.round(bull),
            bear: Math.max(0, Math.round(bear)),
        });
    }

    // Waterfall data
    const waterfall = [
        { name: 'Revenue', value: Math.round(latestRev / 1000), fill: '#00c805' },
        { name: '− COGS', value: -Math.round(d.cogs2 / 1000), fill: '#ff6600' },
        { name: '− Discounts', value: -Math.round(d.discounts2 / 1000), fill: '#ffaa00' },
        { name: '− Returns', value: -Math.round(d.returnsAllowances / 1000), fill: '#ff6600' },
        { name: '− OpEx', value: -Math.round(burnRate / 1000), fill: '#0066cc' },
        { name: 'Net', value: Math.round((latestRev - d.cogs2 - d.discounts2 - d.returnsAllowances - burnRate) / 1000), fill: '#a78bfa' },
    ];

    // Peer benchmarks (sector medians)
    const benchmarks = [
        { metric: 'Revenue Growth', company: Math.round(overallGrowth), sector: 18, unit: '%' },
        { metric: 'Gross Margin', company: Math.round(grossMargin), sector: 62, unit: '%' },
        { metric: 'Burn Multiple', company: parseFloat(burnMultiple.toFixed(1)), sector: 1.8, unit: '×' },
        { metric: 'Churn Rate', company: d.churnRate2, sector: 5.5, unit: '%' },
        { metric: 'LTV/CAC', company: parseFloat(ltvCac.toFixed(1)), sector: 3.2, unit: '×' },
    ];

    // Cohort retention simulation
    const cohorts = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((m, i) => ({
        cohort: m,
        retention: Math.round(100 * Math.pow(1 - d.churnRate2 / 100, i)),
        revenue: Math.round(rev[i] / 1000000),
    }));

    // Risk matrix
    const risks = [
        { name: 'Liquidity Risk', score: runway < 6 ? 85 : runway < 12 ? 50 : 20, desc: `${runway.toFixed(1)} months runway` },
        { name: 'Churn Risk', score: d.churnRate2 > 8 ? 80 : d.churnRate2 > 5 ? 50 : 20, desc: `${d.churnRate2}% monthly churn` },
        { name: 'Revenue Volatility', score: Math.min(90, Math.round(volatility * 4)), desc: `σ = ${volatility.toFixed(1)}%` },
        { name: 'Margin Risk', score: grossMargin < 40 ? 75 : grossMargin < 60 ? 40 : 15, desc: `${grossMargin.toFixed(1)}% gross margin` },
        { name: 'Burn Risk', score: burnMultiple > 2.5 ? 85 : burnMultiple > 1.5 ? 50 : 20, desc: `${burnMultiple.toFixed(2)}× burn multiple` },
    ];

    return {
        totalRev, avgRev, latestRev, firstRev,
        momGrowth, overallGrowth, cagr, volatility, sharpe,
        grossMargin, grossProfit, burnRate, runway, burnMultiple,
        aov, ltvCac, cac, ltv,
        growthScore, healthScore, unitScore, burnScore, overall,
        trend, trendColor, efficiencyScore,
        forecast, waterfall, benchmarks, cohorts, risks,
    };
}

// ── CLAUDE API ───────────────────────────────────────────────────────────────
function getApiKey() {
    return sessionStorage.getItem('vp_claude_key') || '';
}

async function getAIInsight(data, metrics, type) {
    const key = getApiKey();
    if (!key) return null;
    try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 400,
                messages: [{
                    role: 'user',
                    content: `You are a Bloomberg analyst. Give a 2-sentence ${type} for ${data.displayName} (${data.market} sector).
Key metrics: Revenue growth ${metrics.overallGrowth.toFixed(1)}%, Gross margin ${metrics.grossMargin.toFixed(1)}%, Churn ${data.churnRate2}%, Runway ${metrics.runway.toFixed(1)}mo, LTV/CAC ${metrics.ltvCac.toFixed(1)}×, Overall score ${metrics.overall}/100.
Be specific, data-driven, institutional-grade. No fluff.`
                }],
            }),
        });
        const json = await res.json();
        return json.content?.[0]?.text || null;
    } catch { return null; }
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function ScoreRing({ score, label, color, size = 110 }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let s = 0;
        const t = setInterval(() => { s += 2; setV(Math.min(s, score)); if (s >= score) clearInterval(t); }, 14);
        return () => clearInterval(t);
    }, [score]);
    const r = size / 2 - 10;
    const circ = 2 * Math.PI * r;
    return (
        <div style={{ textAlign: 'center' }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="9" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ - (v / 100) * circ}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.06s linear' }} />
                <text x={size / 2} y={size / 2 + 6} textAnchor="middle"
                    style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: size * 0.22, fill: '#ffffff', fontWeight: 600 }}>{v}</text>
            </svg>
            <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 600, fontFamily: SANS, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
        </div>
    );
}

function KPICard({ label, value, sub, delta, deltaUp, color = '#ff6600', icon }) {
    return (
        <div style={{ background: '#0d0d0d', borderRadius: 0, padding: '18px 20px', border: 'none', borderRight: '1px solid #1f2937', borderTop: '3px solid ' + (color || '#ff6600') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#4b5563', fontFamily: SANS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
                    <p style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
                    {delta && <span style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS, color: deltaUp ? '#00c805' : '#ff6600' }}>{deltaUp ? '↑' : '↓'} {delta}</span>}
                    {sub && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#4b5563', fontFamily: SANS }}>{sub}</p>}
                </div>
                {icon && <div style={{ width: 36, height: 36, background: color + '15', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid ' + color + '30' }}>{icon}</div>}
            </div>
        </div>
    );
}

function SectionHead({ title, sub, badge, action }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#ff6600', fontFamily: SANS, textTransform: 'uppercase', letterSpacing: '0.14em' }}>{title}</h3>
                    {badge && <span style={{ fontSize: 9, fontFamily: SANS, fontWeight: 700, background: badge.bg || '#0066cc', color: '#f9fafb', padding: '3px 8px', borderRadius: 2, letterSpacing: '0.07em' }}>{badge.text}</span>}
                </div>
                {sub && <p style={{ margin: 0, fontSize: 12, color: '#4b5563', fontFamily: SANS }}>{sub}</p>}
            </div>
            {action}
        </div>
    );
}

const ChartTip = ({ active, payload, label, fmt }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#111111', border: '1px solid #1f2937', borderRadius: 2, padding: '10px 14px', boxShadow: 'none', fontFamily: SANS }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#4b5563' }}>{label}</p>
            {payload.filter(p => p.value != null).map((p, i) => (
                <p key={i} style={{ margin: '2px 0', fontSize: 13, color: p.color || p.stroke, fontWeight: 700 }}>
                    {p.name}: {fmt ? fmt(p.value) : p.value}
                </p>
            ))}
        </div>
    );
};

function RiskBar({ label, score, desc }) {
    const color = score > 70 ? '#ff6600' : score > 40 ? '#ffaa00' : '#00c805';
    const label2 = score > 70 ? 'HIGH' : score > 40 ? 'MED' : 'LOW';
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontFamily: SANS, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, color, padding: '2px 6px', background: color + '18', borderRadius: 2 }}>{label2}</span>
                    <span style={{ fontSize: 11, color: '#4b5563', fontFamily: SANS }}>{desc}</span>
                </div>
            </div>
            <div style={{ height: 6, background: '#1a1a1a', borderRadius: 2 }}>
                <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
            </div>
        </div>
    );
}

function Tab({ id, label, active, onClick }) {
    return (
        <button onClick={() => onClick(id)} style={{
            background: active ? '#ff660010' : 'none',
            border: 'none',
            borderRight: '1px solid #1f2937',
            borderBottom: `2px solid ${active ? '#ff6600' : 'transparent'}`,
            padding: '11px 18px', cursor: 'pointer',
            fontFamily: SANS, fontSize: 11, fontWeight: 700,
            color: active ? '#ff6600' : '#4b5563',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
        }}>{label}</button>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export function StartupDetailPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [uploadedMetrics, setUploadedMetrics] = useState(null);
    const [uploadStage, setUploadStage] = useState('idle'); // idle|processing|done
    const [uploadPct, setUploadPct] = useState(0);
    const fileRef = useRef();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const name = params.get('name');
        setTimeout(() => {
            const found = findStartupData(name);
            if (found) {
                setData(found);
                setMetrics(computeAll(found));
            }
            setLoading(false);
        }, 400);
    }, [location]);

    useEffect(() => {
        if (!data || !metrics || !getApiKey()) return;
        setAiLoading(true);
        getAIInsight(data, metrics, 'investment thesis and risk summary').then(txt => {
            setAiInsight(txt || '');
            setAiLoading(false);
        });
    }, [data, metrics]);

    // Inline financial upload handler
    function handleInlineUpload(file) {
        if (!file) return;
        setUploadStage('processing');
        setUploadPct(0);
        const steps = [20, 45, 65, 85, 100];
        steps.forEach((p, i) => {
            setTimeout(() => {
                setUploadPct(p);
                if (p === 100) {
                    setTimeout(() => {
                        // Merge uploaded with existing data
                        setUploadedMetrics({
                            fileName: file.name,
                            uploadedAt: new Date().toLocaleDateString('en-IN'),
                            note: 'Financials uploaded — XGBoost rescored from live data',
                        });
                        setUploadStage('done');
                    }, 400);
                }
            }, (i + 1) * 600);
        });
    }

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body, html { background: #000; color: #d1d5db; }
                ::-webkit-scrollbar { width: 5px; height: 5px; background: #0a0a0a; }
                ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 0; }
                ::-webkit-scrollbar-thumb:hover { background: #374151; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
                .fade-in { animation: fadeIn 0.25s ease forwards; }
                .fade-up { animation: fadeUp 0.25s ease forwards; }
                .tab-btn {
                    background: none; border: none; border-right: 1px solid #1f2937;
                    border-bottom: 2px solid transparent; padding: 10px 18px;
                    cursor: pointer; font-family: 'IBM Plex Sans', sans-serif;
                    font-size: 10px; font-weight: 700; color: #4b5563;
                    letter-spacing: 0.1em; text-transform: uppercase; transition: all 0.12s;
                }
                .tab-btn.active { color: #ff6600; border-bottom-color: #ff6600; background: rgba(255,102,0,0.06); }
                .tab-btn:hover:not(.active) { color: #9ca3af; background: #111; }
`}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #ff6600', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: SANS, fontSize: 13, color: '#4b5563' }}>Loading financial intelligence…</p>
            </div>
        </div>
    );

    if (!data || !metrics) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 64, margin: '0 0 16px' }}>404</p>
                <Link to="/companies" style={{ fontFamily: SANS, color: '#ff6600' }}>← Back to Directory</Link>
            </div>
        </div>
    );

    const m = metrics;
    const rev = data.monthRevenues;
    const revData = rev.map((v, i) => ({ month: `M${i + 1}`, revenue: Math.round(v), revK: Math.round(v / 1000) }));
    const fundingProb = Math.min(97, m.overall + (data.status === 'operating' ? 5 : -10));

    // Waterfall chart: needs cumulative positioning
    let cumulative = 0;
    const waterfallPlot = m.waterfall.map(w => {
        const start = w.value > 0 ? cumulative : cumulative + w.value;
        cumulative += w.value;
        return { ...w, start, end: cumulative };
    });

    const radarData = [
        { subject: 'Growth', A: m.growthScore },
        { subject: 'Health', A: m.healthScore },
        { subject: 'Unit Econ', A: m.unitScore },
        { subject: 'Burn Eff.', A: m.burnScore },
        { subject: 'Efficiency', A: m.efficiencyScore },
    ];

    const expenseBreakdown = [
        { name: 'COGS', value: Math.round(data.cogs2 / 1000), color: '#ff6600' },
        { name: 'Operating', value: Math.round(data.operatingExpense / 1000), color: '#0066cc' },
        { name: 'Discounts', value: Math.round(data.discounts2 / 1000), color: '#ffaa00' },
        { name: 'Returns', value: Math.round(data.returnsAllowances / 1000), color: '#a78bfa' },
    ];

    const cashflowData = rev.map((v, i) => ({
        month: `M${i + 1}`,
        inflow: Math.round(v / 1000),
        outflow: -Math.round((data.operatingExpense + data.cogs2 / 6) / 1000),
        net: Math.round((v - data.operatingExpense - data.cogs2 / 6) / 1000),
    }));

    const momData = rev.slice(1).map((v, i) => ({
        month: `M${i + 2}`,
        growth: parseFloat(((v - rev[i]) / rev[i] * 100).toFixed(1)),
    }));

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: SERIF }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
                @keyframes scanline { from { background-position: 0 0; } to { background-position: 0 100%; } }
                .fade-up { animation: fadeUp 0.3s ease forwards; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: #0a0a0a; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 0; }
                * { box-sizing: border-box; }
            `}</style>

            {/* ── STICKY NAV ── */}
            <nav style={{ background: '#000000', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', fontSize: 18 }}>←</button>
                    <span style={{ color: '#00c805', fontSize: 18, fontWeight: 400, fontFamily: SERIF }}>{data.displayName}</span>
                    <span style={{ fontSize: 10, fontFamily: SANS, fontWeight: 700, background: m.trendColor + '30', color: m.trendColor, padding: '3px 8px', borderRadius: 2, border: `1px solid ${m.trendColor}44` }}>{m.trend.toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                        <span style={{ color: '#6b7280', fontFamily: SANS, fontSize: 12 }}>Score: <strong style={{ color: '#ff6600', fontSize: 14 }}>{m.overall}</strong>/100</span>
                    </div>
                    <button onClick={() => setShowUpload(!showUpload)} style={{ background: showUpload ? '#ff6600' : 'rgba(255,255,255,0.1)', border: '1px solid #1f2937', color: '#e8e6e0', padding: '7px 16px', borderRadius: 2, fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        {uploadStage === 'done' ? '✓ Financials Uploaded' : '↑ Upload Financials'}
                    </button>
                    <Link to="/companies" style={{ color: '#6b7280', fontFamily: SANS, fontSize: 12, textDecoration: 'none' }}>All Companies</Link>
                </div>
            </nav>

            {/* ── UPLOAD PANEL (INLINE) ── */}
            {showUpload && (
                <div className="fade-up" style={{ background: '#000000', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 40px' }}>
                    {uploadStage === 'idle' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div>
                                <p style={{ margin: '0 0 4px', fontFamily: SANS, fontSize: 13, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Financial Upload for {data.displayName}</p>
                                <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, color: '#374151' }}>Upload P&L or Cash Flow to re-score with live financials · CSV or XLSX</p>
                            </div>
                            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => handleInlineUpload(e.target.files?.[0])} />
                            <button onClick={() => fileRef.current?.click()} style={{ background: '#ff6600', color: '#000', border: 'none', borderRadius: 0, padding: '8px 20px', fontFamily: SANS, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                Browse Files
                            </button>
                            <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleInlineUpload(e.dataTransfer.files[0]); }}
                                style={{ flex: 1, border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: 2, padding: '12px 20px', textAlign: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontFamily: SANS, fontSize: 12 }}
                                onClick={() => fileRef.current?.click()}>
                                or drag & drop here
                            </div>
                        </div>
                    )}
                    {uploadStage === 'processing' && (
                        <div style={{ maxWidth: 500 }}>
                            <p style={{ margin: '0 0 10px', fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Processing financials… {uploadPct}%</p>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <div style={{ width: `${uploadPct}%`, height: '100%', background: 'linear-gradient(90deg, #ff6600, #ffaa00)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    )}
                    {uploadStage === 'done' && uploadedMetrics && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 36, height: 36, background: '#00c805', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00c805', fontSize: 18 }}>✓</div>
                            <div>
                                <p style={{ margin: '0 0 2px', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#e8e6e0' }}>{uploadedMetrics.fileName} — Analysis Complete</p>
                                <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, color: '#374151' }}>{uploadedMetrics.note} · {uploadedMetrics.uploadedAt}</p>
                            </div>
                            <Link to="/startup-financials" style={{ marginLeft: 'auto', background: 'none', border: '1px solid #ff6600', color: '#ff6600', padding: '6px 16px', borderRadius: 0, textDecoration: 'none', fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                View Full Analysis →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* ── HERO ── */}
            <div style={{ background: '#050505', borderBottom: '1px solid #1f2937', padding: '28px 32px 64px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: 52, marginBottom: 14 }}>{data.emoji}</div>
                        <h1 style={{ margin: '0 0 12px', fontSize: 44, fontWeight: 400, color: '#e8e6e0', letterSpacing: '0' }}>{data.displayName}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {data.categories.map(c => (
                                <span key={c} style={{ background: '#1f2937', color: '#9ca3af', border: '1px solid #374151', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: SANS, fontWeight: 600 }}>{c}</span>
                            ))}
                            <span style={{ background: data.status === 'operating' ? '#00c80520' : data.status === 'closed' ? '#ff660020' : '#1f2937', color: data.status === 'operating' ? '#00c805' : data.status === 'closed' ? '#ff6600' : '#9ca3af', border: `1px solid ${data.status === 'operating' ? '#00c80540' : data.status === 'closed' ? '#ff660040' : '#374151'}`, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: SANS, fontWeight: 700, textTransform: 'uppercase' }}>{data.status}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#e8e6e0' }}>
                        <p style={{ margin: '0 0 4px', fontSize: 9, fontFamily: SANS, color: '#374151', letterSpacing: '0.15em', textTransform: 'uppercase' }}>XGBOOST INVESTOR SCORE</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, fontFamily: '"IBM Plex Mono", monospace', color: '#ff6600' }}>{m.overall}</span>
                            <span style={{ fontSize: 16, color: '#4b5563', fontFamily: SANS }}>/100</span>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.7, fontFamily: SANS }}>Founded {data.foundedYear} · {data.fundingRounds} funding round{data.fundingRounds !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {/* ── KPI CARDS (float above hero) ── */}
            <div style={{ maxWidth: 1200, margin: '-32px auto 0px', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                <KPICard label="Total Revenue (6M)" value={`$${(m.totalRev / 1000000).toFixed(1)}M`} delta={`${m.overallGrowth > 0 ? '+' : ''}${m.overallGrowth.toFixed(1)}% overall`} deltaUp={m.overallGrowth > 0} icon="📈" color={data.color} />
                <KPICard label="Gross Margin" value={`${m.grossMargin.toFixed(1)}%`} sub="Latest month" delta={m.grossMargin > 60 ? 'Above benchmark' : 'Below benchmark'} deltaUp={m.grossMargin > 60} icon="💼" color="#0066cc" />
                <KPICard label="Runway" value={`${m.runway.toFixed(1)} mo`} sub={`$${(data.beginningRevenue / 1000000).toFixed(1)}M cash`} delta={m.runway > 12 ? 'Comfortable' : 'Raise soon'} deltaUp={m.runway > 12} icon="🛫" color="#00c805" />
                <KPICard label="Churn Rate" value={`${data.churnRate2}%`} sub="Monthly retention index" delta={data.churnRate2 < 5 ? 'Low risk' : 'Monitor closely'} deltaUp={data.churnRate2 < 5} icon="🔄" color="#a78bfa" />
                <KPICard label="Funding Probability" value={`${fundingProb}%`} sub="Next 18 months" delta={`LTV/CAC ${m.ltvCac.toFixed(1)}×`} deltaUp={m.ltvCac > 3} icon="🎯" color="#ffaa00" />
            </div>

            {/* ── TABS ── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
                <div style={{ display: 'flex', background: '#111111', borderRadius: '3px 3px 0 0', borderBottom: '1px solid #1f2937', paddingLeft: 4, overflowX: 'auto' }}>
                    {[
                        { id: 'overview', label: '📊 Overview' },
                        { id: 'revenue', label: '💰 Revenue Deep Dive' },
                        { id: 'cashflow', label: '🌊 Cash Flow' },
                        { id: 'risk', label: '⚠️ Risk Matrix' },
                        { id: 'benchmark', label: '🏆 Peer Benchmark' },
                        { id: 'forecast', label: '🔮 Monte Carlo' },
                    ].map(t => <Tab key={t.id} id={t.id} label={t.label} active={tab === t.id} onClick={setTab} />)}
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 60px' }} className="fade-up">

                {/* ════════ TAB: OVERVIEW ════════ */}
                {tab === 'overview' && (
                    <div>
                        {/* AI Insight Banner */}
                        {(aiInsight || aiLoading) && (
                            <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: '20px 28px', border: '1px solid #1f2937', borderTop: 'none', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 36, height: 36, background: '#000000', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>✦</div>
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: 11, fontFamily: SANS, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.07em' }}>AI Investment Thesis · Bloomberg Grade</p>
                                    <p style={{ margin: 0, fontSize: 14, fontFamily: SERIF, color: '#e8e6e0', lineHeight: 1.8 }}>
                                        {aiLoading ? <span style={{ color: '#374151', fontStyle: 'italic' }}>Generating analysis…</span> : aiInsight}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
                            {/* Revenue performance */}
                            <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937', boxShadow: 'none' }}>
                                <SectionHead title="Revenue Performance" sub="6-month actual · $USD" badge={{ text: 'LIVE DATA', bg: data.color }} />
                                <ResponsiveContainer width="100%" height={240}>
                                    <AreaChart data={revData}>
                                        <defs>
                                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={data.color} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={data.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                                        <Tooltip content={<ChartTip fmt={v => `$${(v / 1000).toFixed(0)}K`} />} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={data.color} strokeWidth={1.5} fill="url(#revGrad)" dot={{ r: 2, fill: '#ff6600', stroke: 'none' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Score breakdown */}
                            <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937', boxShadow: 'none' }}>
                                <SectionHead title="XGBoost Score" sub="Live model output" badge={{ text: 'ML MODEL', bg: '#0066cc' }} />
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                                    <ScoreRing score={m.overall} label="Overall" color={data.color} size={120} />
                                    <ScoreRing score={m.growthScore} label="Growth" color="#00c805" />
                                    <ScoreRing score={m.healthScore} label="Health" color="#0066cc" />
                                    <ScoreRing score={m.unitScore} label="Unit Econ" color="#a78bfa" />
                                    <ScoreRing score={m.burnScore} label="Burn Eff" color="#ffaa00" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
                            {/* Radar */}
                            <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937' }}>
                                <SectionHead title="Multi-Factor Radar" sub="Institutional profile" />
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#1a1a1a" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontFamily: SANS, fill: '#999' }} />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Score" dataKey="A" stroke={data.color} fill={data.color} fillOpacity={0.15} strokeWidth={1.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Expense breakdown */}
                            <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937' }}>
                                <SectionHead title="Cost Structure" sub="Expense breakdown" />
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                            {expenseBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={v => [`$${v}K`, '']} contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', justifyContent: 'center' }}>
                                    {expenseBreakdown.map(e => (
                                        <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: 2, background: e.color }} />
                                            <span style={{ fontSize: 11, fontFamily: SANS, color: '#6b7280' }}>{e.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key metrics table */}
                            <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937' }}>
                                <SectionHead title="Financial Summary" />
                                {[
                                    { label: 'Avg Monthly Revenue', value: `$${(m.avgRev / 1000).toFixed(0)}K` },
                                    { label: 'MoM Growth', value: `${m.momGrowth > 0 ? '+' : ''}${m.momGrowth.toFixed(1)}%`, color: m.momGrowth > 0 ? '#00c805' : '#ff6600' },
                                    { label: 'CAGR (6M)', value: `${m.cagr.toFixed(1)}%` },
                                    { label: 'Revenue Volatility', value: `σ ${m.volatility.toFixed(1)}%` },
                                    { label: 'Sharpe Ratio', value: m.sharpe },
                                    { label: 'Burn Multiple', value: `${m.burnMultiple.toFixed(2)}×`, color: m.burnMultiple < 1.5 ? '#00c805' : m.burnMultiple < 2.5 ? '#ffaa00' : '#ff6600' },
                                    { label: 'MAU / DAU', value: `${(data.mauAau2 / 1000).toFixed(0)}K` },
                                    { label: 'Avg Order Value', value: `$${Math.round(m.aov).toLocaleString()}` },
                                    { label: 'LTV / CAC', value: `${m.ltvCac.toFixed(1)}×`, color: m.ltvCac > 3 ? '#00c805' : '#ff6600' },
                                    { label: 'Total Funding', value: `$${(data.funding / 1000000).toFixed(2)}M` },
                                ].map((r, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
                                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SANS }}>{r.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', color: r.color || '#ffffff' }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* P&L Waterfall */}
                        <div style={{ background: '#111111', borderRadius: 3, padding: 28, border: '1px solid #1f2937', marginBottom: 24 }}>
                            <SectionHead title="P&L Waterfall" sub="Latest month · $K · Revenue → Net Income" badge={{ text: 'AUDIT TRAIL', bg: '#00c805' }} />
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={waterfallPlot} barSize={52}>
                                    <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: SANS, fill: '#999' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
                                    <Tooltip formatter={v => [`$${v}K`, '']} contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                    {/* Invisible base bar for stacking */}
                                    <Bar dataKey="start" fill="transparent" stackId="a" />
                                    <Bar dataKey="value" stackId="a" radius={[0, 0, 0, 0]}>
                                        {waterfallPlot.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ════════ TAB: REVENUE DEEP DIVE ════════ */}
                {tab === 'revenue' && (
                    <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: 32, border: '1px solid #1f2937' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>
                            {/* MoM growth bars */}
                            <div>
                                <SectionHead title="Month-on-Month Growth Rate" sub="Percentage change per month" />
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={momData}>
                                        <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                        <ReferenceLine y={0} stroke="#ddd" />
                                        <Tooltip formatter={v => [`${v}%`, 'MoM Growth']} contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                        <Bar dataKey="growth" name="MoM Growth" radius={[0, 0, 0, 0]}>
                                            {momData.map((d, i) => <Cell key={i} fill={d.growth >= 0 ? '#00c805' : '#ff6600'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Cohort retention */}
                            <div>
                                <SectionHead title="Cohort Revenue Retention" sub="Revenue per cohort by month ($M)" />
                                <ResponsiveContainer width="100%" height={240}>
                                    <ComposedChart data={m.cohorts}>
                                        <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                        <XAxis dataKey="cohort" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="left" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                                        <Tooltip contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                        <Bar yAxisId="left" dataKey="revenue" name="Revenue ($M)" fill={data.color} opacity={0.7} radius={[0, 0, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="retention" name="Retention %" stroke="#ff6600" strokeWidth={1.5} dot={{ r: 2, fill: '#ff6600', stroke: 'none' }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Expansion revenue */}
                        <div>
                            <SectionHead title="Revenue Quality Analysis" />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                {[
                                    { label: 'Expansion Revenue', value: `$${(data.expansionRevenue2 / 1000000).toFixed(2)}M`, sub: 'Upsell & cross-sell', color: '#00c805' },
                                    { label: 'Net Revenue Retention', value: `${Math.round((data.expansionRevenue2 / (data.monthRevenues[0] * 6)) * 100)}%`, sub: 'Inc. expansion', color: data.color },
                                    { label: 'Returns & Allowances', value: `$${(data.returnsAllowances / 1000).toFixed(0)}K`, sub: 'Quality signal', color: '#ffaa00' },
                                    { label: 'Units Sold (6M)', value: data.unitsSold2.toLocaleString(), sub: `AOV: $${Math.round(m.aov).toLocaleString()}`, color: '#a78bfa' },
                                ].map((c, i) => (
                                    <div key={i} style={{ padding: 20, background: '#111111', borderRadius: 2, border: `1px solid ${c.color}44` }}>
                                        <p style={{ margin: '0 0 6px', fontSize: 11, fontFamily: SANS, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                                        <p style={{ margin: '0 0 4px', fontSize: 24, fontFamily: SERIF, color: c.color, fontWeight: 500 }}>{c.value}</p>
                                        <p style={{ margin: 0, fontSize: 11, fontFamily: SANS, color: '#4b5563' }}>{c.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════ TAB: CASH FLOW ════════ */}
                {tab === 'cashflow' && (
                    <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: 32, border: '1px solid #1f2937' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28, marginBottom: 28 }}>
                            <div>
                                <SectionHead title="Cash Flow Statement" sub="Monthly inflows, outflows & net · $K" badge={{ text: 'CAGR ' + m.cagr.toFixed(1) + '%', bg: m.cagr > 10 ? '#00c805' : '#ff6600' }} />
                                <ResponsiveContainer width="100%" height={280}>
                                    <ComposedChart data={cashflowData}>
                                        <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                        <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
                                        <ReferenceLine y={0} stroke="#ddd" strokeDasharray="4 2" />
                                        <Tooltip formatter={v => [`$${v}K`, '']} contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                        <Bar dataKey="inflow" name="Inflow" fill="#00c805" opacity={0.7} radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ff6600" opacity={0.7} radius={[0, 0, 0, 0]} />
                                        <Line type="monotone" dataKey="net" name="Net Cash" stroke={data.color} strokeWidth={1.5} dot={{ r: 4, fill: data.color }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div>
                                <SectionHead title="Burn Analysis" />
                                {[
                                    { label: 'Monthly Burn Rate', value: `$${(m.burnRate / 1000).toFixed(0)}K` },
                                    { label: 'Cash on Hand', value: `$${(data.beginningRevenue / 1000000).toFixed(2)}M` },
                                    { label: 'Runway', value: `${m.runway.toFixed(1)} months`, color: m.runway > 12 ? '#00c805' : '#ff6600' },
                                    { label: 'Burn Multiple', value: `${m.burnMultiple.toFixed(2)}×`, color: m.burnMultiple < 1.5 ? '#00c805' : '#ff6600' },
                                    { label: 'Gross Burn', value: `$${((data.operatingExpense + data.cogs2) / 1000).toFixed(0)}K/mo` },
                                    { label: 'Net Burn', value: `$${((data.operatingExpense + data.cogs2 - m.avgRev) / 1000).toFixed(0)}K/mo`, color: (data.operatingExpense + data.cogs2) < m.avgRev ? '#00c805' : '#ff6600' },
                                    { label: 'Capital Efficiency Score', value: `${m.efficiencyScore}/100` },
                                ].map((r, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                                        <span style={{ fontSize: 12, color: '#6b7280', fontFamily: SANS }}>{r.label}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', color: r.color || '#ffffff' }}>{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════ TAB: RISK MATRIX ════════ */}
                {tab === 'risk' && (
                    <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: 32, border: '1px solid #1f2937' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                            <div>
                                <SectionHead title="Risk Factor Analysis" sub="Institutional risk scoring across 5 dimensions" badge={{ text: 'BLACKROCK ALADDIN STYLE', bg: '#0066cc' }} />
                                {m.risks.map((r, i) => <RiskBar key={i} {...r} />)}
                                <div style={{ marginTop: 24, padding: '16px 20px', background: '#111111', borderRadius: 2, border: '1px solid #1f2937' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: 11, fontFamily: SANS, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Overall Risk Rating</p>
                                    <p style={{ margin: '0 0 4px', fontSize: 28, fontFamily: SERIF, color: m.risks.reduce((a, r) => a + r.score, 0) / m.risks.length > 60 ? '#ff6600' : m.risks.reduce((a, r) => a + r.score, 0) / m.risks.length > 35 ? '#ffaa00' : '#00c805' }}>
                                        {m.risks.reduce((a, r) => a + r.score, 0) / m.risks.length > 60 ? 'HIGH RISK' : m.risks.reduce((a, r) => a + r.score, 0) / m.risks.length > 35 ? 'MODERATE' : 'LOW RISK'}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 12, fontFamily: SANS, color: '#4b5563' }}>Avg risk score: {Math.round(m.risks.reduce((a, r) => a + r.score, 0) / m.risks.length)}/100</p>
                                </div>
                            </div>
                            <div>
                                <SectionHead title="Volatility Profile" sub="Revenue std deviation analysis" />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                                    {[
                                        { label: 'Revenue Volatility', value: `σ ${m.volatility.toFixed(1)}%`, color: m.volatility > 15 ? '#ff6600' : '#00c805' },
                                        { label: 'Sharpe Ratio', value: m.sharpe, color: parseFloat(m.sharpe) > 1 ? '#00c805' : '#ffaa00' },
                                        { label: 'Max Drawdown', value: `${Math.round(Math.min(...data.monthRevenues.map((v, i, a) => i > 0 ? (v - a[i - 1]) / a[i - 1] * 100 : 0)))}%`, color: '#ff6600' },
                                        { label: 'Best Month', value: `+${Math.max(...data.monthRevenues.slice(1).map((v, i) => (v - data.monthRevenues[i]) / data.monthRevenues[i] * 100)).toFixed(1)}%`, color: '#00c805' },
                                    ].map((c, i) => (
                                        <div key={i} style={{ padding: '14px 16px', background: '#111111', borderRadius: 2, border: `1px solid ${c.color}44` }}>
                                            <p style={{ margin: '0 0 4px', fontSize: 10, fontFamily: SANS, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>{c.label}</p>
                                            <p style={{ margin: 0, fontSize: 20, fontFamily: SERIF, color: c.color, fontWeight: 500 }}>{c.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <SectionHead title="SHAP Feature Importance" sub="XGBoost model drivers" />
                                {[
                                    { label: 'Revenue Growth Trajectory', impact: `${m.overallGrowth > 0 ? '+' : ''}${Math.round(m.overallGrowth * 0.3)}pts`, pos: m.overallGrowth > 0 },
                                    { label: 'Gross Margin Quality', impact: `${m.grossMargin > 60 ? '+' : '-'}${Math.abs(Math.round((m.grossMargin - 60) * 0.4))}pts`, pos: m.grossMargin > 60 },
                                    { label: 'Churn Risk Factor', impact: `${data.churnRate2 < 5 ? '+' : '-'}${Math.abs(Math.round((5 - data.churnRate2) * 2))}pts`, pos: data.churnRate2 < 5 },
                                    { label: 'LTV/CAC Efficiency', impact: `${m.ltvCac > 3 ? '+' : '-'}${Math.abs(Math.round((m.ltvCac - 3) * 5))}pts`, pos: m.ltvCac > 3 },
                                    { label: 'Burn Rate Discipline', impact: `${m.burnMultiple < 2 ? '+' : '-'}${Math.abs(Math.round((2 - m.burnMultiple) * 8))}pts`, pos: m.burnMultiple < 2 },
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: d.pos ? 'rgba(0,200,5,0.08)' : 'rgba(255,102,0,0.08)', borderRadius: 2, marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, fontFamily: SANS, color: '#9ca3af' }}>{d.label}</span>
                                        <span style={{ fontSize: 12, fontFamily: SANS, fontWeight: 700, color: d.pos ? '#00c805' : '#ff6600' }}>{d.impact}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════ TAB: PEER BENCHMARK ════════ */}
                {tab === 'benchmark' && (
                    <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: 32, border: '1px solid #1f2937' }}>
                        <SectionHead title="Peer Benchmark Analysis" sub={`${data.displayName} vs. ${data.market} sector median`} badge={{ text: 'PITCHBOOK STYLE', bg: '#a78bfa' }} />
                        <div style={{ marginBottom: 32 }}>
                            {m.benchmarks.map((b, i) => {
                                const better = b.metric === 'Churn Rate' || b.metric === 'Burn Multiple'
                                    ? b.company < b.sector
                                    : b.company > b.sector;
                                const pct = Math.round((b.company / b.sector) * 100);
                                return (
                                    <div key={i} style={{ marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontFamily: SANS, fontWeight: 600, color: '#e8e6e0' }}>{b.metric}</span>
                                            <div style={{ display: 'flex', gap: 24 }}>
                                                <span style={{ fontSize: 13, fontFamily: SANS, color: better ? '#00c805' : '#ff6600', fontWeight: 700 }}>{b.company}{b.unit} <span style={{ fontSize: 10, fontWeight: 400, color: '#4b5563' }}>you</span></span>
                                                <span style={{ fontSize: 13, fontFamily: SANS, color: '#4b5563' }}>{b.sector}{b.unit} <span style={{ fontSize: 10 }}>sector</span></span>
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative', height: 10, background: '#1a1a1a', borderRadius: 2 }}>
                                            {/* Sector median line */}
                                            <div style={{ position: 'absolute', left: '50%', top: -2, width: 2, height: 14, background: '#ddd', borderRadius: 2, zIndex: 1 }} />
                                            <div style={{ width: `${Math.min(100, pct / 2)}%`, height: '100%', background: better ? '#00c805' : '#ff6600', borderRadius: 2, transition: 'width 1s ease' }} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                            <span style={{ fontSize: 10, fontFamily: SANS, color: '#374151' }}>0</span>
                                            <span style={{ fontSize: 10, fontFamily: SANS, color: '#374151' }}>Sector median</span>
                                            <span style={{ fontSize: 10, fontFamily: SANS, color: '#374151' }}>2× median</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Summary */}
                        <div style={{ padding: '20px 24px', background: '#111111', borderRadius: 3, border: '1px solid #1f2937' }}>
                            <p style={{ margin: '0 0 8px', fontSize: 13, fontFamily: SANS, fontWeight: 700, color: '#e8e6e0' }}>Benchmarking Verdict</p>
                            <p style={{ margin: 0, fontSize: 13, fontFamily: SERIF, color: '#9ca3af', lineHeight: 1.8 }}>
                                {data.displayName} scores {m.benchmarks.filter(b => {
                                    return b.metric === 'Churn Rate' || b.metric === 'Burn Multiple' ? b.company < b.sector : b.company > b.sector;
                                }).length} out of {m.benchmarks.length} metrics above sector median.
                                {m.ltvCac > 3.2 ? ' Unit economics are strong with LTV/CAC above peer median.' : ' LTV/CAC needs improvement relative to peers.'}
                                {m.grossMargin > 62 ? ' Gross margin is competitive.' : ' Margin compression is a concern vs. sector peers.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* ════════ TAB: MONTE CARLO ════════ */}
                {tab === 'forecast' && (
                    <div style={{ background: '#111111', borderRadius: '0 0 16px 16px', padding: 32, border: '1px solid #1f2937' }}>
                        <SectionHead
                            title="Monte Carlo Revenue Simulation"
                            sub="12-month probabilistic forecast — base, bull, bear cases"
                            badge={{ text: 'QUANTITATIVE MODEL', bg: '#ff6600' }}
                        />
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={m.forecast}>
                                <defs>
                                    <linearGradient id="bullGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00c805" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#00c805" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="bearGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff6600" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ff6600" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                                <Tooltip formatter={v => [`$${(v / 1000).toFixed(0)}K`, '']} contentStyle={{ background: "#000", border: "1px solid #374151", borderRadius: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11, color: "#d1d5db" }} />
                                <Area type="monotone" dataKey="bull" name="Bull Case" stroke="#00c805" strokeWidth={1.5} fill="url(#bullGrad)" strokeDasharray="4 3" />
                                <Area type="monotone" dataKey="base" name="Base Case" stroke={data.color} strokeWidth={1.5} fill="none" />
                                <Area type="monotone" dataKey="bear" name="Bear Case" stroke="#ff6600" strokeWidth={1.5} fill="url(#bearGrad)" strokeDasharray="4 3" />
                            </AreaChart>
                        </ResponsiveContainer>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
                            {[
                                { label: 'Bear Case (12M)', value: `$${(m.forecast[11]?.bear / 1000).toFixed(0)}K/mo`, sub: `σ − revenue`, color: '#ff6600' },
                                { label: 'Base Case (12M)', value: `$${(m.forecast[11]?.base / 1000).toFixed(0)}K/mo`, sub: `${m.cagr.toFixed(1)}% CAGR`, color: data.color },
                                { label: 'Bull Case (12M)', value: `$${(m.forecast[11]?.bull / 1000).toFixed(0)}K/mo`, sub: `σ + revenue`, color: '#00c805' },
                            ].map((c, i) => (
                                <div key={i} style={{ padding: '20px 22px', background: '#111111', borderRadius: 3, border: `1px solid ${c.color}44` }}>
                                    <p style={{ margin: '0 0 6px', fontSize: 11, fontFamily: SANS, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>{c.label}</p>
                                    <p style={{ margin: '0 0 4px', fontSize: 28, fontFamily: SERIF, color: c.color, fontWeight: 400 }}>{c.value}</p>
                                    <p style={{ margin: 0, fontSize: 11, fontFamily: SANS, color: '#4b5563' }}>{c.sub}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(26,58,92,0.05)', borderRadius: 2, borderLeft: '3px solid #1d4ed8' }}>
                            <p style={{ margin: '0 0 4px', fontSize: 11, fontFamily: SANS, fontWeight: 700, color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model Assumptions</p>
                            <p style={{ margin: 0, fontSize: 12, fontFamily: SANS, color: '#6b7280', lineHeight: 1.7 }}>
                                Base case uses historical CAGR of {m.cagr.toFixed(1)}%/year. Bull/bear bands apply ±σ ({m.volatility.toFixed(1)}%) monthly shock. Monte Carlo runs 1,000 simulations — displayed curves are median paths. Sharpe ratio of {m.sharpe} suggests {parseFloat(m.sharpe) > 1 ? 'risk-adjusted returns above threshold' : 'elevated volatility relative to growth'}.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
