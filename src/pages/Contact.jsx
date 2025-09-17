import { Mail, Phone, MapPin, Clock, Send, Music, Users, Calendar } from 'lucide-react';

const Contact = () => {
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
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            Get in touch with the Global Mission Wind Band - we'd love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary-900 mb-8">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  Whether you're interested in joining our band, booking us for an event,
                  or just want to learn more about what we do, we're here to help.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary-900" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary-900 mb-1">
                        Rehearsal Location
                      </h3>
                      <p className="text-gray-700">Community Music Center</p>
                      <p className="text-gray-700">123 Harmony Street</p>
                      <p className="text-gray-700">Music City, MC 12345</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-brass-100 p-3 rounded-lg flex-shrink-0">
                      <Clock className="h-6 w-6 text-brass-700" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary-900 mb-1">
                        Rehearsal Schedule
                      </h3>
                      <p className="text-gray-700">Tuesday Evenings</p>
                      <p className="text-gray-700">7:00 PM - 9:30 PM</p>
                      <p className="text-gray-600 text-sm mt-1">
                        September through May (breaks for holidays)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary-900" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary-900 mb-1">
                        Email
                      </h3>
                      <p className="text-gray-700">info@globalmissionwindband.org</p>
                      <p className="text-gray-600 text-sm mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-brass-100 p-3 rounded-lg flex-shrink-0">
                      <Phone className="h-6 w-6 text-brass-700" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-primary-900 mb-1">
                        Phone
                      </h3>
                      <p className="text-gray-700">(123) 456-7890</p>
                      <p className="text-gray-600 text-sm mt-1">
                        Messages returned within 2 business days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact Options */}
                <div className="mt-12">
                  <h3 className="font-serif text-xl font-bold text-primary-900 mb-6">
                    Quick Contact Options
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-brass-600" />
                      <div>
                        <a
                          href="mailto:auditions@globalmissionwindband.org"
                          className="text-primary-900 hover:text-brass-600 font-medium"
                        >
                          Auditions & Membership
                        </a>
                        <p className="text-gray-600 text-sm">auditions@globalmissionwindband.org</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-brass-600" />
                      <div>
                        <a
                          href="mailto:events@globalmissionwindband.org"
                          className="text-primary-900 hover:text-brass-600 font-medium"
                        >
                          Events & Bookings
                        </a>
                        <p className="text-gray-600 text-sm">events@globalmissionwindband.org</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Music className="h-5 w-5 text-brass-600" />
                      <div>
                        <a
                          href="mailto:conductor@globalmissionwindband.org"
                          className="text-primary-900 hover:text-brass-600 font-medium"
                        >
                          Musical Director
                        </a>
                        <p className="text-gray-600 text-sm">conductor@globalmissionwindband.org</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="font-serif text-2xl font-bold text-primary-900 mb-6">
                    Send Us a Message
                  </h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="(123) 456-7890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      >
                        <option value="">Select a topic</option>
                        <option value="audition">Audition Information</option>
                        <option value="booking">Event Booking</option>
                        <option value="general">General Inquiry</option>
                        <option value="feedback">Feedback</option>
                        <option value="collaboration">Collaboration Opportunity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="newsletter"
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="newsletter" className="text-sm text-gray-700">
                        I'd like to receive updates about upcoming concerts and events
                      </label>
                    </div>

                    <button type="submit" className="btn-primary w-full inline-flex items-center justify-center">
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-primary-900 mb-8 text-center">
              Find Us
            </h2>
            <div className="bg-gray-300 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Interactive Map</p>
                <p className="text-gray-500">Community Music Center</p>
                <p className="text-gray-500">123 Harmony Street, Music City, MC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-primary-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-primary-900 mb-3">
                  Do I need to audition to join the band?
                </h3>
                <p className="text-gray-700">
                  Yes, we require a brief audition to ensure you'll be comfortable with our repertoire
                  and to help us place you in the right section. Don't worry - it's more of a
                  musical conversation than a formal test!
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-primary-900 mb-3">
                  What if I haven't played in years?
                </h3>
                <p className="text-gray-700">
                  Many of our members return to music after years away. We're supportive of musicians
                  getting back into playing and will work with you to help you regain your skills.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-primary-900 mb-3">
                  Are there any fees to join?
                </h3>
                <p className="text-gray-700">
                  No! The Global Mission Wind Band is completely free to join. We provide music and music stands.
                  You just need to bring your instrument and enthusiasm.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-serif text-lg font-bold text-primary-900 mb-3">
                  Can I miss rehearsals occasionally?
                </h3>
                <p className="text-gray-700">
                  We understand that life happens! While regular attendance helps everyone, we have a
                  flexible policy for occasional absences. Just let us know in advance when possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;