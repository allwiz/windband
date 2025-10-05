import { supabase } from '../lib/supabase';

class PerformanceService {
  /**
   * Check if current user is admin
   * @returns {boolean} True if user is admin
   */
  async isUserAdmin() {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) return false;

      const { data: sessionData } = await supabase
        .rpc('validate_session', { session_token: sessionToken });

      if (!sessionData) return false;

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', sessionData.user_id)
        .single();

      return userData?.role === 'admin';
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  /**
   * Upload an image to Supabase storage
   * @param {File} file - The image file to upload
   * @param {string} category - The category of the image
   * @returns {Object} Upload result with URL and storage path
   */
  async uploadImage(file, category = 'general') {
    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `performances/${category}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('infinite recursion')) {
          console.error('Storage Policy Error: Please check storage policies');
          throw new Error('Storage configuration error. Please contact administrator.');
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicUrl,
        storagePath: fileName,
        fileSize: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a performance item in the database
   * @param {Object} performanceData - Performance item data
   * @returns {Object} Result of the database operation
   */
  async createPerformanceItem(performanceData) {
    try {
      let userId = null;

      const sessionToken = localStorage.getItem('sessionToken');
      console.log('Session token exists:', !!sessionToken);

      if (sessionToken) {
        try {
          console.log('Attempting to validate session...');
          const { data: sessionData, error: sessionError } = await supabase
            .rpc('validate_session', { session_token: sessionToken });

          console.log('Session validation result:', { sessionData, sessionError });

          if (sessionData && sessionData.user_id) {
            userId = sessionData.user_id;
            console.log('Got user ID from session:', userId);
          }
        } catch (sessionErr) {
          console.warn('Session validation failed, continuing without user_id:', sessionErr);
        }
      }

      if (!userId) {
        console.log('No session found, checking for admin user...');
        const { data: adminUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', 'admin@windband.com')
          .single();

        if (adminUser) {
          userId = adminUser.id;
          console.log('Using admin user ID:', userId);
        }
      }

      console.log('Creating performance item with user ID:', userId);

      const insertData = {
        title: performanceData.title,
        description: performanceData.description || null,
        category: performanceData.category,
        venue: performanceData.venue || null,
        date: performanceData.date || new Date().toISOString().split('T')[0],
        start_time: performanceData.startTime || null,
        end_time: performanceData.endTime || null,
        image_url: performanceData.imageUrl || null,
        storage_path: performanceData.storagePath || null,
        file_size: performanceData.fileSize || null,
        mime_type: performanceData.mimeType || null,
        width: performanceData.width || null,
        height: performanceData.height || null,
        ticket_link: performanceData.ticketLink || null,
        is_featured: performanceData.isFeatured || false,
        created_by: userId,
        is_active: true
      };

      const { data, error } = await supabase
        .from('performances')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        if (error.message?.includes('infinite recursion')) {
          console.error('RLS Policy Error: Infinite recursion detected');
          throw new Error('Database configuration error. Please contact administrator.');
        }
        throw error;
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Create performance item error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all performance items
   * @param {Object} filters - Optional filters (category, isActive, isFeatured)
   * @returns {Object} List of performance items
   */
  async getPerformanceItems(filters = {}) {
    try {
      let query = supabase
        .from('performances')
        .select('*')
        .order('date', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get performance items error:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Update a performance item
   * @param {string} id - Performance item ID
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated performance item
   */
  async updatePerformanceItem(id, updates) {
    try {
      const { data, error } = await supabase
        .from('performances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Update performance item error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a performance item
   * @param {string} id - Performance item ID
   * @returns {Object} Result of deletion
   */
  async deletePerformanceItem(id) {
    try {
      const { data: item, error: fetchError } = await supabase
        .from('performances')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (item?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove([item.storage_path]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }

      const { error } = await supabase
        .from('performances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Performance item deleted successfully'
      };
    } catch (error) {
      console.error('Delete performance item error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get image dimensions from a file
   * @param {File} file - Image file
   * @returns {Promise<Object>} Image dimensions
   */
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const performanceService = new PerformanceService();
