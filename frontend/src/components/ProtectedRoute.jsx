import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component: Restricts route access to logged-in users only.
 * Redirects unauthenticated users to the Login view and shows a spinner while checking session state.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show fullscreen animated loading spinner while context retrieves stored session tokens
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Redirect to login page if session is missing
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render children views if user session is successfully verified
  return children;
};

export default ProtectedRoute;
