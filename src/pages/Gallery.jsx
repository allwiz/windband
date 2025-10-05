import { useState, useEffect } from 'react';
import { Search, X, Calendar, Tag } from 'lucide-react';
import { galleryService } from '../services/galleryService';

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    setLoading(true);
    const result = await galleryService.getGalleryItems({ isActive: true });
    if (result.success) {
      setGalleryItems(result.data);
    }
    setLoading(false);
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'concerts', label: 'Concerts' },
    { value: 'rehearsals', label: 'Rehearsals' },
    { value: 'events', label: 'Events' },
    { value: 'members', label: 'Members' },
    { value: 'general', label: 'General' },
  ];

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="container-custom pt-24 pb-16">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
            Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Explore memorable moments from our concerts, rehearsals, and special events
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No images found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="16"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  {item.description && (
                    <div
                      className="mt-2 text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="max-w-6xl max-h-[90vh] relative">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                <div className="flex items-center gap-4 mb-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                  </span>
                  <span>{new Date(selectedImage.date).toLocaleDateString()}</span>
                </div>
                {selectedImage.description && (
                  <div
                    className="text-white/80 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedImage.description }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;