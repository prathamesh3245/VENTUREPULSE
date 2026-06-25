


import { Link, useNavigate } from "react-router-dom";
import frameImg from "../assets/Frame 1.png";
import { useAuth } from "../context/Authcontext.jsx";

export const NavBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navigation">
      <ul>
        <li><Link to="/">About</Link></li>
        <li><Link to="/companies">Companies</Link></li>
        <li><Link to="/insights" style={{ color: '#ff6600', fontWeight: '700', letterSpacing: '0.06em' }}>Insights</Link></li>
        <li>
          <Link to="/">
            <img src={frameImg} alt="VenturePulse" style={{ height: "50px" }} />
          </Link>
        </li>
        <li><Link>Partners</Link></li>
        <li><Link>Resources</Link></li>
        <li>
          {currentUser ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link
                to={currentUser.userType === "startup" ? "/startup-dashboard" : "/banker-dashboard"}
                style={{ fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13 }}
              >
                {currentUser.companyName || currentUser.name}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "none", border: "1px solid #ccc",
                  borderRadius: 6, padding: "3px 10px",
                  cursor: "pointer", fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: '"IBM Plex Sans", sans-serif', color: "#4b5563",
                }}
              >
                Logout
              </button>
            </span>
          ) : (
            <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                style={{
                  background: "#000000", color: "#f1f1f1",
                  padding: "5px 14px", borderRadius: 0,
                  fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Sign up
              </Link>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};
