// AdminLogin.js: Component for admin user login
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // For navigation and linking
import axios from 'axios'; // For making HTTP requests to the backend
import '../styles/adminlogin.css'; // Styles for the admin login UI

const AdminLogin = () => {
  // State to store email input
  const [email, setEmail] = useState('');
  // State to store password input
  const [password, setPassword] = useState('');
  // State to display error messages
  const [errorMessage, setErrorMessage] = useState('');
  // State to track loading state during login
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:3000/admin/login', { email, password });
      // Store token and adminId in local storage
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_id', response.data.adminId);
      navigate('/admin'); // Redirect to admin dashboard
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-box">
        <h2>Admin Login</h2>
        {/* Login form */}
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
        {/* Error message display */}
        <div className="error-message">{errorMessage}</div>
        {/* Links to other login pages */}
        <div className="options">
          <Link to="/">Child Login</Link>
          <Link to="/superadmin-login">SuperAdmin Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;