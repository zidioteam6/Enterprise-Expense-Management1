import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
<<<<<<< HEAD
  const navigate = useNavigate();
=======

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
<<<<<<< HEAD
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify({
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role
        }));
        // Save email separately for easy access
        localStorage.setItem('userEmail', data.email);
        
        alert('Login successful!');
        navigate('/dashboard'); // Redirect to dashboard page
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again later.');
=======
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to login. Please try again.');
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
<<<<<<< HEAD
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
=======
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
<<<<<<< HEAD
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
=======
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa
            </div>
          </div>

          <div>
            <button
              type="submit"
<<<<<<< HEAD
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
=======
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa
            </button>
          </div>
        </form>

<<<<<<< HEAD
        {/* Signup Link */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
          </p>
        </div>

        {/* Social Login Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="mx-4 text-sm text-gray-500">Or login with</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center space-x-4">
          {['Google', 'Twitter', 'GitHub'].map((provider) => (
            <button
              key={provider}
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              {provider}
            </button>
          ))}
=======
        {/* Sign up link */}
        <div className="signup">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="forgot-password">
              Sign up
            </Link>
          </p>
>>>>>>> e3e293b72ba17ab639399dd936ee056b8401a7aa
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
