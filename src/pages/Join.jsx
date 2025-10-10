import { useState, useEffect } from 'react';
import { Users, Music, Clock, Award, CheckCircle, Calendar, Mail, FileText } from 'lucide-react';
import { openingsService } from '../services/openingsService';

const Join = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpenings();
  }, []);

  const fetchOpenings = async () => {
    setLoading(true);
    const result = await openingsService.getOpenings({ isActive: true });
    if (result.success) {
      setInstruments(result.data.map(opening => ({
        name: opening.instrument_name,
        openings: opening.openings_count,
        description: opening.description || ''
      })));
    }
    setLoading(false);
  };

  const requirements = [
    {
      icon: Music,
      title: "Musical Experience",
      description: "Intermediate to advanced playing ability on your instrument"
    },
    {
      icon: Clock,
      title: "Time Commitment",
      description: "Weekly rehearsals Tuesday evenings 7:00-9:30 PM"
    },
    {
      icon: Calendar,
      title: "Performance Schedule",
      description: "4-6 concerts per year, additional special events"
    },
    {
      icon: Users,
      title: "Collaborative Spirit",
      description: "Positive attitude and willingness to work as part of an ensemble"
    }
  ];

  const benefits = [
    "Perform challenging and rewarding repertoire",
    "Learn from experienced conductor Dr. Sarah Mitchell",
    "Build lasting friendships with fellow musicians",
    "Contribute to community cultural enrichment",
    "Access to member-only events and workshops",
    "Opportunities for solo performances",
    "Flexible attendance policy for busy schedules",
    "No membership fees or dues required"
  ];

  return (
    <div>
      {/* Hero Section - Enhanced */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-accent-50/20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 charcoal-effect"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 via-transparent to-primary-600/10" />
        <div className="relative z-10 container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6 animate-slide-up">
            Join Our Band
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
            Become part of our musical family and share your passion for wind ensemble music
          </p>
          <a
            href="https://forms.gle/2fbvV4kWEunRPiWs8"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center group hover:scale-[1.02] transition-transform duration-200 animate-slide-up"
            style={{animationDelay: '0.2s'}}
          >
            <Mail className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            Apply Now
          </a>
        </div>
      </section>

      {/* Current Openings */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                Current Openings
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                We welcome talented musicians to join our ensemble. Below are our current openings,
                though exceptional musicians on any instrument are encouraged to audition.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
              </div>
            ) : instruments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No current openings at this time. Please check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.map((instrument, index) => (
                  <div key={index} className="card hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl font-bold text-primary-900">
                        {instrument.name}
                      </h3>
                      <div className="bg-brass-100 text-brass-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {instrument.openings} opening{instrument.openings > 1 ? 's' : ''}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{instrument.description}</p>
                    <a
                      href="https://forms.gle/2fbvV4kWEunRPiWs8"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full text-sm inline-block text-center"
                    >
                      Apply for {instrument.name}
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <div className="bg-primary-50 rounded-xl p-8">
                <h3 className="font-serif text-2xl font-bold text-primary-900 mb-4">
                  Don't See Your Instrument?
                </h3>
                <p className="text-gray-700 mb-6">
                  We're always looking for exceptional musicians, regardless of current openings.
                  Submit your application and we'll consider you for future opportunities.
                </p>
                <a
                  href="https://forms.gle/2fbvV4kWEunRPiWs8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  General Application
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
              What We're Looking For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                    <requirement.icon className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                      {requirement.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {requirement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Member Benefits */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-6">
                  Member Benefits
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Joining the Global Mission Wind Band offers more than just the opportunity to make music.
                  You'll become part of a supportive community that values artistic growth and
                  meaningful connections.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-brass-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Band members enjoying rehearsal"
                  className="rounded-xl shadow-lg w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audition Process */}
      <section className="section-padding bg-primary-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
              Audition Process
            </h2>
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                      Submit Application
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Complete our online application form with your musical background,
                      experience, and instrument preferences.
                    </p>
                    <button className="btn-outline text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Application
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="bg-brass-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                      Prepare Audition Material
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Prepare scales, a solo piece of your choosing, and sight-reading material.
                      We'll provide specific requirements based on your instrument.
                    </p>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Major scales (up to 4 sharps/flats)</li>
                      <li>• Solo piece (2-3 minutes, any style)</li>
                      <li>• Sight-reading exercise (provided at audition)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                      Schedule Audition
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Auditions are held monthly and typically last 15-20 minutes.
                      We'll work with your schedule to find a convenient time.
                    </p>
                    <div className="text-gray-600 text-sm">
                      <p><strong>Next Audition Dates:</strong></p>
                      <p>• December 10, 2024 - 6:00-8:00 PM</p>
                      <p>• January 14, 2025 - 6:00-8:00 PM</p>
                      <p>• February 11, 2025 - 6:00-8:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start space-x-4">
                  <div className="bg-brass-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                      Welcome to the Band!
                    </h3>
                    <p className="text-gray-700">
                      Upon acceptance, you'll receive your music folder, rehearsal schedule,
                      and be invited to your first rehearsal. Welcome to the Global Mission Wind Band family!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Auditions */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready to Audition?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Take the first step toward joining our musical community. We're excited to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://forms.gle/2fbvV4kWEunRPiWs8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center"
            >
              <Mail className="mr-2 h-5 w-5" />
              Start Your Application
            </a>
            <a
              href="mailto:auditions@globalmissionwindband.org"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary-900 inline-flex items-center"
            >
              Email Questions
            </a>
          </div>
          <div className="mt-8 text-primary-200">
            <p>Questions? Contact our audition coordinator:</p>
            <p className="font-semibold">auditions@globalmissionwindband.org</p>
            <p>(123) 456-7890</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Join;