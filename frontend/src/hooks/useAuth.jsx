import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Create the context to hold auth state globally
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Lazily initialize user state from localStorage to prevent auth flashes on refresh
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('yaksha_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  // Track initial loading state while we verify the token in the background
  const [loading, setLoading] = useState(true);

  // Validate the stored token with the backend on initial mount
  useEffect(() => {
    const token = localStorage.getItem('yaksha_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Ping the protected /me route to ensure the token is still valid
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Token is expired or invalid; clear stale data
        localStorage.removeItem('yaksha_token');
        localStorage.removeItem('yaksha_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Authenticate user, save session data locally, and update global state
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data;
    
    localStorage.setItem('yaksha_token', token);
    localStorage.setItem('yaksha_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    
    return loggedInUser;
  };

  // Create a new account, auto-login, and save session data locally
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: registeredUser } = res.data;
    
    localStorage.setItem('yaksha_token', token);
    localStorage.setItem('yaksha_user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    
    return registeredUser;
  };

  // Clear session data from storage and global state to sign the user out
  const logout = () => {
    localStorage.removeItem('yaksha_token');
    localStorage.removeItem('yaksha_user');
    setUser(null);
  };

  return (
    // Expose state and helper functions to all child components
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the auth context in any component
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  // Fail fast if a developer tries to use this hook outside the provider hierarchy
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
