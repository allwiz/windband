import { useState } from 'react';
import { Upload, Plus, Music } from 'lucide-react';
import { performanceService } from '../../../services/performanceService';
import RichTextEditor from '../../../components/RichTextEditor';

const PerformanceForm = ({ onSuccess }) => {
  const [performanceForm, setPerformanceForm] = useState({
    title: '',
    description: '',
    category: 'concert',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    ticketLink: '',
    isFeatured: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setUploadLoading(true);
    setError('');

    try {
      let imageData = {};

      // Upload image if selected
      if (selectedFile) {
        const uploadResult = await performanceService.uploadImage(selectedFile, performanceForm.category);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error);
        }

        const dimensions = await performanceService.getImageDimensions(selectedFile);

        imageData = {
          imageUrl: uploadResult.url,
          storagePath: uploadResult.storagePath,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          width: dimensions.width,
          height: dimensions.height
        };
      }

      const performanceData = {
        title: performanceForm.title,
        description: performanceForm.description,
        category: performanceForm.category,
        venue: performanceForm.venue,
        date: performanceForm.date,
        startTime: performanceForm.startTime,
        endTime: performanceForm.endTime,
        ticketLink: performanceForm.ticketLink,
        isFeatured: performanceForm.isFeatured,
        ...imageData
      };

      const createResult = await performanceService.createPerformanceItem(performanceData);

      if (createResult.success) {
        alert('Performance added successfully!');

        setPerformanceForm({
          title: '',
          description: '',
          category: 'concert',
          venue: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          ticketLink: '',
          isFeatured: false
        });
        setSelectedFile(null);
        setImagePreview('');

        if (onSuccess) onSuccess();
      } else {
        throw new Error(createResult.error);
      }
    } catch (err) {
      setError('Failed to add performance: ' + err.message);
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Music className="h-6 w-6 mr-2 text-accent" />
        Add Performance
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
              value={performanceForm.title}
              onChange={(e) => setPerformanceForm({ ...performanceForm, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter performance title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={performanceForm.category}
              onChange={(e) => setPerformanceForm({ ...performanceForm, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="concert">Concert</option>
              <option value="competition">Competition</option>
              <option value="festival">Festival</option>
              <option value="recital">Recital</option>
              <option value="community">Community Event</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue
            </label>
            <input
              type="text"
              value={performanceForm.venue}
              onChange={(e) => setPerformanceForm({ ...performanceForm, venue: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="Enter venue name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={performanceForm.date}
              onChange={(e) => setPerformanceForm({ ...performanceForm, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={performanceForm.startTime}
              onChange={(e) => setPerformanceForm({ ...performanceForm, startTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={performanceForm.endTime}
              onChange={(e) => setPerformanceForm({ ...performanceForm, endTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Link
            </label>
            <input
              type="url"
              value={performanceForm.ticketLink}
              onChange={(e) => setPerformanceForm({ ...performanceForm, ticketLink: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image (Optional)
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={performanceForm.isFeatured}
              onChange={(e) => setPerformanceForm({ ...performanceForm, isFeatured: e.target.checked })}
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured Performance
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <RichTextEditor
              value={performanceForm.description}
              onChange={(html) => setPerformanceForm({ ...performanceForm, description: html })}
              placeholder="Enter performance description"
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
              setPerformanceForm({
                title: '',
                description: '',
                category: 'concert',
                venue: '',
                date: new Date().toISOString().split('T')[0],
                startTime: '',
                endTime: '',
                ticketLink: '',
                isFeatured: false
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add Performance</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PerformanceForm;
