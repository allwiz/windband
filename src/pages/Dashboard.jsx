import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Music, Calendar, LogOut, Mail, Phone, Edit2, Save, X } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container-main py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="card-feature p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="icon-box w-16 h-16 rounded-2xl">
                  <User className="h-7 w-7 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!
                  </h1>
                  <p className="text-gray-500">Manage your account and preferences</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>

            {/* User Role Badge */}
            <span className="badge">
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </span>
          </div>

          {/* Profile Information */}
          <div className="card-feature p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="icon-box">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-6 px-4 py-3 rounded-xl flex items-center text-small ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-small font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-small font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input pl-10 bg-gray-100 text-gray-500"
                  />
                </div>
                <p className="mt-1.5 text-tiny text-gray-400">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-small font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`input pl-10 ${!isEditing ? 'bg-gray-100 text-gray-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-feature cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="icon-box group-hover:scale-110 transition-transform">
                  <Music className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Instruments</h3>
                  <p className="text-small text-gray-500">Manage your instruments</p>
                </div>
              </div>
            </div>

            <div className="card-feature cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="icon-box group-hover:scale-110 transition-transform">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Event History</h3>
                  <p className="text-small text-gray-500">View past performances</p>
                </div>
              </div>
            </div>

            <div className="card-feature cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="icon-box group-hover:scale-110 transition-transform">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Preferences</h3>
                  <p className="text-small text-gray-500">Notification settings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
