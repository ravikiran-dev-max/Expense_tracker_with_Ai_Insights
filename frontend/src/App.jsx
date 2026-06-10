import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";

const MainLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isAuthPage = ["/login", "/signup"].includes(location.pathname);
  const isLandingPage = location.pathname === "/";
  const showAppFrame = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar onMenuToggle={handleSidebarToggle} />

      <div className="flex flex-1 relative">
        {showAppFrame && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${
            showAppFrame ? "lg:max-w-[calc(100vw-16rem)]" : "w-full"
          }`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={user ? <Navigate to="/dashboard" replace /> : <Signup />}
            />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {user && <ChatBot />}
    </div>
  );
};

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
