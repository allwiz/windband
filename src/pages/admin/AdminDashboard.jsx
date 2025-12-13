import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { authService } from '../../lib/auth';
import GalleryForm from './components/GalleryForm';
import GalleryList from './components/GalleryList';
import PerformanceForm from './components/PerformanceForm';
import PerformanceList from './components/PerformanceList';
import OpeningsForm from './components/OpeningsForm';
import OpeningsList from './components/OpeningsList';
import {
  Users,
  Shield,
  Settings,
  UserCheck,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
  Image,
  Music,
  FileText,
  Menu,
  X,
  Plus,
  Home,
  List,
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  Clock,
  MapPin,
  RefreshCw,
  Globe,
  Link as LinkIcon,
  Check
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminCount: 0,
    recentSignups: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [editingOpeningItem, setEditingOpeningItem] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', event_type: 'rehearsal', location: '',
    date: new Date().toISOString().split('T')[0], start_time: '', end_time: '',
    is_recurring: false, recurrence_pattern: '', is_active: true
  });

  // Content state
  const [siteContent, setSiteContent] = useState([]);
  const [editingContent, setEditingContent] = useState(null);

  // Settings state
  const [siteSettings, setSiteSettings] = useState([]);
  const [savingSettings, setSavingSettings] = useState({});

  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'gallery', label: 'Add Gallery Item', icon: Image },
    { id: 'galleryList', label: 'Gallery List', icon: List },
    { id: 'performance', label: 'Add Performance', icon: Music },
    { id: 'performanceList', label: 'Performance List', icon: Music },
    { id: 'openings', label: 'Add Opening', icon: Plus },
    { id: 'openingsList', label: 'Openings List', icon: List },
    { id: 'events', label: 'Manage Events', icon: Calendar },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (activeSection === 'dashboard' || activeSection === 'users') {
      fetchDashboardData();
    } else if (activeSection === 'events') {
      fetchEvents();
    } else if (activeSection === 'content') {
      fetchContent();
    } else if (activeSection === 'settings') {
      fetchSettings();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get session token from authService
      const sessionToken = authService.sessionToken;
      if (!sessionToken) {
        throw new Error('No valid session');
      }

      const { data: allUsers, error: usersError } = await supabase
        .rpc('get_all_users_admin', { p_session_token: sessionToken });

      if (usersError) throw usersError;

      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.is_active).length,
        adminCount: allUsers.filter(u => u.role === 'admin').length,
        recentSignups: allUsers.filter(u => new Date(u.created_at) > lastWeek).length
      };

      setStats(stats);
      setUsers(allUsers.slice(0, 10));

    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_toggle_user_status', {
        p_session_token: sessionToken,
        p_user_id: userId,
        p_is_active: !currentStatus
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status: ' + err.message);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_change_user_role', {
        p_session_token: sessionToken,
        p_user_id: userId,
        p_new_role: newRole
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role: ' + err.message);
    }
  };

  // Events functions
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_get_events', { p_session_token: sessionToken });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError('Failed to load events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_upsert_event', {
        p_session_token: sessionToken,
        p_id: editingEvent?.id || null,
        p_title: eventForm.title,
        p_description: eventForm.description,
        p_event_type: eventForm.event_type,
        p_location: eventForm.location,
        p_date: eventForm.date,
        p_start_time: eventForm.start_time || null,
        p_end_time: eventForm.end_time || null,
        p_is_recurring: eventForm.is_recurring,
        p_recurrence_pattern: eventForm.recurrence_pattern || null,
        p_is_active: eventForm.is_active
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      resetEventForm();
      fetchEvents();
    } catch (err) {
      setError('Failed to save event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_delete_event', { p_session_token: sessionToken, p_id: id });
      if (error) throw error;
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event: ' + err.message);
    }
  };

  const editEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title, description: event.description || '', event_type: event.event_type,
      location: event.location || '', date: event.date, start_time: event.start_time || '',
      end_time: event.end_time || '', is_recurring: event.is_recurring,
      recurrence_pattern: event.recurrence_pattern || '', is_active: event.is_active
    });
  };

  const resetEventForm = () => {
    setEditingEvent(null);
    setEventForm({
      title: '', description: '', event_type: 'rehearsal', location: '',
      date: new Date().toISOString().split('T')[0], start_time: '', end_time: '',
      is_recurring: false, recurrence_pattern: '', is_active: true
    });
  };

  // Content functions
  const fetchContent = async () => {
    try {
      setLoading(true);
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_get_content', { p_session_token: sessionToken });
      if (error) throw error;
      setSiteContent(data || []);
    } catch (err) {
      setError('Failed to load content: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (key, value) => {
    try {
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_update_content', {
        p_session_token: sessionToken, p_key: key, p_value: value
      });
      if (error) throw error;
      setEditingContent(null);
      fetchContent();
    } catch (err) {
      setError('Failed to update content: ' + err.message);
    }
  };

  // Settings functions
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_get_settings', { p_session_token: sessionToken });
      if (error) throw error;
      setSiteSettings(data || []);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      setSavingSettings(prev => ({ ...prev, [key]: true }));
      const sessionToken = authService.sessionToken;
      const { data, error } = await supabase.rpc('admin_update_setting', {
        p_session_token: sessionToken, p_key: key, p_value: value
      });
      if (error) throw error;
      fetchSettings();
    } catch (err) {
      setError('Failed to update setting: ' + err.message);
    } finally {
      setSavingSettings(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'openings':
        return (
          <OpeningsForm
            editItem={editingOpeningItem}
            onSuccess={() => {
              setEditingOpeningItem(null);
              setActiveSection('openingsList');
            }}
          />
        );

      case 'openingsList':
        return (
          <OpeningsList
            onAddNew={() => {
              setEditingOpeningItem(null);
              setActiveSection('openings');
            }}
            onEdit={(item) => {
              setEditingOpeningItem(item);
              setActiveSection('openings');
            }}
          />
        );

      case 'performance':
        return (
          <PerformanceForm onSuccess={() => setActiveSection('performanceList')} />
        );

      case 'performanceList':
        return (
          <PerformanceList onAddNew={() => setActiveSection('performance')} />
        );

      case 'gallery':
        return (
          <GalleryForm
            editItem={editingGalleryItem}
            onSuccess={() => {
              setEditingGalleryItem(null);
              setActiveSection('galleryList');
            }}
          />
        );

      case 'galleryList':
        return (
          <GalleryList
            onAddNew={() => {
              setEditingGalleryItem(null);
              setActiveSection('gallery');
            }}
            onEdit={(item) => {
              setEditingGalleryItem(item);
              setActiveSection('gallery');
            }}
          />
        );

      case 'users':
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Users</h2>
            {renderUsersTable()}
          </div>
        );

      case 'events':
        return renderEventsSection();

      case 'content':
        return renderContentSection();

      case 'settings':
        return renderSettingsSection();

      case 'dashboard':
      default:
        return (
          <>
            {renderStatsCards()}
            {renderUsersTable()}
          </>
        );
    }
  };

  // Events Section UI
  const renderEventsSection = () => (
    <div className="space-y-6">
      {/* Event Form */}
      <div className="card-feature">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </h3>
        <form onSubmit={handleEventSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="input" placeholder="Event title" />
            </div>
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">Type *</label>
              <select value={eventForm.event_type}
                onChange={(e) => setEventForm({...eventForm, event_type: e.target.value})}
                className="input">
                <option value="rehearsal">Rehearsal</option>
                <option value="meeting">Meeting</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">Date *</label>
              <input type="date" required value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                className="input" />
            </div>
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={eventForm.location}
                onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                className="input" placeholder="Event location" />
            </div>
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" value={eventForm.start_time}
                onChange={(e) => setEventForm({...eventForm, start_time: e.target.value})}
                className="input" />
            </div>
            <div>
              <label className="block text-small font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" value={eventForm.end_time}
                onChange={(e) => setEventForm({...eventForm, end_time: e.target.value})}
                className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-small font-medium text-gray-700 mb-1">Description</label>
              <textarea value={eventForm.description} rows={2}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="input" placeholder="Event description" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={eventForm.is_recurring}
                  onChange={(e) => setEventForm({...eventForm, is_recurring: e.target.checked})}
                  className="rounded border-gray-300" />
                <span className="text-small text-gray-700">Recurring</span>
              </label>
              {eventForm.is_recurring && (
                <select value={eventForm.recurrence_pattern}
                  onChange={(e) => setEventForm({...eventForm, recurrence_pattern: e.target.value})}
                  className="input w-auto">
                  <option value="">Select pattern</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              )}
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={eventForm.is_active}
                  onChange={(e) => setEventForm({...eventForm, is_active: e.target.checked})}
                  className="rounded border-gray-300" />
                <span className="text-small text-gray-700">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              <Save className="h-4 w-4 mr-1" /> {editingEvent ? 'Update' : 'Add'} Event
            </button>
            {editingEvent && (
              <button type="button" onClick={resetEventForm} className="btn btn-secondary">Cancel</button>
            )}
          </div>
        </form>
      </div>

      {/* Events List */}
      <div className="card-feature p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">All Events</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No events found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{event.title}</span>
                    <span className={`px-2 py-0.5 text-tiny rounded-full ${
                      event.event_type === 'rehearsal' ? 'bg-blue-50 text-blue-700' :
                      event.event_type === 'meeting' ? 'bg-purple-50 text-purple-700' :
                      event.event_type === 'social' ? 'bg-green-50 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{event.event_type}</span>
                    {event.is_recurring && <RefreshCw className="h-3 w-3 text-gray-400" />}
                    {!event.is_active && <span className="px-2 py-0.5 text-tiny bg-red-50 text-red-700 rounded-full">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-4 text-small text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.date).toLocaleDateString()}</span>
                    {event.start_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.start_time}{event.end_time && ` - ${event.end_time}`}</span>}
                    {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => editEvent(event)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="h-4 w-4 text-gray-500" /></button>
                  <button onClick={() => deleteEvent(event.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Content Section UI
  const renderContentSection = () => (
    <div className="card-feature">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4" /> Site Content
      </h3>
      <p className="text-small text-gray-500 mb-6">Edit content blocks displayed across the website.</p>
      {loading ? (
        <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-4">
          {siteContent.map((content) => (
            <div key={content.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900">{content.content_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  {content.description && <p className="text-tiny text-gray-500">{content.description}</p>}
                </div>
                <button onClick={() => setEditingContent(editingContent === content.content_key ? null : content.content_key)}
                  className="p-1.5 hover:bg-gray-200 rounded-lg">
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              {editingContent === content.content_key ? (
                <div className="space-y-2">
                  <textarea defaultValue={content.content_value} rows={3} className="input"
                    id={`content-${content.content_key}`} />
                  <div className="flex gap-2">
                    <button onClick={() => updateContent(content.content_key, document.getElementById(`content-${content.content_key}`).value)}
                      className="btn btn-primary text-small py-1.5"><Save className="h-3 w-3 mr-1" />Save</button>
                    <button onClick={() => setEditingContent(null)} className="btn btn-secondary text-small py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-small text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{content.content_value || <em className="text-gray-400">No content</em>}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Settings Section UI
  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div className="card-feature">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" /> Site Settings
        </h3>
        <p className="text-small text-gray-500 mb-6">Configure website settings and preferences.</p>
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-4">
            {siteSettings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    {setting.setting_type === 'email' && <Mail className="h-4 w-4 text-gray-400" />}
                    {setting.setting_type === 'url' && <LinkIcon className="h-4 w-4 text-gray-400" />}
                    {setting.setting_type === 'boolean' && <Check className="h-4 w-4 text-gray-400" />}
                    {(setting.setting_type === 'text' || setting.setting_type === 'number') && <Globe className="h-4 w-4 text-gray-400" />}
                    <span className="font-medium text-gray-900">{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  {setting.description && <p className="text-tiny text-gray-500 mt-0.5">{setting.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {setting.setting_type === 'boolean' ? (
                    <button onClick={() => updateSetting(setting.setting_key, setting.setting_value === 'true' ? 'false' : 'true')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${setting.setting_value === 'true' ? 'bg-gray-900' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${setting.setting_value === 'true' ? 'left-7' : 'left-1'}`} />
                    </button>
                  ) : (
                    <>
                      <input type={setting.setting_type === 'email' ? 'email' : setting.setting_type === 'url' ? 'url' : 'text'}
                        defaultValue={setting.setting_value} className="input w-64" id={`setting-${setting.setting_key}`}
                        placeholder={setting.setting_type === 'url' ? 'https://...' : ''} />
                      <button onClick={() => updateSetting(setting.setting_key, document.getElementById(`setting-${setting.setting_key}`).value)}
                        disabled={savingSettings[setting.setting_key]}
                        className="btn btn-primary py-2">
                        {savingSettings[setting.setting_key] ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="card-feature">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-small text-gray-500">Total Users</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="icon-box icon-box-lg">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="card-feature">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-small text-gray-500">Active Users</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.activeUsers}</p>
          </div>
          <div className="icon-box icon-box-lg">
            <UserCheck className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="card-feature">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-small text-gray-500">Administrators</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.adminCount}</p>
          </div>
          <div className="icon-box icon-box-lg">
            <Shield className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="card-feature">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-small text-gray-500">New This Week</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.recentSignups}</p>
          </div>
          <div className="icon-box icon-box-lg">
            <TrendingUp className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTable = () => (
    <div className="card-feature p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">Recent Users</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-tiny font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="icon-box">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                    <span className="text-small font-medium text-gray-900">
                      {u.full_name || 'No name'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-small text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={u.role}
                    onChange={(e) => changeUserRole(u.id, e.target.value)}
                    className="text-small border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 bg-white"
                    disabled={u.id === user.id}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-tiny font-medium rounded-full ${
                    u.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-small text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    disabled={u.id === user.id}
                    className={`px-3 py-1.5 rounded-lg text-small font-medium transition-colors ${
                      u.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && activeSection === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out flex flex-col`}>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h1 className={`font-semibold text-lg text-gray-900 ${!sidebarOpen && 'hidden'}`}>
                Admin Panel
              </h1>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5 text-gray-500" /> : <Menu className="h-5 w-5 text-gray-500" />}
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-small font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Back to Home Button */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-small font-medium">Back to Home</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="icon-box">
                <Shield className="h-4 w-4 text-gray-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeSection === 'dashboard' ? 'Dashboard' :
                 activeSection === 'users' ? 'User Management' :
                 activeSection === 'gallery' ? 'Gallery Management' :
                 activeSection === 'galleryList' ? 'Gallery List' :
                 activeSection === 'performance' ? 'Performance Management' :
                 activeSection === 'performanceList' ? 'Performance List' :
                 activeSection === 'openings' ? 'Openings Management' :
                 activeSection === 'openingsList' ? 'Openings List' :
                 activeSection === 'events' ? 'Event Management' :
                 activeSection === 'content' ? 'Content Management' :
                 activeSection === 'settings' ? 'Site Settings' :
                 'Admin Dashboard'}
              </h1>
            </div>
            <p className="text-gray-500">
              {activeSection === 'dashboard' ? 'Monitor system activity and manage users' :
               activeSection === 'gallery' ? 'Add and manage gallery items' :
               activeSection === 'galleryList' ? 'View and manage gallery items' :
               activeSection === 'performance' ? 'Add and manage performances' :
               activeSection === 'performanceList' ? 'View and manage performances' :
               activeSection === 'openings' ? 'Add and manage instrument openings' :
               activeSection === 'openingsList' ? 'View and manage instrument openings' :
               activeSection === 'events' ? 'Schedule rehearsals, meetings, and events' :
               activeSection === 'content' ? 'Edit website content and text blocks' :
               activeSection === 'settings' ? 'Configure site settings and preferences' :
               'Manage your application'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center text-small">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
