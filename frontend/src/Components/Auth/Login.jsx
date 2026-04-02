// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// // ─── Minimal Auth Utility (localStorage-based, no backend needed for demo) ───
// function getUsers() {
//   try { return JSON.parse(localStorage.getItem('vp_users') || '[]'); } catch { return []; }
// }

// function saveUsers(users) {
//   localStorage.setItem('vp_users', JSON.stringify(users));
// }
// function setCurrentUser(user) {
//   localStorage.setItem('vp_current_user', JSON.stringify(user));
// }

// export function Login() {
//   const [userType, setUserType] = useState('startup');
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     setTimeout(() => {
//       const users = getUsers();
//       const user = users.find(
//         (u) => u.email === formData.email && u.password === formData.password && u.userType === userType
//       );

//       if (user) {
//         setCurrentUser(user);
//         navigate(userType === 'startup' ? '/startup-dashboard' : '/banker-dashboard');
//       } else {
//         setError('Invalid credentials or account type. Please check and try again.');
//       }
//       setLoading(false);
//     }, 600);
//   };

//   const roleConfig = {
//     startup: {
//       label: 'Startup',
//       icon: '🚀',
//       accent: '#ff6600',
//       tagline: 'Access your funding dashboard',
//     },
//     investment_banker: {
//       label: 'Investment Banker',
//       icon: '🏦',
//       accent: '#1d4ed8',
//       tagline: 'Access deal flow & analytics',
//     },
//   };

//   const current = roleConfig[userType];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       backgroundColor: '#000000',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '40px 20px',
//       fontFamily: '"IBM Plex Mono", monospace',
//     }}>
//       {/* Back link */}
//       <Link to="/" style={{
//         position: 'fixed', top: '24px', left: '32px',
//         fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px',
//         color: '#9ca3af', textDecoration: 'none', display: 'flex',
//         alignItems: 'center', gap: '6px', letterSpacing: '0.02em',
//       }}>
//         ← VenturePulse
//       </Link>

//       <div style={{ width: '100%', maxWidth: '480px' }}>
//         {/* Header */}
//         <div style={{ textAlign: 'center', marginBottom: '40px' }}>
//           <div style={{ fontSize: '40px', marginBottom: '12px' }}>{current.icon}</div>
//           <h1 style={{
//             fontSize: '38px', fontWeight: '400', lineHeight: '1.15',
//             color: '#f1f1f1', margin: '0 0 8px',
//           }}>
//             Welcome back
//           </h1>
//           <p style={{
//             fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '15px',
//             color: '#777', margin: 0, fontWeight: '300',
//           }}>
//             {current.tagline}
//           </p>
//         </div>

//         {/* Role Toggle */}
//         <div style={{
//           display: 'flex', backgroundColor: '#e8e8e0',
//           borderRadius: '0', padding: '4px', marginBottom: '32px',
//         }}>
//           {Object.entries(roleConfig).map(([key, cfg]) => (
//             <button
//               key={key} type="button"
//               onClick={() => { setUserType(key); setError(''); }}
//               style={{
//                 flex: 1, padding: '10px 12px',
//                 backgroundColor: userType === key ? 'white' : 'transparent',
//                 border: 'none', borderRadius: '0',
//                 fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '13px',
//                 fontWeight: userType === key ? '600' : '400',
//                 color: userType === key ? '#f1f1f1' : '#888',
//                 cursor: 'pointer',
//                 boxShadow: userType === key ? 'none' : 'none',
//                 transition: 'all 0.2s ease',
//               }}
//             >
//               {cfg.icon} {cfg.label}
//             </button>
//           ))}
//         </div>

//         {/* Form Card */}
//         <div style={{
//           backgroundColor: '#111111', borderRadius: '0',
//           padding: '40px', boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
//           border: '1px solid #1f2937',
//         }}>
//           {error && (
//             <div style={{
//               backgroundColor: '#fff5f5', border: '1px solid #fcc',
//               color: '#c33', padding: '12px 16px', borderRadius: '0',
//               marginBottom: '24px', fontSize: '13px',
//               fontFamily: '"IBM Plex Sans", sans-serif',
//             }}>
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <Field label="Email Address" type="email" name="email"
//               value={formData.email} onChange={handleChange} placeholder="you@company.com" />

//             <Field label="Password" type="password" name="password"
//               value={formData.password} onChange={handleChange} placeholder="Your password" />

//             <button type="submit" disabled={loading} style={{
//               width: '100%', padding: '14px',
//               backgroundColor: loading ? '#ccc' : '#f1f1f1',
//               color: '#f1f1f1', border: 'none', borderRadius: '0',
//               fontSize: '15px', fontWeight: '500',
//               fontFamily: '"IBM Plex Sans", sans-serif',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               marginTop: '8px',
//               transition: 'background 0.2s ease',
//               letterSpacing: '0.02em',
//             }}>
//               {loading ? 'Signing in…' : `Sign in as ${current.label}`}
//             </button>
//           </form>

//           <div style={{
//             marginTop: '28px', textAlign: 'center',
//             fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '14px', color: '#6b7280',
//           }}>
//             Don't have an account?{' '}
//             <Link to="/register" style={{ color: '#f1f1f1', fontWeight: '600', textDecoration: 'none' }}>
//               Create account
//             </Link>
//           </div>
//         </div>

//         {/* Subtle footnote */}
//         <p style={{
//           textAlign: 'center', marginTop: '24px',
//           fontFamily: '"IBM Plex Sans", sans-serif', fontSize: '12px',
//           color: '#4b5563', lineHeight: '1.6',
//         }}>
//           Your credentials are verified against SEBI / DIPP records.
//         </p>
//       </div>
//     </div>
//   );
// }

// function Field({ label, type, name, value, onChange, placeholder }) {
//   return (
//     <div style={{ marginBottom: '22px' }}>
//       <label style={{
//         display: 'block', marginBottom: '6px',
//         fontSize: '13px', fontWeight: '500',
//         fontFamily: '"IBM Plex Sans", sans-serif', color: '#9ca3af',
//         letterSpacing: '0.03em',
//       }}>
//         {label}
//       </label>
//       <input
//         type={type} name={name} value={value}
//         onChange={onChange} required placeholder={placeholder}
//         style={{
//           width: '100%', padding: '13px 14px',
//           border: '1px solid #1f2937', borderRadius: '0',
//           fontSize: '15px', fontFamily: '"IBM Plex Sans", sans-serif',
//           boxSizing: 'border-box', backgroundColor: '#0a0a0a',
//           outline: 'none', color: '#f1f1f1',
//           transition: 'border-color 0.2s',
//         }}
//         onFocus={(e) => e.target.style.borderColor = '#f1f1f1'}
//         onBlur={(e) => e.target.style.borderColor = '#e0e0d8'}
//       />
//     </div>
//   );
// }



//                






import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

function Field({ label, type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
        fontFamily: '"IBM Plex Sans", sans-serif', color: "#666",
        letterSpacing: "0.07em", textTransform: "uppercase",
      }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} required placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "12px 14px", boxSizing: "border-box",
          border: `1px solid ${focused ? '#ff6600' : '#1f2937'}`,
          borderRadius: 9, fontSize: 14, fontFamily: '"IBM Plex Sans", sans-serif',
          background: "#0a0a0a", outline: "none", color: "#f1f1f1",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

export function Login() {
  const [userType, setUserType] = useState("startup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password, userType);
      setLoading(false);
      if (result.success) {
        navigate(userType === "startup" ? "/startup-dashboard" : "/banker-dashboard");
      } else {
        setError(result.error);
      }
    }, 500);
  };

  const roles = {
    startup: { icon: "🚀", label: "Startup", tagline: "Access your funding dashboard" },
    investment_banker: { icon: "🏦", label: "Investment Banker", tagline: "Access deal flow & analytics" },
  };
  const cur = roles[userType];

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#000000",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", fontFamily: '"IBM Plex Mono", monospace',
    }}>
      <Link to="/" style={{
        position: "fixed", top: 24, left: 32,
        fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13,
        color: "#4b5563", textDecoration: "none",
      }}>← VenturePulse</Link>

      <div style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>{cur.icon}</div>
          <h1 style={{ fontSize: 36, fontWeight: 400, color: "#f1f1f1", margin: "0 0 8px", lineHeight: 1.15 }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 14, color: "#888", margin: 0 }}>
            {cur.tagline}
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: "flex", backgroundColor: "#111", borderRadius: 0, padding: 4, marginBottom: 28 }}>
          {Object.entries(roles).map(([key, r]) => (
            <button key={key} type="button"
              onClick={() => { setUserType(key); setError(""); }}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 0, border: "none",
                background: userType === key ? "#1a1a1a" : "transparent",
                fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13,
                fontWeight: userType === key ? 700 : 400,
                color: userType === key ? "#ff6600" : "#4b5563",
                cursor: "pointer",
                boxShadow: userType === key ? "none" : "none",
                transition: "all 0.2s",
              }}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "#111111", borderRadius: 16, padding: "36px 36px 28px",
          boxShadow: "none", border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {error && (
            <div style={{
              background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.25)", color: "#ff3b3b",
              padding: "11px 14px", borderRadius: 0, marginBottom: 22,
              fontSize: 13, fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="Email Address" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            <Field label="Password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Your password" />

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", marginTop: 4,
              background: loading ? '#333' : '#ff6600',
              color: "#f1f1f1", border: "none", borderRadius: 0,
              fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: "0.02em",
              transition: "background 0.2s",
            }}>
              {loading ? "Signing in…" : `Sign in as ${cur.label}`}
            </button>
          </form>

          <p style={{
            textAlign: "center", marginTop: 24, marginBottom: 0,
            fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 14, color: "#888",
          }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#f1f1f1", fontWeight: 700, textDecoration: "none" }}>
              Create account
            </Link>
          </p>
        </div>

        <p style={{
          textAlign: "center", marginTop: 18,
          fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 12, color: "#bbb",
        }}>
          Credentials verified against SEBI / DIPP records
        </p>
      </div>
    </div>
  );
}

