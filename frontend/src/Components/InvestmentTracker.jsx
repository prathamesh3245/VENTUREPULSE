import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('vp_current_user')); } catch { return null; }
}

const portfolioCompanies = [
    { name: 'FinEdge Technologies', sector: 'Fintech', stage: 'Series A', invested: 25, valuation: 120, irr: 34, moic: 2.8, status: 'Growing', date: 'Mar 2023' },
    { name: 'AgriSense India', sector: 'AgriTech', stage: 'Seed', invested: 8, valuation: 28, irr: 41, moic: 2.1, status: 'Growing', date: 'Jul 2023' },
    { name: 'HealthBridge', sector: 'HealthTech', stage: 'Series B', invested: 60, valuation: 310, irr: 28, moic: 3.4, status: 'Performing', date: 'Jan 2022' },
    { name: 'LogiFlow Systems', sector: 'Logistics', stage: 'Series A', invested: 18, valuation: 54, irr: 19, moic: 1.6, status: 'Watch', date: 'Nov 2023' },
    { name: 'EduNest', sector: 'EdTech', stage: 'Seed', invested: 5, valuation: 22, irr: 55, moic: 3.1, status: 'High Growth', date: 'Sep 2024' },
];

const capitalDeployed = [
    { q: 'Q1 \'23', deployed: 25, returned: 0 },
    { q: 'Q2 \'23', deployed: 0, returned: 0 },
    { q: 'Q3 \'23', deployed: 8, returned: 0 },
    { q: 'Q4 \'23', deployed: 18, returned: 0 },
    { q: 'Q1 \'24', deployed: 0, returned: 12 },
    { q: 'Q2 \'24', deployed: 60, returned: 0 },
    { q: 'Q3 \'24', deployed: 0, returned: 28 },
    { q: 'Q4 \'24', deployed: 5, returned: 0 },
    { q: 'Q1 \'25', deployed: 0, returned: 45 },
];

const sectorAllocation = [
    { name: 'HealthTech', value: 52, color: '#ff6600' },
    { name: 'Fintech', value: 21, color: '#1d4ed8' },
    { name: 'Logistics', value: 15, color: '#a78bfa' },
    { name: 'AgriTech', value: 7, color: '#00c805' },
    { name: 'EdTech', value: 5, color: '#ffaa00' },
];

const pipeline = {
    Prospecting: [
        { name: 'CleanGrid Energy', sector: 'CleanTech', ask: '₹15Cr', match: 88 },
        { name: 'DroneDeliver', sector: 'Logistics', ask: '₹8Cr', match: 76 },
    ],
    'Due Diligence': [
        { name: 'NeuroPay', sector: 'Fintech', ask: '₹32Cr', match: 91 },
    ],
    'Term Sheet': [
        { name: 'CropSight AI', sector: 'AgriTech', ask: '₹12Cr', match: 84 },
    ],
    Closed: [
        { name: 'EduNest', sector: 'EdTech', ask: '₹5Cr', match: 95 },
    ],
};

const stageColors = { Prospecting: '#aaa', 'Due Diligence': '#ffaa00', 'Term Sheet': '#ff6600', Closed: '#00c805' };

const statusColor = (s) => s === 'High Growth' ? '#00c805' : s === 'Growing' ? '#1d4ed8' : s === 'Performing' ? '#a78bfa' : '#ff6600';

function StatCard({ label, value, sub, color, icon }) {
    return (
        <div style={{ backgroundColor: '#111111', borderRadius: '0', padding: '24px', border: '1px solid #1f2937', boxShadow: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '700', fontFamily: '"IBM Plex Sans", sans-serif', color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '400', fontFamily: '"IBM Plex Mono", monospace', color: '#f1f1f1' }}>{value}</p>
                    {sub && <p style={{ margin: 0, fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif', color: color, fontWeight: '600' }}>{sub}</p>}
                </div>
                <div style={{ fontSize: '26px', width: '50px', height: '50px', backgroundColor: color + '15', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            </div>
        </div>
    );
}

export function InvestmentTracker() {
    const navigate = useNavigate();
    const user = getCurrentUser();
    const [activeTab, setActiveTab] = useState('portfolio');

    const tip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: '#111111', border: '1px solid #eee', borderRadius: '0', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ margin: '2px 0', fontSize: '13px', color: p.color, fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                        {p.name}: ₹{p.value}Cr
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000000', fontFamily: '"IBM Plex Mono", monospace' }}>
            <style>{`.tab2{background:none;border:none;cursor:pointer;padding:10px 20px;border-radius:8px;font-family:"IBM Plex Sans",sans-serif;font-size:13px;font-weight:600;transition:all 0.2s}.tab2:hover{background:rgba(26,58,92,0.08);color:#1a3a5c}.tab2.active{background:#f1f1f1;color:white}`}</style>

            <nav style={{ backgroundColor: '#000000', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link to="/" style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '500', fontFamily: '"IBM Plex Mono", monospace', textDecoration: 'none' }}>VenturePulse</Link>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <Link to="/banker-dashboard" style={{ color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</Link>
                    <Link to="/banker-due-diligence" style={{ color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', textDecoration: 'none' }}>⚡ Due Diligence</Link>
                    <Link to="/insights" style={{ color: '#ff6600', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>📊 Insights</Link>
                    <button onClick={() => { localStorage.removeItem('vp_current_user'); navigate('/login'); }} style={{ background: '#111', border: '1px solid #374151', color: '#f1f1f1', padding: '7px 16px', borderRadius: '0', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
                </div>
            </nav>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ marginBottom: '28px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>Investment Banking Intelligence</p>
                    <h1 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: '400', color: '#f1f1f1' }}>
                        Portfolio &amp; Deal <span style={{ color: '#1d4ed8', fontStyle: 'italic' }}>Tracker</span>
                    </h1>
                    <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: '300' }}>
                        Your private investment analytics — {user?.firmName || 'Your Firm'} · Updated live
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['portfolio', 'pipeline', 'analytics'].map(t => (
                            <button key={t} className={`tab2${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)} style={{ color: activeTab === t ? 'white' : '#888' }}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <StatCard label="AUM Deployed" value="₹116Cr" sub="Across 5 companies" color="#1d4ed8" icon="💼" />
                    <StatCard label="Portfolio Value" value="₹534Cr" sub="↑ 360% TVPI" color="#00c805" icon="📈" />
                    <StatCard label="Avg IRR" value="35.4%" sub="Since inception" color="#ff6600" icon="🎯" />
                    <StatCard label="Deals in Pipeline" value="4" sub="₹67Cr potential" color="#a78bfa" icon="🔄" />
                    <StatCard label="Capital Returned" value="₹85Cr" sub="3 exits/distributions" color="#ffaa00" icon="💰" />
                </div>

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                    <div>
                        <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '500', color: '#f1f1f1' }}>Portfolio Companies</h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>5 active investments · IRR and MOIC tracked in real-time</p>
                                </div>
                                <button style={{ background: '#1d4ed8', color: '#f1f1f1', border: 'none', borderRadius: '0', padding: '10px 20px', fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>+ Add Investment</button>
                            </div>

                            {/* Table Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 90px 80px 80px 90px', gap: '12px', padding: '0 0 10px', borderBottom: '2px solid #111111', marginBottom: '4px' }}>
                                {['Company', 'Sector', 'Stage', 'Invested', 'Valuation', 'IRR', 'MOIC', 'Status'].map(h => (
                                    <p key={h} style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</p>
                                ))}
                            </div>

                            {portfolioCompanies.map(co => (
                                <div key={co.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 90px 90px 80px 80px 90px', gap: '12px', padding: '16px 0', borderBottom: '1px solid #000000', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1' }}>{co.name}</p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif' }}>Since {co.date}</p>
                                    </div>
                                    <span style={{ fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#1d4ed8', fontWeight: '600', background: '#1a3a5c15', padding: '3px 8px', borderRadius: '0' }}>{co.sector}</span>
                                    <span style={{ fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#a78bfa', fontWeight: '600', background: '#7b5ea715', padding: '3px 8px', borderRadius: '0' }}>{co.stage}</span>
                                    <span style={{ fontSize: '14px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1', fontWeight: '500' }}>₹{co.invested}Cr</span>
                                    <span style={{ fontSize: '14px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1', fontWeight: '500' }}>₹{co.valuation}Cr</span>
                                    <span style={{ fontSize: '14px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#00c805', fontWeight: '700' }}>{co.irr}%</span>
                                    <span style={{ fontSize: '14px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#ff6600', fontWeight: '700' }}>{co.moic}×</span>
                                    <span style={{ fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif', color: statusColor(co.status), fontWeight: '700', background: statusColor(co.status) + '15', padding: '3px 8px', borderRadius: '0' }}>{co.status}</span>
                                </div>
                            ))}
                        </div>

                        {/* Sector Allocation + Capital Deployed */}
                        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
                            <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>Sector Allocation</h3>
                                <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>% of total capital deployed</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={sectorAllocation} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                            {sectorAllocation.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={v => `${v}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                                    {sectorAllocation.map(s => (
                                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                                            <span style={{ fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#6b7280' }}>{s.name} {s.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>Capital Deployed &amp; Returned</h3>
                                <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>Quarterly cash flow · ₹ Crores</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={capitalDeployed} barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
                                        <XAxis dataKey="q" tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={tip} />
                                        <Bar dataKey="deployed" name="Deployed" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="returned" name="Returned" fill="#00c805" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pipeline Tab */}
                {activeTab === 'pipeline' && (
                    <div>
                        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                            Drag deals through stages · AI match scores shown
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {Object.entries(pipeline).map(([stage, deals]) => (
                                <div key={stage}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stageColors[stage] }} />
                                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', fontFamily: '"IBM Plex Sans", sans-serif', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage}</p>
                                        <span style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif', color: '#374151', fontWeight: '600' }}>{deals.length}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {deals.map(d => (
                                            <div key={d.name} style={{ background: '#111111', borderRadius: '0', padding: '16px', border: '1px solid #1f2937', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'grab', transition: 'box-shadow 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>
                                                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1' }}>{d.name}</p>
                                                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>{d.sector} · {d.ask}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ height: '4px', flex: 1, backgroundColor: '#111111', borderRadius: '0', overflow: 'hidden', marginRight: '8px' }}>
                                                        <div style={{ width: `${d.match}%`, height: '100%', backgroundColor: stageColors[stage], borderRadius: '0' }} />
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', fontFamily: '"IBM Plex Sans", sans-serif', color: stageColors[stage] }}>{d.match}%</span>
                                                </div>
                                                <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#ccc', fontFamily: '"IBM Plex Sans", sans-serif' }}>AI Match Score</p>
                                            </div>
                                        ))}
                                        <div style={{ border: '2px dashed #e8e8e0', borderRadius: '0', padding: '16px', textAlign: 'center', cursor: 'pointer', color: '#ccc', fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                                            + Add deal
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>Portfolio Value Growth</h3>
                                <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>Aggregate portfolio valuation · ₹ Crores</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={[
                                        { q: 'Q2 \'23', value: 25 }, { q: 'Q3 \'23', value: 38 }, { q: 'Q4 \'23', value: 62 },
                                        { q: 'Q1 \'24', value: 95 }, { q: 'Q2 \'24', value: 210 }, { q: 'Q3 \'24', value: 310 },
                                        { q: 'Q4 \'24', value: 420 }, { q: 'Q1 \'25', value: 534 },
                                    ]}>
                                        <defs>
                                            <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" />
                                        <XAxis dataKey="q" tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={v => `₹${v}Cr`} />
                                        <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="#1d4ed8" strokeWidth={2.5} fill="url(#vg)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>Company IRR Comparison</h3>
                                <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>Annual IRR% per portfolio company</p>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={portfolioCompanies.map(c => ({ name: c.name.split(' ')[0], irr: c.irr }))}>
                                        <defs>
                                            <linearGradient id="irrg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ff6600" />
                                                <stop offset="100%" stopColor="#ffaa00" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#000000" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fontFamily: '"IBM Plex Sans", sans-serif', fill: '#aaa' }} axisLine={false} tickLine={false} unit="%" />
                                        <Tooltip formatter={v => `${v}%`} />
                                        <Bar dataKey="irr" name="IRR" fill="url(#irrg)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div style={{ background: '#111111', borderRadius: '0', padding: '28px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>Personal Performance Analytics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                {[
                                    { label: 'Deals Closed This Year', value: '3', sub: '↑ from 2 last year', color: '#1d4ed8' },
                                    { label: 'Avg Ticket Size', value: '₹23Cr', sub: 'Series A focus', color: '#ff6600' },
                                    { label: 'Deal Conversion Rate', value: '38%', sub: 'Industry avg: 24%', color: '#00c805' },
                                    { label: 'Time to Close (avg)', value: '4.2 mo', sub: '↓ 0.8 mo vs 2023', color: '#a78bfa' },
                                ].map(m => (
                                    <div key={m.label} style={{ padding: '20px', backgroundColor: '#000000', borderRadius: '0' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '700', color: '#374151', fontFamily: '"IBM Plex Sans", sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                                        <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '400', color: '#f1f1f1', fontFamily: '"IBM Plex Mono", monospace' }}>{m.value}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: m.color, fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: '600' }}>{m.sub}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
