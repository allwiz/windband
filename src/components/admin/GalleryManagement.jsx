import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { galleryService } from '../../lib/galleryService'
import {
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
  Play,
  Save,
  ExternalLink
} from 'lucide-react'

const GalleryManagement = () => {
  const { user } = useAuth()
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Upload form state
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    description: '',
    category: 'general',
    tags: '',
    is_featured: false,
    uploadType: 'file' // 'file' or 'youtube'
  })

  // YouTube upload state
  const [youtubeData, setYoutubeData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: 'general',
    tags: '',
    is_featured: false
  })

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'concert', label: 'Concerts' },
    { value: 'rehearsal', label: 'Rehearsals' },
    { value: 'event', label: 'Events' },
    { value: 'behind-scenes', label: 'Behind the Scenes' },
    { value: 'masterclass', label: 'Masterclasses' },
    { value: 'community', label: 'Community' }
  ]

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setError('')
      const result = await galleryService.getAllGalleryItems()

      if (result.success) {
        setGalleryItems(result.data)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      setError('Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadData.file || !uploadData.title.trim()) {
      setError('Please select a file and enter a title')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      console.log('Starting file upload process...', {
        file: uploadData.file.name,
        size: uploadData.file.size,
        type: uploadData.file.type,
        category: uploadData.category
      })

      // Upload file to storage directly (we'll handle RLS in the database)
      const uploadResult = await galleryService.uploadWithProgress(
        uploadData.file,
        uploadData.category,
        (progress) => {
          console.log('Upload progress:', progress + '%')
          setUploadProgress(progress)
        }
      )

      console.log('Upload result:', uploadResult)

      if (!uploadResult.success) {
        console.error('Upload failed:', uploadResult.error)
        setError(`Upload failed: ${uploadResult.error}`)
        return
      }

      console.log('File uploaded successfully, creating database entry...')

      // Create gallery item in database
      const createResult = await galleryService.createGalleryItem({
        title: uploadData.title,
        description: uploadData.description,
        type: uploadResult.data.mediaType || 'photo', // Default to photo if no mediaType
        file_url: uploadResult.data.url,
        file_path: uploadResult.data.path,
        file_size: uploadResult.data.size,
        file_type: uploadResult.data.type,
        width: uploadResult.data.width,
        height: uploadResult.data.height,
        duration: uploadResult.data.duration,
        category: uploadData.category,
        tags: uploadData.tags ? uploadData.tags.split(',').map(tag => tag.trim()) : null,
        is_featured: uploadData.is_featured
      })

      console.log('Database result:', createResult)

      if (createResult.success) {
        setSuccess('File uploaded and added to gallery successfully!')
        setShowUploadModal(false)
        resetUploadForm()
        fetchGalleryItems()
      } else {
        console.error('Database creation failed:', createResult.error)
        setError(`Database error: ${createResult.error}`)
      }
    } catch (error) {
      console.error('Upload process error:', error)
      setError(`Upload process failed: ${error.message}`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleYouTubeUpload = async () => {
    if (!youtubeData.youtube_url || !youtubeData.title.trim()) {
      setError('Please enter a YouTube URL and title')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Extract YouTube video ID
      const videoId = extractYouTubeVideoId(youtubeData.youtube_url)
      if (!videoId) {
        setError('Invalid YouTube URL')
        return
      }

      // Create gallery item with YouTube data
      const createResult = await galleryService.createGalleryItem({
        title: youtubeData.title,
        description: youtubeData.description,
        type: 'video',
        external_url: videoId,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        category: youtubeData.category,
        tags: youtubeData.tags ? youtubeData.tags.split(',').map(tag => tag.trim()) : null,
        is_featured: youtubeData.is_featured
      })

      if (createResult.success) {
        setSuccess('YouTube video added successfully!')
        setShowUploadModal(false)
        resetUploadForm()
        fetchGalleryItems()
      } else {
        setError(createResult.error)
      }
    } catch (error) {
      console.error('YouTube upload error:', error)
      setError('Failed to add YouTube video: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const extractYouTubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const resetUploadForm = () => {
    setUploadData({
      file: null,
      title: '',
      description: '',
      category: 'general',
      tags: '',
      is_featured: false,
      uploadType: 'file'
    })
    setYoutubeData({
      title: '',
      description: '',
      youtube_url: '',
      category: 'general',
      tags: '',
      is_featured: false
    })
  }

  const handleEdit = (item) => {
    setEditingItem({
      ...item,
      tags: item.tags ? item.tags.join(', ') : ''
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingItem.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      const result = await galleryService.updateGalleryItem(editingItem.id, {
        title: editingItem.title,
        description: editingItem.description,
        category: editingItem.category,
        tags: editingItem.tags ? editingItem.tags.split(',').map(tag => tag.trim()) : null,
        is_published: editingItem.is_published,
        is_featured: editingItem.is_featured,
        display_order: editingItem.display_order
      })

      if (result.success) {
        setSuccess('Item updated successfully!')
        setShowEditModal(false)
        setEditingItem(null)
        fetchGalleryItems()
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Edit error:', error)
      setError('Failed to update item')
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return
    }

    try {
      const result = await galleryService.deleteGalleryItem(item.id, item.file_path)

      if (result.success) {
        setSuccess('Item deleted successfully!')
        fetchGalleryItems()
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setError('Failed to delete item')
    }
  }

  const togglePublished = async (item) => {
    try {
      const result = await galleryService.updateGalleryItem(item.id, {
        is_published: !item.is_published
      })

      if (result.success) {
        setSuccess(`Item ${!item.is_published ? 'published' : 'unpublished'}!`)
        fetchGalleryItems()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to update item')
    }
  }

  const toggleFeatured = async (item) => {
    try {
      const result = await galleryService.updateGalleryItem(item.id, {
        is_featured: !item.is_featured
      })

      if (result.success) {
        setSuccess(`Item ${!item.is_featured ? 'featured' : 'unfeatured'}!`)
        fetchGalleryItems()
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('Failed to update item')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900">
            Gallery Management
          </h2>
          <p className="text-gray-600">
            Upload and manage photos and videos for the gallery
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Media
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X className="h-4 w-4 text-green-600" />
          </button>
        </div>
      )}

      {/* Gallery Items */}
      <div className="card">
        {galleryItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Media</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleryItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                          {(() => {
                            const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMjAwIiBzdHlsZT0iZmlsbDojOTk5O2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWY7Zm9udC1zaXplOjE4cHg7Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            let imageSrc;

                            if (item.type === 'video') {
                              imageSrc = item.thumbnail_url || (item.external_url ? `https://img.youtube.com/vi/${item.external_url}/maxresdefault.jpg` : placeholderImg);
                            } else {
                              imageSrc = item.file_url || item.external_url || placeholderImg;
                            }

                            return (
                              <img
                                src={imageSrc}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = placeholderImg;
                                }}
                              />
                            );
                          })()}
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className={`p-1 rounded ${
                          item.type === 'video' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'
                        }`}>
                          {item.type === 'video' ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <ImageIcon className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.is_published ? 'Published' : 'Draft'}
                        </span>
                        {item.is_featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 justify-end">
                        <button
                          onClick={() => togglePublished(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={item.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {item.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFeatured(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title={item.is_featured ? 'Unfeature' : 'Feature'}
                        >
                          {item.is_featured ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first photo or video</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-gray-900">
                  Add Media to Gallery
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    resetUploadForm()
                    setError('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Upload Type Selector */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setUploadData(prev => ({ ...prev, uploadType: 'file' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    uploadData.uploadType === 'file'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  onClick={() => setUploadData(prev => ({ ...prev, uploadType: 'youtube' }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                    uploadData.uploadType === 'youtube'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ExternalLink className="h-4 w-4 inline mr-2" />
                  YouTube Video
                </button>
              </div>

              {uploadData.uploadType === 'file' ? (
                // File Upload Form
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {uploadData.file ? uploadData.file.name : 'Click to select file'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Images and videos up to 50MB
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="Enter title..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="Enter description..."
                    />
                  </div>

                  {/* Category and Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={uploadData.category}
                        onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={uploadData.tags}
                        onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={uploadData.is_featured}
                      onChange={(e) => setUploadData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      Feature this item
                    </label>
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-accent-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={handleFileUpload}
                      disabled={uploading || !uploadData.file || !uploadData.title.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        resetUploadForm()
                        setError('')
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // YouTube Upload Form
                <div className="space-y-4">
                  {/* YouTube URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube URL *
                    </label>
                    <input
                      type="url"
                      value={youtubeData.youtube_url}
                      onChange={(e) => setYoutubeData(prev => ({ ...prev, youtube_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={youtubeData.title}
                      onChange={(e) => setYoutubeData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="Enter title..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={youtubeData.description}
                      onChange={(e) => setYoutubeData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="Enter description..."
                    />
                  </div>

                  {/* Category and Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={youtubeData.category}
                        onChange={(e) => setYoutubeData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={youtubeData.tags}
                        onChange={(e) => setYoutubeData(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="youtube-featured"
                      checked={youtubeData.is_featured}
                      onChange={(e) => setYoutubeData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                    />
                    <label htmlFor="youtube-featured" className="ml-2 text-sm text-gray-700">
                      Feature this video
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={handleYouTubeUpload}
                      disabled={uploading || !youtubeData.youtube_url || !youtubeData.title.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Adding...' : 'Add Video'}
                    </button>
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        resetUploadForm()
                        setError('')
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-gray-900">
                  Edit Gallery Item
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                    setError('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>

              {/* Category and Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={editingItem.tags}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              {/* Status Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-published"
                    checked={editingItem.is_published}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_published: e.target.checked }))}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-published" className="ml-2 text-sm text-gray-700">
                    Published
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editingItem.is_featured}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-featured" className="ml-2 text-sm text-gray-700">
                    Featured
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="btn-primary inline-flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingItem(null)
                    setError('')
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryManagement