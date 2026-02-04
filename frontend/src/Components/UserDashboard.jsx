import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgb(254, 251, 245)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          paddingBottom: '20px',
          borderBottom: '2px solid #ddd'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '600'
          }}>
            Welcome, {user?.name}!
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '20px'
          }}>
            Account Information
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong style={{ fontFamily: 'Poppins, sans-serif' }}>Email:</strong>
              <p style={{ fontFamily: 'Poppins, sans-serif', marginTop: '5px' }}>{user?.email}</p>
            </div>
            <div>
              <strong style={{ fontFamily: 'Poppins, sans-serif' }}>User Type:</strong>
              <p style={{ fontFamily: 'Poppins, sans-serif', marginTop: '5px' }}>
                {user?.userType === 'investment_banker' ? 'Investment Banker' : 'Startup'}
              </p>
            </div>
            {user?.companyName && (
              <div>
                <strong style={{ fontFamily: 'Poppins, sans-serif' }}>Company:</strong>
                <p style={{ fontFamily: 'Poppins, sans-serif', marginTop: '5px' }}>{user?.companyName}</p>
              </div>
            )}
            {user?.sebiRegistrationNumber && (
              <div>
                <strong style={{ fontFamily: 'Poppins, sans-serif' }}>SEBI Registration:</strong>
                <p style={{ fontFamily: 'Poppins, sans-serif', marginTop: '5px' }}>
                  {user?.sebiRegistrationNumber}
                </p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: user?.sebiVerified ? '#d4edda' : '#fff3cd',
                  color: user?.sebiVerified ? '#155724' : '#856404',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {user?.sebiVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            )}
            {user?.startupUniqueId && (
              <div>
                <strong style={{ fontFamily: 'Poppins, sans-serif' }}>Startup ID:</strong>
                <p style={{ fontFamily: 'Poppins, sans-serif', marginTop: '5px' }}>
                  {user?.startupUniqueId}
                </p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: user?.startupVerified ? '#d4edda' : '#fff3cd',
                  color: user?.startupVerified ? '#155724' : '#856404',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {user?.startupVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Notice */}
        {((user?.userType === 'investment_banker' && !user?.sebiVerified) ||
          (user?.userType === 'startup' && !user?.startupVerified)) && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontFamily: 'Poppins, sans-serif',
              marginBottom: '10px',
              color: '#856404'
            }}>
              Verification Pending
            </h3>
            <p style={{
              fontSize: '14px',
              fontFamily: 'Poppins, sans-serif',
              color: '#856404'
            }}>
              {user?.userType === 'investment_banker'
                ? 'Your SEBI registration is pending verification. Some features may be limited until verification is complete.'
                : 'Your Startup ID is pending verification against the Indian government platform. Some features may be limited until verification is complete.'}
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '20px'
          }}>
            Dashboard
          </h2>
          <p style={{
            fontSize: '16px',
            fontFamily: 'Poppins, sans-serif',
            color: '#666'
          }}>
            Your personalized dashboard content will appear here. This is where you can access
            {user?.userType === 'investment_banker'
              ? ' startup listings, investment opportunities, and analytics.'
              : ' your startup profile, funding opportunities, and investor connections.'}
          </p>
        </div>
      </div>
    </div>
  );
}
