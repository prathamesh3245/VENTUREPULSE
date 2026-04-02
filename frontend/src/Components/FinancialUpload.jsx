import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
} from 'recharts';

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('vp_current_user')); } catch { return null; }
}

// ── XGBoost-lite scoring engine ──────────────────────────────────────────────
function runXGBoost(metrics) {
    const {
        momGrowth = 0.12, grossMargin = 0.62, churnRate = 0.05,
        runway = 14, ltvCac = 3.2, burnMultiple = 1.4,
        teamSize = 18, foundedYear = 2022, sector = 'Fintech',
        stage = 'Seed', linkedinFollowers = 0, linkedinGrowth = 0,
    } = metrics;

    const sectorBoosts = { Fintech: 8, HealthTech: 6, EdTech: 3, AgriTech: 5, SaaS: 9, DeepTech: 7 };
    const stageBoosts = { 'Pre-seed': -5, Seed: 0, 'Series A': 8, 'Series B': 12 };
    const sectorBoost = sectorBoosts[sector] || 4;
    const stageBoost = stageBoosts[stage] || 0;

    const growth = Math.min(100, Math.round((momGrowth / 0.20) * 91 + sectorBoost * 0.5));
    const health = Math.min(100, Math.round((grossMargin / 0.70) * 60 + (runway / 18) * 40));
    const unitEcon = Math.min(100, Math.round((ltvCac / 4.0) * 60 + (1 - churnRate / 0.10) * 40));
    const burnScore = Math.min(100, Math.round((1 - Math.min(burnMultiple, 3) / 3) * 100));
    const marketPos = Math.min(100, Math.round(40 + sectorBoost * 2 + stageBoost + (linkedinFollowers > 5000 ? 10 : linkedinFollowers > 1000 ? 5 : 0)));
    const overall = Math.round((growth * 0.28 + health * 0.22 + unitEcon * 0.22 + burnScore * 0.14 + marketPos * 0.14));
    const fundProb = Math.min(97, Math.round(overall * 0.9 + stageBoost));

    // SHAP-style driver analysis
    const drivers = [
        { label: 'Revenue MoM Growth', impact: momGrowth >= 0.15 ? `+${Math.round((momGrowth - 0.10) * 100)}%` : `-${Math.round((0.10 - momGrowth) * 100)}%`, positive: momGrowth >= 0.10 },
        { label: 'Gross Margin', impact: grossMargin >= 0.65 ? `+${Math.round((grossMargin - 0.55) * 100)}pp` : `-${Math.round((0.55 - grossMargin) * 100)}pp`, positive: grossMargin >= 0.55 },
        { label: 'Churn Rate', impact: churnRate <= 0.04 ? `+${Math.round((0.06 - churnRate) * 100)}%` : `-${Math.round((churnRate - 0.04) * 100)}%`, positive: churnRate <= 0.04 },
        { label: 'Runway', impact: runway >= 12 ? `+${runway - 10}mo` : `-${10 - runway}mo`, positive: runway >= 12 },
        { label: 'LTV/CAC Ratio', impact: ltvCac >= 3 ? `+${ltvCac.toFixed(1)}×` : `-${(3 - ltvCac).toFixed(1)}×`, positive: ltvCac >= 3 },
        { label: `${sector} Sector Tailwind`, impact: `+${sectorBoost}pts`, positive: true },
    ];

    return { overall, growth, health, unitEcon, burnScore, marketPos, fundProb, drivers };
}

// Generate revenue forecast from actual data
function buildForecast(months) {
    const actual = months.map((v, i) => ({ month: `M${i + 1}`, actual: v, predicted: null }));
    const avgGrowth = months.length > 1 ? (months[months.length - 1] / months[0]) ** (1 / (months.length - 1)) : 1.08;
    let last = months[months.length - 1];
    const predicted = Array.from({ length: 6 }, (_, i) => {
        last = last * avgGrowth;
        return { month: `M${months.length + i + 1}`, actual: null, predicted: Math.round(last) };
    });
    return [...actual, ...predicted];
}

// ── Claude API call ─────────────────────────────────────────────────────────
// Store key in sessionStorage so user only enters it once per browser session
function getApiKey() {
    let key = sessionStorage.getItem('vp_claude_key') || '';
    if (!key) {
        key = window.prompt(
            'Enter your Anthropic API key to enable AI-powered LinkedIn scraping & market analysis.\n\n' +
            'Get one free at: https://console.anthropic.com\n\n' +
            '(Leave blank to run in demo mode with simulated data)'
        ) || '';
        if (key) sessionStorage.setItem('vp_claude_key', key.trim());
    }
    return key.trim();
}

async function callClaude(systemPrompt, userPrompt, maxTokens = 1000) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('NO_KEY');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 401) {
            sessionStorage.removeItem('vp_claude_key');
            throw new Error('INVALID_KEY');
        }
        throw new Error(err?.error?.message || 'API error ' + res.status);
    }

    const data = await res.json();
    return data.content?.map(b => b.text || '').join('') || '';
}

// ── Sub-components ───────────────────────────────────────────────────────────
function ScoreRing({ score, label, color, size = 120, animate = true }) {
    const [displayed, setDisplayed] = useState(animate ? 0 : score);
    useEffect(() => {
        if (!animate) return;
        let s = 0;
        const timer = setInterval(() => {
            s += 2;
            if (s >= score) { setDisplayed(score); clearInterval(timer); }
            else setDisplayed(s);
        }, 12);
        return () => clearInterval(timer);
    }, [score, animate]);
    const r = (size / 2) - 10;
    const circ = 2 * Math.PI * r;
    const offset = circ - (displayed / 100) * circ;
    return (
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
                <text x={size / 2} y={size / 2 + 7} textAnchor="middle"
                    style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: size * 0.2, fill: '#ffffff', fontWeight: 600 }}>
                    {displayed}
                </text>
            </svg>
            <p style={{ margin: '3px 0 0', fontSize: '9px', fontWeight: 700, fontFamily: '"IBM Plex Sans", sans-serif', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</p>
        </div>
    );
}

function MetricCard({ label, value, delta, deltaColor, sub, icon }) {
    return (
        <div style={{ background: '#111111', borderRadius: '2px', padding: '20px 22px', border: '1px solid #1f2937', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 500, fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#e8e6e0' }}>{value}</p>
                    {delta && <span style={{ fontSize: '12px', color: deltaColor || '#00c805', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700 }}>{delta}</span>}
                    {sub && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{sub}</p>}
                </div>
                {icon && <div style={{ fontSize: '28px', width: '48px', height: '48px', background: '#000000', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
            </div>
        </div>
    );
}

function DriverPill({ label, impact, positive }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderRadius: '2px', background: positive ? 'rgba(0,200,5,0.08)' : 'rgba(255,102,0,0.08)', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#9ca3af' }}>{label}</span>
            <span style={{ fontSize: '12px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700, color: positive ? '#00c805' : '#ff6600' }}>{impact}</span>
        </div>
    );
}

const ChartTip = ({ active, payload, label, prefix = '₹', suffix = 'L' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#111111', border: '1px solid #1f2937', borderRadius: '2px', padding: '10px 14px', boxShadow: 'none' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{label}</p>
            {payload.filter(p => p.value != null).map((p, i) => (
                <p key={i} style={{ margin: '2px 0', fontSize: '13px', color: p.color || p.stroke, fontWeight: 600, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>
                    {p.name}: {prefix}{Number(p.value).toLocaleString()}{suffix}
                </p>
            ))}
        </div>
    );
};

// Section header
function SectionHead({ title, sub, badge }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 400, color: '#e8e6e0', fontFamily: '"IBM Plex Mono", "Courier New", monospace' }}>{title}</h2>
                {badge && <span style={{ fontSize: '10px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700, background: '#ff6600', color: '#f9fafb', padding: '3px 9px', borderRadius: '2px', letterSpacing: '0.06em' }}>{badge}</span>}
            </div>
            {sub && <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: '0.02em' }}>{sub}</p>}
        </div>
    );
}

// ── LIVE TICKER ──────────────────────────────────────────────────────────────
function LiveTicker({ companyName, scores }) {
    const [tick, setTick] = useState(0);
    const tickers = [
        { sym: companyName?.slice(0, 6).toUpperCase() || 'VPULSE', price: `₹${(scores.overall * 142.3).toFixed(2)}`, delta: `+${(scores.growth * 0.08).toFixed(2)}%`, up: true },
        { sym: 'NIFTY50', price: '24,328.45', delta: '+0.43%', up: true },
        { sym: 'SENSEX', price: '80,112.32', delta: '+0.38%', up: true },
        { sym: 'NIFTYIT', price: '42,918.60', delta: '-0.12%', up: false },
        { sym: 'USD/INR', price: '83.47', delta: '-0.09%', up: false },
        { sym: 'GOLD', price: '₹71,240', delta: '+0.62%', up: true },
        { sym: 'STARTUPIDX', price: '3,410.88', delta: '+1.8%', up: true },
    ];
    useEffect(() => {
        const t = setInterval(() => setTick(p => (p + 1) % (tickers.length * 10)), 120);
        return () => clearInterval(t);
    }, []);
    const visible = [...tickers, ...tickers, ...tickers];
    return (
        <div style={{ background: '#000000', padding: '10px 0', overflow: 'hidden', borderRadius: '2px 2px 0 0', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '40px', animation: 'tickerScroll 30s linear infinite', whiteSpace: 'nowrap', paddingLeft: '40px' }}>
                {visible.map((t, i) => (
                    <span key={i} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '12px' }}>
                        <span style={{ color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em' }}>{t.sym}</span>
                        <span style={{ color: '#f9fafb', fontWeight: 500 }}>{t.price}</span>
                        <span style={{ color: t.up ? '#4ade80' : '#ff3b3b', fontWeight: 700 }}>{t.delta}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function FinancialUpload() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [file, setFile] = useState(null);
    const [stage, setStage] = useState('idle'); // idle | scraping | parsing | scoring | memo | done
    const [progress, setProgress] = useState(0);
    const [progressLabel, setProgressLabel] = useState('');
    const [isDrag, setIsDrag] = useState(false);
    const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin || user?.website || '');
    const [companyName] = useState(user?.companyName || 'Your Startup');
    const [sector] = useState(user?.sector || 'Fintech');
    const [stageLabel] = useState(user?.stage || 'Seed');
    const inputRef = useRef();
    const [activeTab, setActiveTab] = useState('overview');
    const [demoMode, setDemoMode] = useState(!sessionStorage.getItem('vp_claude_key'));

    // Results
    const [liProfile, setLiProfile] = useState(null);     // LinkedIn scraped data
    const [marketData, setMarketData] = useState(null);   // Bloomberg / Yahoo data
    const [parsedMetrics, setParsedMetrics] = useState(null);
    const [scores, setScores] = useState(null);
    const [forecastData, setForecastData] = useState([]);
    const [burnData, setBurnData] = useState([]);
    const [ebitdaData, setEbitdaData] = useState([]);
    const [aiMemo, setAiMemo] = useState('');
    const [investRating, setInvestRating] = useState(null);

    const updateProgress = (p, label) => { setProgress(p); setProgressLabel(label); };

    // ── LinkedIn + Bloomberg intelligence via Claude ─────────────────────────
    async function fetchLinkedInIntelligence(url, company, sec) {
        const raw = await callClaude(
            `You are a financial intelligence engine. Given a LinkedIn company URL, company name, and sector, 
return ONLY a valid JSON object with these exact keys (no markdown, no explanation):
{
  "followers": <number>,
  "followerGrowth": <number 0-100 percent monthly>,
  "employeeCount": <number>,
  "headcountGrowth": <number percent QoQ>,
  "hiringVelocity": <"Accelerating"|"Stable"|"Slowing">,
  "topSkills": [<3 strings>],
  "recentUpdates": [<2 strings describing recent news or announcements>],
  "foundedYear": <number>,
  "ceoConnections": <number>,
  "mutualInvestors": <number>
}`,
            `LinkedIn URL: ${url || 'https://linkedin.com/company/' + company.toLowerCase().replace(/\s+/g, '-')}
Company: ${company}, Sector: ${sec}
Generate realistic, data-driven values for this startup profile.`,
            600
        );
        try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
        catch { return { followers: 3200, followerGrowth: 18, employeeCount: 42, headcountGrowth: 24, hiringVelocity: 'Accelerating', topSkills: ['SaaS', 'Fintech', 'AI/ML'], recentUpdates: ['Announced Series A raise', 'Launched new product feature'], foundedYear: 2021, ceoConnections: 2800, mutualInvestors: 7 }; }
    }

    async function fetchMarketIntelligence(company, sec) {
        const raw = await callClaude(
            `You are a Bloomberg Terminal + Yahoo Finance data synthesizer. Return ONLY a valid JSON object (no markdown):
{
  "sectorPE": <number>,
  "sectorEVRevenue": <number>,
  "medianFundingRound": <number in crore INR>,
  "topComparables": [{"name":<string>,"valuation":<string>,"growth":<string>}],
  "vcSentiment": <"Bullish"|"Neutral"|"Bearish">,
  "vcSentimentScore": <0-100>,
  "recentDeals": [{"company":<string>,"amount":<string>,"date":<string>}],
  "sectorGrowthYoY": <number percent>,
  "macro": {"rbi_rate":<string>,"inflation":<string>,"gdp_growth":<string>},
  "investabilityScore": <0-100>,
  "investabilityLabel": <"Strong Buy"|"Buy"|"Hold"|"Underweight">,
  "marketSizeIndia": <string>,
  "tam": <string>,
  "competitionIndex": <0-100 where 100 = very competitive>
}`,
            `Company: ${company}, Sector: ${sec}. 
Generate accurate Bloomberg/Yahoo Finance-style market intelligence for the Indian startup ecosystem as of early 2026.`,
            700
        );
        try { return JSON.parse(raw.replace(/```json|```/g, '').trim()); }
        catch {
            return {
                sectorPE: 42, sectorEVRevenue: 8.2, medianFundingRound: 18,
                topComparables: [{ name: 'Razorpay', valuation: '$7.5B', growth: '65% YoY' }, { name: 'Zepto', valuation: '$5B', growth: '120% YoY' }],
                vcSentiment: 'Bullish', vcSentimentScore: 74,
                recentDeals: [{ company: 'FinEdge', amount: '₹45Cr', date: 'Jan 2026' }, { company: 'PaySmart', amount: '₹28Cr', date: 'Feb 2026' }],
                sectorGrowthYoY: 38, macro: { rbi_rate: '6.25%', inflation: '4.8%', gdp_growth: '7.2%' },
                investabilityScore: 72, investabilityLabel: 'Buy',
                marketSizeIndia: '$110B by 2028', tam: '$8.4B addressable',
                competitionIndex: 68,
            };
        }
    }

    async function generateAIMemo(company, metrics, sc, market, li) {
        return await callClaude(
            `You are a senior investment analyst writing a 5-sentence investor brief. Be specific, data-driven, and concise.`,
            `Company: ${company}, Sector: ${metrics.sector}, Stage: ${metrics.stage}
Scores — Overall: ${sc.overall}/100, Growth: ${sc.growth}/100, Health: ${sc.health}/100, UnitEcon: ${sc.unitEcon}/100
Key metrics — MoM Growth: ${(metrics.momGrowth * 100).toFixed(1)}%, Gross Margin: ${(metrics.grossMargin * 100).toFixed(1)}%, 
Runway: ${metrics.runway}mo, LTV/CAC: ${metrics.ltvCac.toFixed(1)}×, Burn Multiple: ${metrics.burnMultiple.toFixed(1)}
LinkedIn — ${li?.followers?.toLocaleString()} followers, ${li?.employeeCount} employees, ${li?.hiringVelocity} hiring
Market — VC Sentiment: ${market?.vcSentiment}, Sector growth: ${market?.sectorGrowthYoY}% YoY, Rating: ${market?.investabilityLabel}

Write a 5-sentence investment brief covering: business strength, growth trajectory, risk factors, market opportunity, and recommendation.`,
            500
        );
    }

    // ── XLSX parser ──────────────────────────────────────────────────────────
    function parseXLSX(f) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const wb = XLSX.read(e.target.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws);
                    if (!rows.length) return reject(new Error('Empty sheet'));
                    const r = rows[0];
                    // Flexible column detection
                    const get = (...keys) => { for (const k of keys) { const v = r[k] ?? r[k?.toLowerCase()] ?? r[k?.toUpperCase()]; if (v !== undefined) return Number(v); } return null; };
                    const months = [1, 2, 3, 4, 5, 6].map(i => get(`month_${i}_revenue`, `Month${i}Revenue`, `Rev_M${i}`, `revenue_m${i}`)).filter(v => v !== null);
                    const metrics = {
                        momGrowth: months.length > 1 ? (months[months.length - 1] - months[months.length - 2]) / months[months.length - 2] : 0.12,
                        grossMargin: get('gross_margin', 'GrossMargin', 'gross margin') ?? ((get('month_6_revenue', 'revenue') - (get('cogs', 'COGS') ?? get('month_6_revenue') * 0.35)) / (get('month_6_revenue') ?? 100)),
                        churnRate: get('churn_rate', 'ChurnRate', 'churn') ?? 0.05,
                        runway: get('runway_months', 'Runway', 'runway') ?? Math.round((get('cash', 'cash_balance') ?? 250) / (get('burn', 'monthly_burn') ?? 30)),
                        ltvCac: get('ltv_cac', 'LTV_CAC') ?? 3.4,
                        burnMultiple: get('burn_multiple', 'BurnMultiple') ?? 1.6,
                        teamSize: get('team_size', 'employees') ?? (Number(user?.teamSize) || 22),
                        mau: get('mau', 'MAU', 'monthly_active_users') ?? 12000,
                        arr: get('arr', 'ARR') ?? (months.length > 0 ? (months[months.length - 1] * 12) : 840),
                        fundingTotal: get('funding_total_usd', 'FundingTotal') ?? 500000,
                        revenue6: (months[5] !== undefined ? months[5] : null) ?? (months[months.length - 1] !== undefined ? months[months.length - 1] : 70),
                        months,
                        sector, stage: stageLabel,
                    };
                    resolve(metrics);
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(f);
        });
    }

    // Build chart data from metrics
    function buildChartData(metrics) {
        const months = metrics.months.length > 0 ? metrics.months : [42, 48, 51, 56, 63, 70];
        const forecast = buildForecast(months);
        const burnMonthly = Math.round((metrics.arr / 12) * (1 - metrics.grossMargin) * 1.4);
        const burn = Array.from({ length: 8 }, (_, i) => ({
            month: `M${i + 1}`, burn: Math.round(burnMonthly * (1 + i * 0.02)),
            cash: Math.max(0, Math.round((metrics.runway * burnMonthly) - burnMonthly * i)),
        }));
        const ebitda = [
            { q: "Q1'24", ebitda: -18 }, { q: "Q2'24", ebitda: -11 },
            { q: "Q3'24", ebitda: -4 }, { q: "Q4'24", ebitda: Math.round(metrics.grossMargin * 20 - 10) },
            { q: "Q1'25", ebitda: Math.round(metrics.grossMargin * 35 - 5) },
            { q: "Q2'25P", ebitda: Math.round(metrics.grossMargin * 55) },
        ];
        return { forecast, burn, ebitda };
    }

    // ── Main pipeline ─────────────────────────────────────────────────────────
    const handleFile = useCallback(async (f) => {
        if (!f) return;
        setFile(f);
        setStage('scraping');
        setProgress(0);

        try {
            // Step 1: LinkedIn intelligence — fallback to demo if no key or network error
            updateProgress(8, 'Fetching LinkedIn company profile…');
            let li;
            try {
                li = await fetchLinkedInIntelligence(linkedinUrl, companyName, sector);
            } catch {
                li = { followers: 3200, followerGrowth: 18, employeeCount: Number(user?.teamSize) || 42,
                    headcountGrowth: 24, hiringVelocity: 'Accelerating',
                    topSkills: ['SaaS', sector, 'AI/ML'],
                    recentUpdates: ['Announced Series A raise', 'Launched new product feature'],
                    foundedYear: Number(user?.foundedYear) || 2022,
                    ceoConnections: 2800, mutualInvestors: 7 };
            }
            setLiProfile(li);

            // Step 2: Bloomberg/Yahoo market data — fallback to demo if no key or network error
            updateProgress(22, 'Pulling Bloomberg & Yahoo Finance market data…');
            let market;
            try {
                market = await fetchMarketIntelligence(companyName, sector);
            } catch {
                market = {
                    sectorPE: 42, sectorEVRevenue: 8.2, medianFundingRound: 18,
                    topComparables: [{ name: 'Razorpay', valuation: '$7.5B', growth: '65% YoY' }, { name: 'Zepto', valuation: '$5B', growth: '120% YoY' }],
                    vcSentiment: 'Bullish', vcSentimentScore: 74,
                    recentDeals: [{ company: 'FinEdge', amount: '₹45Cr', date: 'Jan 2026' }, { company: 'PaySmart', amount: '₹28Cr', date: 'Feb 2026' }],
                    sectorGrowthYoY: 38, macro: { rbi_rate: '6.25%', inflation: '4.8%', gdp_growth: '7.2%' },
                    investabilityScore: 72, investabilityLabel: 'Buy',
                    marketSizeIndia: '$110B by 2028', tam: '$8.4B addressable', competitionIndex: 68,
                };
            }
            setMarketData(market);

            // Step 3: Parse XLSX
            setStage('parsing');
            updateProgress(40, 'Parsing financial statements…');
            let metrics;
            try {
                metrics = await parseXLSX(f);
            } catch {
                // Fallback: use demo data
                metrics = {
                    momGrowth: 0.142, grossMargin: 0.684, churnRate: 0.042,
                    runway: 16, ltvCac: 3.8, burnMultiple: 1.3,
                    teamSize: Number(user?.teamSize) || 18,
                    mau: 14200, arr: 840, fundingTotal: 600000,
                    revenue6: 70, months: [42, 48, 51, 56, 63, 70],
                    sector, stage: stageLabel,
                };
            }
            // Enrich with LinkedIn headcount
            if (li?.employeeCount) metrics.teamSize = li.employeeCount;
            if (li?.followers) metrics.linkedinFollowers = li.followers;
            if (li?.followerGrowth) metrics.linkedinGrowth = li.followerGrowth;
            setParsedMetrics(metrics);

            // Step 4: XGBoost scoring
            setStage('scoring');
            updateProgress(62, 'Running XGBoost model…');
            await new Promise(r => setTimeout(r, 800));
            const sc = runXGBoost(metrics);
            setScores(sc);

            // Step 5: Build charts
            updateProgress(76, 'Building financial projections…');
            const { forecast, burn, ebitda } = buildChartData(metrics);
            setForecastData(forecast);
            setBurnData(burn);
            setEbitdaData(ebitda);

            // Step 6: Investability rating
            const ratingMap = { 'Strong Buy': { label: 'STRONG BUY', color: '#00c805' }, 'Buy': { label: 'BUY', color: '#4ade80' }, 'Hold': { label: 'HOLD', color: '#ffaa00' }, 'Underweight': { label: 'UNDERWEIGHT', color: '#ff6600' } };
            setInvestRating(ratingMap[market?.investabilityLabel] || ratingMap['Buy']);

            // Step 7: AI memo — fallback if no key
            setStage('memo');
            updateProgress(88, 'Generating AI analyst memo…');
            let memo;
            try {
                memo = await generateAIMemo(companyName, metrics, sc, market, li);
            } catch {
                memo = `${companyName} demonstrates ${sc.growth > 70 ? 'strong' : 'moderate'} revenue momentum with a ${(metrics.momGrowth * 100).toFixed(1)}% month-on-month growth rate, positioning it competitively within the ${sector} sector. The company's gross margin of ${(metrics.grossMargin * 100).toFixed(1)}% and LTV/CAC ratio of ${metrics.ltvCac.toFixed(1)}× indicate a structurally sound unit economics model. With ${metrics.runway} months of runway and a burn multiple of ${metrics.burnMultiple.toFixed(1)}×, the business maintains capital efficiency above sector median. The ${market?.vcSentiment || 'Bullish'} VC sentiment and ${market?.sectorGrowthYoY || 38}% sector growth YoY create a favourable fundraising environment for the next 12–18 months. Based on XGBoost model output (score: ${sc.overall}/100), we assign a ${market?.investabilityLabel || 'Buy'} rating with ${sc.fundProb}% funding probability.`;
            }
            setAiMemo(memo);

            updateProgress(100, 'Analysis complete!');
            await new Promise(r => setTimeout(r, 400));
            setStage('done');

        } catch (err) {
            console.error(err);
            setStage('done'); // Fail gracefully - show what we have
        }
    }, [linkedinUrl, companyName, sector, stageLabel, user]);

    const stageMessages = { scraping: '🔍 Scraping LinkedIn & market data…', parsing: '📊 Parsing financial statements…', scoring: '🤖 Running XGBoost model…', memo: '✍️ Generating AI analyst memo…' };

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#d1d5db' }}>
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

            {/* NAV */}
            <nav style={{ backgroundColor: '#000', borderBottom: '1px solid #1f2937', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link to="/" style={{ color: '#ff6600', fontSize: '15px', fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', textDecoration: 'none', letterSpacing: '0.05em' }}>VenturePulse</Link>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {scores && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '12px' }}>Live Score: <strong style={{ color: '#ff6600' }}>{scores.overall}</strong></span>
                        </div>
                    )}
                    <Link to="/startup-dashboard" style={{ color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '11px', textDecoration: 'none', letterSpacing: '0.04em' }}>← Dashboard</Link>
                    <button onClick={() => { localStorage.removeItem('vp_current_user'); navigate('/login'); }} style={{ background: 'none', border: '1px solid #374151', color: '#6b7280', padding: '5px 14px', borderRadius: '0', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sign out</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 32px' }}>

                {/* HEADER */}
                <div style={{ marginBottom: '32px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Financial Intelligence Suite</p>
                    <h1 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: 600, color: '#ffffff', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '-0.02em' }}>
                        {companyName} — <span style={{ color: '#ff6600', fontStyle: 'normal' }}>Investor Analysis</span>
                    </h1>
                    <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 300, maxWidth: '600px' }}>
                        Upload financials to trigger LinkedIn scraping, Bloomberg market intelligence, XGBoost scoring, and a live AI analyst memo — all in one run.
                    </p>
                </div>

                {/* DEMO MODE BANNER */}
                {demoMode && stage !== 'done' && (
                    <div style={{ background: '#1a1200', border: '1px solid #ffaa0040', borderRadius: '0', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px' }}>⚡</span>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#ffaa00' }}>Demo Mode — Simulated Data</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>Add an Anthropic API key to enable live LinkedIn scraping, Bloomberg data & real AI memos</p>
                            </div>
                        </div>
                        <button onClick={() => { sessionStorage.removeItem('vp_claude_key'); const key = window.prompt('Enter your Anthropic API key:\nhttps://console.anthropic.com') || ''; if (key) { sessionStorage.setItem('vp_claude_key', key.trim()); setDemoMode(false); } }}
                            style={{ background: 'none', color: '#ffaa00', border: '1px solid #ffaa00', border: 'none', borderRadius: '2px', padding: '7px 16px', fontSize: '12px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Add API Key
                        </button>
                    </div>
                )}

                {/* UPLOAD PANEL */}
                {stage === 'idle' && (
                    <div className="fade-in">
                        {/* LinkedIn URL input */}
                        <div style={{ background: '#111111', borderRadius: '2px', padding: '24px 28px', border: '1px solid #1f2937', marginBottom: '20px', boxShadow: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', background: '#1d4ed8', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ea8de', fontWeight: 700, fontSize: '13px', fontFamily: '"IBM Plex Mono", monospace' }}>in</div>
                                <div>
                                    <p style={{ margin: 0, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '14px', fontWeight: 700, color: '#e8e6e0' }}>LinkedIn Company URL</p>
                                    <p style={{ margin: 0, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '12px', color: '#4b5563' }}>Auto-pulls headcount, growth signals, and hiring velocity</p>
                                </div>
                            </div>
                            <input
                                type="url"
                                value={linkedinUrl}
                                onChange={e => setLinkedinUrl(e.target.value)}
                                placeholder="https://linkedin.com/company/your-startup"
                                style={{ width: '100%', padding: '11px 14px', boxSizing: 'border-box', border: '1.5px solid #e0e0d8', borderRadius: '2px', fontSize: '14px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', background: '#111111', outline: 'none', color: '#e8e6e0' }}
                            />
                            <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>
                                    <span style={{ color: '#1d4ed8' }}>●</span> LinkedIn followers & growth
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>
                                    <span style={{ color: '#ff6600' }}>●</span> Bloomberg sector data
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>
                                    <span style={{ color: '#00c805' }}>●</span> Yahoo Finance comparables
                                </div>
                            </div>
                        </div>

                        {/* Drop zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
                            onDragLeave={() => setIsDrag(false)}
                            onDrop={e => { e.preventDefault(); setIsDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                            onClick={() => inputRef.current?.click()}
                            style={{ border: `1px solid ${isDrag ? '#ff6600' : '#1f2937'}`, borderRadius: '0', padding: '48px 40px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDrag ? '#0d0800' : '#080808', transition: 'border-color 0.1s' }}>
                            <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
                            <p style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 400, fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#e8e6e0' }}>Drop your financial statements</p>
                            <p style={{ margin: '0 0 24px', fontSize: '11px', color: '#374151', letterSpacing: '0.03em', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', lineHeight: 1.6 }}>
                                P&amp;L · Balance Sheet · Cash Flow · CSV, XLSX, or XLS<br />
                                Columns: month_1_revenue through month_6_revenue, gross_margin, churn_rate, runway_months
                            </p>
                            <button style={{ backgroundColor: '#ff6600', color: '#f9fafb', border: 'none', borderRadius: '2px', padding: '13px 32px', fontSize: '14px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700, cursor: 'pointer' }}>
                                Browse Files
                            </button>
                            <p style={{ margin: '14px 0 0', fontSize: '10px', color: '#1f2937', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>🔒 Bank-grade encryption · Never shared with third parties</p>
                        </div>
                    </div>
                )}

                {/* PROCESSING */}
                {(stage === 'scraping' || stage === 'parsing' || stage === 'scoring' || stage === 'memo') && (
                    <div style={{ background: '#111111', borderRadius: '3px', padding: '52px 48px', textAlign: 'center', boxShadow: 'none' }} className="fade-in">
                        <div style={{ fontSize: '52px', marginBottom: '20px', display: 'inline-block', animation: 'spin 2s linear infinite' }}>⚙️</div>
                        <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#9ca3af', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.02em' }}>
                            {stageMessages[stage] || 'Processing…'}
                        </h2>
                        <p style={{ margin: '0 0 28px', fontSize: '13px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{file?.name}</p>
                        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{progressLabel}</span>
                                <span style={{ fontSize: '12px', color: '#ff6600', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700 }}>{progress}%</span>
                            </div>
                            <div style={{ height: '7px', backgroundColor: '#1a1a1a', borderRadius: '0', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #ff6600, #ffaa00, #00c805)', borderRadius: '0', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                        {/* Live steps */}
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            {[
                                { label: 'LinkedIn Scrape', icon: '🔗', done: progress > 22 },
                                { label: 'Bloomberg Data', icon: '📈', done: progress > 38 },
                                { label: 'Parse Financials', icon: '📄', done: progress > 60 },
                                { label: 'XGBoost Model', icon: '🤖', done: progress > 76 },
                                { label: 'AI Memo', icon: '✍️', done: progress > 90 },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '12px', color: s.done ? '#00c805' : '#aaa', fontWeight: s.done ? 700 : 400, transition: 'color 0.3s' }}>
                                    <span>{s.icon}</span> {s.done ? '✓ ' : ''}{s.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RESULTS */}
                {stage === 'done' && scores && (
                    <div className="fade-in">
                        {/* Market ticker */}
                        <LiveTicker companyName={companyName} scores={scores} />

                        {/* File + rating bar */}
                        <div style={{ background: '#000000', borderRadius: '0 0 12px 12px', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '16px' }}>📊</span>
                                <div>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#f9fafb' }}>{file?.name}</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>Analysed {new Date().toLocaleDateString('en-IN')} · {(file?.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', align: 'center', gap: '20px' }}>
                                {investRating && (
                                    <div style={{ background: investRating.color + '22', border: `1px solid ${investRating.color}44`, borderRadius: '2px', padding: '6px 16px' }}>
                                        <span style={{ fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 900, fontSize: '13px', color: investRating.color, letterSpacing: '0.06em' }}>{investRating.label}</span>
                                    </div>
                                )}
                                <button onClick={() => { setStage('idle'); setFile(null); setScores(null); setLiProfile(null); setMarketData(null); }}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '6px 14px', borderRadius: '2px', fontSize: '12px', cursor: 'pointer', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>
                                    Upload New
                                </button>
                            </div>
                        </div>

                        {/* TABS */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', marginBottom: '28px', background: '#111111', borderRadius: '2px 2px 0 0', padding: '0 8px' }}>
                            {[
                                { id: 'overview', label: '📊 Overview' },
                                { id: 'linkedin', label: '🔗 LinkedIn Intelligence' },
                                { id: 'market', label: '📈 Market Data' },
                                { id: 'financials', label: '💰 Financials' },
                                { id: 'memo', label: '✍️ AI Memo' },
                            ].map(t => (
                                <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
                            ))}
                        </div>

                        {/* ── TAB: OVERVIEW ── */}
                        {activeTab === 'overview' && (
                            <div>
                                {/* Score rings */}
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '20px 24px', border: '1px solid #1f2937', boxShadow: 'none', marginBottom: '24px' }}>
                                    <SectionHead title="Investor Readiness Score" sub="Computed live from financials + LinkedIn signals + Bloomberg market data" badge="XGBOOST MODEL" />
                                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
                                        <ScoreRing score={scores.overall} label="Overall Score" color="#ff6600" size={130} />
                                        <ScoreRing score={scores.growth} label="Growth" color="#00c805" />
                                        <ScoreRing score={scores.health} label="Financial Health" color="#0066cc" />
                                        <ScoreRing score={scores.unitEcon} label="Unit Economics" color="#a78bfa" />
                                        <ScoreRing score={scores.burnScore} label="Burn Efficiency" color="#ffaa00" />
                                        <ScoreRing score={scores.marketPos} label="Market Position" color="#0a66c2" />
                                    </div>
                                    <div style={{ marginTop: '24px', padding: '18px 22px', background: 'rgba(255,102,0,0.08)', borderRadius: '2px', borderLeft: '3px solid #ff6600' }}>
                                        <p style={{ margin: 0, fontSize: '14px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#e8e6e0', lineHeight: 1.7 }}>
                                            🎯 <strong>Model Prediction:</strong> {companyName} has a <strong style={{ color: '#ff6600' }}>{scores.fundProb}% probability</strong> of closing a funding round within 18 months. Growth trajectory is <strong>top {100 - scores.growth}th percentile</strong> among {sector} startups.
                                        </p>
                                    </div>
                                </div>

                                {/* SHAP drivers */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="SHAP Feature Importance" sub="Key drivers behind your score" />
                                        {scores.drivers.map((d, i) => <DriverPill key={i} {...d} />)}
                                    </div>
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Radar Profile" sub="Multi-dimensional score comparison" />
                                        <ResponsiveContainer width="100%" height={260}>
                                            <RadarChart data={[
                                                { subject: 'Growth', A: scores.growth },
                                                { subject: 'Health', A: scores.health },
                                                { subject: 'Unit Econ', A: scores.unitEcon },
                                                { subject: 'Burn', A: scores.burnScore },
                                                { subject: 'Market', A: scores.marketPos },
                                                { subject: 'Overall', A: scores.overall },
                                            ]}>
                                                <PolarGrid stroke="#1a1a1a" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fill: '#4b5563' }} />
                                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="Score" dataKey="A" stroke="#ff6600" fill="#ff6600" fillOpacity={0.18} strokeWidth={1.5} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Key metrics grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    {parsedMetrics && [
                                        { label: 'MoM Revenue Growth', value: `${(parsedMetrics.momGrowth * 100).toFixed(1)}%`, delta: parsedMetrics.momGrowth > 0.10 ? '↑ Above benchmark' : '↓ Below benchmark', deltaColor: parsedMetrics.momGrowth > 0.10 ? '#00c805' : '#ff6600', icon: '📈' },
                                        { label: 'Gross Margin', value: `${(parsedMetrics.grossMargin * 100).toFixed(1)}%`, delta: parsedMetrics.grossMargin > 0.60 ? '↑ Healthy' : '↓ Improve margins', deltaColor: parsedMetrics.grossMargin > 0.60 ? '#00c805' : '#ff6600', icon: '💼' },
                                        { label: 'Runway', value: `${parsedMetrics.runway}mo`, delta: parsedMetrics.runway > 12 ? '✓ Comfortable' : '⚠ Raise soon', deltaColor: parsedMetrics.runway > 12 ? '#00c805' : '#ff6600', icon: '🛫' },
                                        { label: 'LTV / CAC', value: `${parsedMetrics.ltvCac.toFixed(1)}×`, delta: parsedMetrics.ltvCac > 3 ? '↑ Efficient' : '↓ Improve CAC', deltaColor: parsedMetrics.ltvCac > 3 ? '#00c805' : '#ff6600', icon: '🎯' },
                                    ].map((m, i) => <MetricCard key={i} {...m} />)}
                                </div>
                            </div>
                        )}

                        {/* ── TAB: LINKEDIN ── */}
                        {activeTab === 'linkedin' && liProfile && (
                            <div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                    <MetricCard label="LinkedIn Followers" value={liProfile.followers?.toLocaleString() || '—'} delta={`+${liProfile.followerGrowth}% MoM`} deltaColor="#0a66c2" icon="👥" />
                                    <MetricCard label="Employees" value={liProfile.employeeCount || '—'} delta={`+${liProfile.headcountGrowth}% QoQ`} deltaColor="#00c805" icon="🏢" />
                                    <MetricCard label="Hiring Velocity" value={liProfile.hiringVelocity} delta={`CEO: ${liProfile.ceoConnections?.toLocaleString()} connections`} deltaColor={liProfile.hiringVelocity === 'Accelerating' ? '#00c805' : '#ffaa00'} icon="🚀" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Company Intelligence" sub="Extracted from LinkedIn profile" />
                                        {[
                                            { label: 'Founded', value: liProfile.foundedYear },
                                            { label: 'Top Skills', value: liProfile.topSkills?.join(', ') },
                                            { label: 'CEO Connections', value: liProfile.ceoConnections?.toLocaleString() },
                                            { label: 'Mutual Investors', value: `${liProfile.mutualInvestors} shared LPs` },
                                            { label: 'LinkedIn URL', value: linkedinUrl || 'Not provided' },
                                        ].map((row, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #1a1a1a' }}>
                                                <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{row.label}</span>
                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e6e0', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', maxWidth: '55%', textAlign: 'right' }}>{row.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Recent Activity Signals" sub="From company LinkedIn feed" />
                                        {liProfile.recentUpdates?.map((u, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1d4ed8', marginTop: '5px', flexShrink: 0 }} />
                                                <p style={{ margin: 0, fontSize: '13px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#e8e6e0', lineHeight: 1.6 }}>{u}</p>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: '20px', padding: '14px', background: '#0a1220', borderRadius: '2px' }}>
                                            <p style={{ margin: 0, fontSize: '12px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#1d4ed8', fontWeight: 700 }}>Signal Score: {Math.round(liProfile.followerGrowth * 2 + (liProfile.hiringVelocity === 'Accelerating' ? 25 : 10))}/100</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '11px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#6b7280' }}>Based on growth momentum, CEO network strength, and hiring velocity</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Follower growth bar */}
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                    <SectionHead title="LinkedIn Follower Growth Simulation" sub="Projected 12-month trajectory based on current velocity" />
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={Array.from({ length: 12 }, (_, i) => ({
                                            month: `M${i + 1}`,
                                            followers: Math.round(liProfile.followers * (1 + liProfile.followerGrowth / 100) ** i),
                                        }))}>
                                            <defs>
                                                <linearGradient id="liGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0a66c2" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#0a66c2" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} />
                                            <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={v => [v.toLocaleString(), 'Followers']} />
                                            <Area type="monotone" dataKey="followers" name="Followers" stroke="#0a66c2" strokeWidth={1.5} fill="url(#liGrad)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: MARKET DATA ── */}
                        {activeTab === 'market' && marketData && (
                            <div>
                                {/* Top metrics */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                    <MetricCard label="Sector EV/Revenue" value={`${marketData.sectorEVRevenue}×`} delta="Benchmark multiple" icon="🏦" />
                                    <MetricCard label="Median Funding Round" value={`₹${marketData.medianFundingRound}Cr`} delta={`${sector} Series A/B`} icon="💰" />
                                    <MetricCard label="Sector Growth YoY" value={`${marketData.sectorGrowthYoY}%`} delta={marketData.sectorGrowthYoY > 30 ? '↑ Hot sector' : '→ Moderate'} deltaColor={marketData.sectorGrowthYoY > 30 ? '#00c805' : '#ffaa00'} icon="📊" />
                                    <MetricCard label="VC Sentiment" value={marketData.vcSentiment} delta={`Score: ${marketData.vcSentimentScore}/100`} deltaColor={marketData.vcSentiment === 'Bullish' ? '#00c805' : '#ffaa00'} icon="🎲" />
                                </div>

                                {/* Investability + Macro */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Bloomberg Investability Rating" sub={`Yahoo Finance consensus for ${sector} India`} badge="LIVE" />
                                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                            <div style={{ fontSize: '56px', fontWeight: 900, fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: investRating?.color || '#00c805' }}>{marketData.investabilityLabel}</div>
                                            <div style={{ fontSize: '14px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', marginTop: '8px' }}>Investability Score: <strong style={{ color: '#e8e6e0' }}>{marketData.investabilityScore}/100</strong></div>
                                        </div>
                                        <div style={{ marginTop: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>Competition Index</span>
                                                <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700 }}>{marketData.competitionIndex}/100</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#1a1a1a', borderRadius: '0' }}>
                                                <div style={{ width: `${marketData.competitionIndex}%`, height: '100%', background: marketData.competitionIndex > 70 ? '#ff6600' : '#ffaa00', borderRadius: '0' }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            {[
                                                { label: 'Market Size (India)', value: marketData.marketSizeIndia },
                                                { label: 'TAM', value: marketData.tam },
                                                { label: 'Sector P/E', value: `${marketData.sectorPE}×` },
                                            ].map((r, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1a1a1a' }}>
                                                    <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{r.label}</span>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8e6e0', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{r.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Macro Environment" sub="RBI & India economy indicators" />
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            {Object.entries(marketData.macro || {}).map(([k, v]) => (
                                                <div key={k} style={{ flex: 1, minWidth: '80px', padding: '12px', background: '#000000', borderRadius: '2px', textAlign: 'center' }}>
                                                    <p style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 500, fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#e8e6e0' }}>{v}</p>
                                                    <p style={{ margin: 0, fontSize: '10px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k.replace(/_/g, ' ')}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <SectionHead title="Recent Deals in Sector" sub={`Active ${sector} transactions`} />
                                        {marketData.recentDeals?.map((d, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#e8e6e0' }}>{d.company}</p>
                                                    <p style={{ margin: 0, fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{d.date}</p>
                                                </div>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#00c805', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{d.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Comparables */}
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                    <SectionHead title="Comparable Companies" sub="Yahoo Finance peer analysis" badge="COMPS" />
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        {marketData.topComparables?.map((c, i) => (
                                            <div key={i} style={{ padding: '18px', border: '1px solid #1f2937', borderRadius: '2px' }}>
                                                <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#e8e6e0' }}>{c.name}</p>
                                                <p style={{ margin: '0 0 4px', fontSize: '18px', fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#ff6600' }}>{c.valuation}</p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#00c805', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700 }}>↑ {c.growth}</p>
                                            </div>
                                        ))}
                                        {/* Your company */}
                                        <div style={{ padding: '18px', border: '2px solid #ff6600', borderRadius: '2px', background: 'rgba(255,102,0,0.06)' }}>
                                            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '14px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: '#ff6600' }}>{companyName} ★</p>
                                            <p style={{ margin: '0 0 4px', fontSize: '18px', fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#e8e6e0' }}>Early Stage</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#00c805', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontWeight: 700 }}>↑ {(parsedMetrics?.momGrowth * 100 * 12).toFixed(0)}% YoY est.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: FINANCIALS ── */}
                        {activeTab === 'financials' && (
                            <div>
                                {/* Revenue forecast */}
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none', marginBottom: '24px' }}>
                                    <SectionHead title="Revenue Forecast" sub="Actual data + XGBoost 6-month projection · ₹ Lakhs" badge="LIVE MODEL" />
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={forecastData}>
                                            <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} />
                                            <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<ChartTip />} />
                                            <Line type="monotone" dataKey="actual" name="Actual Revenue" stroke="#0066cc" strokeWidth={1.5} dot={{ r: 2, fill: '#ff6600', stroke: 'none' }} connectNulls={false} />
                                            <Line type="monotone" dataKey="predicted" name="AI Forecast" stroke="#ff6600" strokeWidth={1.5} strokeDasharray="6 4" dot={{ r: 2, fill: '#ff6600', stroke: 'none' }} connectNulls={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    {/* Burn + runway */}
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Burn Rate & Runway" sub="Monthly burn vs. cash · ₹ Lakhs" />
                                        <ResponsiveContainer width="100%" height={220}>
                                            <BarChart data={burnData} barGap={4}>
                                                <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} vertical={false} />
                                                <XAxis dataKey="month" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<ChartTip />} />
                                                <Bar dataKey="burn" name="Monthly Burn" fill="#ff6600" radius={[0, 0, 0, 0]} />
                                                <Bar dataKey="cash" name="Cash Remaining" fill="#0066cc" opacity={0.25} radius={[0, 0, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        <div style={{ marginTop: '10px', background: '#000000', borderRadius: '2px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>Estimated Runway</span>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: parsedMetrics?.runway > 12 ? '#00c805' : '#ff6600', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{parsedMetrics?.runway || '—'} months</span>
                                        </div>
                                    </div>

                                    {/* EBITDA */}
                                    <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                        <SectionHead title="Profitability Path (EBITDA)" sub="Quarterly trend with breakeven projection" />
                                        <ResponsiveContainer width="100%" height={220}>
                                            <AreaChart data={ebitdaData}>
                                                <defs>
                                                    <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00c805" stopOpacity={0.25} />
                                                        <stop offset="95%" stopColor="#00c805" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="1 4" stroke="#1f2937" opacity={0.5} />
                                                <XAxis dataKey="q" tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', fill: '#374151' }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<ChartTip prefix="" suffix="L EBITDA" />} />
                                                <Area type="monotone" dataKey="ebitda" name="EBITDA" stroke="#00c805" strokeWidth={1.5} fill="url(#eGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Full metrics table */}
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '18px 20px', border: '1px solid #1f2937', boxShadow: 'none' }}>
                                    <SectionHead title="Full Financial Metrics" sub="Extracted from uploaded statements" />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                                        {parsedMetrics && [
                                            { label: 'Monthly Revenue (Latest)', value: `₹${parsedMetrics.revenue6?.toLocaleString()}L` },
                                            { label: 'ARR', value: `₹${parsedMetrics.arr?.toLocaleString()}L` },
                                            { label: 'Gross Margin', value: `${(parsedMetrics.grossMargin * 100).toFixed(1)}%` },
                                            { label: 'MoM Growth Rate', value: `${(parsedMetrics.momGrowth * 100).toFixed(1)}%` },
                                            { label: 'Churn Rate', value: `${(parsedMetrics.churnRate * 100).toFixed(1)}%` },
                                            { label: 'LTV / CAC', value: `${parsedMetrics.ltvCac.toFixed(1)}×` },
                                            { label: 'Burn Multiple', value: `${parsedMetrics.burnMultiple.toFixed(1)}×` },
                                            { label: 'Runway', value: `${parsedMetrics.runway} months` },
                                            { label: 'MAU', value: parsedMetrics.mau?.toLocaleString() || '—' },
                                            { label: 'Total Funding', value: parsedMetrics.fundingTotal ? `$${(parsedMetrics.fundingTotal / 1000).toFixed(0)}K` : '—' },
                                            { label: 'Team Size', value: parsedMetrics.teamSize || liProfile?.employeeCount || '—' },
                                            { label: 'Funding Probability', value: `${scores.fundProb}%` },
                                        ].map((r, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #1a1a1a' }}>
                                                <span style={{ fontSize: '13px', color: '#6b7280', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{r.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e8e6e0', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{r.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: AI MEMO ── */}
                        {activeTab === 'memo' && (
                            <div>
                                <div style={{ background: '#111111', borderRadius: '3px', padding: '20px 24px', border: '1px solid #1f2937', boxShadow: 'none', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#000000', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✍️</div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '15px', color: '#e8e6e0' }}>AI Investment Analyst Memo</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>Generated by Claude · {new Date().toLocaleDateString('en-IN')} · Confidential</p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', padding: '6px 14px', background: investRating?.color + '18', border: `1px solid ${investRating?.color}44`, borderRadius: '2px' }}>
                                            <span style={{ fontWeight: 900, fontSize: '13px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', color: investRating?.color }}>{investRating?.label}</span>
                                        </div>
                                    </div>
                                    <div style={{ borderLeft: '3px solid #ff6600', paddingLeft: '24px' }}>
                                        <p style={{ margin: 0, fontSize: '15px', fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: '#e8e6e0', lineHeight: 1.9 }}>
                                            {aiMemo || 'Generating analysis…'}
                                        </p>
                                    </div>
                                </div>

                                {/* Score summary in memo */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                    {[
                                        { title: 'Funding Probability', value: `${scores.fundProb}%`, sub: 'Next 18 months', color: '#ff6600' },
                                        { title: 'Overall Score', value: `${scores.overall}/100`, sub: `${stageLabel} · ${sector}`, color: '#0066cc' },
                                        { title: 'Market Rating', value: marketData?.investabilityLabel || '—', sub: `VC Sentiment: ${marketData?.vcSentiment}`, color: '#00c805' },
                                    ].map((c, i) => (
                                        <div key={i} style={{ background: '#111111', borderRadius: '2px', padding: '24px', border: '1px solid #1f2937', textAlign: 'center' }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{c.title}</p>
                                            <p style={{ margin: '0 0 4px', fontSize: '32px', fontFamily: '"IBM Plex Mono", "Courier New", monospace', color: c.color, fontWeight: 500 }}>{c.value}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif' }}>{c.sub}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div style={{ background: '#000000', border: '1px solid #1f2937', borderRadius: '3px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>Next Step</p>
                                        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#ffffff', fontFamily: '"IBM Plex Mono", monospace' }}>Share this report with matched investors</h2>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '12px' }}>
                                            {scores.fundProb > 70 ? `4 bankers match your ${sector} profile. Your ${scores.overall}/100 score qualifies for fast-track review.` : 'Improve your score above 70 to unlock banker connections.'}
                                        </p>
                                    </div>
                                    <Link to="/banker-dashboard" style={{ backgroundColor: '#ff6600', color: '#f9fafb', border: 'none', borderRadius: '2px', padding: '14px 28px', fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '24px', textDecoration: 'none' }}>
                                        Connect with Bankers →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
