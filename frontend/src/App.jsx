import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

/**
 * Main Layout component: Structures the visual frame of the page dynamically.
 * Conditionally shows the side navbar and floating AI chatbot if the user is authenticated.
 */
const MainLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controls responsive drawer state on mobile screens
  const location = useLocation();

  // Toggles the drawer menu (sidebar) for smaller viewport dimensions
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';

  // Display Sidebar and standard grid frame only when user is logged in
  // and is not currently viewing auth (login/signup) or landing (root) pages.
  const showAppFrame = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      
      {/* Global Navigation Header Bar */}
      <Navbar onMenuToggle={handleSidebarToggle} />

      <div className="flex flex-1 relative">
        {/* Sidebar Component for larger viewports or mobile drawer overlay */}
        {showAppFrame && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Content Viewport Wrapper */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${
          showAppFrame ? 'lg:max-w-[calc(100vw-16rem)]' : 'w-full'
        }`}>
          <Routes>
            {/* Landing Intro Page Route */}
            <Route path="/" element={<Home />} />
            
            {/* Auth Routes: Redirect already logged in user to dashboard */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
            />

            {/* Protected Private Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-all: Route unmatched routes to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating AI Chatbot overlay drawer (Enabled for logged in users only) */}
      {user && <ChatBot />}
    </div>
  );
};

/**
 * Top level App component wrapping the application in Context Providers
 */
function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
