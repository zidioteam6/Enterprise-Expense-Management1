

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import ExpenseResult from './components/ExpenseResult';
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'; // ✅ Correct import
import Error from './components/Error';
import EmployeeExpense from './components/EmployeeExpense';

function App() {

  const router = createBrowserRouter([
  {
    path: '/expenseResult',
    element: <ExpenseResult/>,
    errorElement: <Error/>
  },
  
])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenseResult" element={<ExpenseResult />} />
          <Route path="/error" element={<Error />} />
          <Route path="/employeeExpense" element={<EmployeeExpense />} />
          {/* <Route path="/upload-expense" element={<FileUpload />} /> */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
