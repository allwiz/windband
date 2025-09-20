import { supabase } from './supabase'

// Database wrapper with timeout and error handling
class DatabaseService {
  constructor() {
    this.defaultTimeout = 15000 // 15 seconds
    this.retryCount = 2 // Reduce retries to prevent long waits
    this.retryDelay = 2000 // 2 seconds between retries
  }

  // Create a promise that rejects after timeout
  withTimeout(promise, timeout = this.defaultTimeout) {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), timeout)
    )

    return Promise.race([promise, timeoutPromise])
  }

  // Retry wrapper for database operations
  async withRetry(operation, maxRetries = this.retryCount) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        console.log(`Database operation failed, retrying (${attempt}/${maxRetries})...`)
      }
    }
  }

  // Generic query wrapper with timeout and retry
  async query(operation, options = {}) {
    const { timeout = this.defaultTimeout, retry = true } = options

    const executeQuery = async () => {
      return await this.withTimeout(operation(), timeout)
    }

    if (retry) {
      return await this.withRetry(executeQuery)
    } else {
      return await executeQuery()
    }
  }

  // Specific database operations
  async fetchGalleryItems() {
    return await this.query(async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    })
  }

  async fetchProfiles() {
    return await this.query(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          role,
          status,
          joined_date,
          last_login,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    })
  }

  async fetchProfile(userId) {
    return await this.query(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, return basic profile
          return { id: userId, role: 'member' }
        }
        throw error
      }
      return data
    })
  }

  async fetchDashboardStats() {
    return await this.query(async () => {
      // Use Promise.allSettled to handle partial failures
      const [profilesResult, applicationsResult, eventsResult, activityResult] = await Promise.allSettled([
        supabase.from('profiles').select('id, status, role, created_at'),
        supabase.from('applications').select('id, status'),
        supabase.from('events').select('id, status, start_date'),
        supabase.from('admin_activity_log').select(`
          id, action, target_type, created_at,
          profiles!admin_id(full_name, email)
        `).order('created_at', { ascending: false }).limit(10)
      ])

      const profiles = profilesResult.status === 'fulfilled' ? profilesResult.value.data || [] : []
      const applications = applicationsResult.status === 'fulfilled' ? applicationsResult.value.data || [] : []
      const events = eventsResult.status === 'fulfilled' ? eventsResult.value.data || [] : []
      const activity = activityResult.status === 'fulfilled' ? activityResult.value.data || [] : []

      return {
        totalMembers: profiles.length,
        activeMembers: profiles.filter(p => p.status === 'active').length,
        pendingApplications: applications.filter(a => a.status === 'pending').length,
        totalEvents: events.filter(e => e.status === 'scheduled').length,
        recentActivity: activity
      }
    })
  }

  async updateProfile(userId, updates) {
    return await this.query(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) throw error
      return data
    })
  }

  // Health check for database connection
  async healthCheck() {
    try {
      const { data, error } = await this.withTimeout(
        supabase.from('profiles').select('count').limit(1),
        5000 // 5 second timeout for health check
      )

      if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
        throw error
      }

      return { status: 'healthy', connection: true }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        status: 'unhealthy',
        connection: false,
        error: error.message
      }
    }
  }

  // Run comprehensive diagnostics
  async runDiagnostics() {
    const { quickDiagnostic } = await import('./dbDiagnostics')
    return await quickDiagnostic()
  }

  // Check and update admin role for specific email
  async ensureAdminRole(email = 'allwiz@gmail.com') {
    try {
      // Check if user with this email has admin role
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, role, status')
        .eq('email', email)
        .limit(1)

      if (fetchError) {
        console.log('Could not check admin role:', fetchError.message)
        return { success: false, message: 'Could not access profiles table' }
      }

      if (existingProfiles && existingProfiles.length > 0) {
        const profile = existingProfiles[0]

        if (profile.role === 'admin' || profile.role === 'super_admin') {
          console.log(`✅ ${email} already has admin role: ${profile.role}`)
          return { success: true, message: 'Already admin', role: profile.role }
        }

        // Update to admin role
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', status: 'active' })
          .eq('email', email)
          .select()

        if (updateError) {
          console.error('Failed to update admin role:', updateError.message)
          return { success: false, message: 'Failed to update role' }
        }

        console.log(`✅ Successfully updated ${email} to admin role`)
        return { success: true, message: 'Updated to admin', role: 'admin' }
      } else {
        console.log(`⚠️ No profile found for ${email}. User needs to sign up first.`)
        return { success: false, message: 'User profile not found. Please sign up first.' }
      }
    } catch (error) {
      console.error('Error ensuring admin role:', error)
      return { success: false, message: error.message }
    }
  }
}

// Create singleton instance
export const db = new DatabaseService()

// Export individual methods for convenience
export const {
  query,
  fetchGalleryItems,
  fetchProfiles,
  fetchProfile,
  fetchDashboardStats,
  updateProfile,
  healthCheck
} = db