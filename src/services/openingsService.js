import { supabase } from '../lib/supabase';

class OpeningsService {
  /**
   * Create a new opening
   * @param {Object} openingData - Opening data
   * @returns {Object} Result of the database operation
   */
  async createOpening(openingData) {
    try {
      // Get user ID from custom session (same pattern as galleryService)
      let userId = null;

      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        try {
          const { data: sessionData } = await supabase
            .rpc('validate_session', { session_token: sessionToken });

          if (sessionData && sessionData.user_id) {
            userId = sessionData.user_id;
          }
        } catch (sessionErr) {
          console.warn('Session validation failed:', sessionErr);
        }
      }

      const { data, error } = await supabase
        .from('openings')
        .insert([{
          instrument_name: openingData.instrumentName,
          openings_count: openingData.openingsCount,
          description: openingData.description,
          is_active: openingData.isActive !== undefined ? openingData.isActive : true,
          priority: openingData.priority || 0,
          created_by: userId
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create opening error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all openings
   * @param {Object} filters - Optional filters (isActive)
   * @returns {Object} List of openings
   */
  async getOpenings(filters = {}) {
    try {
      let query = supabase
        .from('openings')
        .select('*')
        .order('priority', { ascending: false })
        .order('instrument_name', { ascending: true });

      // Apply filters
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get openings error:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Update an opening
   * @param {string} id - Opening ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated opening
   */
  async updateOpening(id, updates) {
    try {
      const updateData = {};

      if (updates.instrumentName !== undefined) updateData.instrument_name = updates.instrumentName;
      if (updates.openingsCount !== undefined) updateData.openings_count = updates.openingsCount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.priority !== undefined) updateData.priority = updates.priority;

      const { data, error } = await supabase
        .from('openings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update opening error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete an opening
   * @param {string} id - Opening ID
   * @returns {Object} Result of deletion
   */
  async deleteOpening(id) {
    try {
      const { error } = await supabase
        .from('openings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Opening deleted successfully'
      };
    } catch (error) {
      console.error('Delete opening error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Toggle opening active status
   * @param {string} id - Opening ID
   * @param {boolean} isActive - New active status
   * @returns {Object} Updated opening
   */
  async toggleActive(id, isActive) {
    try {
      const { data, error } = await supabase
        .from('openings')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Toggle active error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const openingsService = new OpeningsService();
