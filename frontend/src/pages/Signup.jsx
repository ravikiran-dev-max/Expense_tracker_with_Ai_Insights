import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

/**
 * Signup Page Component
 * Collects details, performs form checks (like password mismatch), and invokes signup hook context methods.
 */
const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Signup fields mapping
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false); // Controls network activity loader status
  const [errors, setErrors] = useState({});       // Validation messages state

  /**
   * Action: Validates input field configurations
   */
  const validate = () => {
    const tempErrors = {};
    if (!formData.username.trim()) tempErrors.username = 'Username is required';
    
    // Email regex validation
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please add a valid email address';
    }

    // Password rules check (Minimum 6 characters long)
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirms password equality
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  /**
   * Action: Submits signup inputs
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const success = await signup(formData.username, formData.email, formData.password);
    setLoading(false);

    // Direct user to application workspace if register call completes successfully
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Signup Card */}
      <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/35 p-8 shadow-2xl backdrop-blur-md relative z-10 animate-slide-up">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label htmlFor="reg-username" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-username"
                type="text"
                placeholder="JohnDoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full rounded-xl border bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition ${
                  errors.username ? 'border-rose-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-rose-400">{errors.username}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="reg-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                id="reg-email"
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

          {/* Password & Confirm inputs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password input */}
            <div>
              <label htmlFor="reg-pass" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-pass"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full rounded-xl border bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition ${
                    errors.password ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            {/* Confirm password input */}
            <div>
              <label htmlFor="reg-confirm" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Confirm
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full rounded-xl border bg-slate-950/75 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-primary-500 transition ${
                    errors.confirmPassword ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Form Submit (displays spinner during fetch delay) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition duration-200 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Sign Up
              </>
            )}
          </button>

        </form>

        {/* Redirect toggle to login view */}
        <div className="mt-8 pt-6 border-t border-slate-900/60 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="inline-flex items-center gap-0.5 font-semibold text-primary-400 hover:text-primary-300 transition"
            >
              Log in here
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
