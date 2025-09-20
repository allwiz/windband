import { useState, useEffect } from 'react'
import { db } from '../lib/database'
import {
  Play,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all') // all, photos, videos
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let mounted = true

    const initializeGallery = async () => {
      try {
        if (mounted) {
          await fetchGalleryItems()
        }
      } catch (err) {
        console.error('Gallery initialization error:', err)
        if (mounted) {
          setError('Failed to load gallery')
          setSampleData()
        }
      }
    }

    initializeGallery()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    filterItems()
  }, [galleryItems, filter, searchTerm])

  const fetchGalleryItems = async () => {
    try {
      setError(null)

      // Use the new database service with timeout and retry
      const data = await db.fetchGalleryItems()

      // Successfully fetched data from database
      if (data && data.length > 0) {
        console.info(`Successfully loaded ${data.length} gallery items from database`)
        setGalleryItems(data)
      } else {
        // If database is empty, show message but don't use sample data
        console.info('No gallery items found in database')
        setGalleryItems([])
        setError(null) // Clear any previous errors
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error)

      // Handle specific error types
      if (error.message.includes('timed out')) {
        setError('Database connection timed out. Using sample data for demonstration.')
      } else if (error.message.includes('relation "gallery_items" does not exist') ||
                 error.code === '42P01' ||
                 error.code === 'PGRST116') {
        setError('Database table not configured. Using sample data for demonstration.')
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        setError('Unable to connect to database. Please check your internet connection.')
      } else {
        setError(`Database error: ${error.message}`)
      }

      // Always use sample data on error
      setSampleData()
    } finally {
      setLoading(false)
    }
  }

  const setSampleData = () => {
    const sampleData = [
      {
        id: '1',
        title: 'Holiday Concert 2024',
        description: 'Our annual holiday concert featuring classical and contemporary holiday favorites',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-12-15'
      },
      {
        id: '2',
        title: 'Concert Performance Highlights',
        description: 'Highlights from our recent performance featuring Holst\'s "First Suite in E-flat"',
        type: 'video',
        url: 'dQw4w9WgXcQ', // YouTube video ID
        thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-11-20'
      },
      {
        id: '3',
        title: 'Rehearsal Behind the Scenes',
        description: 'A glimpse into our weekly rehearsals at the community center',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-11-15'
      },
      {
        id: '4',
        title: 'Wind Ensemble Masterclass',
        description: 'Recording of our masterclass session with renowned conductor Dr. Andrew Park',
        type: 'video',
        url: 'jNQXAC9IVRw', // YouTube video ID
        thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-10-30'
      },
      {
        id: '5',
        title: 'Spring Concert Series',
        description: 'Beautiful moments captured during our spring concert series at the park pavilion',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-05-18'
      },
      {
        id: '6',
        title: 'New Member Auditions',
        description: 'Welcoming new talented musicians to our ensemble family',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        created_at: '2024-09-10'
      }
    ]
    setGalleryItems(sampleData)
  }

  const filterItems = () => {
    let filtered = galleryItems

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(item =>
        filter === 'photos' ? item.type === 'photo' : item.type === 'video'
      )
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }

  const openModal = (item) => {
    setSelectedItem(item)
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    document.body.style.overflow = 'unset'
  }

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!showModal) return

      switch (event.key) {
        case 'Escape':
          closeModal()
          break
        case 'ArrowLeft':
          event.preventDefault()
          navigateModal('prev')
          break
        case 'ArrowRight':
          event.preventDefault()
          navigateModal('next')
          break
      }
    }

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal, selectedItem, filteredItems])

  const navigateModal = (direction) => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id)
    let newIndex

    if (direction === 'next') {
      newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1
    }

    setSelectedItem(filteredItems[newIndex])
  }

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  }

  const getYouTubeThumbnail = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  // Show error message if there's an error
  const errorMessage = error && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8">
      <div className="flex items-center">
        <div className="text-yellow-600">
          ⚠️ {error}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-hero font-display text-gray-900 mb-6">
              Gallery
            </h1>
            <p className="text-large text-gray-600 mb-8 leading-relaxed">
              Explore our musical journey through photos and videos from concerts, rehearsals, and special events
            </p>

            {/* Error Message */}
            {errorMessage}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>

              {/* Type Filter */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('photos')}
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-colors ${
                    filter === 'photos'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setFilter('videos')}
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-colors ${
                    filter === 'videos'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openModal(item)}
                  className="group cursor-pointer hover-lift"
                >
                  <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-200">
                    <img
                      src={item.type === 'video' ? (item.thumbnail || getYouTubeThumbnail(item.url)) : item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Video Overlay */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors">
                        <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 transition-colors">
                          <Play className="h-6 w-6 text-gray-900 ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`p-2 rounded-full ${
                        item.type === 'video'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.type === 'video' ? (
                          <Play className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    {item.created_at && (
                      <div className="flex items-center space-x-2 mt-4 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Gallery items will appear here'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 lg:p-8">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={() => navigateModal('prev')}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigateModal('next')}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="flex flex-col lg:flex-row h-full">
              {/* Media Section */}
              <div className="flex-1 lg:flex-[2] relative bg-black">
                {selectedItem.type === 'video' ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedItem.url)}
                    title={selectedItem.title}
                    className="w-full h-full min-h-[60vh] lg:min-h-full"
                    style={{ border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full min-h-[60vh] lg:min-h-full">
                    <img
                      src={selectedItem.url}
                      alt={selectedItem.title}
                      className="w-full h-full object-contain"
                    />
                    {/* Image zoom indicator */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      Click to zoom
                    </div>
                  </div>
                )}
              </div>

              {/* Details Panel */}
              <div className="lg:w-96 lg:flex-shrink-0 bg-white p-8 lg:p-10 overflow-y-auto">
                {/* Content Type Badge */}
                <div className="mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedItem.type === 'video'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedItem.type === 'video' ? (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Video
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Photo
                      </>
                    )}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {selectedItem.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {selectedItem.description}
                </p>

                {/* Metadata */}
                {selectedItem.created_at && (
                  <div className="flex items-center space-x-3 text-gray-500 mb-8 pb-6 border-b border-gray-200">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date</p>
                      <p className="text-sm">{new Date(selectedItem.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {selectedItem.type === 'video' && (
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedItem.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Watch on YouTube
                    </a>
                  )}

                  {selectedItem.type === 'photo' && (
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      View Full Size
                    </a>
                  )}

                  <button
                    onClick={closeModal}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>

                {/* Navigation Info */}
                {filteredItems.length > 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      {filteredItems.findIndex(item => item.id === selectedItem.id) + 1} of {filteredItems.length}
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                      Use arrow keys or buttons to navigate
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery