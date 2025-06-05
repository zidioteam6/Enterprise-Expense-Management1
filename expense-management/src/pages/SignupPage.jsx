// // import React, { useState } from 'react';
// // import { Link } from 'react-router-dom';
// // import { User, Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';

// // export default function SignupPage() {
// //   const [fullName, setFullName] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [confirmPassword, setConfirmPassword] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [acceptTerms, setAcceptTerms] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     // Check if passwords match
// //     if (password !== confirmPassword) {
// //       alert("Passwords don't match!");
// //       return;
// //     }
    
// //     setIsSubmitting(true);
    
// //     // Create the user data object to send to the backend
// //     const userData = {
// //       fullName,
// //       email,
// //       password
// //     };
    
// //     try {
// //       // Send the data to your backend API
// //     const response = await fetch('http://localhost:8080/api/auth/signup', {        method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(userData)
// //       });
      
// //       const data = await response.json();
      
// //       if (response.ok) {
// //         // If signup was successful
// //         console.log('Signup successful:', data);
        
// //         // Redirect to login page or dashboard
// //         // If using React Router:
// //         // navigate('/login');
        
// //         // Or you could reload with window.location:
// //         // window.location.href = '/login';
// //       } else {
// //         // If there was an error from the server
// //         console.error('Signup failed:', data);
// //         alert(data.message || 'Signup failed. Please try again.');
// //       }
// //     } catch (error) {
// //       // If there was a network error
// //       console.error('Error during signup:', error);
// //       alert('Network error. Please check your connection and try again.');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <div className="login-container">
// //       <div className="login-card">
// //         {/* Header */}
// //         <div className="login-header">
// //           <h2>Create Account</h2>
// //           <p>Sign up to get started</p>
// //         </div>
        
// //         {/* Form */}
// //         <div className="login-form">
// //           <form onSubmit={handleSubmit}>
// //             {/* Full Name input */}
// //             <div className="form-group">
// //               <label htmlFor="fullName">Full Name</label>
// //               <div className="input-container">
// //                 <span className="icon">
// //                   <User size={18} />
// //                 </span>
// //                 <input
// //                   id="fullName"
// //                   type="text"
// //                   value={fullName}
// //                   onChange={(e) => setFullName(e.target.value)}
// //                   placeholder="John Doe"
// //                   required
// //                 />
// //               </div>
// //             </div>
            
// //             {/* Email input */}
// //             <div className="form-group">
// //               <label htmlFor="email">Email</label>
// //               <div className="input-container">
// //                 <span className="icon">
// //                   <Mail size={18} />
// //                 </span>
// //                 <input
// //                   id="email"
// //                   type="email"
// //                   value={email}
// //                   onChange={(e) => setEmail(e.target.value)}
// //                   placeholder="your@email.com"
// //                   required
// //                 />
// //               </div>
// //             </div>
            
// //             {/* Password input */}
// //             <div className="form-group">
// //               <label htmlFor="password">Password</label>
// //               <div className="input-container">
// //                 <span className="icon">
// //                   <Lock size={18} />
// //                 </span>
// //                 <input
// //                   id="password"
// //                   type={showPassword ? "text" : "password"}
// //                   value={password}
// //                   onChange={(e) => setPassword(e.target.value)}
// //                   placeholder="••••••••"
// //                   required
// //                 />
// //                 <button
// //                   type="button"
// //                   className="toggle-password"
// //                   onClick={() => setShowPassword(!showPassword)}
// //                 >
// //                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
// //                 </button>
// //               </div>
// //             </div>
            
// //             {/* Confirm Password input */}
// //             <div className="form-group">
// //               <label htmlFor="confirmPassword">Confirm Password</label>
// //               <div className="input-container">
// //                 <span className="icon">
// //                   <Lock size={18} />
// //                 </span>
// //                 <input
// //                   id="confirmPassword"
// //                   type={showConfirmPassword ? "text" : "password"}
// //                   value={confirmPassword}
// //                   onChange={(e) => setConfirmPassword(e.target.value)}
// //                   placeholder="••••••••"
// //                   required
// //                 />
// //                 <button
// //                   type="button"
// //                   className="toggle-password"
// //                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
// //                 >
// //                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
// //                 </button>
// //               </div>
// //             </div>
            
// //             {/* Terms and Conditions */}
// //             <div className="form-group">
// //               <label className="remember-me terms-checkbox">
// //                 <input 
// //                   type="checkbox" 
// //                   checked={acceptTerms}
// //                   onChange={(e) => setAcceptTerms(e.target.checked)}
// //                   required
// //                 />
// // I agree to the <Link to="/terms" className="terms-link">Terms of Service</Link> and <Link to="/privacy" className="terms-link">Privacy Policy</Link>
// //               </label>
// //             </div>
            
// //             {/* Submit button */}
// //             <button
// //               type="submit"
// //               disabled={isSubmitting || !acceptTerms}
// //               className="login-button"
// //             >
// //               {isSubmitting ? (
// //                 <>
// //                   <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
// //                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //                   </svg>
// //                   Processing...
// //                 </>
// //               ) : (
// //                 <>
// //                   Sign Up
// //                   <ArrowRight style={{ marginLeft: '8px' }} size={18} />
// //                 </>
// //               )}
// //             </button>
// //           </form>
          
// //           {/* Sign in link - Updated to use React Router */}
// //           <div className="signup">
// //             <p>
// //               Already have an account?{' '}
// //               <Link to="/login" className="forgot-password">
// //                 Sign in
// //               </Link>
// //             </p>
// //           </div>
          
// //           {/* Social login */}
// //           <div className="social-divider">
// //             <span>Or sign up with</span>
// //           </div>
          
// //           <div className="social-buttons">
// //             {['Google', 'Twitter', 'GitHub'].map((provider) => (
// //               <button
// //                 key={provider}
// //                 type="button"
// //                 className="social-button"
// //               >
// //                 {provider}
// //               </button>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { User, Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';

// export default function SignupPage() {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [acceptTerms, setAcceptTerms] = useState(false);
  
//   // New state for role selection
//   const [role, setRole] = useState('EMPLOYEE'); // default to EMPLOYEE

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Check if passwords match
//     if (password !== confirmPassword) {
//       alert("Passwords don't match!");
//       return;
//     }

//     setIsSubmitting(true);

//     // Include role in the user data
//     const userData = {
//       fullName,
//       email,
//       password,
//       role,  // send role to backend
//     };

//     try {
//       const response = await fetch('http://localhost:8080/api/auth/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         console.log('Signup successful:', data);
//         // Redirect or other actions here
//       } else {
//         console.error('Signup failed:', data);
//         alert(data.message || 'Signup failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error during signup:', error);
//       alert('Network error. Please check your connection and try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <div className="login-header">
//           <h2>Create Account</h2>
//           <p>Sign up to get started</p>
//         </div>
//         <div className="login-form">
//           <form onSubmit={handleSubmit}>
//             {/* Full Name input */}
//             <div className="form-group">
//               <label htmlFor="fullName">Full Name</label>
//               <div className="input-container">
//                 <span className="icon">
//                   <User size={18} />
//                 </span>
//                 <input
//                   id="fullName"
//                   type="text"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Email input */}
//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <div className="input-container">
//                 <span className="icon">
//                   <Mail size={18} />
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

//             {/* Role selection dropdown */}
//             <div className="form-group">
//               <label htmlFor="role">Select Role</label>
//               <select
//                 id="role"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 required
//               >
//                 <option value="EMPLOYEE">Employee</option>
//                 <option value="MANAGER">Manager</option>
//                 <option value="ADMIN">Admin</option>
//               </select>
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
//                   type={showPassword ? 'text' : 'password'}
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

//             {/* Confirm Password input */}
//             <div className="form-group">
//               <label htmlFor="confirmPassword">Confirm Password</label>
//               <div className="input-container">
//                 <span className="icon">
//                   <Lock size={18} />
//                 </span>
//                 <input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="toggle-password"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 >
//                   {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {/* Terms and Conditions */}
//             <div className="form-group">
//               <label className="remember-me terms-checkbox">
//                 <input
//                   type="checkbox"
//                   checked={acceptTerms}
//                   onChange={(e) => setAcceptTerms(e.target.checked)}
//                   required
//                 />
//                 I agree to the{' '}
//                 <Link to="/terms" className="terms-link">
//                   Terms of Service
//                 </Link>{' '}
//                 and{' '}
//                 <Link to="/privacy" className="terms-link">
//                   Privacy Policy
//                 </Link>
//               </label>
//             </div>

//             {/* Submit button */}
//             <button
//               type="submit"
//               disabled={isSubmitting || !acceptTerms}
//               className="login-button"
//             >
//               {isSubmitting ? (
//                 <>
//                   <svg
//                     className="spinner"
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                       fill="none"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   Sign Up
//                   <ArrowRight style={{ marginLeft: '8px' }} size={18} />
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Sign in link */}
//           <div className="signup">
//             <p>
//               Already have an account?{' '}
//               <Link to="/login" className="forgot-password">
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           {/* Social login */}
//           <div className="social-divider">
//             <span>Or sign up with</span>
//           </div>

//           <div className="social-buttons">
//             {['Google', 'Twitter', 'GitHub'].map((provider) => (
//               <button key={provider} type="button" className="social-button">
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
import { User, Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [role, setRole] = useState('EMPLOYEE'); // default role

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsSubmitting(true);

    const userData = { fullName, email, password, role };

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Signup successful:', data);
        alert('Signup successful! Please login.');
        navigate('/login');  // Redirect to login page after successful signup
      } else {
        console.error('Signup failed:', data);
        alert(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
      <p className="text-sm text-gray-500">Sign up to get started</p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <span className="text-gray-500 mr-2"><User size={18} /></span>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <span className="text-gray-500 mr-2"><Mail size={18} /></span>
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

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Select Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="MANAGER">Super Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
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
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
          <span className="text-gray-500 mr-2"><Lock size={18} /></span>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Terms */}
      {/* <div className="flex items-start">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          required
          className="mt-1 mr-2"
        />
        <label className="text-sm text-gray-600">
          I agree to the{' '}
          <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </label>
      </div> */}

      {/* Submit Button */}
      <button
        type="submit"
        // disabled={isSubmitting || !acceptTerms}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            Sign Up
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>

    {/* Sign In link */}
    <div className="mt-4 text-center text-sm text-gray-600">
      <p>
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </div>

    {/* Divider */}
    <div className="my-6 flex items-center">
      <div className="flex-grow h-px bg-gray-300"></div>
      <span className="mx-4 text-sm text-gray-500">Or sign up with</span>
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
