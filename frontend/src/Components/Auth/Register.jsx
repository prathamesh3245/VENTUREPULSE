import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const [userType, setUserType] = useState('startup'); // 'startup' or 'investment_banker'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
    phone: '',
    sebiRegistrationNumber: '',
    startupUniqueId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerInvestmentBanker, registerStartup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let result;
    if (userType === 'investment_banker') {
      const { startupUniqueId, ...bankerData } = formData;
      result = await registerInvestmentBanker(bankerData);
    } else {
      const { sebiRegistrationNumber, ...startupData } = formData;
      result = await registerStartup(startupData);
    }

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgb(254, 251, 245)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '28px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Register for VenturePulse
        </h2>

        {/* User Type Selection */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            type="button"
            onClick={() => setUserType('startup')}
            style={{
              padding: '10px 20px',
              backgroundColor: userType === 'startup' ? '#2563eb' : '#e5e7eb',
              color: userType === 'startup' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '500'
            }}
          >
            Startup
          </button>
          <button
            type="button"
            onClick={() => setUserType('investment_banker')}
            style={{
              padding: '10px 20px',
              backgroundColor: userType === 'investment_banker' ? '#2563eb' : '#e5e7eb',
              color: userType === 'investment_banker' ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '500'
            }}
          >
            Investment Banker
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '5px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {userType === 'investment_banker' ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif'
              }}>
                SEBI Registration Number * (Format: IN-SEBI-XXXXX)
              </label>
              <input
                type="text"
                name="sebiRegistrationNumber"
                value={formData.sebiRegistrationNumber}
                onChange={handleChange}
                required
                placeholder="IN-SEBI-12345"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{
                color: '#666',
                fontSize: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Your SEBI registration will be verified after registration.
              </small>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Startup Unique ID * (Format: DIPP/STARTUP/XXXXXX)
              </label>
              <input
                type="text"
                name="startupUniqueId"
                value={formData.startupUniqueId}
                onChange={handleChange}
                required
                placeholder="DIPP/STARTUP/123456"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
              <small style={{
                color: '#666',
                fontSize: '12px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Your Startup ID will be verified against Indian government platform after registration.
              </small>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              marginTop: '10px'
            }}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Already have an account?{' '}
          <a
            href="/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
