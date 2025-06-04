

// import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import './App.css';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import Dashboard from './components/Dashboard';
// import FileUpload from './components/FileUpload';

// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
          
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch('http://localhost:8080/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       if (response.ok) {
//         // Login success
//         navigate('/dashboard');  // Redirect to dashboard
//       } else {
//         const data = await response.json();
//         setError(data.message || 'Login failed');
//       }
//     } catch (err) {
//       setError('Network error. Try again.');
//     }
//   };

//   return (
//     <form onSubmit={handleLogin}>
//       {/* Your email and password inputs here */}
//       <input
//         type="email"
//         value={email}
//         onChange={e => setEmail(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={e => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit">Login</button>
//       {error && <p style={{color: 'red'}}>{error}</p>}
//     </form>
//   );
// }
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import './App.css';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import Dashboard from './components/Dashboard';
// import FileUpload from './components/FileUpload';

// function App() {
//   return (
//     <div className="App">
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignupPage />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {/* Uncomment below route when needed */}
//         {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
//         <Route path="*" element={<Navigate to="/LoginPage" replace />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// >>>>>>> e1a00d8a70fad4c869259187f9fccf4367e41eeb
// import './App.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './components/Dashboard';
// <<<<<<< HEAD
// // import FileUpload from './components/FileUpload';
import ExpenseResult from './components/ExpenseResult';
// // import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'; // ✅ Correct import
// import Error from './components/Error';
import EmployeeExpense from './components/EmployeeExpense';

// function App() {

//   const router = createBrowserRouter([
//   {
//     path: '/expenseResult',
//     element: <ExpenseResult/>,
//     errorElement: <Error/>
//   },
  
// ])

  // return (
  //   <Router>
  //     <div className="App">
  //       <Routes>
  //         <Route path="/login" element={<LoginPage />} />
  //         <Route path="/signup" element={<SignupPage />} />
  //         <Route path="/dashboard" element={<Dashboard />} />
  //         <Route path="/expenseResult" element={<ExpenseResult />} />
  //         <Route path="/error" element={<Error />} />
  //         <Route path="/employeeExpense" element={<EmployeeExpense />} />
  //         {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
  //         <Route path="*" element={<Navigate to="/dashboard" replace />} />
  //       </Routes>
  //     </div>
  //   </Router>

import FileUpload from './components/FileUpload';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Redirect root path to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/EmployeeExpense" element={<EmployeeExpense />} />
        <Route path="/ExpenseResult" element={<ExpenseResult />} />

        {/* Uncomment below route when needed */}
        {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>

  );
}

export default App;







// Na code 
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import './App.css';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import Dashboard from './components/Dashboard';
// import FileUpload from './components/FileUpload';
// import ExpenseResult from './components/ExpenseResult';
// import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'; // ✅ Correct import
// import Error from './components/Error';
// import EmployeeExpense from './components/EmployeeExpense';

// function App() {

//   const router = createBrowserRouter([
//   {
//     path: '/expenseResult',
//     element: <ExpenseResult/>,
//     errorElement: <Error/>
//   },
  
// ])

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/expenseResult" element={<ExpenseResult />} />
//           <Route path="/error" element={<Error />} />
//           <Route path="/employeeExpense" element={<EmployeeExpense />} />
//           {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
//           {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
