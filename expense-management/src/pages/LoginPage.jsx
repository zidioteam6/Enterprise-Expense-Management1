import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import api from '../utils/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      console.log('Attempting login for:', email);
      const response = await api.post('/auth/login', {
        email,
        password
      });

      console.log('Login response:', response.data);
      console.log('Login response role:', response.data.role);
      console.log('Login response role type:', typeof response.data.role);

      if (response.data.message === 'Login successful') {
        // Verify all required fields are present
        const requiredFields = ['email', 'role', 'userId', 'fullName'];
        const missingFields = requiredFields.filter(field => !response.data[field]);

        if (missingFields.length > 0) {
          throw new Error(`Login response missing required fields: ${missingFields.join(', ')}`);
        }

        // Store user data
        const userData = {
          email: response.data.email,
          username: response.data.fullName,
          role: response.data.role,
          id: response.data.userId,
          fullName: response.data.fullName
        };

        console.log('Storing user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));

        // Verify the stored data
        const storedData = JSON.parse(localStorage.getItem('user'));
        console.log('Verified stored user data:', storedData);
        console.log('Stored role:', storedData.role);
        console.log('Stored role type:', typeof storedData.role);

        if (!storedData || !storedData.role) {
          throw new Error('Failed to store user data properly');
        }

        // Role-based navigation with debug logging
        console.log('Checking role for navigation:', storedData.role);
        console.log('Role comparison:', storedData.role.toUpperCase() === 'MANAGER');
        
        if (storedData.role.toUpperCase() === 'MANAGER') {
          console.log('Navigating to manager dashboard');
          navigate('/manager-dashboard');
        } else {
          console.log('Navigating to regular dashboard');
          navigate('/dashboard');
        }

      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>
        {error && (
          <div className="error-message" style={{
            color: 'red',
            marginBottom: '1rem',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <span className="icon"><User size={18} /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <span className="icon"><Lock size={18} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : (
                <>
                  Login
                  <ArrowRight style={{ marginLeft: '8px' }} size={18} />
                </>
              )}
            </button>
          </form>

          <div className="signup">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="forgot-password">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
