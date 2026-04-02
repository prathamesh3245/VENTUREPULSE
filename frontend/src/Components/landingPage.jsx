import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NavBar } from "./navBar";
import { Heading } from "./heading";
import { Scrolling } from "./newScroll";

const s2 = { fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px', color: '#6b7280' };
const s3 = { fontFamily: '"IBM Plex Sans", sans-serif' };

function SectionHeading({ subtitle, title, centered = true }) {
    return (
        <div style={{ textAlign: centered ? 'center' : 'left', marginBottom: '28px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#ff6600', letterSpacing: '0.15em', textTransform: 'uppercase', ...s3 }}>{subtitle}</p>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '400', color: '#f1f1f1', fontFamily: '"IBM Plex Mono", monospace', lineHeight: 1.1 }}>{title}</h2>
        </div>
    );
}

export function LandingPage() {

    return (
        <>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .reveal { animation: fadeInUp 0.8s ease forwards; }
                .pillar:hover { border-color: #ff6600 !important; background: #0d0800 !important; transform: none !important; box-shadow: none !important; }
                .footer-link { color: #374151; text-decoration: none; transition: color 0.2s; font-size: 14px; margin-bottom: 8px; display: block; }
                .footer-link:hover { color: #ff6600; }
            `}</style>

            <div className="box" style={{ background: '#000000', minHeight: '100vh' }}>
                <div id="blackstrip" style={{ position: 'fixed', top: 0, width: '100%', height: '4px', backgroundColor: '#000000', zIndex: 1000 }}></div>

                <div style={{ padding: '20px 0' }}>
                    <NavBar />
                </div>

                <section style={{ padding: '60px 0 20px' }}>
                    <Heading />
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <Scrolling />
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" style={{ maxWidth: '1100px', margin: '0 auto 140px', padding: '0 24px' }}>
                    <SectionHeading subtitle="The Process" title={<>Built for <i style={{ color: '#1d4ed8' }}>Velocity</i> &amp; Certainty</>} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px' }}>
                        {[
                            { step: '01', title: 'Data Ingestion', desc: 'Securely link MCA, EPFO, GST, and bank statements via our Sovereign Data Enclave.', icon: '🔗' },
                            { step: '02', title: 'ML Verification', desc: 'Deterministic XGBoost models audit every metric for accuracy and regulatory compliance.', icon: '🧠' },
                            { step: '03', title: 'Invest with Confidence', desc: 'Execute deals backed by an immutable audit trail and real-time predictive insights.', icon: '🎯' },
                        ].map((s, i) => (
                            <div key={i} className="reveal" style={{ animationDelay: `${i * 0.2}s` }}>
                                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{s.icon}</div>
                                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#ff6600', fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: '0.1em' }}>STEP {s.step}</p>
                                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '500', color: '#f1f1f1' }}>{s.title}</h3>
                                <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', lineHeight: 1.6, fontWeight: '300', ...s3 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FEATURE PILLARS */}
                <section id="features" style={{ backgroundColor: '#000000', padding: '60px 0', marginBottom: '40px' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: '700', color: '#ff6600', letterSpacing: '0.15em', textTransform: 'uppercase', ...s3 }}>Product Suite</p>
                            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '400', color: '#f1f1f1', fontFamily: '"IBM Plex Mono", monospace' }}>Engineered for <i style={{ color: '#ff6600' }}>Formidable</i> Decisions</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {[
                                { title: 'Predictive Insights', desc: 'Crunchbase-style analytics covering real-time funding trends, sector heatmaps, and success probability scaling.', color: '#ff6600', icon: '🌐', path: '/insights' },
                                { title: 'Due Diligence Pipeline', desc: 'Agentic audit terminal with LinkedIn enrichment, MCA/GST verification, and Basel III compliance mapping.', color: '#1d4ed8', icon: '⚡', path: '/banker-due-diligence' },
                                { title: 'Investment Tracker', desc: 'Private portfolio management with real-time IRR/MOIC tracking and automated capital call alerts.', color: '#a78bfa', icon: '💼', path: '/banker-investments' },
                                { title: 'Founder Terminal', desc: 'Financial health dashboards for startups with burn-rate forecasting and investor-readiness scoring.', color: '#00c805', icon: '🏗️', path: '/startup-financials' },
                            ].map((p, i) => (
                                <Link key={i} to={p.path} style={{ textDecoration: 'none' }}>
                                    <div className="pillar" style={{
                                        backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid #1f2937',
                                        padding: '40px', borderRadius: '0', transition: 'all 0.3s'
                                    }}>
                                        <div style={{ fontSize: '32px', marginBottom: '24px', width: '60px', height: '48px', background: p.color + '15', borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.icon}</div>
                                        <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: '#ff6600', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' }}>{p.title}</h3>
                                        <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#374151', lineHeight: 1.6, fontWeight: '300', ...s3 }}>{p.desc}</p>
                                        <span style={{ color: p.color, fontSize: '13px', fontWeight: '600', ...s3 }}>Explore Module →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* STATS BAR */}
                <section style={{ maxWidth: '1100px', margin: '0 auto 140px', padding: '0 24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
                        {[
                            { val: '₹2,840Cr', label: 'Assets Verified' },
                            { val: '320+', label: 'Registered Bankers' },
                            { val: '1,400+', label: 'Verified Startups' },
                            { val: '94.2%', label: 'ML Accuracy' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '400', color: '#f1f1f1', fontFamily: '"IBM Plex Mono", monospace' }}>{stat.val}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', ...s3 }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
                <footer style={{ backgroundColor: '#111111', padding: '48px 0 32px', borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '700', color: '#ff6600', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.05em' }}>VenturePulse</h1>
                                <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', lineHeight: 1.7, maxWidth: '300px', fontWeight: '300', ...s3 }}>
                                    The definitive operating system for investment bankers and formidable founders. Turning raw data into investment-grade certainty.
                                </p>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#f1f1f1', letterSpacing: '0.1em', ...s3 }}>Platform</h4>
                                <Link to="/insights" className="footer-link" style={s3}>Predictive Insights</Link>
                                <Link to="/banker-due-diligence" className="footer-link" style={s3}>Due Diligence</Link>
                                <Link to="/banker-investments" className="footer-link" style={s3}>Investment Tracker</Link>
                                <Link to="/companies" className="footer-link" style={s3}>Browse Companies</Link>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#f1f1f1', letterSpacing: '0.1em', ...s3 }}>Company</h4>
                                <a href="#" className="footer-link" style={s3}>About Us</a>
                                <a href="#" className="footer-link" style={s3}>Pricing</a>
                                <a href="#" className="footer-link" style={s3}>Institutional</a>
                                <a href="#" className="footer-link" style={s3}>Contact</a>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 24px', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#f1f1f1', letterSpacing: '0.1em', ...s3 }}>Legal</h4>
                                <a href="#" className="footer-link" style={s3}>Privacy Policy</a>
                                <a href="#" className="footer-link" style={s3}>Terms of Service</a>
                                <a href="#" className="footer-link" style={s3}>Security</a>
                                <a href="#" className="footer-link" style={s3}>Compliance</a>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#374151', ...s3 }}>© 2026 VenturePulse Inc. All rights reserved.</p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {['Twitter', 'LinkedIn', 'Crunchbase'].map(social => (
                                    <a key={social} href="#" style={{ color: '#374151', textDecoration: 'none', fontSize: '13px', ...s3 }}>{social}</a>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );

}
