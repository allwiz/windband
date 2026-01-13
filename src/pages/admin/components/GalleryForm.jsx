import { useState, useEffect } from 'react';
import { Upload, Plus, Image, Save, Video, Link } from 'lucide-react';
import { galleryService } from '../../../services/galleryService';
import RichTextEditor from '../../../components/RichTextEditor';

// Helper function to extract YouTube video ID from various URL formats
const extractYouTubeId = (url) => {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// Get YouTube thumbnail URL from video ID
const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const GalleryForm = ({ onSuccess, editItem = null }) => {
  const [mediaType, setMediaType] = useState('image');
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'concerts',
    date: new Date().toISOString().split('T')[0],
    youtubeUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  // Load edit data when editItem changes
  useEffect(() => {
    if (editItem) {
      setMediaType(editItem.media_type || 'image');
      setGalleryForm({
        title: editItem.title || '',
        description: editItem.description || '',
        category: editItem.category || 'concerts',
        date: editItem.date || new Date().toISOString().split('T')[0],
        youtubeUrl: editItem.youtube_url || ''
      });
      if (editItem.media_type === 'video' && editItem.youtube_url) {
        const videoId = extractYouTubeId(editItem.youtube_url);
        setImagePreview(getYouTubeThumbnail(videoId));
      } else {
        setImagePreview(editItem.image_url || '');
      }
    }
  }, [editItem]);

  // Update preview when YouTube URL changes
  useEffect(() => {
    if (mediaType === 'video' && galleryForm.youtubeUrl) {
      const videoId = extractYouTubeId(galleryForm.youtubeUrl);
      if (videoId) {
        setImagePreview(getYouTubeThumbnail(videoId));
      } else {
        setImagePreview('');
      }
    }
  }, [mediaType, galleryForm.youtubeUrl]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    // Reset previews and file selection when switching types
    setSelectedFile(null);
    setImagePreview('');
    if (type === 'image') {
      setGalleryForm(prev => ({ ...prev, youtubeUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on media type
    if (mediaType === 'image') {
      if (!editItem && !selectedFile) {
        alert('Please select an image file');
        return;
      }
    } else if (mediaType === 'video') {
      if (!galleryForm.youtubeUrl) {
        alert('Please enter a YouTube URL');
        return;
      }
      const videoId = extractYouTubeId(galleryForm.youtubeUrl);
      if (!videoId) {
        alert('Please enter a valid YouTube URL');
        return;
      }
    }

    setUploadLoading(true);
    setError('');

    try {
      let imageUrl = editItem?.image_url;
      let storagePath = editItem?.storage_path;
      let fileSize = editItem?.file_size;
      let mimeType = editItem?.mime_type;
      let width = editItem?.width;
      let height = editItem?.height;

      if (mediaType === 'image') {
        // Upload new image if selected
        if (selectedFile) {
          const uploadResult = await galleryService.uploadImage(selectedFile, galleryForm.category);

          if (!uploadResult.success) {
            throw new Error(uploadResult.error);
          }

          // Get image dimensions
          const dimensions = await galleryService.getImageDimensions(selectedFile);

          imageUrl = uploadResult.url;
          storagePath = uploadResult.storagePath;
          fileSize = uploadResult.fileSize;
          mimeType = uploadResult.mimeType;
          width = dimensions.width;
          height = dimensions.height;
        }
      } else if (mediaType === 'video') {
        // For videos, use YouTube thumbnail as image_url
        const videoId = extractYouTubeId(galleryForm.youtubeUrl);
        imageUrl = getYouTubeThumbnail(videoId);
        storagePath = null;
        fileSize = null;
        mimeType = 'video/youtube';
        width = 480;
        height = 360;
      }

      const galleryData = {
        title: galleryForm.title,
        description: galleryForm.description,
        category: galleryForm.category,
        imageUrl: imageUrl,
        storagePath: storagePath,
        fileSize: fileSize,
        mimeType: mimeType,
        width: width,
        height: height,
        date: galleryForm.date,
        mediaType: mediaType,
        youtubeUrl: mediaType === 'video' ? galleryForm.youtubeUrl : null
      };

      let result;
      if (editItem) {
        // Update existing item
        result = await galleryService.updateGalleryItem(editItem.id, {
          title: galleryData.title,
          description: galleryData.description,
          category: galleryData.category,
          image_url: galleryData.imageUrl,
          storage_path: galleryData.storagePath,
          file_size: galleryData.fileSize,
          mime_type: galleryData.mimeType,
          width: galleryData.width,
          height: galleryData.height,
          date: galleryData.date,
          media_type: galleryData.mediaType,
          youtube_url: galleryData.youtubeUrl
        });
      } else {
        // Create new item
        result = await galleryService.createGalleryItem(galleryData);
      }

      if (result.success) {
        alert(editItem ? 'Gallery item updated successfully!' : 'Gallery item added successfully!');

        // Reset form
        setMediaType('image');
        setGalleryForm({
          title: '',
          description: '',
          category: 'concerts',
          date: new Date().toISOString().split('T')[0],
          youtubeUrl: ''
        });
        setSelectedFile(null);
        setImagePreview('');

        // Notify parent of success
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError((editItem ? 'Failed to update gallery item: ' : 'Failed to add gallery item: ') + err.message);
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        {mediaType === 'video' ? (
          <Video className="h-6 w-6 mr-2 text-accent" />
        ) : (
          <Image className="h-6 w-6 mr-2 text-accent" />
        )}
        {editItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
        {/* Media Type Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleMediaTypeChange('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                mediaType === 'image'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Image className="h-4 w-4" />
              Image
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeChange('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                mediaType === 'video'
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <Video className="h-4 w-4" />
              YouTube Video
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={galleryForm.title}
              onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder={mediaType === 'video' ? 'Enter video title' : 'Enter image title'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={galleryForm.category}
              onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="concerts">Concerts</option>
              <option value="rehearsals">Rehearsals</option>
              <option value="events">Events</option>
              <option value="members">Members</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={galleryForm.date}
              onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {mediaType === 'image' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image {!editItem && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-accent transition-colors flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100"
                >
                  <Upload className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600">
                    {selectedFile ? selectedFile.name : 'Choose an image'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Max file size: 50MB</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={galleryForm.youtubeUrl}
                  onChange={(e) => setGalleryForm({ ...galleryForm, youtubeUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Paste a YouTube video URL or video ID</p>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={galleryForm.description}
              onChange={(html) => setGalleryForm({ ...galleryForm, description: html })}
              placeholder={mediaType === 'video' ? 'Enter video description' : 'Enter image description'}
            />
          </div>
        </div>

        {imagePreview && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mediaType === 'video' ? 'Video Thumbnail Preview' : 'Image Preview'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-64 object-contain mx-auto"
              />
              {mediaType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-red-600 rounded-full p-4">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => {
              setMediaType('image');
              setGalleryForm({
                title: '',
                description: '',
                category: 'concerts',
                date: new Date().toISOString().split('T')[0],
                youtubeUrl: ''
              });
              setSelectedFile(null);
              setImagePreview('');
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={uploadLoading}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{mediaType === 'video' ? 'Saving...' : 'Uploading...'}</span>
              </>
            ) : editItem ? (
              <>
                <Save className="h-5 w-5" />
                <span>Update Gallery Item</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add to Gallery</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GalleryForm;
