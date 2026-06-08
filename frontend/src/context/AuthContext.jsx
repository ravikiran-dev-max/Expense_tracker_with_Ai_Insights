import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAlert } from './AlertContext';

// Create the Context object for authentication
const AuthContext = createContext();

/**
 * Custom hook to consume the AuthContext safely.
 * Throws an error if used outside an AuthProvider wrapper.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Central API Base URL endpoint configuration
// Evaluates VITE_API_BASE from environments (for production hosting) or defaults to local server port
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Context Provider Component wrapping the application to share session state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Tracks the authenticated user's session data
  const [loading, setLoading] = useState(true); // Manages initial loading screen state
  const { showAlert } = useAlert();             // Alert utility context to push notification bars

  // Load user session details on initial page render from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('expense_tracker_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('expense_tracker_user'); // Clear corrupted storage objects
      }
    }
    setLoading(false);
  }, []);

  /**
   * Reusable central API Call wrapper.
   * Handles headers, inserts JWT authorization tokens, and parses response objects.
   */
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const storedUser = localStorage.getItem('expense_tracker_user');
    let token = '';
    if (storedUser) {
      try {
        token = JSON.parse(storedUser).token;
      } catch (e) {}
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Attach JWT authorization header if session token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Multipart forms (e.g. avatar file upload) require browser to define boundary parameters
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    // Execute standard browser fetch call
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json();

    // Check for HTTP errors (outside 2xx range) and throw
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    return result;
  }, []);

  /**
   * Action: Register new user
   */
  const signup = async (username, email, password) => {
    try {
      const result = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      setUser(result.data);
      localStorage.setItem('expense_tracker_user', JSON.stringify(result.data));
      showAlert('Account registered successfully!', 'success');
      return true;
    } catch (error) {
      showAlert(error.message, 'error');
      return false;
    }
  };

  /**
   * Action: Log in existing user
   */
  const login = async (email, password) => {
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setUser(result.data);
      localStorage.setItem('expense_tracker_user', JSON.stringify(result.data));
      showAlert('Welcome back!', 'success');
      return true;
    } catch (error) {
      showAlert(error.message, 'error');
      return false;
    }
  };

  /**
   * Action: Log out current session
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('expense_tracker_user');
    showAlert('Logged out successfully.', 'info');
  };

  /**
   * Action: Update user settings profile (username, monthly budget)
   */
  const updateProfile = async (username, monthlyBudget) => {
    try {
      const result = await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ username, monthlyBudget }),
      });
      
      const updatedUser = {
        ...user,
        username: result.data.username,
        monthlyBudget: result.data.monthlyBudget,
      };
      
      setUser(updatedUser);
      localStorage.setItem('expense_tracker_user', JSON.stringify(updatedUser));
      showAlert('Profile details updated!', 'success');
      return true;
    } catch (error) {
      showAlert(error.message, 'error');
      return false;
    }
  };

  /**
   * Action: Update user account password securely
   */
  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await apiCall('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      showAlert('Password updated successfully!', 'success');
      return true;
    } catch (error) {
      showAlert(error.message, 'error');
      return false;
    }
  };

  /**
   * Action: Upload profile avatar image file
   */
  const uploadAvatar = async (formData) => {
    try {
      const result = await apiCall('/auth/avatar', {
        method: 'PUT',
        body: formData, // Form data contains multipart image stream
      });

      const updatedUser = {
        ...user,
        avatar: result.data.avatar, // Save returning image relative path or cloud url
      };

      setUser(updatedUser);
      localStorage.setItem('expense_tracker_user', JSON.stringify(updatedUser));
      showAlert('Profile photo updated!', 'success');
      return true;
    } catch (error) {
      showAlert(error.message, 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        updateProfile,
        updatePassword,
        uploadAvatar,
        apiCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
