import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('vp_current_user')); } catch { return null; }
}
function logout(navigate) {
  localStorage.removeItem('vp_current_user');
  navigate('/login');
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#1d4ed8', icon }) {
  return (
    <div style={{
      backgroundColor: '#111111', borderRadius: '0',
      padding: '24px', border: '1px solid #1f2937',
      boxShadow: 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            margin: '0 0 8px', fontSize: '12px', fontWeight: '600',
            fontFamily: '"IBM Plex Sans", sans-serif', color: '#4b5563',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>{label}</p>
          <p style={{
            margin: '0 0 4px', fontSize: '14px', fontWeight: '500',
            fontFamily: '"IBM Plex Mono", monospace', color: '#f1f1f1',
          }}>{value}</p>
          {sub && <p style={{
            margin: 0, fontSize: '12px',
            fontFamily: '"IBM Plex Sans", sans-serif', color: '#4b5563',
          }}>{sub}</p>}
        </div>
        <div style={{
          fontSize: '16px', width: '50px', height: '50px',
          backgroundColor: color + '15',
          borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Tag ─────────────────────────────────────────────────────────────────────
function Tag({ children, color = '#1d4ed8' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px',
      backgroundColor: color + '18', color: color,
      borderRadius: '0', fontSize: '11px',
      fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: '600',
      letterSpacing: '0.04em',
    }}>{children}</span>
  );
}

// ─── Deal Row ─────────────────────────────────────────────────────────────────
function DealRow({ name, sector, stage, ask, match }) {
  const matchColor = match > 85 ? '#00c805' : match > 70 ? '#ff6600' : '#aaa';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px 0', borderBottom: '1px solid #1a1a1a',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '0',
        backgroundColor: '#000000', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
      }}>🚀</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 4px', fontSize: '14px', fontWeight: '500',
          fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{name}</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Tag color="#1d4ed8">{sector}</Tag>
          <Tag color="#a78bfa">{stage}</Tag>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          margin: '0 0 4px', fontSize: '14px', fontWeight: '500',
          fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1',
        }}>{ask}</p>
        <span style={{
          fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif',
          fontWeight: '600', color: matchColor,
        }}>
          {match}% match
        </span>
      </div>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ icon, text, time }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      padding: '14px 0', borderBottom: '1px solid #1a1a1a',
    }}>
      <div style={{
        width: '36px', height: '36px', backgroundColor: '#000000',
        borderRadius: '0', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '16px', flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: '0 0 2px', fontSize: '14px', color: '#f1f1f1',
          fontFamily: '"IBM Plex Sans", sans-serif',
        }}>{text}</p>
        <p style={{
          margin: 0, fontSize: '12px', color: '#4b5563',
          fontFamily: '"IBM Plex Sans", sans-serif',
        }}>{time}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BankerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.userType !== 'investment_banker') navigate('/login');
    else setUser(u);
  }, [navigate]);

  if (!user) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const profile = {
    name: user.name || 'Banker',
    firm: user.firmName || 'Your Firm',
    sebi: user.sebiRegistrationNumber || '—',
    category: user.sebiCategory || 'Investment Banker',
    aum: user.aumRange || '—',
    city: user.city || 'India',
    experience: user.yearsExperience ? `${user.yearsExperience} yrs` : '—',
    email: user.email,
  };

  const mockDeals = [
    { name: 'FinEdge Technologies', sector: 'Fintech', stage: 'Series A', ask: '₹25 Cr', match: 92 },
    { name: 'AgriSense India', sector: 'AgriTech', stage: 'Seed', ask: '₹8 Cr', match: 84 },
    { name: 'HealthBridge', sector: 'HealthTech', stage: 'Series B', ask: '₹60 Cr', match: 77 },
    { name: 'LogiFlow Systems', sector: 'Logistics', stage: 'Series A', ask: '₹18 Cr', match: 71 },
  ];

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000000',
      fontFamily: '"IBM Plex Mono", monospace',
    }}>
      {/* Top Nav */}
      <nav style={{
        backgroundColor: '#000000', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '48px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{
          color: '#f1f1f1', fontSize: '14px', fontWeight: '500',
          fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '-0.01em',
        }}>
          VenturePulse
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/companies" style={{
            color: '#6b7280', fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '13px', textDecoration: 'none',
          }}>
            Browse Startups
          </Link>
          <Link to="/insights" style={{
            color: '#ff6600', fontFamily: '"IBM Plex Sans", sans-serif',
            fontSize: '13px', textDecoration: 'none', fontWeight: '600',
          }}>
            📊 Market Insights
          </Link>
          <button onClick={() => logout(navigate)} style={{
            background: 'none', border: '1px solid #374151',
            color: '#f1f1f1', padding: '7px 16px', borderRadius: '0',
            fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px',
            cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Greeting Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: '36px',
        }}>
          <div>
            <p style={{
              margin: '0 0 6px', fontFamily: '"IBM Plex Sans", sans-serif',
              fontSize: '14px', color: '#4b5563', fontWeight: '300',
            }}>{greeting()},</p>
            <h1 style={{
              margin: '0 0 10px', fontSize: '15px', fontWeight: '400',
              color: '#f1f1f1', lineHeight: '1.1',
            }}>
              {profile.name} 💼
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag color="#1d4ed8">{profile.firm}</Tag>
              <Tag color="#a78bfa">SEBI Registered</Tag>
              <Tag color="#00c805">{profile.city}</Tag>
            </div>
          </div>

          {/* SEBI Badge */}
          <div style={{
            backgroundColor: '#0d1a33', borderRadius: '0',
            padding: '20px 24px', minWidth: '220px', textAlign: 'right',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '0',
              backgroundColor: 'rgba(255,255,255,0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '15px',
              marginLeft: 'auto', marginBottom: '10px',
            }}>🏦</div>
            <p style={{
              margin: '0 0 4px', fontSize: '15px', fontWeight: '500',
              color: '#f1f1f1', fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{profile.firm}</p>
            <p style={{
              margin: '0 0 8px', fontSize: '12px', color: '#6b7280',
              fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{profile.email}</p>
            <div style={{
              fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif',
              color: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.06)',
              padding: '4px 8px', borderRadius: '0', display: 'inline-block',
            }}>
              SEBI: {profile.sebi}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px', marginBottom: '32px',
        }}>
          <StatCard label="Active Deals" value="12" sub="4 in due diligence" color="#1d4ed8" icon="📋" />
          <StatCard label="Startups Reviewed" value="89" sub="This month" color="#ff6600" icon="🔍" />
          <StatCard label="Deals Closed" value="₹420 Cr" sub="FY 2024–25" color="#00c805" icon="💰" />
          <StatCard label="AUM Managed" value={profile.aum} sub="Under management" color="#a78bfa" icon="📈" />
        </div>

        {/* Two Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Left */}
          <div>
            {/* Deal Flow */}
            <div style={{
              backgroundColor: '#111111', borderRadius: '0',
              padding: '28px', border: '1px solid #1f2937',
              boxShadow: 'none',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '500', color: '#f1f1f1' }}>
                    Recommended Deal Flow
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>
                    AI-matched startups based on your mandate
                  </p>
                </div>
                <Link to="/companies" style={{
                  fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px',
                  color: '#ff6600', textDecoration: 'none', fontWeight: '600',
                }}>View all →</Link>
              </div>

              {mockDeals.map(deal => (
                <DealRow key={deal.name} {...deal} />
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { icon: '🔍', label: 'Browse Startups', desc: 'Filter by sector, stage, city', path: '/companies' },
                { icon: '💼', label: 'My Investments', desc: 'Portfolio, IRR & deal tracker', path: '/banker-investments' },
                { icon: '🌐', label: 'Market Insights', desc: 'Crunchbase-style analytics', path: '/insights' },
                { icon: '⚡', label: 'Due Diligence', desc: 'AI audit pipeline · EU AI Act ready', path: '/banker-due-diligence', highlight: true },
                { icon: '📋', label: 'Deal Rooms', desc: 'Manage active conversations', path: null },
                { icon: '⚙️', label: 'Mandate Settings', desc: 'Update investment criteria', path: null },
              ].map(action => (
                action.path ? (
                  <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      backgroundColor: action.highlight ? '#0d0800' : '#0a0a0a',
                      border: action.highlight ? '1px solid rgba(232,99,42,0.3)' : '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '0', padding: '18px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: action.highlight ? '0 4px 20px rgba(232,99,42,0.15)' : '0 1px 6px rgba(0,0,0,0.03)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ fontSize: '15px', marginBottom: '8px' }}>{action.icon}</div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif', color: action.highlight ? '#ff6600' : '#f1f1f1' }}>{action.label}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: action.highlight ? '#6b7280' : '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>{action.desc}</p>
                    </div>
                  </Link>
                ) : (
                  <button key={action.label} style={{
                    backgroundColor: '#111111', border: '1px solid #1f2937',
                    borderRadius: '0', padding: '18px',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: 'none',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ fontSize: '15px', marginBottom: '8px' }}>{action.icon}</div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1' }}>{action.label}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>{action.desc}</p>
                  </button>
                )
              ))}
            </div>

          </div>

          {/* Right Sidebar */}
          <div>
            {/* Profile Summary */}
            <div style={{
              backgroundColor: '#111111', borderRadius: '0',
              padding: '24px', border: '1px solid #1f2937',
              boxShadow: 'none',
              marginBottom: '16px',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>
                Your Profile
              </h3>
              {[
                { label: 'Firm', value: profile.firm },
                { label: 'SEBI No.', value: profile.sebi },
                { label: 'Category', value: profile.category },
                { label: 'AUM', value: profile.aum },
                { label: 'Experience', value: profile.experience },
                { label: 'Location', value: profile.city },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid #000000',
                }}>
                  <span style={{
                    fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif',
                    color: '#4b5563', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{row.label}</span>
                  <span style={{
                    fontSize: '13px', fontFamily: '"IBM Plex Sans", sans-serif',
                    color: '#f1f1f1', fontWeight: '500', textAlign: 'right',
                    maxWidth: '140px',
                  }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Activity Feed */}
            <div style={{
              backgroundColor: '#111111', borderRadius: '0',
              padding: '24px', border: '1px solid #1f2937',
              boxShadow: 'none',
            }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '500', color: '#f1f1f1' }}>
                Activity
              </h3>
              <p style={{
                margin: '0 0 16px', fontSize: '12px', color: '#4b5563',
                fontFamily: '"IBM Plex Sans", sans-serif',
              }}>Recent platform events</p>
              <ActivityRow icon="📋" text="FinEdge Technologies sent pitch deck" time="1 hour ago" />
              <ActivityRow icon="🔔" text="3 new Fintech startups matched your mandate" time="4 hours ago" />
              <ActivityRow icon="✅" text="SEBI registration verified" time="2 days ago" />
              <ActivityRow icon="📩" text="Startup Inbox: 7 unread messages" time="3 days ago" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
