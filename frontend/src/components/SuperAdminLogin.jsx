import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/superadminlogin.css';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/superadmin/login', { email, password });
      localStorage.setItem('superadmin_token', response.data.token);
      setErrorMessage('');
      navigate('/superadmin');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-login-container">
      <div className="login-box">
        <h2>SuperAdmin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="error-message">{errorMessage}</div>
        <div className="options">
          <Link to="/">Child Login</Link>
          <Link to="/admin-login">Admin Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;