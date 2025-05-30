import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt with:', { email, password });
      setIsSubmitting(false);
      // Reset form or redirect user after successful login
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue</p>
        </div>
        
        {/* Form */}
        <div className="login-form">
          <form onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <span className="icon">
                  <User size={18} />
                </span>
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
            
            {/* Password input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <span className="icon">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Forgot password & Remember me */}
            <div className="form-footer">
              <label className="remember-me">
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>
            
            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-button"
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ marginLeft: '8px' }} size={18} />
                </>
              )}
            </button>
          </form>
          
          {/* Sign up link - Updated to use React Router */}
          <div className="signup">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="forgot-password">
                Sign up
              </Link>
            </p>
          </div>
          
          {/* Social login */}
          <div className="social-divider">
            <span>Or continue with</span>
          </div>
          
          <div className="social-buttons">
            {['Google', 'Twitter', 'GitHub'].map((provider) => (
              <button
                key={provider}
                type="button"
                className="social-button"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}