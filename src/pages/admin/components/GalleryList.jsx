import { useState, useEffect } from 'react';
import { List, Plus, Eye, Trash2, Image, Edit } from 'lucide-react';
import { galleryService } from '../../../services/galleryService';

const GalleryList = ({ onAddNew, onEdit }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setLoading(true);
    const result = await galleryService.getGalleryItems();
    if (result.success) {
      setGalleryItems(result.data);
    }
    setLoading(false);
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    const result = await galleryService.deleteGalleryItem(id);
    if (result.success) {
      fetchGalleryItems();
    } else {
      alert('Failed to delete gallery item: ' + result.error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <List className="h-6 w-6 mr-2 text-accent" />
          Gallery Items
        </div>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add New</span>
        </button>
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No gallery items found</p>
          <button
            onClick={onAddNew}
            className="mt-4 px-6 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {item.category} • {new Date(item.date + 'T00:00:00').toLocaleDateString()}
                </p>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(item.image_url, '_blank')}
                      className="text-gray-600 hover:text-accent"
                      title="View Full Image"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(item)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
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

export default GalleryList;