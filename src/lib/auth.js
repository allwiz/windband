import { supabase } from './supabase';

// Session storage key
const SESSION_KEY = 'windband_session';

/**
 * Authentication Service
 * Handles all authentication operations with custom auth system
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionToken = null;
    this.loadSession();
  }

  // Load session from localStorage
  loadSession() {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is not expired
        if (new Date(session.expires_at) > new Date()) {
          this.sessionToken = session.token;
          this.currentUser = session.user;
        } else {
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
    }
  }

  // Save session to localStorage
  saveSession(sessionData) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        token: sessionData.session_token,
        user: sessionData.user,
        expires_at: sessionData.expires_at
      }));
      this.sessionToken = sessionData.session_token;
      this.currentUser = sessionData.user;
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Clear session from localStorage
  clearSession() {
    localStorage.removeItem(SESSION_KEY);
    this.currentUser = null;
    this.sessionToken = null;
  }

  /**
   * Register a new user
   */
  async register(email, password, fullName = null, phone = null) {
    try {
      const { data, error } = await supabase.rpc('register_user', {
        p_email: email,
        p_password: password,
        p_full_name: fullName,
        p_phone: phone
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        message: data.message,
        userId: data.user_id,
        verificationToken: data.verification_token
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const { data, error } = await supabase.rpc('login_user', {
        p_email: email,
        p_password: password,
        p_ip_address: null, // You can get this from the server
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Save session
      this.saveSession(data);

      return {
        success: true,
        user: data.user,
        token: data.session_token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      if (this.sessionToken) {
        const { error } = await supabase.rpc('logout_user', {
          p_token: this.sessionToken
        });

        if (error) {
          console.error('Logout error:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      if (!this.sessionToken) {
        return { success: false, user: null };
      }

      const { data, error } = await supabase.rpc('validate_session', {
        p_token: this.sessionToken
      });

      if (error) throw error;

      if (data.success) {
        this.currentUser = data.user;
        return { success: true, user: data.user };
      } else {
        this.clearSession();
        return { success: false, user: null };
      }
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearSession();
      return { success: false, user: null };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      const { data, error } = await supabase.rpc('verify_email', {
        p_token: token
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    try {
      const { data, error } = await supabase.rpc('request_password_reset', {
        p_email: email
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    try {
      const { data, error } = await supabase.rpc('reset_password', {
        p_token: token,
        p_new_password: newPassword
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase.rpc('change_password', {
        p_user_id: this.currentUser.id,
        p_current_password: currentPassword,
        p_new_password: newPassword
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      // Update local user data
      this.currentUser = { ...this.currentUser, ...data };

      // Update session storage
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (stored) {
        stored.user = this.currentUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
      }

      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!this.currentUser && !!this.sessionToken;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export individual functions for convenience
export const {
  register,
  login,
  logout,
  validateSession,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
  getCurrentUser,
  isAdmin,
  isAuthenticated
} = authService;