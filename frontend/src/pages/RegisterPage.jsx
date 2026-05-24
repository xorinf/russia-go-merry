import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  // Pull the register function from global auth context and initialize routing
  const { register } = useAuth();
  const navigate = useNavigate();

  // Local state for handling user inputs, validation errors, and submission status
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generic input handler: dynamically updates the specific field and clears active errors
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  // Handles form submission, validation, and account creation
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent standard browser page refresh
    
    // 1. Basic validation: Ensure no fields are left blank
    if (!form.name || !form.email || !form.password) {
      setError('Please fill out all fields.');
      return;
    }

    // 2. Security validation: Enforce minimum password length matching backend schema
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 3. Attempt registration via context API
      await register(form.name.trim(), form.email.trim(), form.password);
      
      // 4. Success: Redirect to home page and prevent back-navigation to the register page
      navigate('/', { replace: true });
    } catch (err) {
      // 5. Failure: Display backend error (e.g., "Email already in use") or fallback message
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      {/* Centered Registration Card */}
      <div className="w-full max-w-sm">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-sage-600 flex items-center justify-center mb-4 shadow-float">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" fill="white" opacity="0.9"/>
              <circle cx="10" cy="10" r="3" fill="white"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-ink">Yaksha FAQ Portal</h1>
          <p className="text-xs text-ink/45 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-xl border border-black/6 shadow-card p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Sign up</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name Input Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-ink/60 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-black/12 bg-white text-sm text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition duration-150"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink/60 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-black/12 bg-white text-sm text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition duration-150"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink/60 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-black/12 bg-white text-sm text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-sage-400/50 focus:border-sage-400 transition duration-150"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message Display Block */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit Button with Dynamic Loading State */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 active:bg-sage-800 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full py-2.5 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/40 border-t-white animate-spin" />
                  Signing up…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login Fallback Link */}
          <p className="text-center text-xs text-ink/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sage-600 hover:text-sage-700 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
