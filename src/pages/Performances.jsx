import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X, ExternalLink, Search, Music, ZoomIn, Map, Navigation, CalendarPlus } from 'lucide-react';
import { performanceService } from '../services/performanceService';

const Performances = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [performanceItems, setPerformanceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceItems();
  }, []);

  const fetchPerformanceItems = async () => {
    setLoading(true);
    const result = await performanceService.getPerformanceItems({ isActive: true });
    if (result.success) {
      setPerformanceItems(result.data);
    }
    setLoading(false);
  };

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'concert', label: 'Concerts' },
    { value: 'competition', label: 'Competitions' },
    { value: 'festival', label: 'Festivals' },
    { value: 'recital', label: 'Recitals' },
    { value: 'community', label: 'Community' },
  ];

  const filteredItems = performanceItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.venue && item.venue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const today = new Date().toISOString().split('T')[0];
  const upcomingPerformances = filteredItems.filter(item => item.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const pastPerformances = filteredItems.filter(item => item.date < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateStr, options = {}) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options
    });
  };

  // Calendar helper functions
  const getCalendarDateTime = (date, time) => {
    const [hours, minutes] = time ? time.split(':').map(Number) : [12, 0];
    const dateObj = new Date(date + 'T00:00:00');
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  };

  const formatDateTimeForGoogle = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const formatDateTimeForICS = (date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, -1);
  };

  const generateGoogleCalendarUrl = (performance) => {
    const startDate = getCalendarDateTime(performance.date, performance.start_time);
    const endDate = performance.end_time
      ? getCalendarDateTime(performance.date, performance.end_time)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: performance.title,
      dates: `${formatDateTimeForGoogle(startDate)}/${formatDateTimeForGoogle(endDate)}`,
      details: performance.description ? performance.description.replace(/<[^>]*>/g, '') : '',
      location: performance.venue || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateICSFile = (performance) => {
    const startDate = getCalendarDateTime(performance.date, performance.start_time);
    const endDate = performance.end_time
      ? getCalendarDateTime(performance.date, performance.end_time)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//GMWB//Performance//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDateTimeForICS(startDate)}`,
      `DTEND:${formatDateTimeForICS(endDate)}`,
      `SUMMARY:${performance.title}`,
      `DESCRIPTION:${performance.description ? performance.description.replace(/<[^>]*>/g, '').replace(/\n/g, '\\n') : ''}`,
      `LOCATION:${performance.venue || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${performance.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateOutlookUrl = (performance) => {
    const startDate = getCalendarDateTime(performance.date, performance.start_time);
    const endDate = performance.end_time
      ? getCalendarDateTime(performance.date, performance.end_time)
      : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: performance.title,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: performance.description ? performance.description.replace(/<[^>]*>/g, '') : '',
      location: performance.venue || '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero Header */}
      <section className="section-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-50" />

        <div className="container-main relative">
          <div className="max-w-2xl">
            <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-4">
              Events & Concerts
            </div>
            <h1 className="heading-title mb-4">Performances</h1>
            <p className="text-lg text-gray-500">
              Experience live wind ensemble music at our concerts and events throughout the year.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-5 border-y border-gray-100 sticky top-16 bg-white/80 backdrop-blur-xl z-40">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search performances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-small bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-4 focus:ring-gray-100 transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 text-small font-medium rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.value
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="section flex justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcomingPerformances.length > 0 && (
            <section className="section relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-blue w-[400px] h-[400px] -top-[100px] -right-[100px] opacity-10" />
              </div>

              <div className="container-main relative">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Coming Soon
                    </div>
                    <h2 className="heading-subtitle">Upcoming Concerts</h2>
                  </div>
                  <span className="badge">
                    {upcomingPerformances.length} event{upcomingPerformances.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                  {upcomingPerformances.map((concert) => (
                    <article
                      key={concert.id}
                      className="card card-hover cursor-pointer group"
                      onClick={() => setSelectedPerformance(concert)}
                    >
                      {concert.image_url ? (
                        <div className="aspect-[16/10] bg-gray-50 overflow-hidden flex items-center justify-center">
                          <img
                            src={concert.image_url}
                            alt={concert.title}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                          <Music className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-gray-600 transition-colors">
                          {concert.title}
                        </h3>
                        <div className="space-y-2 text-small text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(concert.date)}
                          </div>
                          {concert.start_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {concert.start_time}
                            </div>
                          )}
                          {concert.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{concert.venue}</span>
                            </div>
                          )}
                        </div>
                        {concert.ticket_link && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(concert.ticket_link, '_blank');
                            }}
                            className="btn btn-primary w-full mt-4"
                          >
                            Get tickets
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Past */}
          {pastPerformances.length > 0 && (
            <section className="section-sm bg-gradient-subtle">
              <div className="container-main">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <div className="text-tiny font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Archive
                    </div>
                    <h2 className="heading-subtitle">Past Performances</h2>
                  </div>
                  <span className="text-small text-gray-400">
                    {pastPerformances.length} performance{pastPerformances.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {pastPerformances.map((performance) => (
                    <div
                      key={performance.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all group"
                      onClick={() => setSelectedPerformance(performance)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="icon-box flex-shrink-0">
                          <Music className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                            {performance.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-1 text-small text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(performance.date)}
                            </span>
                            {performance.venue && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {performance.venue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-small text-gray-400 group-hover:text-gray-900 transition-colors flex items-center gap-1">
                        Details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Empty state */}
          {filteredItems.length === 0 && (
            <section className="section">
              <div className="container-main">
                <div className="text-center py-16">
                  <div className="icon-box icon-box-lg mx-auto mb-4">
                    <Music className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No performances found</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="btn btn-secondary"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Modal */}
      {selectedPerformance && (
        <div
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPerformance(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPerformance.image_url ? (
              <div
                className="aspect-[16/9] bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer relative group/image"
                onClick={() => setLightboxImage(selectedPerformance.image_url)}
              >
                <img
                  src={selectedPerformance.image_url}
                  alt={selectedPerformance.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover/image:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-200" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedPerformance.title}
                  </h2>
                  {selectedPerformance.category && (
                    <span className="badge text-tiny">
                      {selectedPerformance.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPerformance(null)}
                  className="p-2 -m-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors w-full text-left group"
                >
                  <div className="icon-box flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <span className="flex-1 group-hover:underline">{formatDate(selectedPerformance.date, { weekday: 'long' })}</span>
                  <CalendarPlus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
                {selectedPerformance.start_time && (
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors w-full text-left group"
                  >
                    <div className="icon-box flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <Clock className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="flex-1 group-hover:underline">
                      {selectedPerformance.start_time}
                      {selectedPerformance.end_time && ` – ${selectedPerformance.end_time}`}
                    </span>
                    <CalendarPlus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                )}
                {selectedPerformance.venue && (
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors w-full text-left group"
                  >
                    <div className="icon-box flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="flex-1 group-hover:underline">{selectedPerformance.venue}</span>
                    <Map className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>

              {selectedPerformance.description && (
                <div
                  className="text-gray-600 mb-6 prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedPerformance.description }}
                />
              )}

              <div className="flex gap-3 pt-2">
                {selectedPerformance.ticket_link && new Date(selectedPerformance.date) >= new Date() && (
                  <button
                    onClick={() => window.open(selectedPerformance.ticket_link, '_blank')}
                    className="btn btn-primary flex-1"
                  >
                    Get tickets
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedPerformance(null)}
                  className="btn btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for full-size image */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && selectedPerformance?.venue && (
        <div
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowMapModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <MapPin className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Venue Location</h3>
                  <p className="text-small text-gray-500">{selectedPerformance.venue}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map */}
            <div className="aspect-[16/10] bg-gray-100">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedPerformance.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${selectedPerformance.venue}`}
                className="w-full h-full"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPerformance.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </a>
              <button
                onClick={() => setShowMapModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && selectedPerformance && (
        <div
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <CalendarPlus className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add to Calendar</h3>
                  <p className="text-small text-gray-500">{selectedPerformance.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Summary */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="space-y-2 text-small">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedPerformance.date, { weekday: 'long' })}</span>
                </div>
                {selectedPerformance.start_time && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {selectedPerformance.start_time}
                      {selectedPerformance.end_time && ` – ${selectedPerformance.end_time}`}
                    </span>
                  </div>
                )}
                {selectedPerformance.venue && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedPerformance.venue}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Options */}
            <div className="p-4 space-y-2">
              <a
                href={generateGoogleCalendarUrl(selectedPerformance)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left group"
                onClick={() => setShowCalendarModal(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Google Calendar</div>
                  <div className="text-small text-gray-500">Open in Google Calendar</div>
                </div>
              </a>

              <button
                onClick={() => {
                  generateICSFile(selectedPerformance);
                  setShowCalendarModal(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Apple Calendar</div>
                  <div className="text-small text-gray-500">Download .ics file</div>
                </div>
              </button>

              <a
                href={generateOutlookUrl(selectedPerformance)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors w-full text-left group"
                onClick={() => setShowCalendarModal(false)}
              >
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.23-.58.23h-8.547v-6.959l1.6 1.229c.102.086.221.127.357.127.136 0 .255-.041.357-.127l.04-.031 6.773-5.186v-.004l.238.183V7.39z"/>
                    <path fill="#0078D4" d="M24 5.5v.614l-7.168 5.5-1.654-1.272V4.333h8.004c.228 0 .422.077.58.231.158.152.238.348.238.578v.358z"/>
                    <path fill="#0364B8" d="M8.615 4.333v5.822L0 4.333h8.615z"/>
                    <path fill="#0078D4" d="M8.615 10.155v.893l-2.308 1.462L0 7.516v-.903l6.307 3.542h2.308z"/>
                    <path fill="#28A8EA" d="M0 4.333l8.615 5.822v.893L0 7.516V4.333z"/>
                    <path fill="#0078D4" d="M8.615 10.155v6.051L0 10.87V7.516l8.615 2.64z"/>
                    <path fill="#0364B8" d="M8.615 16.206v3.46H0v-8.797l8.615 5.337z"/>
                    <path fill="#14447D" d="M15.176 10.71v6.96H8.615v-6.96h6.561z"/>
                    <path fill="#0078D4" d="M15.176 4.333v6.377H8.615V4.333h6.561z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Outlook</div>
                  <div className="text-small text-gray-500">Open in Outlook Calendar</div>
                </div>
              </a>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="btn btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performances;
