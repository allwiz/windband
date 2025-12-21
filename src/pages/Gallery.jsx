import { useState, useEffect, useCallback } from 'react';
import { Search, X, Calendar, Tag, Image, Grid3X3, GalleryHorizontal, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { galleryService } from '../services/galleryService';

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'carousel'
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  // Reset carousel index when filter changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [selectedCategory, searchQuery]);

  // Carousel navigation
  const goToPrevious = useCallback(() => {
    setCarouselIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  }, [filteredItems.length]);

  const goToNext = useCallback(() => {
    setCarouselIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  }, [filteredItems.length]);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (viewMode !== 'carousel' || filteredItems.length === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredItems.length, goToPrevious, goToNext]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedImage(filteredItems[currentIndex - 1]);
      }
      if (e.key === 'ArrowRight' && currentIndex < filteredItems.length - 1) {
        setSelectedImage(filteredItems[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredItems]);

  const navigateLightbox = (direction) => {
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedImage(filteredItems[currentIndex - 1]);
    }
    if (direction === 'next' && currentIndex < filteredItems.length - 1) {
      setSelectedImage(filteredItems[currentIndex + 1]);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-4">
              Memories
            </div>
            <h1 className="heading-title mb-4">Photo Gallery</h1>
            <p className="text-lg text-gray-500">
              Explore memorable moments from our concerts, rehearsals, and special events.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-5 border-y border-gray-100 sticky top-16 bg-white/80 backdrop-blur-xl z-40">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-small bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('carousel')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'carousel'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Carousel View"
                >
                  <GalleryHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 text-small font-medium rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category.value
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="section">
        <div className="container-main">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="icon-box icon-box-lg mx-auto mb-4">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="btn btn-secondary"
              >
                Clear filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item)}
                  className="card card-hover cursor-pointer group"
                >
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden flex items-center justify-center relative">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                        <ZoomIn className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-small text-gray-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.date + 'T00:00:00').toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Carousel View */
            <div className="max-w-6xl mx-auto">
              {/* Main Carousel with Side Previews */}
              <div className="relative">
                <div className="flex items-center justify-center gap-4">
                  {/* Previous Image Preview */}
                  <div
                    className="hidden md:block w-1/6 flex-shrink-0 cursor-pointer opacity-40 hover:opacity-60 transition-opacity"
                    onClick={goToPrevious}
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={filteredItems[carouselIndex === 0 ? filteredItems.length - 1 : carouselIndex - 1]?.image_url}
                        alt="Previous"
                        className="w-full h-full object-cover blur-[1px]"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>

                  {/* Main Image */}
                  <div className="flex-1 max-w-4xl relative">
                    <div
                      className="aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer group shadow-lg"
                      onClick={() => setSelectedImage(filteredItems[carouselIndex])}
                    >
                      <img
                        src={filteredItems[carouselIndex]?.image_url}
                        alt={filteredItems[carouselIndex]?.title}
                        className="w-full h-full object-contain transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center rounded-2xl">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg">
                          <ZoomIn className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:bg-white hover:scale-110 transition-all z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:bg-white hover:scale-110 transition-all z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-small">
                      {carouselIndex + 1} / {filteredItems.length}
                    </div>
                  </div>

                  {/* Next Image Preview */}
                  <div
                    className="hidden md:block w-1/6 flex-shrink-0 cursor-pointer opacity-40 hover:opacity-60 transition-opacity"
                    onClick={goToNext}
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={filteredItems[carouselIndex === filteredItems.length - 1 ? 0 : carouselIndex + 1]?.image_url}
                        alt="Next"
                        className="w-full h-full object-cover blur-[1px]"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Info */}
              <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {filteredItems[carouselIndex]?.title}
                </h2>
                <div className="flex items-center justify-center gap-4 text-small text-gray-500">
                  <span className="badge">
                    {filteredItems[carouselIndex]?.category.charAt(0).toUpperCase() + filteredItems[carouselIndex]?.category.slice(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(filteredItems[carouselIndex]?.date + 'T00:00:00').toLocaleDateString()}
                  </span>
                </div>
                {filteredItems[carouselIndex]?.description && (
                  <div
                    className="mt-3 text-gray-600 max-w-2xl mx-auto prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: filteredItems[carouselIndex]?.description }}
                  />
                )}
              </div>

              {/* Thumbnail Strip */}
              <div className="mt-8">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setCarouselIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === carouselIndex
                          ? 'border-gray-900 ring-2 ring-gray-900/20'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3C/svg%3E';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard hint */}
              <p className="mt-4 text-center text-tiny text-gray-400">
                Use arrow keys to navigate
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {filteredItems.findIndex(item => item.id === selectedImage.id) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {filteredItems.findIndex(item => item.id === selectedImage.id) < filteredItems.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full max-h-[75vh] object-contain rounded-lg animate-fade-up"
            />
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">{selectedImage.title}</h2>
              <div className="flex items-center justify-center gap-4 text-small text-white/60">
                <span className="badge bg-white/10 text-white/80">
                  {selectedImage.category.charAt(0).toUpperCase() + selectedImage.category.slice(1)}
                </span>
                <span>{new Date(selectedImage.date + 'T00:00:00').toLocaleDateString()}</span>
                <span>
                  {filteredItems.findIndex(item => item.id === selectedImage.id) + 1} / {filteredItems.length}
                </span>
              </div>
              {selectedImage.description && (
                <div
                  className="mt-3 text-white/70 max-w-2xl mx-auto"
                  dangerouslySetInnerHTML={{ __html: selectedImage.description }}
                />
              )}
              <p className="mt-4 text-tiny text-white/40">
                Use arrow keys to navigate • Press Escape to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
