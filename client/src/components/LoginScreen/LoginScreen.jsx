import React, { useState, useEffect } from 'react';
import './LoginScreen.css';
import robotImage from '../../assets/robot.png'; // Make sure this image exists in this path
import { FaLock, FaBolt, FaWifi } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [ERROR_MESSAGE, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation effect when component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleJoinChat = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !accessCode.trim()) {
      setError('Please enter both username and access code');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Store user info in localStorage or state management
    localStorage.setItem('chatUser', JSON.stringify({
      username: username.trim(),
      roomCode: accessCode.trim()
    }));
    
    // Navigate to the chat dashboard
    navigate('/chat');
  };

  const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById('accessCode');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  };

  return (
    <div className="login-container">
      {/* Left side - Robot Image */}
      <div className="image-container">
        <img src={robotImage} alt="AI Robot" className="robot-image" />
      </div>

      {/* Right side - Login Form */}
      <div className={`form-container ${isVisible ? 'visible' : ''}`}>
        <div className="login-card">
          <div className="login-header">
            <h1>Hello !</h1>
            <h2>Welcome Back</h2>
          </div>

          {/* Form submission */}
          <form onSubmit={handleJoinChat}>
            <div className="input-group">
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <span className="input-icon">👤</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                id="accessCode"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
              <span className="input-icon password-toggle" onClick={togglePasswordVisibility}>
                👁️
              </span>
            </div>

            <div className="forgot-password">
              <span>Recover Access Code?</span>
            </div>

            <button type="submit" className="login-button">
              Join Chat
            </button>
          </form>

          <div className="or-continue">
            <span>Or continue with</span>
          </div>

          <div className="project-features">
            <div className="feature">
              <div className="feature-icon">
                <FaLock />
              </div>
              <span>Secure LAN</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaBolt />
              </div>
              <span>Fast Messaging</span>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FaWifi />
              </div>
              <span>Offline Access</span>
            </div>
          </div>

          <div className="signup-link">
            <span>Don't have an account? </span>
            <a href="#">Create Account!</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;