import { Mail, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div>
      {/* Hero */}
      <section className="section-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-4">
              Get in Touch
            </div>
            <h1 className="heading-title mb-4">Contact Us</h1>
            <p className="text-lg text-gray-500">
              We'd love to hear from you. Reach out with questions about joining, events, or collaborations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
                Information
              </div>
              <h2 className="heading-subtitle mb-6">How to Reach Us</h2>
              <p className="text-gray-500 mb-8">
                Whether you're interested in joining our band, booking us for an event, or just want to learn more about what we do, we're here to help.
              </p>

              <div className="space-y-4">
                <div className="card-feature">
                  <div className="flex items-start gap-4">
                    <div className="icon-box flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Rehearsal Location
                      </h3>
                      <p className="text-gray-500">Irvine Baptist Church</p>
                      <p className="text-gray-500">5101 Walnut Ave, Irvine, CA 92604</p>
                    </div>
                  </div>
                </div>

                <div className="card-feature">
                  <div className="flex items-start gap-4">
                    <div className="icon-box flex-shrink-0">
                      <Clock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Rehearsal Schedule
                      </h3>
                      <p className="text-gray-500">Saturday Evenings</p>
                      <p className="text-gray-500">6:00 PM - 7:15 PM</p>
                    </div>
                  </div>
                </div>

                <div className="card-feature">
                  <div className="flex items-start gap-4">
                    <div className="icon-box flex-shrink-0">
                      <Mail className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <a href="mailto:gmwbirvine@gmail.com" className="text-gray-900 hover:text-gray-600 transition-colors">
                        gmwbirvine@gmail.com
                      </a>
                      <p className="text-small text-gray-400 mt-1">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="card-feature p-8">
                <h2 className="font-semibold text-gray-900 mb-6">
                  Send Us a Message
                </h2>
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-small font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-small font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-small font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="input"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-small font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select required className="input">
                      <option value="">Select a topic</option>
                      <option value="audition">Audition Information</option>
                      <option value="booking">Event Booking</option>
                      <option value="general">General Inquiry</option>
                      <option value="feedback">Feedback</option>
                      <option value="collaboration">Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-small font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="input resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="mt-1 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <label htmlFor="newsletter" className="text-small text-gray-500">
                      I'd like to receive updates about upcoming concerts and events
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-sm bg-gradient-subtle">
        <div className="container-main">
          <div className="text-center mb-8">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
              Location
            </div>
            <h2 className="heading-subtitle">Find Us</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <iframe
              src="https://maps.google.com/maps?q=Irvine+Baptist+Church,+5101+Walnut+Ave,+Irvine,+CA+92604&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Irvine Baptist Church Location"
              className="w-full"
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=5101+Walnut+Ave,+Irvine,+CA+92604"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-3">
                Help
              </div>
              <h2 className="heading-subtitle">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              <div className="card-feature">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Do I need to audition to join the band?
                </h3>
                <p className="text-gray-500">
                  Yes, we require a brief audition to ensure you'll be comfortable with our repertoire and to help us place you in the right section. Don't worry - it's more of a musical conversation than a formal test!
                </p>
              </div>
{/*}
              <div className="card-feature">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What if I haven't played in years?
                </h3>
                <p className="text-gray-500">
                  Many of our members return to music after years away. We're supportive of musicians getting back into playing and will work with you to help you regain your skills.
                </p>
              </div>
*/}

              <div className="card-feature">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Are there any fees to join?
                </h3>
                <p className="text-gray-500">
                  No! The Global Mission Winds & Brass is completely free to join. We provide music and music stands. You just need to bring your instrument and enthusiasm.
                </p>
              </div>

              <div className="card-feature">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I miss rehearsals occasionally?
                </h3>
                <p className="text-gray-500">
                  We understand that life happens! While regular attendance helps everyone, we have a flexible policy for occasional absences. Just let us know in advance when possible.
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
