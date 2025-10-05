import { useState, useEffect } from 'react';
import { List, Plus, Eye, Trash2, Music, Star, MapPin, Calendar, Clock } from 'lucide-react';
import { performanceService } from '../../../services/performanceService';

const PerformanceList = ({ onAddNew }) => {
  const [performanceItems, setPerformanceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceItems();
  }, []);

  const fetchPerformanceItems = async () => {
    setLoading(true);
    const result = await performanceService.getPerformanceItems();
    if (result.success) {
      setPerformanceItems(result.data);
    }
    setLoading(false);
  };

  const handleDeletePerformanceItem = async (id) => {
    if (!confirm('Are you sure you want to delete this performance?')) {
      return;
    }

    const result = await performanceService.deletePerformanceItem(id);
    if (result.success) {
      fetchPerformanceItems();
    } else {
      alert('Failed to delete performance: ' + result.error);
    }
  };

  const handleToggleFeatured = async (item) => {
    const result = await performanceService.updatePerformanceItem(item.id, {
      is_featured: !item.is_featured
    });
    if (result.success) {
      fetchPerformanceItems();
    } else {
      alert('Failed to update performance: ' + result.error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <List className="h-6 w-6 mr-2 text-accent-600" />
          Performances
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
      ) : performanceItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No performances found</p>
          <button
            onClick={onAddNew}
            className="mt-4 px-6 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors"
          >
            Add First Performance
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {performanceItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {item.image_url && (
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{item.title}</h3>
                  {item.is_featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>

                  {item.start_time && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {item.start_time}
                        {item.end_time && ` - ${item.end_time}`}
                      </span>
                    </div>
                  )}

                  {item.venue && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{item.venue}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`text-sm flex items-center space-x-1 ${
                      item.is_featured
                        ? 'text-yellow-600 hover:text-yellow-700'
                        : 'text-gray-600 hover:text-yellow-600'
                    }`}
                    title="Toggle Featured"
                  >
                    <Star className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} />
                    <span>{item.is_featured ? 'Featured' : 'Feature'}</span>
                  </button>

                  <div className="flex space-x-2">
                    {item.ticket_link && (
                      <button
                        onClick={() => window.open(item.ticket_link, '_blank')}
                        className="text-gray-600 hover:text-accent-600"
                        title="View Tickets"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePerformanceItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceList;
