import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, role = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required, check if user has that role
  if (role && user?.role !== role) {
    return <Navigate to="/courses" />;
  }

  return children;
};

export default ProtectedRoute;