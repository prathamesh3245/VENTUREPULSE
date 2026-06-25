           






import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

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

