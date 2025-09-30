import { Calendar, Clock, MapPin, Ticket, PlayCircle, Music } from 'lucide-react';

const Performances = () => {
  const upcomingConcerts = [
    {
      id: 1,
      title: "Holiday Spectacular",
      date: "December 15, 2024",
      time: "7:30 PM",
      venue: "Community Music Center Auditorium",
      address: "123 Harmony Street, Music City, MC 12345",
      description: "Join us for an enchanting evening of holiday classics and contemporary favorites. This special concert features beloved seasonal music that will warm your heart and get you in the festive spirit.",
      ticketPrice: "Free Admission",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: true
    },
    {
      id: 2,
      title: "Spring Concert Series",
      date: "March 22, 2025",
      time: "2:00 PM",
      venue: "Riverside Park Amphitheater",
      address: "456 River Road, Music City, MC 12345",
      description: "Welcome spring with a delightful afternoon of classical and modern wind ensemble pieces performed in the beautiful outdoor setting of Riverside Park.",
      ticketPrice: "$10 Adults, $5 Students",
      image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: false
    },
    {
      id: 3,
      title: "Patriotic Pops",
      date: "July 4, 2025",
      time: "6:00 PM",
      venue: "City Hall Plaza",
      address: "789 Main Street, Music City, MC 12345",
      description: "Celebrate Independence Day with stirring patriotic music and beloved American classics. This outdoor concert is part of the city's annual Fourth of July celebration.",
      ticketPrice: "Free Admission",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      featured: false
    }
  ];

  const pastPerformances = [
    {
      id: 1,
      title: "Autumn Melodies",
      date: "October 28, 2024",
      venue: "Community Music Center",
      description: "A beautiful evening featuring works by contemporary composers and traditional fall favorites."
    },
    {
      id: 2,
      title: "Summer Serenade",
      date: "August 15, 2024",
      venue: "Riverside Park",
      description: "Our annual outdoor summer concert featuring light classical and popular music selections."
    },
    {
      id: 3,
      title: "Memorial Day Tribute",
      date: "May 27, 2024",
      venue: "Veterans Memorial Park",
      description: "A moving tribute to our service members featuring patriotic music and ceremonial honors."
    }
  ];

  return (
    <div>
      {/* Hero Section - Enhanced */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-accent-50/20">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600/5 via-transparent to-primary-600/10" />
        <div className="relative z-10 container-custom text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6 animate-slide-up">
            Performances
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
            Experience the magic of live wind ensemble music at our upcoming concerts
          </p>
        </div>
      </section>

      {/* Featured Concert */}
      {upcomingConcerts.find(concert => concert.featured) && (
        <section className="section-padding bg-primary-50">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-4">
                  Featured Concert
                </h2>
                <p className="text-lg text-gray-700">Don't miss our next spectacular performance</p>
              </div>

              {upcomingConcerts.filter(concert => concert.featured).map(concert => (
                <div key={concert.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="relative h-64 lg:h-full">
                      <img
                        src={concert.image}
                        alt={concert.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-transparent" />
                    </div>
                    <div className="p-8 lg:p-12">
                      <h3 className="font-serif text-3xl font-bold text-primary-900 mb-4">
                        {concert.title}
                      </h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-brass-600" />
                          <span className="text-gray-700 font-medium">{concert.date}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-brass-600" />
                          <span className="text-gray-700 font-medium">{concert.time}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <MapPin className="h-5 w-5 text-brass-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-gray-700 font-medium">{concert.venue}</p>
                            <p className="text-gray-600 text-sm">{concert.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Ticket className="h-5 w-5 text-brass-600" />
                          <span className="text-gray-700 font-medium">{concert.ticketPrice}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-8 leading-relaxed">
                        {concert.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button className="btn-primary inline-flex items-center justify-center">
                          <Ticket className="mr-2 h-5 w-5" />
                          Get Tickets
                        </button>
                        <button className="btn-outline inline-flex items-center justify-center">
                          <PlayCircle className="mr-2 h-5 w-5" />
                          Preview Music
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Concerts */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
              Upcoming Concerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingConcerts.filter(concert => !concert.featured).map(concert => (
                <div key={concert.id} className="card hover:scale-105 transition-transform duration-300">
                  <div className="relative h-48 mb-6 -mx-6 -mt-6">
                    <img
                      src={concert.image}
                      alt={concert.title}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-xl" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary-900 mb-3">
                    {concert.title}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-brass-600" />
                      <span className="text-gray-700 text-sm">{concert.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-brass-600" />
                      <span className="text-gray-700 text-sm">{concert.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-brass-600" />
                      <span className="text-gray-700 text-sm">{concert.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4 text-brass-600" />
                      <span className="text-gray-700 text-sm">{concert.ticketPrice}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {concert.description}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button className="btn-primary text-sm">
                      Get Tickets
                    </button>
                    <button className="btn-outline text-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Past Performances */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-900 mb-12 text-center">
              Recent Performances
            </h2>
            <div className="space-y-6">
              {pastPerformances.map(performance => (
                <div key={performance.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-bold text-primary-900 mb-2">
                        {performance.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mb-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-brass-600" />
                          <span className="text-gray-700">{performance.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-brass-600" />
                          <span className="text-gray-700">{performance.venue}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {performance.description}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button className="btn-outline text-sm">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        View Recording
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <Music className="h-16 w-16 mx-auto mb-6 text-brass-400" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Never Miss a Performance
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our mailing list to receive updates about upcoming concerts,
            special events, and exclusive behind-the-scenes content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brass-400"
            />
            <button className="btn-secondary">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Performances;