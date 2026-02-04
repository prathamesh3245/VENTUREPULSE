import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, requiredUserType }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(254, 251, 245)'
      }}>
        <div style={{
          fontSize: '18px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgb(254, 251, 245)',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontFamily: 'Poppins, sans-serif',
          color: '#c33'
        }}>
          Access Denied
        </h2>
        <p style={{
          fontSize: '16px',
          fontFamily: 'Poppins, sans-serif',
          color: '#666'
        }}>
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return children;
}
