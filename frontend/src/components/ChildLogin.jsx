// ChildLogin.js: Component for child user login with name and 6-digit code
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // For navigation and linking
import axios from 'axios'; // For making HTTP requests to the backend
import characterImg from '../assets/trail2.png'; // Character image for login UI
import '../styles/childstyles.css'; // Styles for the child login UI

const ChildLogin = () => {
  // State to store the child's name
  const [childName, setChildName] = useState('');
  // State to store the 6-digit code
  const [digits, setDigits] = useState(Array(6).fill(''));
  // State to display error messages
  const [errorMessage, setErrorMessage] = useState('');
  // State to track loading state during login
  const [loading, setLoading] = useState(false);
  // Ref to manage input focus for digit boxes
  const inputRefs = useRef([]);
  const navigate = useNavigate(); // Hook for navigation

  // Handle digit input changes
  const handleDigitChange = (value, index) => {
    if (!/^\d?$/.test(value)) return; // Allow only single digits
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits); // Update digit array
    if (value && index < 5) inputRefs.current[index + 1].focus(); // Move to next input
  };

  // Handle keydown events (Backspace and Enter)
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus(); // Move to previous input on backspace
    }
    if (e.key === 'Enter') validateLogin(); // Trigger login on Enter
  };

  // Validate and process login
  const validateLogin = async () => {
    const userId = digits.join(''); // Combine digits into userId
    if (!childName || userId.length !== 6) {
      setErrorMessage('Please enter your name and 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      // Send login request to backend
      const response = await axios.post('http://localhost:3000/child/login', {
        childName,
        userId,
        password: userId, // Password is same as userId
      });
      // Store token and userId in local storage
      localStorage.setItem('child_token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      navigate('/game'); // Redirect to game page
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Invalid credentials!');
    } finally {
      setLoading(false);
    }
  };

  // Focus on the first digit input on component mount
  useEffect(() => {
    inputRefs.current[0].focus();
  }, []);

  return (
    <div className="login-body">
      <div className="container">
        <div className="login-box">
          {/* Character image for visual appeal */}
          <img src={characterImg} alt="Character" className="character" />
          <h2>LOGIN</h2>
          {/* Child name input */}
          <input
            type="text"
            placeholder="Your Name"
            className="input-box"
            value={childName}
            onChange={e => setChildName(e.target.value)}
          />
          {/* Digit input boxes */}
          <div className="digit-boxes">
            {digits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="digit-box"
                value={digit}
                ref={el => (inputRefs.current[index] = el)}
                onChange={e => handleDigitChange(e.target.value, index)}
                onKeyDown={e => handleKeyDown(e, index)}
              />
            ))}
          </div>
          {/* Error message display */}
          <div className="error-message">{errorMessage}</div>
          {/* Login button */}
          <button className="login-btn" onClick={validateLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Join the Fun!'}
          </button>
          {/* Additional options */}
          <div className="options">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#">Forgot your password?</a>
          </div>
        </div>
        {/* Links to other login pages */}
        <Link to="/admin-login" className="admin-btn">Admin Login</Link>
        <Link to="/superadmin-login" className="superadmin-btn">SuperAdmin Login</Link>
      </div>
    </div>
  );
};

export default ChildLogin;