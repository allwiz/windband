import { useState, useEffect } from 'react';
import { Users, Music, Clock, Calendar, Mail, CheckCircle, ArrowRight } from 'lucide-react';
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
      description: "Weekly rehearsals Saturday evenings 6:00-7:15 PM"
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
    {
      title: "Musical Growth",
      description: "Improve your musical skills under inspiring conductors."
    },
    {
      title: "Leadership & Teamwork",
      description: "Build leadership through ensemble rehearsals and performances."
    },
    {
      title: "Community Service",
      description: "Use your talent to serve and bring joy to others through music."
    },
    {
      title: "Personal Development",
      description: "Develop discipline and collaboration skills for your future."
    },
    {
      title: "Belonging & Inspiration",
      description: "Be part of a warm, supportive community of musicians."
    }
  ];

  return (
    <div>
      {/* Hero */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-4">
              Become a Member
            </div>
            <h1 className="heading-title mb-6">
              Join Our Band
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              Become part of our musical family and share your passion for wind ensemble music with a supportive community.
            </p>
            <a
              href="https://forms.gle/2fbvV4kWEunRPiWs8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-6 py-3"
            >
              <Mail className="mr-2 h-4 w-4" />
              Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="section-sm bg-gradient-subtle">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
              Available Positions
            </div>
            <h2 className="heading-subtitle mb-4">Current Openings</h2>
            <p className="text-gray-500">
              We welcome talented musicians to join our ensemble. Exceptional musicians on any instrument are encouraged to apply.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
          ) : instruments.length === 0 ? (
            <div className="text-center py-12">
              <div className="icon-box icon-box-lg mx-auto mb-4">
                <Music className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No current openings at this time. Please check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {instruments.map((instrument, index) => (
                <div key={index} className="card-feature">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {instrument.name}
                    </h3>
                    <span className="badge">
                      {instrument.openings} opening{instrument.openings > 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-gray-500 text-small mb-4">{instrument.description}</p>
                  <a
                    href="https://forms.gle/2fbvV4kWEunRPiWs8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline w-full text-small"
                  >
                    Apply for {instrument.name}
                  </a>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <div className="card-feature p-8 text-center max-w-2xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">
                Don't See Your Instrument?
              </h3>
              <p className="text-gray-500 mb-6">
                We're always looking for exceptional musicians. Submit your application and we'll consider you for future opportunities.
              </p>
              <a
                href="https://forms.gle/2fbvV4kWEunRPiWs8"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                General Application
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section">
        <div className="container-main">
          <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
            Expectations
          </div>
          <h2 className="heading-subtitle mb-10">What We're Looking For</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {requirements.map((requirement, index) => (
              <div key={index} className="card-feature">
                <div className="flex items-start gap-4">
                  <div className="icon-box flex-shrink-0">
                    <requirement.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {requirement.title}
                    </h3>
                    <p className="text-gray-500">
                      {requirement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Member Benefits */}
      <section className="section-sm bg-gradient-subtle">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
                Why Join
              </div>
              <h2 className="heading-subtitle mb-6">Member Benefits</h2>
              <p className="text-gray-500 mb-8">
                Joining the Global Mission Winds & Brass offers more than just the opportunity to make music. You'll become part of a supportive community.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900">{benefit.title}</span>
                      <span className="text-gray-500"> — {benefit.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-gray-100">
              <img
                src="/logo.png"
                alt="Global Mission Winds & Brass"
                className="w-full max-w-xs h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm border-t border-gray-100">
        <div className="container-main">
          <div className="card-feature p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Ready to Join?
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
              Take the first step toward joining our musical community. We're excited to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://forms.gle/2fbvV4kWEunRPiWs8"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-6 py-3"
              >
                Start Your Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="mailto:info@globalmissionwindband.org"
                className="btn btn-outline px-6 py-3"
              >
                Email Questions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Join;
