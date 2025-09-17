import { Link } from 'react-router-dom';
import { Calendar, Music, Users, Award, ArrowRight, PlayCircle } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image - Charcoal style wind band artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat charcoal-effect"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="hero-overlay" />

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white container-custom">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Global Mission Wind Band
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto font-light">
            Excellence in Musical Performance Since 1985
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Experience the power and beauty of wind ensemble music with our passionate community of musicians
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/performances" className="btn-secondary inline-flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Concerts
            </Link>
            <Link to="/join" className="btn-outline inline-flex items-center bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary-900">
              <Users className="mr-2 h-5 w-5" />
              Join Our Band
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white opacity-70">
          <div className="animate-bounce">
            <ArrowRight className="h-6 w-6 rotate-90" />
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
              Welcome to Our Musical Community
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              For nearly four decades, the Global Mission Wind Band has been a cornerstone of our community's
              cultural life. We bring together passionate musicians of all ages and backgrounds to create
              memorable performances that inspire and entertain audiences throughout the region.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-primary-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">Excellence</h3>
                <p className="text-gray-600">
                  Committed to the highest standards of musical performance and artistic expression
                </p>
              </div>
              <div className="text-center">
                <div className="bg-brass-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-brass-700" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">Community</h3>
                <p className="text-gray-600">
                  Building lasting friendships through shared passion for wind ensemble music
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary-900" />
                </div>
                <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">Achievement</h3>
                <p className="text-gray-600">
                  Recognized for outstanding performances and community service contributions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Concert Highlight */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  Next Performance
                </h2>
                <div className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary-900 mb-2">
                        Holiday Spectacular
                      </h3>
                      <p className="text-brass-700 font-semibold mb-2">December 15, 2024 • 7:30 PM</p>
                      <p className="text-gray-600 mb-4">Community Music Center Auditorium</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-gray-700 mb-6">
                    Join us for an enchanting evening of holiday classics and contemporary favorites.
                    This special concert features beloved seasonal music that will warm your heart
                    and get you in the festive spirit.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
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
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Wind ensemble performance"
                  className="rounded-xl shadow-lg w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Music With Us?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            We welcome musicians of all skill levels who share our passion for wind ensemble music.
            Join our family and be part of something special.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join" className="btn-secondary inline-flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Audition Information
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary-900 inline-flex items-center">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;