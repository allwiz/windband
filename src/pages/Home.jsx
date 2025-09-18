import { Link } from 'react-router-dom';
import { Calendar, Music, Users, Award, ArrowRight, PlayCircle } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section - Apple Style */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        {/* Background Image with Apple-style treatment */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />

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
            <Link to="/performances" className="btn-primary inline-flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Concerts
            </Link>
            <Link to="/join" className="btn-outline inline-flex items-center">
              <Users className="mr-2 h-5 w-5" />
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

      {/* Welcome Section - Apple Style */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-subhero font-display text-gray-900 mb-6">
              Welcome to Our Musical Community
            </h2>
            <p className="text-large text-gray-600 mb-16 leading-relaxed max-w-4xl mx-auto">
              For nearly four decades, the Global Mission Wind Band has been a cornerstone of our community's
              cultural life. We bring together passionate musicians of all ages and backgrounds to create
              memorable performances that inspire and entertain audiences throughout the region.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
              <div className="text-center hover-lift">
                <div className="bg-accent-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Music className="h-10 w-10 text-accent-600" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Committed to the highest standards of musical performance and artistic expression
                </p>
              </div>
              <div className="text-center hover-lift">
                <div className="bg-gray-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-gray-700" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Building lasting friendships through shared passion for wind ensemble music
                </p>
              </div>
              <div className="text-center hover-lift">
                <div className="bg-accent-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Award className="h-10 w-10 text-accent-600" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-900 mb-4">Achievement</h3>
                <p className="text-gray-600 leading-relaxed">
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
                        Holiday Spectacular
                      </h3>
                      <p className="text-accent-600 font-semibold mb-2 text-lg">December 15, 2024 • 7:30 PM</p>
                      <p className="text-gray-600 mb-4 text-lg">Community Music Center Auditorium</p>
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
              <div className="relative order-1 lg:order-2 hover-lift">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Wind ensemble performance"
                  className="rounded-3xl shadow-2xl w-full h-96 lg:h-128 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Apple Style */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-subhero font-display text-white mb-8">
            Ready to Make Music With Us?
          </h2>
          <p className="text-large text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We welcome musicians of all skill levels who share our passion for wind ensemble music.
            Join our family and be part of something special.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/join" className="btn-primary inline-flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Audition Information
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 inline-flex items-center">
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