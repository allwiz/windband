import { supabase } from './supabase'
import { s3Config, hasS3Config, getS3FileUrl } from './s3Config'

class GalleryService {
  constructor() {
    this.bucketName = 'gmwb_public'
  }

  /**
   * Upload a file using Edge Function for secure uploads
   * @param {File} file - The file to upload
   * @param {string} category - Category for organization (e.g., 'concert', 'rehearsal')
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async uploadFile(file, category = 'general') {
    try {
      // Validate file
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      console.log('Uploading file via Edge Function:', {
        name: file.name,
        size: file.size,
        type: file.type,
        category
      })

      // Prepare form data for edge function
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession()

      // For admin uploads, we'll proceed even without auth since Edge Function has service role
      // If you need auth, the Edge Function will handle it
      console.log('Auth session status:', session ? 'Authenticated' : 'No session (proceeding anyway)')

      // Call Edge Function for upload
      const headers = {}
      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      } else {
        // Use the anon key if no session
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-gallery-image`,
        {
          method: 'POST',
          headers,
          body: formData
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('Edge function error:', result)
        return {
          success: false,
          error: result.error || 'Upload failed via edge function'
        }
      }

      console.log('File uploaded successfully via Edge Function:', result.data)

      // Get file metadata
      const metadata = await this.getFileMetadata(file)

      return {
        success: true,
        data: {
          ...result.data,
          ...metadata
        }
      }
    } catch (error) {
      console.error('Upload service error:', error)
      return { success: false, error: `Upload service error: ${error.message}` }
    }
  }

  /**
   * Upload a file directly to Supabase Storage (fallback method)
   * @param {File} file - The file to upload
   * @param {string} category - Category for organization
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async uploadFileDirect(file, category = 'general') {
    try {
      // This is the original method, kept as fallback
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      const filePath = `${category}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Direct upload error:', uploadError)
        return { success: false, error: `Upload failed: ${uploadError.message}` }
      }

      const publicUrl = this.getPublicUrl(uploadData?.path || filePath)
      const metadata = await this.getFileMetadata(file)

      return {
        success: true,
        data: {
          path: uploadData?.path || filePath,
          url: publicUrl,
          size: file.size,
          type: file.type,
          name: file.name,
          ...metadata
        }
      }
    } catch (error) {
      console.error('Direct upload error:', error)
      return { success: false, error: `Upload error: ${error.message}` }
    }
  }

  /**
   * Validate uploaded file
   * @param {File} file - File to validate
   * @returns {object} Validation result
   */
  validateFile(file) {
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/webm']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]

    if (!file) {
      return { valid: false, error: 'No file provided' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 50MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Allowed: images (JPEG, PNG, WebP, GIF) and videos (MP4, MOV, AVI, WMV, WebM)' }
    }

    return { valid: true }
  }

  /**
   * Get file metadata (dimensions for images/videos)
   * @param {File} file - File to analyze
   * @returns {Promise<object>} Metadata object
   */
  async getFileMetadata(file) {
    return new Promise((resolve) => {
      const metadata = {}

      if (file.type.startsWith('image/')) {
        const img = new Image()
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            mediaType: 'photo'
          })
        }
        img.onerror = () => resolve({ mediaType: 'photo' })
        img.src = URL.createObjectURL(file)
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: Math.round(video.duration),
            mediaType: 'video'
          })
          URL.revokeObjectURL(video.src)
        }
        video.onerror = () => {
          resolve({ mediaType: 'video' })
          URL.revokeObjectURL(video.src)
        }
        video.src = URL.createObjectURL(file)
      } else {
        resolve({})
      }
    })
  }

  /**
   * Create gallery item in database
   * @param {object} itemData - Gallery item data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async createGalleryItem(itemData) {
    try {
      console.log('Creating gallery item with data:', itemData)

      // Ensure we have a URL value for the url column
      const urlValue = itemData.file_url || itemData.external_url || 'placeholder'

      // Build the insert object with all available fields
      const insertObject = {
        title: itemData.title,
        description: itemData.description || '',
        type: itemData.type || 'photo',
        url: urlValue, // Always provide a value for url column
        category: itemData.category || 'general',
        is_featured: itemData.is_featured || false,
        is_published: true,
        created_at: new Date().toISOString()
      }

      // Add optional fields if they exist in itemData
      if (itemData.file_url) insertObject.file_url = itemData.file_url
      if (itemData.file_path) insertObject.file_path = itemData.file_path
      if (itemData.file_size) insertObject.file_size = itemData.file_size
      if (itemData.file_type) insertObject.file_type = itemData.file_type
      if (itemData.external_url) insertObject.external_url = itemData.external_url
      if (itemData.thumbnail_url) insertObject.thumbnail_url = itemData.thumbnail_url
      if (itemData.width) insertObject.width = itemData.width
      if (itemData.height) insertObject.height = itemData.height
      if (itemData.duration) insertObject.duration = itemData.duration
      if (itemData.tags) insertObject.tags = itemData.tags
      if (itemData.published_at) insertObject.published_at = itemData.published_at

      console.log('Inserting with full data:', insertObject)

      // Try direct insert with all fields
      const { data: insertData, error: insertError } = await supabase
        .from('gallery_items')
        .insert(insertObject)
        .select('id')
        .single()

      if (insertError) {
        console.error('Insert error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        })
        console.log('Failed insert data:', {
          title: itemData.title,
          url: urlValue,
          type: itemData.type || 'photo',
          fullData: {
            title: itemData.title,
            description: itemData.description || '',
            type: itemData.type || 'photo',
            url: urlValue,
            category: itemData.category || 'general',
            is_featured: itemData.is_featured || false,
            is_published: true,
            created_at: new Date().toISOString()
          }
        })

        // Try a minimal insert with just required fields
        if (insertError.message && insertError.message.includes('null value in column')) {
          console.log('Attempting minimal insert...')
          const { data: minimalData, error: minimalError } = await supabase
            .from('gallery_items')
            .insert({
              title: itemData.title,
              url: urlValue
            })
            .select('id')
            .single()

          if (minimalError) {
            console.error('Minimal insert also failed:', minimalError.message)
            return { success: false, error: `Database error: ${minimalError.message}` }
          }

          console.log('Minimal insert succeeded with ID:', minimalData.id)
          return { success: true, data: { id: minimalData.id } }
        }

        return { success: false, error: insertError.message }
      }

      console.log('Successfully created gallery item with ID:', insertData.id)
      return { success: true, data: { id: insertData.id } }
    } catch (error) {
      console.error('Create gallery item error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Update gallery item
   * @param {number} id - Item ID
   * @param {object} updates - Fields to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateGalleryItem(id, updates) {
    try {
      const { data, error } = await supabase.rpc('update_gallery_item', {
        p_id: id,
        p_title: updates.title || null,
        p_description: updates.description || null,
        p_category: updates.category || null,
        p_tags: updates.tags || null,
        p_is_published: updates.is_published !== undefined ? updates.is_published : null,
        p_is_featured: updates.is_featured !== undefined ? updates.is_featured : null,
        p_display_order: updates.display_order || null
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Update gallery item error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete gallery item and its file
   * @param {string} id - Item ID (UUID)
   * @param {string} filePath - File path in storage (optional)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteGalleryItem(id, filePath = null) {
    try {
      console.log('Deleting gallery item:', { id, filePath })

      // First, try direct delete which should work with UUID
      const { data: deleteData, error: deleteError } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id)
        .select()

      if (deleteError) {
        console.log('Direct delete failed, trying RPC:', deleteError.message)

        // If direct delete fails, try the stored procedure (in case it was updated to handle UUID)
        const { data: rpcData, error: rpcError } = await supabase.rpc('delete_gallery_item', { p_id: id })

        if (rpcError) {
          console.error('Both delete methods failed')
          return { success: false, error: `Failed to delete item: ${deleteError.message}` }
        }
      }

      // Delete file from storage if path provided
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from(this.bucketName)
          .remove([filePath])

        if (storageError) {
          console.warn('Storage deletion warning:', storageError.message)
          // Don't fail the whole operation if storage deletion fails
        }
      }

      console.log('Gallery item deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Delete gallery item error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all gallery items for admin management
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  async getAllGalleryItems() {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      // Ensure file_url contains full public URL
      const itemsWithUrls = (data || []).map(item => {
        // If we have file_path, use it to generate the correct URL
        if (item.file_path) {
          item.file_url = this.getPublicUrl(item.file_path)
        } else if (item.file_url) {
          // If file_url exists but no file_path, try to extract path and fix URL
          if (!item.file_url.startsWith('http')) {
            // It's just a path, generate full URL
            item.file_url = this.getPublicUrl(item.file_url)
          } else if (item.file_url.includes('/gmwb_public/')) {
            // Extract the path portion and regenerate to ensure consistency
            const pathStart = item.file_url.indexOf('/gmwb_public/') + 13
            const path = item.file_url.substring(pathStart)
            if (path) {
              item.file_url = this.getPublicUrl(path)
            }
          }
        }
        return item
      })

      return { success: true, data: itemsWithUrls }
    } catch (error) {
      console.error('Get all gallery items error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get featured gallery images
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  async getFeaturedImages() {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .like('file_type', 'image/%')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        return { success: false, error: error.message }
      }

      // Ensure file_url contains full public URL
      const itemsWithUrls = (data || []).map(item => {
        // If we have file_path, use it to generate the correct URL
        if (item.file_path) {
          item.file_url = this.getPublicUrl(item.file_path)
        } else if (item.file_url) {
          // If file_url exists but no file_path, try to extract path and fix URL
          if (!item.file_url.startsWith('http')) {
            // It's just a path, generate full URL
            item.file_url = this.getPublicUrl(item.file_url)
          } else if (item.file_url.includes('/gmwb_public/')) {
            // Extract the path portion and regenerate to ensure consistency
            const pathStart = item.file_url.indexOf('/gmwb_public/') + 13
            const path = item.file_url.substring(pathStart)
            if (path) {
              item.file_url = this.getPublicUrl(path)
            }
          }
        }
        return item
      })

      return { success: true, data: itemsWithUrls }
    } catch (error) {
      console.error('Get featured images error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Toggle featured status of an image
   * @param {number} id - Item ID
   * @param {boolean} isFeatured - Featured status
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async toggleFeatured(id, isFeatured) {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .update({ is_featured: isFeatured })
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Toggle featured error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get published gallery items for public viewing
   * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
   */
  async getPublishedGalleryItems() {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('published_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      // Ensure file_url contains full public URL
      const itemsWithUrls = (data || []).map(item => {
        // If we have file_path, use it to generate the correct URL
        if (item.file_path) {
          item.file_url = this.getPublicUrl(item.file_path)
        } else if (item.file_url) {
          // If file_url exists but no file_path, try to extract path and fix URL
          if (!item.file_url.startsWith('http')) {
            // It's just a path, generate full URL
            item.file_url = this.getPublicUrl(item.file_url)
          } else if (item.file_url.includes('/gmwb_public/')) {
            // Extract the path portion and regenerate to ensure consistency
            const pathStart = item.file_url.indexOf('/gmwb_public/') + 13
            const path = item.file_url.substring(pathStart)
            if (path) {
              item.file_url = this.getPublicUrl(path)
            }
          }
        }
        return item
      })

      return { success: true, data: itemsWithUrls }
    } catch (error) {
      console.error('Get published gallery items error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get public URL for a file in the storage bucket
   * @param {string} filePath - Path to the file in the bucket
   * @returns {string} Public URL for the file
   */
  getPublicUrl(filePath) {
    if (!filePath) return ''

    // If we have S3 config, use the S3-compatible URL format
    if (hasS3Config()) {
      return getS3FileUrl(filePath)
    }

    // Fallback to Supabase's standard public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    return publicUrl
  }

  /**
   * Generate thumbnail for video file
   * @param {File} videoFile - Video file
   * @returns {Promise<Blob>} Thumbnail blob
   */
  async generateVideoThumbnail(videoFile) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.onloadedmetadata = () => {
        // Set canvas dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Seek to middle of video for thumbnail
        video.currentTime = video.duration / 2
      }

      video.onseeked = () => {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(video.src)
          resolve(blob)
        }, 'image/jpeg', 0.8)
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        reject(new Error('Failed to generate thumbnail'))
      }

      video.src = URL.createObjectURL(videoFile)
    })
  }

  /**
   * Upload with progress tracking
   * @param {File} file - File to upload
   * @param {string} category - Category
   * @param {function} onProgress - Progress callback
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async uploadWithProgress(file, category = 'general', onProgress = null) {
    try {
      // Validate file first
      const validation = this.validateFile(file)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Simulate progress updates during upload
      if (onProgress) {
        onProgress(10) // Starting
      }

      // Generate unique file path
      const fileExtension = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
      const filePath = `${category}/${fileName}`

      if (onProgress) {
        onProgress(30) // File path generated
      }

      console.log('Uploading file to S3-compatible bucket:', {
        bucket: this.bucketName,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        s3Configured: hasS3Config()
      })

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)

        // Handle specific Supabase errors
        if (uploadError.message.includes('Bucket not found')) {
          return {
            success: false,
            error: 'Storage bucket not configured. Please run the gallery setup SQL script.'
          }
        }

        if (uploadError.message.includes('Insufficient permissions')) {
          return {
            success: false,
            error: 'Upload permission denied. Please check your admin role.'
          }
        }

        if (uploadError.message.includes('Object already exists')) {
          // Try with a new filename
          const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-retry.${fileExtension}`
          const newFilePath = `${category}/${newFileName}`

          const { data: retryData, error: retryError } = await supabase.storage
            .from(this.bucketName)
            .upload(newFilePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (retryError) {
            return { success: false, error: `Upload failed (retry): ${retryError.message}` }
          }

          // Use retry data for the rest of the process
          uploadData.path = newFilePath
        } else {
          return { success: false, error: `Upload failed: ${uploadError.message}` }
        }
      }

      if (onProgress) {
        onProgress(70) // Upload complete
      }

      // Get the correct public URL for the uploaded file
      const publicUrl = this.getPublicUrl(uploadData?.path || filePath)

      if (onProgress) {
        onProgress(90) // Getting URL
      }

      // Get file metadata
      const metadata = await this.getFileMetadata(file)

      if (onProgress) {
        onProgress(100) // Complete
      }

      return {
        success: true,
        data: {
          path: uploadData?.path || filePath,
          url: publicUrl,
          size: file.size,
          type: file.type,
          name: file.name,
          ...metadata
        }
      }
    } catch (error) {
      console.error('Upload service error:', error)
      return { success: false, error: `Upload service error: ${error.message}` }
    }
  }
}

export const galleryService = new GalleryService()
export default galleryService