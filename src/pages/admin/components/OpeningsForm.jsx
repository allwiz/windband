import { useState, useEffect } from 'react';
import { Plus, Save, Music } from 'lucide-react';
import { openingsService } from '../../../services/openingsService';

const OpeningsForm = ({ onSuccess, editItem = null }) => {
  const [openingForm, setOpeningForm] = useState({
    instrumentName: '',
    openingsCount: 1,
    description: '',
    isActive: true,
    priority: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const instrumentOptions = [
    'Flute',
    'Clarinet',
    'Saxophone',
    'Trumpet',
    'French Horn',
    'Trombone',
    'Euphonium',
    'Tuba',
    'Percussion'
  ];

  // Load edit data when editItem changes
  useEffect(() => {
    if (editItem) {
      setOpeningForm({
        instrumentName: editItem.instrument_name || '',
        openingsCount: editItem.openings_count || 1,
        description: editItem.description || '',
        isActive: editItem.is_active !== undefined ? editItem.is_active : true,
        priority: editItem.priority || 0
      });
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (editItem) {
        // Update existing opening
        result = await openingsService.updateOpening(editItem.id, openingForm);
      } else {
        // Create new opening
        result = await openingsService.createOpening(openingForm);
      }

      if (result.success) {
        alert(editItem ? 'Opening updated successfully!' : 'Opening added successfully!');

        // Reset form
        setOpeningForm({
          instrumentName: '',
          openingsCount: 1,
          description: '',
          isActive: true,
          priority: 0
        });

        // Notify parent of success
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError((editItem ? 'Failed to update opening: ' : 'Failed to add opening: ') + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Music className="h-6 w-6 mr-2 text-accent-600" />
        {editItem ? 'Edit Opening' : 'Add New Opening'}
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
              Instrument Name <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={openingForm.instrumentName}
              onChange={(e) => setOpeningForm({ ...openingForm, instrumentName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
            >
              <option value="">Select an instrument</option>
              {instrumentOptions.map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Openings <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              max="10"
              value={openingForm.openingsCount}
              onChange={(e) => setOpeningForm({ ...openingForm, openingsCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (higher = shown first)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={openingForm.priority}
              onChange={(e) => setOpeningForm({ ...openingForm, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Higher priority items appear first on the Join page</p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={openingForm.isActive}
              onChange={(e) => setOpeningForm({ ...openingForm, isActive: e.target.checked })}
              className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (visible on Join page)
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows="3"
              value={openingForm.description}
              onChange={(e) => setOpeningForm({ ...openingForm, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="e.g., Including piccolo parts, Strong sight-readers, Multi-percussion skills preferred"
            />
            <p className="text-xs text-gray-500 mt-1">Brief description of the opening requirements or details</p>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => {
              setOpeningForm({
                instrumentName: '',
                openingsCount: 1,
                description: '',
                isActive: true,
                priority: 0
              });
              setError('');
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : editItem ? (
              <>
                <Save className="h-5 w-5" />
                <span>Update Opening</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add Opening</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OpeningsForm;
