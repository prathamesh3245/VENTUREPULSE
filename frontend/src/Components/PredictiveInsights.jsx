import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ── DATA ────────────────────────────────────────────────────────────────────
const fundingTrend = [
  { q: 'Q1 23', amount: 12400, deals: 412 },
  { q: 'Q2 23', amount: 9800, deals: 380 },
  { q: 'Q3 23', amount: 15600, deals: 445 },
  { q: 'Q4 23', amount: 18200, deals: 512 },
  { q: 'Q1 24', amount: 21400, deals: 567 },
  { q: 'Q2 24', amount: 19800, deals: 520 },
  { q: 'Q3 24', amount: 24200, deals: 590 },
  { q: 'Q4 24', amount: 28400, deals: 642 },
  { q: 'Q1 25', amount: 31200, deals: 680 },
];

const sectorData = [
  { name: 'Fintech', value: 32, funding: '₹9,800Cr', growth: '+28%' },
  { name: 'Agritech', value: 18, funding: '₹4,200Cr', growth: '+42%' },
  { name: 'Healthtech', value: 24, funding: '₹7,100Cr', growth: '+15%' },
  { name: 'SaaS', value: 26, funding: '₹8,400Cr', growth: '+34%' },
];

const radarData = [
  { subject: 'Market Size', A: 120, B: 110, fullMark: 150 },
  { subject: 'Talent Pool', A: 98, B: 130, fullMark: 150 },
  { subject: 'Regulatory', A: 86, B: 130, fullMark: 150 },
  { subject: 'Capital Flow', A: 99, B: 100, fullMark: 150 },
  { subject: 'Innovation', A: 85, B: 90, fullMark: 150 },
  { subject: 'Exits', A: 65, B: 85, fullMark: 150 },
];

const COLORS = ['#ff6600', '#1d4ed8', '#a78bfa', '#00c805'];

const s2 = { fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', color: '#6b7280' };
const s3 = { fontFamily: '"IBM Plex Sans", sans-serif' };

// ── COMPONENTS ──────────────────────────────────────────────────────────────
function StatCard({ label, value, trend, desc }) {
  return (
    <div style={{ background: '#111111', padding: '24px', borderRadius: '0', border: '1px solid #1f2937', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', ...s3 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '400', color: '#f1f1f1' }}>{value}</h3>
        {trend && <span style={{ fontSize: '13px', fontWeight: '700', color: trend.startsWith('+') ? '#00c805' : '#ff6600', ...s3 }}>{trend}</span>}
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: '300', ...s3 }}>{desc}</p>
    </div>
  );
}

export function PredictiveInsights() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000000', fontFamily: '"IBM Plex Mono", monospace' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
        .tab-btn { background: none; border: none; cursor: pointer; padding: 10px 20px; border-radius: 8px; font-family: "IBM Plex Sans", sans-serif; font-size: 14px; color: #888; transition: all 0.2s; }
        .tab-btn:hover { background: rgba(0,0,0,0.05); color: #1a3a5c; }
        .tab-btn.active { background: #f1f1f1; color: white; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: '#000000', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#f1f1f1', fontSize: '15px', fontWeight: '500', textDecoration: 'none' }}>VenturePulse</Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '0' }}>
            <span style={{ width: '8px', height: '8px', background: '#ff6600', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
            <span style={{ color: '#f1f1f1', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', ...s3 }}>Live Market Data</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/companies" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '14px', ...s3 }}>Explore Startups</Link>
          <Link to="/login" style={{ color: '#f1f1f1', textDecoration: 'none', fontSize: '14px', fontWeight: '600', padding: '6px 16px', background: '#ff6600', borderRadius: '0', ...s3 }}>Sign In</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #f1f1f1 0%, #0a1628 100%)', padding: '60px 40px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Tag label="Crunchbase-Style Analytics" color="#ff6600" />
          <h1 style={{ color: '#f1f1f1', fontSize: '56px', fontWeight: '400', margin: '20px 0', lineHeight: 1.1 }}>
            Predicting the next <i style={{ color: '#ff6600' }}>Formidable</i> Founders
          </h1>
          <p style={{ color: '#374151', fontSize: '18px', fontWeight: '300', lineHeight: 1.6, ...s3 }}>
            Real-time insights across the Indian startup ecosystem. Leveraging deterministic ML models to reveal hidden patterns in capital flow, talent migration, and sector maturity.
          </p>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ maxWidth: '1200px', margin: '-50px auto 60px', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        <StatCard label="Total Capital" value="₹2.84Tn" trend="+14.2%" desc="Invested in last 12 months" />
        <StatCard label="Unicorn Birth" value="12" trend="-4" desc="New unicorns in 2025" />
        <StatCard label="Avg. Series A" value="₹42Cr" trend="+8%" desc="Median round size (India)" />
        <StatCard label="Success Index" value="84.2" trend="+1.2" desc="Ecosystem health score" />
      </div>

      {/* MAIN ANALYTICS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* Funding Trend */}
          <div style={{ background: '#111111', borderRadius: '0', padding: '32px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '500', color: '#f1f1f1' }}>Funding Velocity</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', ...s3 }}>Quarterly deployment vs Deal count</p>
              </div>
              <div style={{ background: '#000000', padding: '4px', borderRadius: '0', display: 'flex' }}>
                <button className="tab-btn active">Amount</button>
                <button className="tab-btn">Deals</button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={fundingTrend}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="q" axisLine={false} tickLine={false} tick={{ fontSize: 11, ...s3, fill: '#aaa' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, ...s3, fill: '#aaa' }} tickFormatter={v => `₹${v / 1000}kCr`} />
                <Tooltip
                  contentStyle={{ borderRadius: '0', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', ...s3 }}
                  formatter={(v) => [`₹${v} Cr`, 'Funding']}
                />
                <Area type="monotone" dataKey="amount" stroke="#1d4ed8" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Metrics */}
          <div style={{ background: '#111111', borderRadius: '0', padding: '32px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '500', color: '#f1f1f1' }}>Ecosystem Maturity</h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#4b5563', ...s3 }}>Comparative multi-axis model</p>

            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, ...s3, fill: '#888' }} />
                <Radar name="Portfolio" dataKey="A" stroke="#ff6600" fill="#ff6600" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '20px', padding: '16px', background: '#000000', borderRadius: '0' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', color: '#1d4ed8', ...s3 }}>AI INSIGHT</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.5, ...s3 }}>Regulatory tailwinds in 2025 are projected to increase Capital Flow by 14% MoM.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Sector Growth */}
          <div style={{ background: '#111111', borderRadius: '0', padding: '32px', border: '1px solid #1f2937' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '14px', fontWeight: '500', color: '#f1f1f1' }}>Sector Performance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sectorData.map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i] }}></div>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#f1f1f1', ...s3 }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#00c805', fontWeight: '700', ...s3 }}>{s.growth} YoY</span>
                  </div>
                  <div style={{ height: '8px', background: '#000000', borderRadius: '0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.value}%`, background: COLORS[i], borderRadius: '0' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#4b5563', ...s3 }}>Volume: {s.funding}</span>
                    <span style={{ fontSize: '11px', color: '#4b5563', ...s3 }}>{s.value}% Share</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Probability Gauge Placeholder */}
          <div style={{ background: '#000000', borderRadius: '0', padding: '40px', color: '#f1f1f1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(232,99,42,0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '400', textAlign: 'center' }}>Success Prediction Gauge</h2>
            <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#374151', textAlign: 'center', maxWidth: '300px', ...s3 }}>
              Current ecosystem success probability for Series A rounds in 2025:
            </p>

            <div style={{ position: 'relative', width: '200px', height: '100px', overflow: 'hidden' }}>
              <svg width="200" height="100">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ff6600" strokeWidth="20"
                  strokeDasharray="251.3" strokeDashoffset={`${251.3 * (1 - 0.74)}`} />
              </svg>
              <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '300' }}>74%</span>
                <p style={{ margin: 0, fontSize: '11px', color: '#ff6600', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', ...s3 }}>Investor Grade</p>
              </div>
            </div>

            <Link to="/register" style={{ marginTop: '40px', background: '#111111', color: '#f1f1f1', padding: '12px 32px', borderRadius: '0', textDecoration: 'none', fontSize: '14px', fontWeight: '700', ...s3 }}>
              Join to Access Full Report
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function Tag({ label, color }) {
  return (
    <span style={{ padding: '6px 16px', borderRadius: '0', fontSize: '11px', fontWeight: '700', ...s3, color, background: color + '15', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      {label}
    </span>
  );
}
