import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('vp_current_user')); } catch { return null; }
}
function logout(navigate) {
  localStorage.removeItem('vp_current_user');
  navigate('/login');
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#ff6600', icon }) {
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
          fontSize: '14px', width: '52px', height: '52px',
          backgroundColor: color + '15',
          borderRadius: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Tag ────────────────────────────────────────────────────────────────────
function Tag({ children, color = '#ff6600' }) {
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

// ─── Activity Row ────────────────────────────────────────────────────────────
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

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export function StartupDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u || u.userType !== 'startup') navigate('/login');
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
    name: user.name || 'Founder',
    company: user.companyName || 'Your Startup',
    sector: user.sector || 'Tech',
    stage: user.stage || 'Seed',
    city: user.city || 'India',
    dippId: user.startupUniqueId || '—',
    email: user.email,
  };

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
            background: '#111', border: '1px solid #374151',
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
            }}>
              {greeting()},
            </p>
            <h1 style={{
              margin: '0 0 10px', fontSize: '15px', fontWeight: '400',
              color: '#f1f1f1', lineHeight: '1.1',
            }}>
              {profile.name} <span style={{ fontStyle: 'italic', color: '#6b7280' }}>👋</span>
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Tag color="#ff6600">{profile.company}</Tag>
              <Tag color="#1d4ed8">{profile.sector}</Tag>
              <Tag color="#00c805">{profile.stage}</Tag>
              <Tag color="#a78bfa">{profile.city}</Tag>
            </div>
          </div>

          {/* Profile Badge */}
          <div style={{
            backgroundColor: '#111111', borderRadius: '0',
            padding: '20px 24px', border: '1px solid #1f2937',
            boxShadow: 'none',
            minWidth: '220px', textAlign: 'right',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '0',
              backgroundColor: '#ff6600', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '15px', marginLeft: 'auto',
              marginBottom: '10px',
            }}>🚀</div>
            <p style={{
              margin: '0 0 4px', fontSize: '15px', fontWeight: '500',
              color: '#f1f1f1', fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{profile.company}</p>
            <p style={{
              margin: '0 0 8px', fontSize: '12px', color: '#4b5563',
              fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{profile.email}</p>
            <div style={{
              fontSize: '11px', fontFamily: '"IBM Plex Sans", sans-serif',
              color: '#6b7280', backgroundColor: '#000000',
              padding: '4px 8px', borderRadius: '0', display: 'inline-block',
            }}>
              DIPP ID: {profile.dippId}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px', marginBottom: '32px',
        }}>
          <StatCard label="Banker Views" value="24" sub="Last 30 days" color="#ff6600" icon="👁️" />
          <StatCard label="Connection Requests" value="7" sub="3 pending" color="#1d4ed8" icon="🤝" />
          <StatCard label="Profile Strength" value="78%" sub="Add financials to boost" color="#00c805" icon="⚡" />
          <StatCard label="Funding Target" value={`₹${user.fundingTarget || '—'}`} sub={profile.stage} color="#a78bfa" icon="🎯" />
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

          {/* Left – Company Profile Card */}
          <div>
            <div style={{
              backgroundColor: '#111111', borderRadius: '0',
              padding: '30px', border: '1px solid #1f2937',
              boxShadow: 'none',
              marginBottom: '24px',
            }}>
              <h2 style={{
                margin: '0 0 20px', fontSize: '14px', fontWeight: '500',
                color: '#f1f1f1',
              }}>
                Company Profile
              </h2>

              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                {[
                  { label: 'Company', value: profile.company },
                  { label: 'Sector', value: profile.sector },
                  { label: 'Stage', value: profile.stage },
                  { label: 'City / HQ', value: profile.city || '—' },
                  { label: 'Founded', value: user.foundedYear || '—' },
                  { label: 'Team Size', value: user.teamSize ? `${user.teamSize} people` : '—' },
                  { label: 'Website', value: user.website || '—' },
                  { label: 'DIPP ID', value: profile.dippId },
                ].map(row => (
                  <div key={row.label}>
                    <p style={{
                      margin: '0 0 2px', fontSize: '11px', fontWeight: '600',
                      fontFamily: '"IBM Plex Sans", sans-serif', color: '#374151',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>{row.label}</p>
                    <p style={{
                      margin: 0, fontSize: '15px', color: '#f1f1f1',
                      fontFamily: '"IBM Plex Sans", sans-serif',
                    }}>{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Completion bar */}
              <div style={{ marginTop: '28px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <span style={{
                    fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif',
                    color: '#6b7280',
                  }}>Profile completion</span>
                  <span style={{
                    fontSize: '12px', fontFamily: '"IBM Plex Sans", sans-serif',
                    color: '#f1f1f1', fontWeight: '600',
                  }}>78%</span>
                </div>
                <div style={{
                  height: '6px', backgroundColor: '#111111', borderRadius: '0', overflow: 'hidden',
                }}>
                  <div style={{
                    width: '78%', height: '100%', backgroundColor: '#ff6600', borderRadius: '0',
                  }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            }}>
              {[
                { icon: '✏️', label: 'Edit Profile', desc: 'Update company details', path: null },
                { icon: '📊', label: 'Upload Financials', desc: 'Get AI predictions & investor scores', path: '/startup-financials' },
                { icon: '🌐', label: 'Market Insights', desc: 'Crunchbase-style analytics', path: '/insights' },
                { icon: '🔍', label: 'Find Bankers', desc: 'Browse investment bankers', path: '/companies' },
              ].map(action => (
                action.path ? (
                  <Link key={action.label} to={action.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      backgroundColor: '#111111', border: '1px solid #1f2937',
                      borderRadius: '0', padding: '18px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: 'none',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ fontSize: '15px', marginBottom: '8px' }}>{action.icon}</div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600', fontFamily: '"IBM Plex Sans", sans-serif', color: '#f1f1f1' }}>{action.label}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#4b5563', fontFamily: '"IBM Plex Sans", sans-serif' }}>{action.desc}</p>
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
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
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
            {/* Recent Activity */}
            <div style={{
              backgroundColor: '#111111', borderRadius: '0',
              padding: '24px', border: '1px solid #1f2937',
              boxShadow: 'none',
              marginBottom: '16px',
            }}>
              <h3 style={{
                margin: '0 0 4px', fontSize: '17px', fontWeight: '500',
                color: '#f1f1f1',
              }}>Recent Activity</h3>
              <p style={{
                margin: '0 0 16px', fontSize: '12px', color: '#4b5563',
                fontFamily: '"IBM Plex Sans", sans-serif',
              }}>Latest events on your profile</p>

              <ActivityRow icon="👁️" text="Kotak Investment Banking viewed your profile" time="2 hours ago" />
              <ActivityRow icon="📩" text="New connection request from Axis Capital" time="Yesterday" />
              <ActivityRow icon="✅" text="DIPP ID verified successfully" time="2 days ago" />
              <ActivityRow icon="🔔" text="Profile listed in Fintech directory" time="3 days ago" />
            </div>

            {/* Tip Card */}
            <div style={{
              backgroundColor: '#ff6600', borderRadius: '0',
              padding: '24px', color: '#f1f1f1',
            }}>
              <p style={{
                margin: '0 0 8px', fontSize: '12px', fontWeight: '600',
                fontFamily: '"IBM Plex Sans", sans-serif', opacity: 0.8,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>💡 Pro Tip</p>
              <p style={{
                margin: '0 0 12px', fontSize: '15px', lineHeight: '1.5',
                fontWeight: '400',
              }}>
                Startups with uploaded financial data receive 3× more banker inquiries.
              </p>
              <Link to="/startup-financials" style={{
                backgroundColor: '#111111', color: '#ff6600',
                border: 'none', borderRadius: '0',
                padding: '9px 18px', fontSize: '13px',
                fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: '600',
                cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
              }}>
                Upload Financials →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
