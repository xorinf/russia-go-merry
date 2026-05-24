import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  // Access the global login function and routing navigation
  const { login } = useAuth();
  const navigate = useNavigate();

  // Local state for form inputs, error messages, and API loading status
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generic input handler: updates specific field by name and clears any active errors
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  // Handles the form submission and authentication flow
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser from refreshing the page
    
    // Basic frontend validation to ensure fields aren't empty
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      // Attempt to authenticate using the context helper
      await login(form.email.trim(), form.password);
      
      // On success, redirect to the dashboard and replace the history stack 
      // so the user can't hit "back" to return to the login screen
      navigate('/', { replace: true });
    } catch (err) {
      // Display the specific error from the backend, or fallback to a generic message
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg grid-bg flex flex-col items-center justify-center px-4">
      {/* Centered Login Card */}
      <div className="w-full max-w-sm animate-fade-in">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl border-2 border-accent/20 bg-accent-light flex items-center justify-center mb-4 shadow-subtle">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <text x="4" y="18" fontSize="18" fontWeight="700" fill="#4f7cff" fontFamily="DM Serif Display, serif">?</text>
            </svg>
          </div>
          <h1 className="text-xl font-serif text-ink">Yaksha FAQ Portal</h1>
          <p className="text-xs text-ink-soft mt-1.5">Internship knowledge base</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Email Input Field */}
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            {/* Password Input Field */}
            <Input
              id="login-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            {/* Conditionally rendered error message block */}
            {error && (
              <p className="text-xs text-danger bg-danger-light border border-danger/15 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit Button with Loading State */}
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-1"
            >
              Sign in
            </Button>
          </form>

          {/* Registration Link Fallback */}
          <p className="text-center text-xs text-ink-soft mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
