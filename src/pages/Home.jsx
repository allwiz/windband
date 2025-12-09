import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Music, Users, Award, ArrowRight, Clock, MapPin, X } from 'lucide-react';
import { performanceService } from '../services/performanceService';

const Home = () => {
  const [upcomingPerformances, setUpcomingPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchUpcomingPerformances();
  }, []);

  const fetchUpcomingPerformances = async () => {
    setLoading(true);
    const result = await performanceService.getPerformanceItems({ isActive: true });
    if (result.success) {
      const today = new Date().toISOString().split('T')[0];
      const upcoming = result.data
        .filter(item => item.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3); // Show only the next 3 upcoming concerts
      setUpcomingPerformances(upcoming);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Global Mission Wind Band
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
            Excellence in Musical Performance Since 2025 
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link
              to="/join"
              className="bg-gradient-to-r from-accent-600 to-accent-700 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-accent-700 hover:to-accent-800 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
            >
              <span>Join Our Band</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/performances"
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/30 inline-flex items-center justify-center space-x-2"
            >
              <span>View Performances</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 bg-white/30 rounded-full relative">
            <div className="absolute top-0 w-1 h-8 bg-white rounded-full animate-slide-down"></div>
          </div>
        </div>
      </section>

      {/* Upcoming Concerts Section */}
      {!loading && upcomingPerformances.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                  Upcoming Concerts
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Join us for our next performances and experience the magic of live wind ensemble music
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {upcomingPerformances.map(concert => (
                  <div
                    key={concert.id}
                    className="card hover:scale-105 transition-transform duration-300"
                  >
                    {concert.image_url && (
                      <div
                        className="relative h-48 mb-6 -mx-6 -mt-6 bg-gray-100 cursor-pointer group"
                        onClick={() => setSelectedImage(concert.image_url)}
                      >
                        <img
                          src={concert.image_url}
                          alt={concert.title}
                          className="w-full h-full object-contain rounded-t-xl transition-opacity group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                            Click to enlarge
                          </div>
                        </div>
                      </div>
                    )}
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-3">
                      {concert.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-brass-600" />
                        <span className="text-gray-700 text-sm">
                          {new Date(concert.date + 'T00:00:00').toLocaleDateString()}
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
                        <a
                          href={concert.ticket_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-sm text-center"
                        >
                          Get Tickets
                        </a>
                      )}
                      <Link to="/performances" className="btn-outline text-sm text-center">
                        Learn More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/performances"
                  className="inline-flex items-center space-x-2 text-accent-600 hover:text-accent-700 font-medium text-lg"
                >
                  <span>View All Performances</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Why Join Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the joy of making music together in a supportive and passionate community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Music className="h-8 w-8 text-accent-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Direction</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn from experienced conductors and musicians who are passionate about wind band music
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a welcoming community of musicians from all walks of life who share your passion
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Regular Performances</h3>
              <p className="text-gray-600 leading-relaxed">
                Showcase your talents in concerts throughout the year at various venues
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                Strive for musical excellence while enjoying the journey of continuous improvement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-accent-600 to-accent-800">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Make Music?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Whether you're a seasoned musician or returning to music after a break, we welcome you to join our ensemble
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/join"
              className="bg-white text-accent-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/30 inline-flex items-center justify-center space-x-2"
            >
              <span>Contact Us</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Concert"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;