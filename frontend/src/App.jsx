// import { Navigate, Routes, Route } from 'react-router-dom'
// import './App.css'
// import { LandingPage } from './Components/landingPage'
// import { AllStartups } from "./Components/allStartups"
// import { HomePage } from './Components/WayWire'
// import { Login } from './Components/Auth/Login'
// import { Register } from './Components/Auth/Register'
// import { StartupDashboard } from './Components/dashboards/StartupDashboard'
// import { BankerDashboard } from './Components/dashboards/BankerDashboard'

// // ─── Protected Route Helper ──────────────────────────────────────────────────
// function ProtectedRoute({ children, requiredType }) {
//   try {
//     const user = JSON.parse(localStorage.getItem('vp_current_user'));
//     if (!user) return <Navigate to="/login" replace />;
//     if (requiredType && user.userType !== requiredType) {
//       // Redirect to the correct dashboard
//       return <Navigate to={user.userType === 'startup' ? '/startup-dashboard' : '/banker-dashboard'} replace />;
//     }
//     return children;
//   } catch {
//     return <Navigate to="/login" replace />;
//   }
// }

// function App() {
//   return (
//     <Routes>
//       {/* Public */}
//       <Route path="/" element={<LandingPage />} />
//       <Route path="/companies" element={<AllStartups />} />
//       <Route path="/startup-detail" element={<HomePage />} />

//       {/* Auth */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       {/* Protected Dashboards */}
//       <Route
//         path="/startup-dashboard"
//         element={
//           <ProtectedRoute requiredType="startup">
//             <StartupDashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/banker-dashboard"
//         element={
//           <ProtectedRoute requiredType="investment_banker">
//             <BankerDashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* Fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App


///


import { Navigate, Routes, Route } from 'react-router-dom';
import './App.css';
import { LandingPage } from './Components/landingPage';
import { AllStartups } from './Components/allStartups';
import { StartupDetailPage } from './Components/Startupdetailpage';
import { Login } from './Components/Auth/Login';
import { Register } from './Components/Auth/Register';
import { StartupDashboard } from './Components/dashboards/StartupDashboard';
import { BankerDashboard } from './Components/dashboards/BankerDashboard';
import { PredictiveInsights } from './Components/PredictiveInsights';
import { FinancialUpload } from './Components/FinancialUpload';
import { InvestmentTracker } from './Components/InvestmentTracker';
import { DueDiligencePipeline } from './Components/DueDiligencePipeline';

// ── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, requiredType }) {
  try {
    const user = JSON.parse(localStorage.getItem('vp_current_user'));
    if (!user) return <Navigate to="/login" replace />;
    if (requiredType && user.userType !== requiredType) {
      return <Navigate to={user.userType === 'startup' ? '/startup-dashboard' : '/banker-dashboard'} replace />;
    }
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/companies" element={<AllStartups />} />
      <Route path="/startup-detail" element={<StartupDetailPage />} />
      <Route path="/insights" element={<PredictiveInsights />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected dashboards */}
      <Route
        path="/startup-dashboard"
        element={
          <ProtectedRoute requiredType="startup">
            <StartupDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banker-dashboard"
        element={
          <ProtectedRoute requiredType="investment_banker">
            <BankerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected feature pages */}
      <Route
        path="/startup-financials"
        element={
          <ProtectedRoute requiredType="startup">
            <FinancialUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banker-investments"
        element={
          <ProtectedRoute requiredType="investment_banker">
            <InvestmentTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/banker-due-diligence"
        element={
          <ProtectedRoute requiredType="investment_banker">
            <DueDiligencePipeline />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
