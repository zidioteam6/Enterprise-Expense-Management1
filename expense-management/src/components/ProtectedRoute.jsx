import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user data, redirect to login
  if (!user) {
    console.log('No user data found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Log user data for debugging
  console.log('ProtectedRoute - User data:', user);
  console.log('ProtectedRoute - User role:', user.role);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);

  // If user's role is not in allowedRoles, redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.map(role => role.toUpperCase()).includes(user.role.toUpperCase())) {
    console.log('User role not allowed, redirecting to appropriate dashboard');
    switch (user.role.toUpperCase()) {
      case 'MANAGER':
        return <Navigate to="/manager-dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 