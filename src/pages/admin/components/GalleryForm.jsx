import { useState } from 'react';
import { Upload, Plus, Image } from 'lucide-react';
import { galleryService } from '../../../services/galleryService';

const GalleryForm = ({ onSuccess }) => {
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'concerts',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    setUploadLoading(true);
    setError('');

    try {
      // Upload image to Supabase storage
      const uploadResult = await galleryService.uploadImage(selectedFile, galleryForm.category);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Get image dimensions
      const dimensions = await galleryService.getImageDimensions(selectedFile);

      // Create gallery item in database
      const galleryData = {
        title: galleryForm.title,
        description: galleryForm.description,
        category: galleryForm.category,
        imageUrl: uploadResult.url,
        storagePath: uploadResult.storagePath,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        width: dimensions.width,
        height: dimensions.height,
        date: galleryForm.date
      };

      const createResult = await galleryService.createGalleryItem(galleryData);

      if (createResult.success) {
        alert('Gallery item added successfully!');

        // Reset form
        setGalleryForm({
          title: '',
          description: '',
          category: 'concerts',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setImagePreview('');

        // Notify parent of success
        if (onSuccess) onSuccess();
      } else {
        throw new Error(createResult.error);
      }
    } catch (err) {
      setError('Failed to add gallery item: ' + err.message);
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Image className="h-6 w-6 mr-2 text-accent-600" />
        Add Gallery Item
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="Enter image title"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image <span className="text-red-500">*</span>
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
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-accent-500 transition-colors flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100"
              >
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">
                  {selectedFile ? selectedFile.name : 'Choose an image'}
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="4"
              value={galleryForm.description}
              onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="Enter image description"
            />
          </div>
        </div>

        {imagePreview && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Preview
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-64 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => {
              setGalleryForm({
                title: '',
                description: '',
                category: 'concerts',
                date: new Date().toISOString().split('T')[0]
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
            className="px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading...</span>
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