import { Award, Users, Music, Heart, Calendar } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section - Minimal */}
      <section className="relative py-6 lg:py-8 bg-gradient-to-br from-gray-50 via-white to-accent-50/20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 charcoal-effect"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 via-transparent to-primary-600/10" />
        <div className="relative z-10 container-custom text-center">
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            GMWB inspires young musicians to use their talents to serve others and spread joy throughout the community
          </p>
        </div>
      </section>

      {/* About GMWB & Director - Combined */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 mb-16 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* GMWB Director Section */}
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-900 mb-6">
                    Director
                  </h2>
                  <h3 className="font-serif text-2xl font-bold text-primary-900 mb-2">
                    Dr. Andrew Park
                  </h3>
                  <h4 className="font-serif text-lg font-bold text-brass-700 mb-6">
                    GMWB Director and Conductor
                  </h4>
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

                {/* GMWB Assistant Conductor Section */}
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-900 mb-6">
                    Assistant Conductor
                  </h2>
                  <h3 className="font-serif text-2xl font-bold text-primary-900 mb-2">
                    Jongeui Kim
                  </h3>
                  <h4 className="font-serif text-lg font-bold text-brass-700 mb-6">
                    GMWB Assistant Conductor
                  </h4>
                  <div className="space-y-4 text-gray-700">
                    <p className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Master of Music at USC</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Music className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Performs with LA Phil, San Diego Symphony, LA Opera, and New West Symphony</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-brass-600 flex-shrink-0" />
                      <span>Active soloist and chamber musician</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2025 GMWB Leadership */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-3xl p-8 mb-16 shadow-lg hover:shadow-xl transition-all duration-500 border border-primary-100">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
                2025 GMWB Leadership
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Board Members Column */}
                <div>
                  <h4 className="font-serif text-xl font-bold text-primary-900 mb-6 text-center">
                    Board Members
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-brass-100 to-brass-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Users className="h-6 w-6 text-brass-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">President</h5>
                          <p className="text-gray-700 font-medium">Yunhee Lee</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Award className="h-6 w-6 text-primary-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">Vice President</h5>
                          <p className="text-gray-700 font-medium">Ynjin Lee</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-brass-100 to-brass-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Calendar className="h-6 w-6 text-brass-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">Secretary</h5>
                          <p className="text-gray-700 font-medium">Ahyoung Cho</p>
                        </div>
                      </div>
                    </div>
{/*
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Heart className="h-6 w-6 text-primary-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">Treasurer</h5>
                          <p className="text-gray-700 font-medium">Hyejin Park</p>
                        </div>
                      </div>
                    </div>
*/}
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-brass-100 to-brass-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Music className="h-6 w-6 text-brass-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">Committee</h5>
                          <p className="text-gray-700 font-medium">Jinmi Do</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Principal Players Column */}
                <div>
                  <h4 className="font-serif text-xl font-bold text-primary-900 mb-6 text-center">
                    Principal Players
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-primary-100 to-primary-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Users className="h-6 w-6 text-primary-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">President</h5>
                          <p className="text-gray-700 font-medium">Jihu Lee</p>
                        </div>
                      </div>
                    </div>
{/*}
                    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-brass-100 to-brass-200 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Award className="h-6 w-6 text-brass-700" />
                        </div>
                        <div>
                          <h5 className="font-serif text-lg font-bold text-primary-900">Vice President</h5>
                          <p className="text-gray-700 font-medium">Olivia Park</p>
                        </div>
                      </div>
                    </div>
*/}



                  </div>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 mb-16 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-900 mb-8 text-center">
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
      <section className="py-8 lg:py-12 bg-primary-900 text-white">
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