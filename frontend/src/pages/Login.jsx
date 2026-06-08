import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

/**
 * Login Page component
 * Captures email & password credentials, validates formats client-side, and initiates AuthContext sign-in.
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' }); // Form input buffer
  const [loading, setLoading] = useState(false);                          // Loading state spinner toggle
  const [errors, setErrors] = useState({});                               // Client-side validation errors

  /**
   * Evaluates input field formats
   * @returns {boolean} True if inputs are formatted correctly, false otherwise
   */
  const validate = () => {
    const tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please add a valid email address'; // Basic regex format check
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  /**
   * Action: Handles login form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // Exit if formatting errors exist

    setLoading(true);
    const success = await login(formData.email, formData.password);
    setLoading(false);

    // Route authenticated user session directly to Dashboard workspace
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Login Card Panel */}
      <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/35 p-8 shadow-2xl backdrop-blur-md relative z-10 animate-slide-up">
        
        {/* Title */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input */}
          <div>
            <label htmlFor="login-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-xl border bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition ${
                  errors.email ? 'border-rose-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="login-pass" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                id="login-pass"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full rounded-xl border bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition ${
                  errors.password ? 'border-rose-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
          </div>

          {/* Form Submit Button (displays spinner during fetch delay) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition duration-200 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>

        </form>

        {/* Redirect toggle to Signup page */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="inline-flex items-center gap-0.5 font-semibold text-primary-400 hover:text-primary-300 transition"
            >
              Sign up here
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
