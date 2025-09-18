import { Award, Users, Music, Heart, Calendar } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 charcoal-effect"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="relative z-10 container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
            About Our Band
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
          GMWB inspires young musicians to use their talents to serve others and spread joy throughout the community
          </p>
        </div>
      </section>

      {/* Mission & History */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  About GMWB
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                The Global Mission Wind Band, made up of talented middle and high school students, is dedicated to enriching our community through
                outstanding musical performances. Every Saturday evening in Irvine, they rehearse under the guidance of Dr. Andrew Park, a professor
                at Pacific University who has led the ensemble for over 16 years..
                </p>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  We believe in the transformative power of music to bring people together, inspire
                  audiences, and create meaningful experiences that resonate long after the final note.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Music className="h-5 w-5 text-brass-600" />
                    <span className="text-gray-700 font-medium">Musical Excellence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-brass-600" />
                    <span className="text-gray-700 font-medium">Community Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-brass-600" />
                    <span className="text-gray-700 font-medium">Inclusive Environment</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1519139270850-e7371968f6d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Charcoal drawing style wind band ensemble with brass and woodwind instruments"
                  className="rounded-xl shadow-lg w-full h-96 object-cover charcoal-effect"
                />
              </div>
            </div>

            {/* GMWB Director */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-16">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
                GMWB Director
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h4 className="font-serif text-2xl font-bold text-primary-900 mb-2">
                    Dr. Andrew Park
                  </h4>
                  <h5 className="font-serif text-lg font-bold text-brass-700 mb-6">
                    GMWB Director and Conductor
                  </h5>
                  <div className="space-y-4 text-gray-700">
                    <p className="flex items-center space-x-3">
                      <Music className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Professor at Azusa Pacific University</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>CEO & Executive Director, OpusOne International Music Festival</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Artistic Director, Satori and IAPMT Competitions</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Dedicated educator, pianist, conductor, and chamber musician</span>
                    </p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative">
                    <img
                      src="/apark.jpg"
                      alt="Dr. Andrew Park, GMWB Director and Conductor"
                      className="rounded-xl shadow-lg w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2025 GMWB Board Members */}
            <div className="bg-primary-50 rounded-2xl p-8 mb-16">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
                2025 GMWB Board Members
              </h3>
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                    <div className="bg-brass-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-brass-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">President</h4>
                    <p className="text-gray-700 font-medium">Yunhee Lee</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-primary-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">Vice President</h4>
                    <p className="text-gray-700 font-medium">Yunjin Lee</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                    <div className="bg-brass-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-brass-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">Secretary</h4>
                    <p className="text-gray-700 font-medium">Ahyoung Cho</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm text-center md:col-start-1 lg:col-start-2">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-primary-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">Treasurer</h4>
                    <p className="text-gray-700 font-medium">Hyejin Park</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm text-center md:col-start-2 lg:col-start-3">
                    <div className="bg-brass-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-brass-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">Committee</h4>
                    <p className="text-gray-700 font-medium">Jinmi Do</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2025 GMWB Principal Players */}
            <div className="bg-white rounded-2xl p-8 mb-16 border border-gray-200">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
                2025 GMWB Principal Players
              </h3>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-primary-50 rounded-xl p-6 shadow-sm text-center">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">President</h4>
                    <p className="text-gray-700 font-medium">Jihu Lee</p>
                  </div>

                  <div className="bg-brass-50 rounded-xl p-6 shadow-sm text-center">
                    <div className="bg-brass-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-brass-700" />
                    </div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-1">Vice President</h4>
                    <p className="text-gray-700 font-medium">Olivia Park</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-16">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
                Our History
              </h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                    2025
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-2">
                      Foundation
                    </h4>
                    <p className="text-gray-700">
                      Founded by a group of passionate musicians with the vision of creating a community
                      wind ensemble that would serve both musicians and audiences.
                    </p>
                  </div>
                </div>
                
                
                
              </div>
            </div>
          </div>
        </div>
      </section>


      

      {/* Community Impact */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              Community Impact
            </h2>
            <p className="text-xl text-primary-100 mb-12">
              Beyond our performances, we're committed to giving back to our community through
              education, outreach, and support for local music programs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Education Programs</h3>
                <p className="text-primary-200">
                  Free masterclasses and workshops for student musicians
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Charity Concerts</h3>
                <p className="text-primary-200">
                  Annual benefit performances supporting local causes
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">Scholarships</h3>
                <p className="text-primary-200">
                  $25,000+ in music scholarships awarded annually
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;