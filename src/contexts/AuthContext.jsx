import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Validate existing session
        const result = await authService.validateSession();
        if (result.success) {
          setUser(result.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Sign up function
  const signUp = async (email, password, fullName = null, phone = null) => {
    try {
      setError(null);
      const result = await authService.register(email, password, fullName, phone);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setError(null);
      const result = await authService.updateProfile(updates);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const result = await authService.changePassword(currentPassword, newPassword);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const result = await authService.requestPasswordReset(email);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const result = await authService.resetPassword(token, newPassword);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const result = await authService.verifyEmail(token);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Helper functions
  const isAdmin = () => user?.role === 'admin';
  const isAuthenticated = () => !!user;

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    isAdmin,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};