import { supabase } from './supabase'

// Custom authentication database service
class AuthDatabaseService {
  constructor() {
    this.defaultTimeout = 15000
    this.sessionStorageKey = 'wind_band_session'
  }

  // Create a promise that rejects after timeout
  withTimeout(promise, timeout = this.defaultTimeout) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    )
    return Promise.race([promise, timeoutPromise])
  }

  // Set current user context for RLS
  async setUserContext(userId) {
    if (userId) {
      await supabase.rpc('set_config', {
        parameter: 'app.current_user_id',
        value: userId
      })
    }
  }

  // Register new user
  async register(email, password, fullName = null, phone = null) {
    try {
      const { data, error } = await this.withTimeout(
        supabase.rpc('register_user', {
          p_email: email,
          p_password: password,
          p_full_name: fullName,
          p_phone: phone
        })
      )

      if (error) throw error

      const result = data[0]
      return {
        success: result.success,
        message: result.message,
        userId: result.user_id
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: error.message || 'Registration failed'
      }
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Get client IP and user agent
      const ipAddress = null // Will be set by server if needed
      const userAgent = navigator.userAgent

      const { data, error } = await this.withTimeout(
        supabase.rpc('login_user', {
          p_email: email,
          p_password: password,
          p_ip_address: ipAddress,
          p_user_agent: userAgent
        })
      )

      if (error) throw error

      const result = data[0]

      if (result.success) {
        // Store session in localStorage
        const sessionData = {
          sessionToken: result.session_token,
          userId: result.user_id,
          email: email,
          role: result.role,
          fullName: result.full_name,
          expiresAt: result.expires_at
        }

        localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionData))

        // Set user context for subsequent requests
        await this.setUserContext(result.user_id)
      }

      return {
        success: result.success,
        message: result.message,
        user: result.success ? {
          id: result.user_id,
          email: email,
          role: result.role,
          fullName: result.full_name
        } : null,
        sessionToken: result.session_token
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.message || 'Login failed'
      }
    }
  }

  // Validate session and get current user
  async validateSession(sessionToken = null) {
    try {
      const token = sessionToken || this.getStoredSessionToken()

      if (!token) {
        return {
          valid: false,
          user: null
        }
      }

      const { data, error } = await this.withTimeout(
        supabase.rpc('validate_session', {
          p_session_token: token
        })
      )

      if (error) throw error

      const result = data[0]

      if (result.valid) {
        // Update stored session data
        const sessionData = {
          sessionToken: token,
          userId: result.user_id,
          email: result.email,
          role: result.role,
          fullName: result.full_name,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }

        localStorage.setItem(this.sessionStorageKey, JSON.stringify(sessionData))

        // Set user context
        await this.setUserContext(result.user_id)

        return {
          valid: true,
          user: {
            id: result.user_id,
            email: result.email,
            role: result.role,
            fullName: result.full_name
          }
        }
      } else {
        // Clear invalid session
        this.clearSession()
        return {
          valid: false,
          user: null
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
      this.clearSession()
      return {
        valid: false,
        user: null
      }
    }
  }

  // Logout user
  async logout() {
    try {
      const token = this.getStoredSessionToken()

      if (token) {
        await this.withTimeout(
          supabase.rpc('logout_user', {
            p_session_token: token
          })
        )
      }

      this.clearSession()
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      this.clearSession() // Clear session even if server call fails
      return { success: true } // Always return success for logout
    }
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const { data, error } = await this.withTimeout(
        supabase.rpc('change_password', {
          p_user_id: userId,
          p_old_password: oldPassword,
          p_new_password: newPassword
        })
      )

      if (error) throw error

      const result = data[0]
      return {
        success: result.success,
        message: result.message
      }
    } catch (error) {
      console.error('Password change error:', error)
      return {
        success: false,
        message: error.message || 'Password change failed'
      }
    }
  }

  // Set user role (admin only)
  async setUserRole(adminId, targetUserId, newRole) {
    try {
      const { data, error } = await this.withTimeout(
        supabase.rpc('set_user_role', {
          p_admin_id: adminId,
          p_target_user_id: targetUserId,
          p_new_role: newRole
        })
      )

      if (error) throw error

      const result = data[0]
      return {
        success: result.success,
        message: result.message
      }
    } catch (error) {
      console.error('Set user role error:', error)
      return {
        success: false,
        message: error.message || 'Role update failed'
      }
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await this.withTimeout(
        supabase
          .from('user_profiles')
          .select('id, email, full_name, phone, role, status, created_at, last_login')
          .order('created_at', { ascending: false })
      )

      if (error) throw error
      return {
        success: true,
        users: data || []
      }
    } catch (error) {
      console.error('Get users error:', error)
      return {
        success: false,
        message: error.message || 'Failed to fetch users',
        users: []
      }
    }
  }

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password_hash, role, ...safeUpdates } = updates

      const { data, error } = await this.withTimeout(
        supabase
          .from('user_profiles')
          .update({
            ...safeUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
      )

      if (error) throw error

      return {
        success: true,
        user: data[0]
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        message: error.message || 'Profile update failed'
      }
    }
  }

  // Session management helpers
  getStoredSessionToken() {
    try {
      const stored = localStorage.getItem(this.sessionStorageKey)
      if (stored) {
        const session = JSON.parse(stored)
        // Check if session is expired
        if (new Date(session.expiresAt) > new Date()) {
          return session.sessionToken
        } else {
          this.clearSession()
        }
      }
    } catch (error) {
      console.error('Error reading session:', error)
      this.clearSession()
    }
    return null
  }

  getStoredSession() {
    try {
      const stored = localStorage.getItem(this.sessionStorageKey)
      if (stored) {
        const session = JSON.parse(stored)
        // Check if session is expired
        if (new Date(session.expiresAt) > new Date()) {
          return session
        } else {
          this.clearSession()
        }
      }
    } catch (error) {
      console.error('Error reading session:', error)
      this.clearSession()
    }
    return null
  }

  clearSession() {
    localStorage.removeItem(this.sessionStorageKey)
  }

  // Cleanup expired sessions (admin function)
  async cleanupExpiredSessions() {
    try {
      const { data, error } = await this.withTimeout(
        supabase.rpc('cleanup_expired_sessions')
      )

      if (error) throw error

      return {
        success: true,
        deletedCount: data
      }
    } catch (error) {
      console.error('Cleanup sessions error:', error)
      return {
        success: false,
        message: error.message || 'Cleanup failed'
      }
    }
  }
}

// Create singleton instance
export const authDb = new AuthDatabaseService()

// Export individual methods for convenience
export const {
  register,
  login,
  logout,
  validateSession,
  changePassword,
  setUserRole,
  getAllUsers,
  updateProfile,
  getStoredSession,
  clearSession
} = authDb