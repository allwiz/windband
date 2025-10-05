import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Ticket, Music, Star, ExternalLink, X, Search } from 'lucide-react';
import { performanceService } from '../services/performanceService';

const Performances = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [performanceItems, setPerformanceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceItems();
  }, []);

  const fetchPerformanceItems = async () => {
    setLoading(true);
    const result = await performanceService.getPerformanceItems({ isActive: true });
    if (result.success) {
      setPerformanceItems(result.data);
    }
    setLoading(false);
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'concert', label: 'Concerts' },
    { value: 'competition', label: 'Competitions' },
    { value: 'festival', label: 'Festivals' },
    { value: 'recital', label: 'Recitals' },
    { value: 'community', label: 'Community' },
  ];

  const filteredItems = performanceItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.venue && item.venue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingPerformances = filteredItems.filter(item => item.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastPerformances = filteredItems.filter(item => item.date < today).sort((a, b) => new Date(b.date) - new Date(a.date));
  const featuredPerformance = upcomingPerformances.find(item => item.is_featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-accent-50/20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 via-transparent to-primary-600/10" />
        <div className="relative z-10 container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6 animate-slide-up">
            Performances
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
            Experience the magic of live wind ensemble music at our upcoming concerts
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="section-padding bg-white border-b border-gray-200">
        <div className="container-custom max-w-4xl">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search performances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-accent-600 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/30'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="section-padding bg-white flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-600"></div>
        </div>
      ) : (
        <>
          {/* Featured Concert */}
          {featuredPerformance && (
            <section className="section-padding bg-primary-50">
              <div className="container-custom">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-4">
                      Featured Concert
                    </h2>
                    <p className="text-lg text-gray-700">Don't miss our next spectacular performance</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      {featuredPerformance.image_url && (
                        <div className="relative h-64 lg:h-full">
                          <img
                            src={featuredPerformance.image_url}
                            alt={featuredPerformance.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-transparent" />
                          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="font-semibold">Featured</span>
                          </div>
                        </div>
                      )}
                      <div className="p-8 lg:p-12">
                        <h3 className="font-serif text-3xl font-bold text-primary-900 mb-4">
                          {featuredPerformance.title}
                        </h3>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-brass-600" />
                            <span className="text-gray-700 font-medium">
                              {new Date(featuredPerformance.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {featuredPerformance.start_time && (
                            <div className="flex items-center space-x-3">
                              <Clock className="h-5 w-5 text-brass-600" />
                              <span className="text-gray-700 font-medium">
                                {featuredPerformance.start_time}
                                {featuredPerformance.end_time && ` - ${featuredPerformance.end_time}`}
                              </span>
                            </div>
                          )}
                          {featuredPerformance.venue && (
                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-brass-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 font-medium">{featuredPerformance.venue}</span>
                            </div>
                          )}
                        </div>
                        {featuredPerformance.description && (
                          <div
                            className="text-gray-700 mb-8 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: featuredPerformance.description }}
                          />
                        )}
                        <div className="flex flex-col sm:flex-row gap-4">
                          {featuredPerformance.ticket_link && (
                            <button
                              onClick={() => window.open(featuredPerformance.ticket_link, '_blank')}
                              className="btn-primary inline-flex items-center justify-center"
                            >
                              <Ticket className="mr-2 h-5 w-5" />
                              Get Tickets
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPerformance(featuredPerformance)}
                            className="btn-outline inline-flex items-center justify-center"
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Upcoming Concerts */}
          {upcomingPerformances.filter(p => !p.is_featured).length > 0 && (
            <section className="section-padding bg-white">
              <div className="container-custom">
                <div className="max-w-6xl mx-auto">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
                    Upcoming Concerts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingPerformances.filter(concert => !concert.is_featured).map(concert => (
                      <div
                        key={concert.id}
                        className="card hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setSelectedPerformance(concert)}
                      >
                        {concert.image_url && (
                          <div className="relative h-48 mb-6 -mx-6 -mt-6">
                            <img
                              src={concert.image_url}
                              alt={concert.title}
                              className="w-full h-full object-cover rounded-t-xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-xl" />
                          </div>
                        )}
                        <h3 className="font-serif text-xl font-bold text-primary-900 mb-3">
                          {concert.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-brass-600" />
                            <span className="text-gray-700 text-sm">
                              {new Date(concert.date).toLocaleDateString()}
                            </span>
                          </div>
                          {concert.start_time && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-brass-600" />
                              <span className="text-gray-700 text-sm">{concert.start_time}</span>
                            </div>
                          )}
                          {concert.venue && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-brass-600" />
                              <span className="text-gray-700 text-sm">{concert.venue}</span>
                            </div>
                          )}
                        </div>
                        {concert.description && (
                          <div
                            className="text-gray-600 text-sm mb-6 line-clamp-3 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: concert.description }}
                          />
                        )}
                        <div className="flex flex-col gap-3">
                          {concert.ticket_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(concert.ticket_link, '_blank');
                              }}
                              className="btn-primary text-sm"
                            >
                              Get Tickets
                            </button>
                          )}
                          <button className="btn-outline text-sm">
                            Learn More
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Past Performances */}
          {pastPerformances.length > 0 && (
            <section className="section-padding bg-gray-50">
              <div className="container-custom">
                <div className="max-w-6xl mx-auto">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
                    Recent Performances
                  </h2>
                  <div className="space-y-6">
                    {pastPerformances.map(performance => (
                      <div
                        key={performance.id}
                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                        onClick={() => setSelectedPerformance(performance)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                              {performance.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-brass-600" />
                                <span className="text-gray-700">
                                  {new Date(performance.date).toLocaleDateString()}
                                </span>
                              </div>
                              {performance.venue && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4 text-brass-600" />
                                  <span className="text-gray-700">{performance.venue}</span>
                                </div>
                              )}
                            </div>
                            {performance.description && (
                              <div
                                className="text-gray-600 line-clamp-2 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: performance.description }}
                              />
                            )}
                          </div>
                          <div className="mt-4 md:mt-0 md:ml-6">
                            <button className="btn-outline text-sm">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* No Results */}
          {filteredItems.length === 0 && (
            <section className="section-padding bg-white">
              <div className="container-custom text-center py-20">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No performances found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {/* Call to Action */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <Music className="h-16 w-16 mx-auto mb-6 text-brass-400" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Never Miss a Performance
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our mailing list to receive updates about upcoming concerts,
            special events, and exclusive behind-the-scenes content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
            <button className="btn-secondary">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Performance Detail Modal */}
      {selectedPerformance && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPerformance(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPerformance.image_url && (
              <div className="relative h-80 bg-gray-200">
                <img
                  src={selectedPerformance.image_url}
                  alt={selectedPerformance.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedPerformance(null)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <X className="h-6 w-6 text-gray-900" />
                </button>
                {selectedPerformance.is_featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">Featured</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {selectedPerformance.title}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-accent-600" />
                  <span className="font-medium">
                    {new Date(selectedPerformance.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {selectedPerformance.start_time && (
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-accent-600" />
                    <span>
                      {selectedPerformance.start_time}
                      {selectedPerformance.end_time && ` - ${selectedPerformance.end_time}`}
                    </span>
                  </div>
                )}

                {selectedPerformance.venue && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-accent-600" />
                    <span>{selectedPerformance.venue}</span>
                  </div>
                )}
              </div>

              {selectedPerformance.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <div
                    className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPerformance.description }}
                  />
                </div>
              )}

              <div className="flex gap-4">
                {selectedPerformance.ticket_link && new Date(selectedPerformance.date) >= new Date() && (
                  <button
                    onClick={() => window.open(selectedPerformance.ticket_link, '_blank')}
                    className="flex-1 px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Get Tickets</span>
                    <ExternalLink className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedPerformance(null)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performances;
