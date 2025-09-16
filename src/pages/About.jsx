import { Award, Users, Music, Heart, Calendar, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="relative z-10 container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6">
            About Our Band
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            A legacy of musical excellence and community service spanning nearly four decades
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
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  The Wind Concert Band is dedicated to enriching our community through exceptional
                  musical performances, fostering musical education, and creating lasting bonds among
                  musicians of all ages and backgrounds.
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
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Band rehearsal"
                  className="rounded-xl shadow-lg w-full h-96 object-cover"
                />
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
                    1985
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
                <div className="flex items-start space-x-4">
                  <div className="bg-brass-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                    1995
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-2">
                      First Award
                    </h4>
                    <p className="text-gray-700">
                      Received the Community Excellence in Arts Award, recognizing our contributions
                      to local cultural life and musical education.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-900 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                    2010
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-2">
                      Expansion
                    </h4>
                    <p className="text-gray-700">
                      Expanded to 60+ members and began our annual scholarship program for young musicians,
                      supporting music education in local schools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-brass-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">
                    2020
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-primary-900 mb-2">
                      Digital Innovation
                    </h4>
                    <p className="text-gray-700">
                      Adapted to virtual performances during the pandemic, reaching new audiences
                      and pioneering innovative concert formats.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conductor Section */}
      <section className="section-padding bg-primary-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  Meet Our Conductor
                </h2>
                <h3 className="font-serif text-xl font-bold text-brass-700 mb-4">
                  Dr. Sarah Mitchell
                </h3>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Dr. Sarah Mitchell brings over 20 years of conducting experience to the Wind Concert Band.
                  A graduate of the prestigious Juilliard School, she has led ensembles across the country
                  and is known for her passionate approach to music education and performance.
                </p>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Under her leadership since 2015, the band has achieved new heights of artistic excellence
                  and community engagement, earning recognition from the National Band Association.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-brass-600 flex-shrink-0" />
                    <span className="text-gray-700">Master of Music, Juilliard School</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-brass-600 flex-shrink-0" />
                    <span className="text-gray-700">National Band Association Outstanding Conductor Award</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-brass-600 flex-shrink-0" />
                    <span className="text-gray-700">20+ Years Conducting Experience</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Dr. Sarah Mitchell conducting"
                    className="rounded-xl shadow-lg w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics & Achievements */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12">
              By the Numbers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brass-600 mb-2">39</div>
                <p className="text-gray-700 font-medium">Years of Excellence</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brass-600 mb-2">65</div>
                <p className="text-gray-700 font-medium">Active Members</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brass-600 mb-2">100+</div>
                <p className="text-gray-700 font-medium">Performances</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-brass-600 mb-2">50K+</div>
                <p className="text-gray-700 font-medium">Audience Members</p>
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