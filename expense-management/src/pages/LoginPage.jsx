// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

// import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const navigate = useNavigate();


//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
    
//     // Simulate API call
//     setTimeout(() => {
//       console.log('Login attempt with:', { email, password });
//       setIsSubmitting(false);
//       // Reset form or redirect user after successful login
//       // Redirect user to dashboard after successful login
//     navigate('/dashboard');
//     }, 1500);
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         {/* Header */}
//         <div className="login-header">
//           <h2>Welcome Back</h2>
//           <p>Sign in to continue</p>
//         </div>
        
//         {/* Form */}
//         <div className="login-form">
//           <form onSubmit={handleSubmit}>
//             {/* Email input */}
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <div className="input-container">
//                 <span className="icon">
//                   <User size={18} />
//                 </span>
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>
//             </div>
            
//             {/* Password input */}
//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <div className="input-container">
//                 <span className="icon">
//                   <Lock size={18} />
//                 </span>
//                 <input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="toggle-password"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>
            
//             {/* Forgot password & Remember me */}
//             <div className="form-footer">
//               <label className="remember-me">
//                 <input type="checkbox" />
//                 Remember me
//               </label>
//               <a href="#" className="forgot-password">
//                 Forgot password?
//               </a>
//             </div>
            
//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="login-button"
//             >
//               {isSubmitting ? (
//                 <>
//                   <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   Sign In
//                   <ArrowRight style={{ marginLeft: '8px' }} size={18} />
//                 </>
//               )}
//             </button>
//           </form>
          
//           {/* Sign up link - Updated to use React Router */}
//           <div className="signup">
//             <p>
//               Don't have an account?{' '}
//               <Link to="/signup" className="forgot-password">
//                 Sign up
//               </Link>
//             </p>
//           </div>
          
//           {/* Social login */}
//           <div className="social-divider">
//             <span>Or continue with</span>
//           </div>
          
//           <div className="social-buttons">
//             {['Google', 'Twitter', 'GitHub'].map((provider) => (
//               <button
//                 key={provider}
//                 type="button"
//                 className="social-button"
//               >
//                 {provider}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token or user info - adjust key name if needed
        localStorage.setItem('token', data.token);

        alert('Login successful!');
        navigate('/dashboard'); // Redirect to dashboard page
      } else {
        alert(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Login</h2>
      <p className="text-sm text-gray-500">Welcome back! Please login to your account.</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <span className="text-gray-500 mr-2"><User size={18} /></span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <span className="text-gray-500 mr-2"><Lock size={18} /></span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        {isSubmitting ? 'Logging in...' : (
          <>
            Login
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>

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
    </div>
  </div>
</div>

  );
}
