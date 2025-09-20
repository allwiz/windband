import { createContext, useContext, useEffect, useState } from 'react'
import { authDb } from '../lib/authDatabase'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initialize authentication state from stored session
    const initializeAuth = async () => {
      try {
        setLoading(true)

        // Try to validate existing session
        const result = await authDb.validateSession()

        if (!mounted) return

        if (result.valid && result.user) {
          setUser(result.user)
          console.log('Session restored for:', result.user.email)
        } else {
          setUser(null)
          console.log('No valid session found')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      const result = await authDb.register(
        email,
        password,
        userData.full_name || userData.fullName,
        userData.phone
      )

      if (result.success) {
        return {
          data: { userId: result.userId },
          error: null
        }
      } else {
        return {
          data: null,
          error: { message: result.message }
        }
      }
    } catch (error) {
      return {
        data: null,
        error: { message: error.message || 'Registration failed' }
      }
    }
  }

  const signIn = async (email, password) => {
    try {
      const result = await authDb.login(email, password)

      if (result.success) {
        setUser(result.user)
        return {
          data: { user: result.user },
          error: null
        }
      } else {
        return {
          data: null,
          error: { message: result.message }
        }
      }
    } catch (error) {
      return {
        data: null,
        error: { message: error.message || 'Login failed' }
      }
    }
  }

  const signOut = async () => {
    try {
      const result = await authDb.logout()
      setUser(null)
      return { error: null }
    } catch (error) {
      // Always clear user state on logout, even if there's an error
      setUser(null)
      return { error: { message: error.message || 'Logout failed' } }
    }
  }

  const resetPassword = async (email) => {
    // Password reset functionality would need to be implemented
    // For now, return not implemented
    return {
      data: null,
      error: { message: 'Password reset not implemented yet' }
    }
  }

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' }
        }
      }

      const result = await authDb.changePassword(user.id, oldPassword, newPassword)

      if (result.success) {
        return { data: { message: result.message }, error: null }
      } else {
        return { data: null, error: { message: result.message } }
      }
    } catch (error) {
      return {
        data: null,
        error: { message: error.message || 'Password update failed' }
      }
    }
  }

  // Admin helper functions
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  // Additional helper functions for the new system
  const getAllUsers = async () => {
    if (!isAdmin()) {
      return {
        success: false,
        message: 'Unauthorized',
        users: []
      }
    }

    return await authDb.getAllUsers()
  }

  const setUserRole = async (targetUserId, newRole) => {
    if (!isAdmin() || !user) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    return await authDb.setUserRole(user.id, targetUserId, newRole)
  }

  const updateProfile = async (userId, updates) => {
    return await authDb.updateProfile(userId, updates)
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
    hasRole,
    getAllUsers,
    setUserRole,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}