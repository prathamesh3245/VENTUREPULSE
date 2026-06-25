



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

/* ── Reusable Field ─────────────────────────────────────────────────────── */
function Field({ label, name, type = "text", value, onChange, placeholder, hint, required = true }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", marginBottom: 5, fontSize: 11, fontWeight: 700,
        fontFamily: '"IBM Plex Sans", sans-serif', color: "#666",
        letterSpacing: "0.07em", textTransform: "uppercase",
      }}>
        {label}{required && <span style={{ color: "#ff6600", marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 13px", boxSizing: "border-box",
          border: `1px solid ${focused ? '#ff6600' : '#1f2937'}`,
          borderRadius: 9, fontSize: 14, fontFamily: '"IBM Plex Sans", sans-serif',
          background: "#0a0a0a", outline: "none", color: "#f1f1f1",
          transition: "border-color 0.2s",
        }}
      />
      {hint && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aaa", fontFamily: '"IBM Plex Sans", sans-serif' }}>{hint}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", marginBottom: 5, fontSize: 11, fontWeight: 700,
        fontFamily: '"IBM Plex Sans", sans-serif', color: "#666",
        letterSpacing: "0.07em", textTransform: "uppercase",
      }}>
        {label} <span style={{ color: "#ff6600" }}>*</span>
      </label>
      <select name={name} value={value} onChange={onChange} required style={{
        width: "100%", padding: "11px 13px", boxSizing: "border-box",
        border: "1.5px solid #e0e0d8", borderRadius: 9, fontSize: 14,
        fontFamily: '"IBM Plex Sans", sans-serif', background: "#0a0a0a",
        outline: "none", color: "#f1f1f1", appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "22px 0 16px" }}>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
      <span style={{
        fontSize: 10, fontWeight: 700, color: "#bbb",
        fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: "0.1em", textTransform: "uppercase",
      }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "#eee" }} />
    </div>
  );
}

/* ── Main Register Component ────────────────────────────────────────────── */
export function Register() {
  const [step, setStep] = useState(1);       // 1 = pick role, 2 = fill form
  const [userType, setUserType] = useState("startup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [startupData, setStartupData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", companyName: "", startupUniqueId: "",
    sector: "", stage: "", city: "", website: "", foundedYear: "", teamSize: "",
  });

  const [bankerData, setBankerData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", firmName: "", sebiRegistrationNumber: "",
    sebiCategory: "", aumRange: "", city: "", linkedIn: "", yearsExperience: "",
  });

  const fd = userType === "startup" ? startupData : bankerData;
  const setFd = userType === "startup"
    ? (e) => setStartupData(p => ({ ...p, [e.target.name]: e.target.value }))
    : (e) => setBankerData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (fd.password !== fd.confirmPassword) return setError("Passwords do not match.");
    if (fd.password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    setTimeout(() => {
      const payload = { ...fd, userType };
      delete payload.confirmPassword;
      const result = register(payload);
      setLoading(false);
      if (result.success) {
        navigate(userType === "startup" ? "/startup-dashboard" : "/banker-dashboard");
      } else {
        setError(result.error);
      }
    }, 600);
  };

  const sectors = [{ value: "", label: "Select sector…" },
  ...["Fintech", "HealthTech", "EdTech", "AgriTech", "SaaS", "News & Media", "E-Commerce", "CleanTech", "DeepTech", "Consumer", "Logistics", "Games", "Other"]
    .map(s => ({ value: s, label: s }))];
  const stages = [{ value: "", label: "Select stage…" },
  ...["Ideation", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth"].map(s => ({ value: s, label: s }))];
  const sebiCats = [{ value: "", label: "Select SEBI category…" },
  ...["Category I - Merchant Banker", "Category II - Merchant Banker", "Category III - Merchant Banker",
    "Investment Adviser (IA)", "Portfolio Manager", "Research Analyst", "AIF Manager"].map(s => ({ value: s, label: s }))];
  const aumRanges = [{ value: "", label: "Select AUM range…" },
  ...["< ₹10 Cr", "₹10–50 Cr", "₹50–200 Cr", "₹200–500 Cr", "₹500–1,000 Cr", "₹1,000 Cr+"].map(s => ({ value: s, label: s }))];

  /* ── STEP 1: Role Selection ────────────────────────────────────────────── */
  if (step === 1) {
    return (
      <div style={{
        minHeight: "100vh", background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px", fontFamily: '"IBM Plex Mono", monospace',
      }}>
        <Link to="/" style={{ position: "fixed", top: 24, left: 32, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13, color: "#555", textDecoration: "none" }}>← VenturePulse</Link>

        <div style={{ width: "100%", maxWidth: 620, textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 400, color: "#f1f1f1", margin: "0 0 10px" }}>
            Create your account
          </h1>
          <p style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 15, color: "#888", margin: "0 0 44px" }}>
            Who are you joining as?
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>
            {[
              { key: "startup", icon: "🚀", title: "Startup Founder", desc: "Raise capital, connect with bankers, showcase your company to investors.", badge: "DIPP / Startup India ID required", color: "#ff6600" },
              { key: "investment_banker", icon: "🏦", title: "Investment Banker", desc: "Discover deal flow, manage pipeline, access financial analytics.", badge: "SEBI Registration Number required", color: "#1d4ed8" },
            ].map(role => (
              <button key={role.key} type="button"
                onClick={() => { setUserType(role.key); setStep(2); }}
                style={{
                  background: "#111111", border: "2px solid #e8e8e0", borderRadius: 16,
                  padding: "30px 22px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s", boxShadow: "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = role.color; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e8e0"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 34, marginBottom: 12 }}>{role.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 500, color: "#f1f1f1", margin: "0 0 8px", fontFamily: '"IBM Plex Mono", monospace' }}>{role.title}</h3>
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px", fontFamily: '"IBM Plex Sans", sans-serif', lineHeight: 1.6 }}>{role.desc}</p>
                <span style={{
                  display: "inline-block", fontSize: 11, fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 700,
                  color: role.color, background: role.color + "14", padding: "4px 10px", borderRadius: 20,
                }}>{role.badge}</span>
              </button>
            ))}
          </div>

          <p style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 14, color: "#888" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#f1f1f1", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── STEP 2: Form ──────────────────────────────────────────────────────── */
  const isStartup = userType === "startup";
  return (
    <div style={{ minHeight: "100vh", background: "#000000", padding: "40px 20px", fontFamily: '"IBM Plex Mono", monospace' }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Back */}
        <button onClick={() => setStep(1)} style={{
          background: "none", border: "none", fontFamily: '"IBM Plex Sans", sans-serif',
          fontSize: 13, color: "#777", cursor: "pointer", marginBottom: 22, padding: 0,
        }}>← Back</button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <span style={{ fontSize: 30 }}>{isStartup ? "🚀" : "🏦"}</span>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 400, color: "#f1f1f1", margin: "0 0 4px" }}>
              {isStartup ? "Register as Startup" : "Register as Investment Banker"}
            </h1>
            <p style={{ margin: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13, color: "#999" }}>
              {isStartup ? "DIPP / Startup India ID required" : "SEBI Registration Number required"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          background: "#111111", borderRadius: 16, padding: "36px",
          boxShadow: "0 2px 24px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fcc", color: "#c33",
              padding: "11px 14px", borderRadius: 0, marginBottom: 22,
              fontSize: 13, fontFamily: '"IBM Plex Sans", sans-serif',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <SectionLabel>Personal Info</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Full Name" name="name" value={fd.name} onChange={setFd} placeholder="Your full name" />
              <Field label="Phone" name="phone" type="tel" value={fd.phone} onChange={setFd} placeholder="+91 98765 43210" required={false} />
            </div>
            <Field label="Email Address" name="email" type="email" value={fd.email} onChange={setFd} placeholder="you@company.com" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Password" name="password" type="password" value={fd.password} onChange={setFd} placeholder="Min. 8 characters" hint="At least 8 characters" />
              <Field label="Confirm Password" name="confirmPassword" type="password" value={fd.confirmPassword} onChange={setFd} placeholder="Repeat password" />
            </div>

            {isStartup ? (
              <>
                <SectionLabel>Startup Identity</SectionLabel>
                <Field label="Company / Startup Name" name="companyName" value={fd.companyName} onChange={setFd} placeholder="Your startup's registered name" />
                <Field label="DIPP / Startup India ID" name="startupUniqueId" value={fd.startupUniqueId} onChange={setFd}
                  placeholder="DIPP12345 or STARTUP/YYYY/ID"
                  hint="Issued by DPIIT under Startup India. Format: DIPP followed by digits." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <SelectField label="Sector" name="sector" value={fd.sector} onChange={setFd} options={sectors} />
                  <SelectField label="Stage" name="stage" value={fd.stage} onChange={setFd} options={stages} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
                  <Field label="City" name="city" value={fd.city} onChange={setFd} placeholder="Bengaluru" required={false} />
                  <Field label="Founded Year" name="foundedYear" type="number" value={fd.foundedYear} onChange={setFd} placeholder="2020" required={false} />
                  <Field label="Team Size" name="teamSize" type="number" value={fd.teamSize} onChange={setFd} placeholder="12" required={false} />
                </div>
                <Field label="Website" name="website" type="url" value={fd.website} onChange={setFd} placeholder="https://yourstartup.in" required={false} />
              </>
            ) : (
              <>
                <SectionLabel>Professional Identity</SectionLabel>
                <Field label="Firm / Bank Name" name="firmName" value={fd.firmName} onChange={setFd} placeholder="Your firm's registered name" />
                <Field label="SEBI Registration Number" name="sebiRegistrationNumber" value={fd.sebiRegistrationNumber} onChange={setFd}
                  placeholder="INM000012345"
                  hint="Format: INM (Merchant Banker) / INA (Investment Adviser) / INP (Portfolio Manager) + 9 digits" />
                <SelectField label="SEBI Registration Category" name="sebiCategory" value={fd.sebiCategory} onChange={setFd} options={sebiCats} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <SelectField label="AUM Range" name="aumRange" value={fd.aumRange} onChange={setFd} options={aumRanges} />
                  <Field label="Years of Experience" name="yearsExperience" type="number" value={fd.yearsExperience} onChange={setFd} placeholder="8" required={false} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <Field label="City" name="city" value={fd.city} onChange={setFd} placeholder="Mumbai" required={false} />
                  <Field label="LinkedIn" name="linkedIn" type="url" value={fd.linkedIn} onChange={setFd} placeholder="https://linkedin.com/in/..." required={false} />
                </div>
              </>
            )}

            {/* Disclosure */}
            <div style={{ background: "#000000", borderRadius: 0, padding: "13px 16px", margin: "8px 0 22px" }}>
              <p style={{ margin: 0, fontSize: 12, fontFamily: '"IBM Plex Sans", sans-serif', color: "#888", lineHeight: 1.7 }}>
                {isStartup
                  ? "📋 Your Startup India ID will be cross-verified with the DPIIT National Startup Registry."
                  : "📋 Your SEBI Registration Number will be verified against the SEBI intermediary database."}
              </p>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: 15,
              background: loading ? "#bbb" : "#f1f1f1",
              color: "#f1f1f1", border: "none", borderRadius: 0,
              fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: '"IBM Plex Sans", sans-serif', letterSpacing: "0.02em", transition: "background 0.2s",
            }}>
              {loading ? "Creating account…" : `Create ${isStartup ? "Startup" : "Banker"} Account`}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 22, marginBottom: 0, fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 14, color: "#888" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#f1f1f1", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

