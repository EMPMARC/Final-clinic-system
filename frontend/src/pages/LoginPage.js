import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('staff'); // 'staff' or 'student'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password, userType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role_name || 'student');
      localStorage.setItem('userType', data.userType);
      
      // Store identifier based on user type
      if (data.userType === 'staff') {
        localStorage.setItem('staffNumber', identifier);
        // Clear student number if it exists
        localStorage.removeItem('studentNumber');
      } else {
        localStorage.setItem('studentNumber', identifier);
        // Clear staff number if it exists
        localStorage.removeItem('staffNumber');
        
        // Save onboarding and POR status to progress
        const progress = {
          onboarding: data.onboardingCompleted || false,
          proofUploaded: data.porUploaded || false,
          booking: false,
          submission: false
        };
        localStorage.setItem('patientProgress', JSON.stringify(progress));
      }

      // For students, check if they've completed onboarding
      if (data.userType === 'student') {
        if (data.onboardingCompleted) {
          // Student has completed onboarding, go to dashboard
          navigate('/patient-dashboard');
        } else {
          // Student needs to complete onboarding
          navigate('/onboarding');
        }
      } 
      // Redirect based on role for staff
      else if (data.user.role_name === 'nurse') {
        navigate('/nurse-dashboard');
      } else if (data.user.role_name === 'admin' || data.user.role_name === 'receptionist') {
        navigate('/admin-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any existing storage on component mount to prevent conflicts
  React.useEffect(() => {
    // Clear previous login data to avoid conflicts
    localStorage.removeItem('staffNumber');
    localStorage.removeItem('studentNumber');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userType');
    localStorage.removeItem('patientProgress');
  }, []);

  return (
    <div className="login-container">
      <h2 className="login-title">Wits Booking</h2>
      <img src={logo} alt="Campus Health and Wellness Centre" className="login-logo" />

      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="staff"
            checked={userType === 'staff'}
            onChange={(e) => setUserType(e.target.value)}
          />
          Staff Login
        </label>
        <label>
          <input
            type="radio"
            value="student"
            checked={userType === 'student'}
            onChange={(e) => setUserType(e.target.value)}
          />
          Student Login
        </label>
      </div>

      <form onSubmit={handleLogin}>
        <label className="login-label" htmlFor="identifier">
          {userType === 'staff' ? 'Staff Number' : 'Student Number'}
        </label>
        <input
          type="text"
          id="identifier"
          placeholder={`Enter your ${userType === 'staff' ? 'staff' : 'student'} number`}
          className="login-input"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <label className="login-label" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Your password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'LOGGING IN...' : 'LOGIN'}
        </button>
      </form>

      <button className="forgot-password">Forgot Password?</button>

      <div style={{ marginTop: 18, fontSize: 13, color: '#444' }}>
        <strong>Select forgot password to reset your login details:</strong>
        <ul style={{ marginTop: 6 }}>
          {/* Password reset instructions */}
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;