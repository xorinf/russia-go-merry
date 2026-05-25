import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <div className="min-h-screen bg-bg grid-bg flex flex-col items-center justify-center px-4">
      {/* Centered Registration Card */}
      <div className="w-full max-w-sm animate-fade-in">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl border-2 border-accent/20 bg-accent-light flex items-center justify-center mb-4 shadow-subtle">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <text x="4" y="18" fontSize="18" fontWeight="700" fill="#4f7cff" fontFamily="DM Serif Display, serif">?</text>
            </svg>
          </div>
          <h1 className="text-xl font-serif text-ink">Yaksha FAQ Portal</h1>
          <p className="text-xs text-ink-soft mt-1.5">Create your account</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Sign up</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name Input Field */}
            <Input
              id="register-name"
              name="name"
              type="text"
              label="Full Name"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
            />

            {/* Email Input Field */}
            <Input
              id="register-email"
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
              id="register-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            {/* Error Message Display Block */}
            {error && (
              <p className="text-xs text-danger bg-danger-light border border-danger/15 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit Button with Dynamic Loading State */}
            <Button
              type="submit"
              loading={loading}
              className="w-full mt-1"
            >
              Create account
            </Button>
          </form>

          {/* Login Fallback Link */}
          <p className="text-center text-xs text-ink-soft mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
