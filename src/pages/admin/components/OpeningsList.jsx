import { useState, useEffect } from 'react';
import { List, Plus, Edit, Trash2, Music, ToggleLeft, ToggleRight } from 'lucide-react';
import { openingsService } from '../../../services/openingsService';

const OpeningsList = ({ onAddNew, onEdit }) => {
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    setLoading(true);
    const result = await openingsService.getOpenings();
    if (result.success) {
      setOpenings(result.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this opening?')) {
      return;
    }

    const result = await openingsService.deleteOpening(id);
    if (result.success) {
      fetchOpenings();
    } else {
      alert('Failed to delete opening: ' + result.error);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const result = await openingsService.toggleActive(id, !currentStatus);
    if (result.success) {
      fetchOpenings();
    } else {
      alert('Failed to toggle status: ' + result.error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <List className="h-6 w-6 mr-2 text-accent-600" />
          Current Openings
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </button>
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
        </div>
      ) : openings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No openings found</p>
          <button
            onClick={onAddNew}
            className="px-6 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors"
          >
            Add First Opening
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openings.map((opening) => (
            <div
              key={opening.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {opening.instrument_name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-brass-100 text-brass-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {opening.openings_count} opening{opening.openings_count > 1 ? 's' : ''}
                      </span>
                      {opening.priority > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          Priority: {opening.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {opening.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {opening.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleActive(opening.id, opening.is_active)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      opening.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={opening.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {opening.is_active ? (
                      <>
                        <ToggleRight className="h-4 w-4" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit && onEdit(opening)}
                      className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(opening.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Created: {new Date(opening.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpeningsList;
