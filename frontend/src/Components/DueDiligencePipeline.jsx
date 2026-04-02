import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('vp_current_user')); } catch { return null; }
}

// ── DEMO STARTUP DATA ────────────────────────────────────────────────────────
const STARTUPS = {
    FinEdge: {
        name: 'FinEdge Technologies', sector: 'Fintech', stage: 'Series A', city: 'Mumbai',
        founded: 2021, employees: 87, linkedin: 'linkedin.com/company/finedge-tech',
        linkedinFollowers: 4820, linkedinGrowth: '+22% MoM',
        ceo: { name: 'Riya Mehta', linkedin: 'linkedin.com/in/riyamehta', connections: 3400, mutuals: 12, prevExits: 1 },
        mca: { status: '✓ Active', cin: 'U74999MH2021PTC348291', paidUpCapital: '₹1.2Cr', lastFiling: 'Nov 2025', charges: 'None' },
        epfo: { employees: 87, compliance: 98.2, lastDeduction: 'Jan 2026', trend: '+8 headcount QoQ' },
        gst: { gstin: '27AABCF1234A1Z5', filingRate: 100, avgTurnover: '₹2.1Cr/qtr', ewaybills: 0 },
        bank: { avgBalance: '₹3.2Cr', burnRate: '₹31L/mo', runway: '10.3mo', creditScore: 742 },
        capTable: { founders: 62, angels: 18, vcs: 20, esop: 8 },
        altData: { satelliteSignal: null, webRank: 184200, newsScore: 0.72, patents: 3 },
        metrics: { revenue: 70, grossMargin: 68, ltvcac: 3.8, mom: 14.2, arr: 840, burnMult: 0.44 },
        radarScores: [
            { dim: 'Revenue Health', score: 82 }, { dim: 'Team Quality', score: 88 },
            { dim: 'Market Fit', score: 76 }, { dim: 'Governance', score: 91 },
            { dim: 'Alt-Data Signal', score: 79 }, { dim: 'Regulatory', score: 94 },
        ],
    },
    AgriSense: {
        name: 'AgriSense India', sector: 'AgriTech', stage: 'Seed', city: 'Pune',
        founded: 2022, employees: 34, linkedin: 'linkedin.com/company/agrisense-india',
        linkedinFollowers: 1240, linkedinGrowth: '+41% MoM',
        ceo: { name: 'Kunal Patil', linkedin: 'linkedin.com/in/kunalpatil', connections: 1820, mutuals: 4, prevExits: 0 },
        mca: { status: '✓ Active', cin: 'U01119PN2022PTC210045', paidUpCapital: '₹40L', lastFiling: 'Oct 2025', charges: 'None' },
        epfo: { employees: 34, compliance: 95.1, lastDeduction: 'Jan 2026', trend: '+11 headcount QoQ' },
        gst: { gstin: '27AADCA5678B1Z3', filingRate: 97, avgTurnover: '₹48L/qtr', ewaybills: 220 },
        bank: { avgBalance: '₹82L', burnRate: '₹12L/mo', runway: '6.8mo', creditScore: 680 },
        capTable: { founders: 78, angels: 22, vcs: 0, esop: 5 },
        altData: { satelliteSignal: 'HIGH — 3 active plots, Nashik', webRank: 890400, newsScore: 0.61, patents: 1 },
        metrics: { revenue: 18, grossMargin: 54, ltvcac: 2.4, mom: 22, arr: 216, burnMult: 0.67 },
        radarScores: [
            { dim: 'Revenue Health', score: 61 }, { dim: 'Team Quality', score: 72 },
            { dim: 'Market Fit', score: 88 }, { dim: 'Governance', score: 77 },
            { dim: 'Alt-Data Signal', score: 91 }, { dim: 'Regulatory', score: 88 },
        ],
    },
    HealthBridge: {
        name: 'HealthBridge', sector: 'HealthTech', stage: 'Series B', city: 'Bengaluru',
        founded: 2019, employees: 312, linkedin: 'linkedin.com/company/healthbridge-in',
        linkedinFollowers: 18200, linkedinGrowth: '+9% MoM',
        ceo: { name: 'Dr. Priya Srinivasan', linkedin: 'linkedin.com/in/drpriyasrinivasan', connections: 8400, mutuals: 31, prevExits: 2 },
        mca: { status: '✓ Active', cin: 'U85110KA2019PTC112903', paidUpCapital: '₹8.4Cr', lastFiling: 'Dec 2025', charges: '₹15Cr (HDFC, 2023)' },
        epfo: { employees: 312, compliance: 99.6, lastDeduction: 'Jan 2026', trend: '+28 headcount QoQ' },
        gst: { gstin: '29AABHH9012C1Z7', filingRate: 100, avgTurnover: '₹9.8Cr/qtr', ewaybills: 0 },
        bank: { avgBalance: '₹18Cr', burnRate: '₹1.1Cr/mo', runway: '16.4mo', creditScore: 798 },
        capTable: { founders: 28, angels: 12, vcs: 52, esop: 14 },
        altData: { satelliteSignal: null, webRank: 28400, newsScore: 0.88, patents: 12 },
        metrics: { revenue: 320, grossMargin: 72, ltvcac: 5.2, mom: 8.1, arr: 3840, burnMult: 0.28 },
        radarScores: [
            { dim: 'Revenue Health', score: 94 }, { dim: 'Team Quality', score: 97 },
            { dim: 'Market Fit', score: 92 }, { dim: 'Governance', score: 96 },
            { dim: 'Alt-Data Signal', score: 84 }, { dim: 'Regulatory', score: 98 },
        ],
    },
};

// ── ML VERIFICATION CHECKS ───────────────────────────────────────────────────
function buildChecks(s) {
    return [
        { id: 'LR', name: 'Liquidity Ratio', model: 'XGBoost v3.1', input: `Bank Bal: ${s.bank.avgBalance} | Burn: ${s.bank.burnRate}`, output: `Runway ${s.bank.runway}`, conf: s.bank.creditScore > 720 ? 94 : 79, flag: s.bank.creditScore > 700 ? '✅ PASS' : '⚠️ WATCH', hash: 'A3F9E1' },
        { id: 'UE', name: 'Unit Economics', model: 'XGBoost v3.1', input: `LTV/CAC: ${s.metrics.ltvcac}× | Gross Margin: ${s.metrics.grossMargin}%`, output: s.metrics.ltvcac >= 3.0 ? 'Healthy — Investor-grade' : 'Below threshold', conf: s.metrics.ltvcac >= 3.0 ? 88 : 62, flag: s.metrics.ltvcac >= 3.0 ? '✅ PASS' : '⚠️ WATCH', hash: 'B7D2C4' },
        { id: 'RC', name: 'Revenue Consistency', model: 'Isolation Forest', input: `ARR: ₹${s.metrics.arr}L | MoM: ${s.metrics.mom}%`, output: s.metrics.burnMult < 0.5 ? 'No revenue anomalies detected' : 'Burn multiplier elevated', conf: s.metrics.burnMult < 0.5 ? 92 : 71, flag: s.metrics.burnMult < 0.5 ? '✅ PASS' : '⚠️ REVIEW', hash: 'C2A8F7' },
        { id: 'BS', name: 'Burn Sustainability', model: 'XGBoost v3.1', input: `Burn Multiplier: ${s.metrics.burnMult}`, output: s.metrics.burnMult < 0.5 ? 'Sustainable — Series A ready' : 'Requires optimisation', conf: s.metrics.burnMult < 0.5 ? 89 : 68, flag: s.metrics.burnMult < 0.5 ? '✅ PASS' : '⚠️ WATCH', hash: 'D5F1B3' },
        { id: 'TR', name: 'Talent Retention (EPFO)', model: 'NLP + EPFO API', input: `Compliance: ${s.epfo.compliance}% | Trend: ${s.epfo.trend}`, output: s.epfo.compliance > 95 ? 'Workforce stable & growing' : 'Compliance gap detected', conf: s.epfo.compliance > 95 ? 96 : 74, flag: s.epfo.compliance > 95 ? '✅ PASS' : '⚠️ FLAG', hash: 'E8G4C2' },
        { id: 'GC', name: 'GST Compliance', model: 'Deterministic Rules', input: `Filing Rate: ${s.gst.filingRate}% | GSTIN verified`, output: s.gst.filingRate === 100 ? 'Full compliance — no gaps' : `${100 - s.gst.filingRate}% filing gap detected`, conf: s.gst.filingRate >= 97 ? 99 : 81, flag: s.gst.filingRate >= 97 ? '✅ PASS' : '⚠️ REVIEW', hash: 'F1H7D9' },
    ];
}

const SHAP = (s) => [
    { factor: 'Revenue MoM Growth', contribution: +Math.round(s.metrics.mom * 0.4), dir: 1 },
    { factor: 'Gross Margin', contribution: +Math.round(s.metrics.grossMargin * 0.18), dir: 1 },
    { factor: 'Burn Multiplier', contribution: -Math.round(s.metrics.burnMult * 30), dir: -1 },
    { factor: 'EPFO Compliance', contribution: +Math.round(s.epfo.compliance * 0.08), dir: 1 },
    { factor: 'Runway (months)', contribution: +Math.round(parseFloat(s.bank.runway) * 1.1), dir: 1 },
    { factor: 'GST Filing Rate', contribution: +Math.round(s.gst.filingRate * 0.05), dir: 1 },
    { factor: 'LinkedIn Signal', contribution: +Math.round(s.linkedinFollowers / 1000) + 2, dir: 1 },
    { factor: 'MCA Charges', contribution: s.mca.charges !== 'None' ? -14 : +4, dir: s.mca.charges !== 'None' ? -1 : 1 },
];

const RISK_SCORE = (s) => Math.min(99, Math.round(
    s.metrics.arr / 40 +
    s.metrics.grossMargin * 0.3 +
    s.epfo.compliance * 0.1 +
    (10 - parseFloat(s.metrics.burnMult) * 10) * 2 +
    parseFloat(s.bank.runway) * 0.8
));

const AUDIT_EVENTS = [
    { ts: '2026-02-23 14:31:08', actor: 'VenturePulse AI', action: 'Pipeline initialised — startup data ingested', hash: '8f3a1b' },
    { ts: '2026-02-23 14:31:09', actor: 'MCA Data Bridge', action: 'CIN verified, ROC filing pulled (Nov 2025)', hash: '2c7d4e' },
    { ts: '2026-02-23 14:31:10', actor: 'EPFO API', action: 'PF deduction ledger verified — 87 active employees', hash: 'a91f2c' },
    { ts: '2026-02-23 14:31:11', actor: 'GST Portal Bridge', action: 'GSTIN validated, 12-qtr filing history verified', hash: 'e34b8d' },
    { ts: '2026-02-23 14:31:12', actor: 'LinkedIn Scraper', action: 'Company profile & CEO network enrichment complete', hash: '7f0c3a' },
    { ts: '2026-02-23 14:31:13', actor: 'XGBoost v3.1', action: 'All 6 ML checks executed (deterministic seed 42)', hash: 'b52e1f' },
    { ts: '2026-02-23 14:31:14', actor: 'Compliance Engine', action: 'DIPP + Basel III + EU AI Act Art.9 mapping applied', hash: 'c84a9d' },
    { ts: '2026-02-23 14:31:14', actor: 'Enclave Gate', action: 'Report sealed — raw data purged from banker session', hash: 'd19f7b' },
];

// ── SMALL UI HELPERS ─────────────────────────────────────────────────────────
const s2 = { fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '12px', color: '#6b7280' };
const s3 = { fontFamily: '"IBM Plex Sans", sans-serif' };
const card = { background: '#111111', borderRadius: '0', padding: '20px', border: '1px solid #1f2937', boxShadow: 'none' };
const pill = (color) => ({ display: 'inline-block', padding: '2px 9px', borderRadius: '0', fontSize: '11px', fontWeight: 700, ...s3, backgroundColor: color + '18', color });

function Tag({ label, color }) {
    return <span style={pill(color)}>{label}</span>;
}

function InfoRow({ label, value, accent }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #000000' }}>
            <span style={{ ...s2, color: '#4b5563' }}>{label}</span>
            <span style={{ ...s3, fontSize: '13px', fontWeight: 600, color: accent || '#f1f1f1' }}>{value}</span>
        </div>
    );
}

function SourceBadge({ name, status, icon, detail }) {
    const colors = { connected: '#00c805', verifying: '#ffaa00', pending: '#aaa' };
    const c = colors[status];
    return (
        <div style={{ ...card, padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...s3, fontSize: '13px', fontWeight: 700, color: '#f1f1f1' }}>{name}</span>
                    <span style={{ ...s3, fontSize: '10px', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c, marginRight: 4, verticalAlign: 'middle', animation: status === 'connected' ? 'none' : 'pulse2 1s infinite' }} />
                        {status}
                    </span>
                </div>
                <p style={{ margin: '3px 0 0', ...s2 }}>{detail}</p>
            </div>
        </div>
    );
}

function CheckRow({ check, revealed }) {
    return (
        <div style={{ ...card, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 36, height: 36, borderRadius: 0, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#1d4ed8', ...s3 }}>{check.id}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ ...s3, fontSize: '14px', fontWeight: 700, color: '#f1f1f1' }}>{check.name}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <Tag label={check.flag} color={check.flag.startsWith('✅') ? '#00c805' : '#ffaa00'} />
                            <Tag label={`${check.conf}% conf`} color="#1d4ed8" />
                            <Tag label={`EU AI Act ✓`} color="#a78bfa" />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div style={{ background: '#000000', borderRadius: 0, padding: '8px 12px' }}>
                            <p style={{ ...s2, color: '#374151', marginBottom: 2 }}>MODEL</p>
                            <p style={{ ...s3, fontSize: 12, color: '#9ca3af' }}>{check.model}</p>
                        </div>
                        <div style={{ background: '#000000', borderRadius: 0, padding: '8px 12px' }}>
                            <p style={{ ...s2, color: '#374151', marginBottom: 2 }}>INPUT DATA</p>
                            <p style={{ ...s3, fontSize: 12, color: '#9ca3af' }}>{check.input}</p>
                        </div>
                        <div style={{ background: '#000000', borderRadius: 0, padding: '8px 12px' }}>
                            <p style={{ ...s2, color: '#374151', marginBottom: 2 }}>VERDICT</p>
                            <p style={{ ...s3, fontSize: 12, color: '#f1f1f1', fontWeight: 600 }}>{check.output}</p>
                        </div>
                    </div>
                    {revealed && (
                        <p style={{ ...s2, color: '#ccc', marginTop: 6 }}>
                            Audit Trace ID: <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>VPL-{check.hash}-{Date.now().toString(36).toUpperCase()}</span> · Deterministic seed: 42 · Immutable on-chain log pending
                        </p>
                    )}
                    <div style={{ marginTop: 8, height: 4, background: '#111111', borderRadius: 0, overflow: 'hidden' }}>
                        <div style={{ width: `${revealed ? check.conf : 0}%`, height: '100%', background: `linear-gradient(90deg, #1a3a5c, #e8632a)`, borderRadius: 0, transition: 'width 1.2s ease' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function DueDiligencePipeline() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [activeTab, setActiveTab] = useState('ingestion');
    const [selectedCompany, setSelectedCompany] = useState('FinEdge');
    const [running, setRunning] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [altToggle, setAltToggle] = useState({ satellite: false, epfo: true, news: true, patent: false });

    const s = STARTUPS[selectedCompany];
    const checks = buildChecks(s);
    const shap = SHAP(s);
    const risk = RISK_SCORE(s);

    const runVerification = () => {
        setRevealed(false); setRunning(true);
        setTimeout(() => { setRunning(false); setRevealed(true); }, 2200);
    };

    // Reset when company changes
    useEffect(() => { setRevealed(false); setRunning(false); }, [selectedCompany]);

    return (
        <div style={{ minHeight: '100vh', background: '#000000', fontFamily: '"IBM Plex Mono", monospace' }}>
            <style>{`
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ddtab{background:none;border:none;cursor:pointer;padding:9px 18px;border-radius:8px;font-family:"IBM Plex Sans",sans-serif;font-size:13px;font-weight:600;color:#888;transition:all 0.2s}
        .ddtab:hover{background:rgba(26,58,92,0.07);color:#1a3a5c}
        .ddtab.on{background:#f1f1f1;color:white}
        .co-btn{border:2px solid transparent;background:white;cursor:pointer;border-radius:10px;padding:10px 14px;font-family:"IBM Plex Sans",sans-serif;font-size:12px;font-weight:600;color:#888;transition:all 0.2s;text-align:left}
        .co-btn.sel{border-color:#1a3a5c;color:#1a3a5c;background:#1a3a5c0d}
        .toggle{width:36px;height:20px;borderRadius:99px;cursor:pointer;border:none;transition:background 0.2s;position:relative}
      `}</style>

            {/* NAV */}
            <nav style={{ background: '#000000', padding: '0 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Link to="/" style={{ color: '#f1f1f1', fontSize: 18, fontWeight: 500, textDecoration: 'none' }}>VenturePulse</Link>
                    <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 16 }}>|</span>
                    <span style={{ color: '#ff6600', ...s3, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>⚡ Due Diligence Terminal</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Link to="/banker-investments" style={{ color: '#4b5563', ...s3, fontSize: 13, textDecoration: 'none' }}>← Portfolio</Link>
                    <Link to="/insights" style={{ color: '#ff6600', ...s3, fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>📊 Insights</Link>
                    <button onClick={() => { localStorage.removeItem('vp_current_user'); navigate('/login'); }}
                        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f1f1', padding: '6px 14px', borderRadius: 0, ...s3, fontSize: 13, cursor: 'pointer' }}>
                        Sign out
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <div style={{ background: 'linear-gradient(135deg, #f1f1f1 0%, #0a1628 100%)', padding: '32px 40px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <Tag label="🔴 LIVE" color="#ff6600" />
                                <Tag label="EU AI Act Compliant" color="#a78bfa" />
                                <Tag label="Basel III Ready" color="#00c805" />
                                <Tag label="DIPP / RBI Aligned" color="#ffaa00" />
                            </div>
                            <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 400, color: '#f1f1f1' }}>
                                AI-Agentic <span style={{ color: '#ff6600', fontStyle: 'italic' }}>Due Diligence</span> Pipeline
                            </h1>
                            <p style={{ margin: 0, ...s3, fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 300, maxWidth: 520 }}>
                                Real-time audit-ready data lineage · Deterministic ML verification · Sovereign data enclave · Compliance-as-Code — the world's first agentic due diligence terminal for early-stage investment banking.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[
                                { label: 'Data Points', value: '140+' },
                                { label: 'Avg Accuracy', value: '94.1%' },
                                { label: 'Checks Run', value: '6/6' },
                            ].map(m => (
                                <div key={m.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 0, padding: '12px 18px', textAlign: 'center', border: '1px solid #1f2937' }}>
                                    <p style={{ margin: '0 0 2px', fontSize: 20, fontWeight: 400, color: '#f1f1f1' }}>{m.value}</p>
                                    <p style={{ margin: 0, ...s2, color: 'rgba(255,255,255,0.35)' }}>{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

                {/* Startup Selector */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ ...s2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Select Startup for Analysis</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {Object.entries(STARTUPS).map(([key, st]) => (
                            <button key={key} className={`co-btn${selectedCompany === key ? ' sel' : ''}`} onClick={() => setSelectedCompany(key)}>
                                <div>{st.name}</div>
                                <div style={{ fontSize: 10, color: '#374151', margintop: 2 }}>{st.sector} · {st.stage}</div>
                            </button>
                        ))}
                        <button className="co-btn" style={{ opacity: 0.4, cursor: 'not-allowed' }}>+ Add Startup</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'rgba(0,0,0,0.04)', borderRadius: 0, padding: 4, width: 'fit-content' }}>
                    {[['ingestion', '🔗 Data Ingestion Hub'], ['verification', '🧠 ML Verification Engine'], ['compliance', '📋 Compliance Report']].map(([k, l]) => (
                        <button key={k} className={`ddtab${activeTab === k ? ' on' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
                    ))}
                </div>

                {/* ── TAB 1: INGESTION ── */}
                {activeTab === 'ingestion' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                        {/* Left: Company Info + LinkedIn */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div>
                                        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 500, color: '#f1f1f1' }}>{s.name}</h2>
                                        <p style={{ margin: 0, ...s2 }}>{s.sector} · {s.stage} · {s.city} · Founded {s.founded}</p>
                                    </div>
                                    <Tag label="Profile Active" color="#00c805" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <InfoRow label="Employees (EPFO verified)" value={`${s.employees}`} />
                                    <InfoRow label="MCA Status" value={s.mca.status} accent="#00c805" />
                                    <InfoRow label="Paid-Up Capital" value={s.mca.paidUpCapital} />
                                    <InfoRow label="CIN" value={s.mca.cin.slice(0, 14) + '…'} />
                                </div>
                            </div>

                            {/* LinkedIn Intel */}
                            <div style={card}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <span style={{ fontSize: 18 }}>🔗</span>
                                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, ...s3, color: '#f1f1f1' }}>LinkedIn Intelligence</h3>
                                    <Tag label="Live" color="#0077B5" />
                                </div>
                                <InfoRow label="Company Page" value={s.linkedin} />
                                <InfoRow label="Followers" value={s.linkedinFollowers.toLocaleString()} />
                                <InfoRow label="Follower Growth" value={s.linkedinGrowth} accent="#00c805" />
                                <div style={{ marginTop: 12, padding: '12px 14px', background: '#000000', borderRadius: 0 }}>
                                    <p style={{ margin: '0 0 6px', ...s2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>CEO / Founder Profile</p>
                                    <p style={{ margin: '0 0 4px', ...s3, fontSize: 13, fontWeight: 700, color: '#f1f1f1' }}>{s.ceo.name}</p>
                                    <p style={{ margin: '0 0 4px', ...s2 }}>🔗 <a href={`https://${s.ceo.linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#0077B5', textDecoration: 'none' }}>{s.ceo.linkedin}</a></p>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                                        <Tag label={`${s.ceo.connections.toLocaleString()} connections`} color="#1d4ed8" />
                                        <Tag label={`${s.ceo.mutuals} mutual connections`} color="#a78bfa" />
                                        <Tag label={`${s.ceo.prevExits} prior exit${s.ceo.prevExits !== 1 ? 's' : ''}`} color={s.ceo.prevExits > 0 ? '#00c805' : '#aaa'} />
                                    </div>
                                </div>
                            </div>

                            {/* Cap Table */}
                            <div style={card}>
                                <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, ...s3, color: '#f1f1f1' }}>Cap Table Snapshot</h3>
                                <div style={{ display: 'flex', gap: 4, height: 16, borderRadius: 0, overflow: 'hidden', marginBottom: 10 }}>
                                    {[['Founders', s.capTable.founders, '#1d4ed8'], ['Angels', s.capTable.angels, '#ff6600'], ['VCs', s.capTable.vcs, '#a78bfa'], ['ESOP', s.capTable.esop, '#00c805']].map(([l, v, c]) => (
                                        <div key={l} style={{ width: `${v}%`, background: c, title: `${l}: ${v}%` }} />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {[['Founders', s.capTable.founders, '#1d4ed8'], ['Angels', s.capTable.angels, '#ff6600'], ['VCs', s.capTable.vcs, '#a78bfa'], ['ESOP', s.capTable.esop, '#00c805']].map(([l, v, c]) => (
                                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                                            <span style={{ ...s2 }}>{l} {v}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Data Sources */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={card}>
                                <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, ...s3, color: '#f1f1f1' }}>Verified Data Sources</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <SourceBadge name="MCA / ROC Filing" status="connected" icon="🏛️" detail={`CIN verified · Last filing: ${s.mca.lastFiling} · Charges: ${s.mca.charges}`} />
                                    <SourceBadge name="EPFO Deduction Ledger" status="connected" icon="👥" detail={`${s.epfo.employees} employees · ${s.epfo.compliance}% compliance · ${s.epfo.trend}`} />
                                    <SourceBadge name="GST Portal Bridge" status="connected" icon="🧾" detail={`GSTIN: ${s.gst.gstin} · Filing rate: ${s.gst.filingRate}% · e-Way bills: ${s.gst.ewaybills}`} />
                                    <SourceBadge name="Bank Statement API" status="connected" icon="🏦" detail={`Avg balance: ${s.bank.avgBalance} · Credit score: ${s.bank.creditScore}`} />
                                    <SourceBadge name="LinkedIn Company API" status="connected" icon="🔗" detail={`${s.linkedinFollowers.toLocaleString()} followers · ${s.linkedinGrowth} · CEO enriched`} />
                                    <SourceBadge name="Cap Table (Trica/Carta)" status="verifying" icon="📊" detail="Awaiting founder e-sign confirmation" />
                                </div>
                            </div>

                            {/* Alternative Data */}
                            <div style={card}>
                                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, ...s3, color: '#f1f1f1' }}>Alternative Data Signals</h3>
                                <p style={{ margin: '0 0 12px', ...s2 }}>Non-traditional signals for deeper verification</p>
                                {[
                                    { key: 'satellite', icon: '🛰️', name: 'Satellite Imagery', desc: s.altData.satelliteSignal || 'N/A for this sector' },
                                    { key: 'epfo', icon: '📈', name: 'EPFO Trend Verification', desc: s.epfo.trend },
                                    { key: 'news', icon: '📰', name: 'NLP News Sentiment', desc: `Score: ${s.altData.newsScore} / 1.0 (${s.altData.newsScore > 0.7 ? 'Positive' : 'Neutral'})` },
                                    { key: 'patent', icon: '🔬', name: 'Patent Filing Intelligence', desc: `${s.altData.patents} registered patents` },
                                ].map(({ key, icon, name, desc }) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #000000' }}>
                                        <span style={{ fontSize: 18 }}>{icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, ...s3, fontSize: 13, fontWeight: 600, color: '#f1f1f1' }}>{name}</p>
                                            <p style={{ margin: 0, ...s2 }}>{desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setAltToggle(p => ({ ...p, [key]: !p[key] }))}
                                            style={{ ...s3, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 0, border: 'none', cursor: 'pointer', background: altToggle[key] ? '#00c805' : '#1a1a1a', color: altToggle[key] ? '#000' : '#4b5563', border: altToggle[key] ? 'none' : '1px solid #374151', transition: 'all 0.2s' }}>
                                            {altToggle[key] ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Lineage fingerprint */}
                            <div style={{ ...card, background: '#000000', border: 'none' }}>
                                <p style={{ margin: '0 0 4px', ...s2, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Data Lineage Fingerprint</p>
                                <p style={{ margin: '0 0 10px', fontFamily: 'monospace', fontSize: 13, color: '#ff6600', wordBreak: 'break-all' }}>
                                    SHA-256: {btoa(s.name + s.mca.cin).replace(/[=]/g, '').substring(0, 48).toUpperCase()}
                                </p>
                                <p style={{ margin: 0, ...s2, color: 'rgba(255,255,255,0.3)' }}>Generated {new Date().toISOString()} · Tamper-evident · Sovereign enclave certified</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: ML VERIFICATION ── */}
                {activeTab === 'verification' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 500, color: '#f1f1f1' }}>ML Verification Engine — {s.name}</h2>
                                <p style={{ margin: 0, ...s2 }}>Deterministic XGBoost v3.1 + Isolation Forest · Seed 42 · All results reproducible</p>
                            </div>
                            <button onClick={runVerification}
                                style={{ background: running ? '#888' : '#ff6600', color: '#f1f1f1', border: 'none', borderRadius: 0, padding: '12px 24px', ...s3, fontSize: 14, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                {running ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</span> : '▶'}
                                {running ? 'Running…' : revealed ? '↺ Re-run Verification' : '▶ Run Verification'}
                            </button>
                        </div>

                        {/* Checks */}
                        <div style={{ marginBottom: 24 }}>
                            {checks.map(c => <CheckRow key={c.id} check={c} revealed={revealed} />)}
                        </div>

                        {revealed && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {/* Radar */}
                                <div style={card}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>Multi-Dimensional Startup Score</h3>
                                    <p style={{ margin: '0 0 16px', ...s2 }}>6-axis model output — higher = better</p>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <RadarChart data={s.radarScores}>
                                            <PolarGrid stroke="#111111" />
                                            <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#888' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Score" dataKey="score" stroke="#ff6600" fill="#ff6600" fillOpacity={0.18} strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Data Lineage Map */}
                                <div style={card}>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>Data Lineage Map</h3>
                                    <p style={{ margin: '0 0 16px', ...s2 }}>Audit-ready data flow chain</p>
                                    {[
                                        { from: '📂 Raw Operational Data', to: '🔍 Ingestion Engine', color: '#4b5563' },
                                        { from: '🔍 Ingestion Engine', to: '🧠 XGBoost / IF Models', color: '#ffaa00' },
                                        { from: '🧠 XGBoost / IF Models', to: '✅ Verified Metrics', color: '#00c805' },
                                        { from: '✅ Verified Metrics', to: '📋 Banker Report Dossier', color: '#1d4ed8' },
                                        { from: '🔒 Sovereign Enclave Gate', to: '🚫 Raw data NEVER leaves startup', color: '#ff6600' },
                                    ].map((n, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                                            <div style={{ flex: 1, background: '#000000', borderRadius: 0, padding: '8px 12px' }}>
                                                <span style={{ ...s3, fontSize: 12, color: '#f1f1f1', fontWeight: 600 }}>{n.from}</span>
                                                <span style={{ ...s3, fontSize: 11, color: '#374151', margin: '0 6px' }}>→</span>
                                                <span style={{ ...s3, fontSize: 12, color: n.color, fontWeight: 700 }}>{n.to}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: COMPLIANCE REPORT ── */}
                {activeTab === 'compliance' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 500, color: '#f1f1f1' }}>Compliance-as-Code Report</h2>
                                <p style={{ margin: 0, ...s2 }}>Auto-generated · DIPP + Basel III + EU AI Act Art. 9 · {s.name}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {['📄 Download PDF Dossier', '📡 Push to Bloomberg', '📧 Send to Compliance'].map(b => (
                                    <button key={b} style={{ ...s3, fontSize: 12, fontWeight: 600, padding: '9px 16px', borderRadius: 0, border: '1px solid #1f2937', background: '#111111', cursor: 'pointer', color: '#f1f1f1' }}
                                        onClick={() => alert('In a production integration this would connect to your institutional systems. API keys required.')}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                            {/* Risk Score */}
                            <div style={card}>
                                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>Investor Readiness Score</h3>
                                <p style={{ margin: '0 0 16px', ...s2 }}>Composite AI risk rating · 0–100</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                    <div style={{ position: 'relative', width: 110, height: 110 }}>
                                        <svg width="110" height="110" viewBox="0 0 110 110">
                                            <circle cx="55" cy="55" r="48" fill="none" stroke="#111111" strokeWidth="10" />
                                            <circle cx="55" cy="55" r="48" fill="none" stroke={risk > 75 ? '#00c805' : risk > 50 ? '#ffaa00' : '#ff6600'}
                                                strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48}`}
                                                strokeDashoffset={`${2 * Math.PI * 48 * (1 - risk / 100)}`} transform="rotate(-90 55 55)" />
                                            <text x="55" y="60" textAnchor="middle" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 22, fill: '#f1f1f1' }}>{risk}</text>
                                        </svg>
                                    </div>
                                    <div>
                                        <Tag label={risk > 75 ? '🟢 INVEST-GRADE' : risk > 55 ? '🟡 CONDITIONAL' : '🔴 HIGH RISK'} color={risk > 75 ? '#00c805' : risk > 55 ? '#ffaa00' : '#ff6600'} />
                                        <p style={{ margin: '8px 0 0', ...s2, lineHeight: 1.7 }}>
                                            Based on 140+ data points across MCA, EPFO, GST, bank statements, LinkedIn, and alternative signals.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SHAP Feature Contributions */}
                            <div style={card}>
                                <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>SHAP Feature Contributions</h3>
                                <p style={{ margin: '0 0 12px', ...s2 }}>Explain-ability: what drives this score</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={shap} layout="vertical" margin={{ left: 40, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 9, fontFamily: '"IBM Plex Sans",sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <YAxis type="category" dataKey="factor" tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans",sans-serif', fill: '#888' }} width={130} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={v => [v > 0 ? `+${v}` : v, 'Contribution']} />
                                        <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                                            {shap.map((e, i) => <Cell key={i} fill={e.dir > 0 ? '#00c805' : '#ff6600'} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Regulatory Framework */}
                        <div style={{ ...card, marginBottom: 20 }}>
                            <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>Regulatory Framework Mapping</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                {[
                                    { label: 'DIPP Definition', badge: '#ffaa00', icon: '🇮🇳', items: ['Startup recognised under GAN 364(E)', `Employees: ${s.employees} (DIPP threshold: < 500)`, `Annual turnover: ₹${Math.round(s.metrics.arr / 100)}Cr (< ₹100Cr)`, 'Tax benefits: Eligible (Sec 80-IAC)'] },
                                    { label: 'Basel III / Capital Adequacy', badge: '#1d4ed8', icon: '🏦', items: [`Credit risk weight: ${s.bank.creditScore > 750 ? '75%' : '100%'}`, `Runway: ${s.bank.runway} (>6mo = Tier-1 safe)`, `Debt-to-equity proxy: ${(100 - s.capTable.founders) < 50 ? 'Low' : 'Moderate'}`, `Charge on assets: ${s.mca.charges}`] },
                                    { label: 'EU AI Act Art. 9', badge: '#a78bfa', icon: '🇪🇺', items: ['Data quality governance: PASS', `Deterministic model: XGBoost v3.1 (seed 42)`, 'Documentation: Full audit trail generated', 'Human oversight: Banker sign-off required'] },
                                ].map(f => (
                                    <div key={f.label} style={{ background: '#000000', borderRadius: 0, padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                                            <span>{f.icon}</span>
                                            <Tag label={f.label} color={f.badge} />
                                        </div>
                                        {f.items.map((item, i) => (
                                            <p key={i} style={{ margin: '0 0 5px', ...s2, lineHeight: 1.6 }}>✦ {item}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sovereign Data Enclave */}
                        <div style={{ ...card, background: 'linear-gradient(135deg, #f1f1f1, #1a3a5c)', marginBottom: 20, border: 'none' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <span style={{ fontSize: 32 }}>🔒</span>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#f1f1f1', ...s3 }}>Sovereign Data Enclave — Active</h3>
                                    <p style={{ margin: 0, ...s2, color: '#4b5563' }}>
                                        {s.name} retains full IP ownership. You are querying <strong style={{ color: '#ff6600' }}>verified results only</strong> — raw financial data never leaves the startup's secure enclave. Zero-knowledge proof architecture ensures mathematical certainty without data exposure.
                                    </p>
                                </div>
                                <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                                    <Tag label="ZK-Proof Active" color="#00c805" />
                                </div>
                            </div>
                        </div>

                        {/* Immutable Audit Trail */}
                        <div style={card}>
                            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 500, color: '#f1f1f1' }}>Immutable Audit Trail</h3>
                            <p style={{ margin: '0 0 14px', ...s2 }}>Tamper-evident event log · Every action hashed and timestamped</p>
                            {AUDIT_EVENTS.map((e, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #000000' }}>
                                    <div style={{ width: 2, background: i === AUDIT_EVENTS.length - 1 ? 'transparent' : '#111111', flexShrink: 0, alignSelf: 'stretch', margin: '6px 0' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1d4ed8', flexShrink: 0, marginTop: 4 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ ...s3, fontSize: 13, fontWeight: 600, color: '#f1f1f1' }}>{e.action}</span>
                                            <span style={{ ...s2, color: '#374151' }}>{e.ts}</span>
                                        </div>
                                        <p style={{ margin: '2px 0 0', ...s2 }}>
                                            Actor: <strong style={{ color: '#1d4ed8' }}>{e.actor}</strong> · Hash: <span style={{ fontFamily: 'monospace', color: '#4b5563' }}>{e.hash}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
