import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'agent') navigate('/agent');
      else navigate('/customer');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to login. Check credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMockSeed = async (type) => {
    // Quick dev helper to fill in credentials
    if(type === 'admin') { setEmail('admin@rd.com'); setPassword('password123'); }
    if(type === 'agent') { setEmail('robert@rd.com'); setPassword('password123'); }
    if(type === 'customer') { setEmail('michael@dundermifflin.com'); setPassword('password123'); }
  }

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel fade-in">
        <div className="text-center mb-4">
          <h2 className="fw-bold gradient-text mb-1">RD Collection</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold">Email Address</label>
            <input 
              type="email" 
              className="form-control p-2 bg-light border-0" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold">Password</label>
            <input 
              type="password" 
              className="form-control p-2 bg-light border-0" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary-custom w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Sign In'}
          </button>
        </form>
        
      </div>
    </div>
  );
};


export default Login;
