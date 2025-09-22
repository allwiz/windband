import { Link } from 'react-router-dom';
import { Calendar, Music, Users, Award, ArrowRight, PlayCircle } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section - Modern Design */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-accent-50/30">
        {/* Enhanced Background with Multiple Layers */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 via-transparent to-primary-600/10" />

        {/* Hero Content */}
        <div className="relative z-10 text-center container-custom animate-fade-in">
          <h1 className="text-hero font-display text-gray-900 mb-6 animate-slide-up">
            Global Mission<br />Wind Band
          </h1>
          <p className="text-subhero text-gray-600 mb-8 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
            Excellence in Musical Performance
          </p>
          <p className="text-large text-gray-500 mb-12 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Experience the power and beauty of wind ensemble music with our passionate community of musicians
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Link to="/performances" className="btn-primary inline-flex items-center group">
              <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Upcoming Concerts
            </Link>
            <Link to="/join" className="btn-outline inline-flex items-center group">
              <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Join Our Band
            </Link>
          </div>
        </div>

        {/* Subtle scroll indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-gray-400 opacity-50">
          <div className="animate-float">
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* Welcome Section - Ultra Compact Design */}
      <section className="py-8 lg:py-10 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-display text-gray-900 mb-2">
              Welcome to Our Musical Community
            </h2>
            <p className="text-base lg:text-lg text-gray-600 mb-6 leading-relaxed max-w-3xl mx-auto">
            The Global Mission Wind Band, founded in 2025, has quickly become a vibrant part of our
            community's cultural life. We unite young musicians from diverse backgrounds to create
            inspiring performances that entertain and engage audiences across the region.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center hover-lift group">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Music className="h-6 w-6 text-accent-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1 group-hover:text-accent-700 transition-colors">Excellence</h3>
                <p className="text-gray-600 leading-relaxed text-xs">
                  Committed to the highest standards of musical performance and artistic expression
                </p>
              </div>
              <div className="text-center hover-lift group">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="h-6 w-6 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">Community</h3>
                <p className="text-gray-600 leading-relaxed text-xs">
                  Building lasting friendships through shared passion for wind ensemble music
                </p>
              </div>
              <div className="text-center hover-lift group">
                <div className="bg-gradient-to-br from-accent-100 to-accent-200 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Award className="h-6 w-6 text-accent-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-900 mb-1 group-hover:text-accent-700 transition-colors">Achievement</h3>
                <p className="text-gray-600 leading-relaxed text-xs">
                  Recognized for outstanding performances and community service contributions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Concert Highlight - Apple Style */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-subhero font-display text-gray-900 mb-8">
                  Next Performance
                </h2>
                <div className="card animate-scale-in">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="font-display text-3xl font-semibold text-gray-900 mb-3">
                        GMWB Debut
                      </h3>
                      <p className="text-accent-600 font-semibold mb-2 text-lg">December 20, 2025 • 7:00 PM</p>
                      <p className="text-gray-600 mb-4 text-lg">Bethel Church</p>
                    </div>
                    <Calendar className="h-10 w-10 text-accent-600" />
                  </div>
                  <p className="text-large text-gray-600 mb-8 leading-relaxed">
                    Join us for an enchanting evening of holiday classics and contemporary favorites.
                    This special concert features beloved seasonal music that will warm your heart
                    and get you in the festive spirit.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/performances" className="btn-primary inline-flex items-center justify-center">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      View All Concerts
                    </Link>
                    <a href="#" className="btn-outline inline-flex items-center justify-center">
                      Get Tickets
                    </a>
                  </div>
                </div>
              </div>
              <div className="relative order-1 lg:order-2 hover-lift group">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Wind ensemble performance"
                  className="rounded-3xl shadow-2xl w-full h-96 lg:h-128 object-cover group-hover:shadow-3xl transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl group-hover:from-black/10 transition-all duration-500" />
                <div className="gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Modern Design */}
      <section className="section-padding bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="container-custom text-center relative z-10">
          <h2 className="text-subhero font-display text-white mb-8">
            Ready to Make Music With Us?
          </h2>
          <p className="text-large text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We welcome musicians of all skill levels who share our passion for wind ensemble music.
            Join our family and be part of something special.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/join" className="btn-primary inline-flex items-center group">
              <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              Audition Information
            </Link>
            <Link to="/contact" className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-gray-900 inline-flex items-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] group">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;