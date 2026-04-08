import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import './Auth.css'; // Reuse some base styles but override with specific ones

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: MFA
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validMFACodes = ['1001', '1002', '1003', '1004', '1005', '1006'];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const attemptLogin = async () => {
      try {
        const response = await authAPI.login({ email, password });
        const data = response.data;
        console.log('Login response:', data);

        // Check if role contains ADMIN (supporting both 'ADMIN' and 'ROLE_ADMIN')
        if (data.user.role === 'ADMIN' || data.user.role === 'ROLE_ADMIN') {
          setTempUserData({ ...data.user, token: data.token });
          setStep(2); // Move to MFA step
          setLoading(false);
        } else {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
        }
      } catch (err) {
        if (err.code === 'ERR_NETWORK') {
          setError('Server is waking up, please wait...');
          setTimeout(attemptLogin, 5000);
        } else {
          setError(err.response?.data?.message || 'Invalid admin credentials');
          setLoading(false);
        }
      }
    };

    attemptLogin();
  };

  const handleMFASubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    
    if (validMFACodes.includes(mfaCode)) {
      if (tempUserData?.token) {
        localStorage.setItem('adminToken', tempUserData.token);
      } else if (tempUserData?.id) {
        localStorage.setItem('adminToken', tempUserData.id.toString());
      }
      login(tempUserData);
      navigate('/admin');
    } else {
      setError('Invalid MFA code');
    }
  };

  return (
    <div className="auth-container admin-portal">
      <div className="auth-card animate-slide-up">
        <div className="auth-header admin-header">
          <div className="admin-icon-wrapper">
            <Shield size={48} className="admin-shield" />
            <Lock size={20} className="admin-lock" />
          </div>
          <h1>LearnHub Admin</h1>
          <p>{step === 1 ? 'Authorized Personnel Only' : 'MFA Verification'}</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Administrator Email</label>
              <div className="input-with-icon">
                <Mail size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Security Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-admin-access"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Access Admin Portal'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMFASubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="mfa">Enter 4-digit MFA Code</label>
              <div className="input-with-icon">
                <Shield size={20} />
                <input
                  id="mfa"
                  type="text"
                  maxLength="4"
                  placeholder="0000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-admin-access"
            >
              Verify & Enter
            </button>
            <button 
              type="button" 
              className="btn-back-to-login"
              onClick={() => setStep(1)}
              style={{
                marginTop: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                width: '100%'
              }}
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
      
      <style>{`
        .admin-portal {
          background: radial-gradient(circle at center, #1a1033 0%, #0f0a1e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .admin-header h1 {
          color: #a78bfa;
          margin-bottom: 0.5rem;
        }
        .admin-icon-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
          color: #7c3aed;
        }
        .admin-lock {
          position: absolute;
          bottom: 2px;
          right: -2px;
          background: #0f0a1e;
          border-radius: 50%;
          padding: 2px;
          color: #10b981;
        }
        .btn-admin-access {
          width: 100%;
          padding: 1rem;
          background: #7c3aed;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-admin-access:hover {
          background: #6d28d9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }
        .btn-admin-access:disabled {
          background: #4c1d95;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
