import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { galleryService } from '../../services/galleryService';
import {
  Users,
  Shield,
  Activity,
  Settings,
  UserCheck,
  UserX,
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
  Upload,
  Trash2,
  Edit,
  Eye,
  List
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
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

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'concerts',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [showGalleryList, setShowGalleryList] = useState(false);

  const sidebarMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'gallery', label: 'Add Gallery Item', icon: Image },
    { id: 'galleryList', label: 'Gallery List', icon: List },
    { id: 'events', label: 'Manage Events', icon: Calendar },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    if (activeSection === 'dashboard' || activeSection === 'users') {
      fetchDashboardData();
    } else if (activeSection === 'galleryList') {
      fetchGalleryItems();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user statistics
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Calculate stats
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.is_active).length,
        adminCount: allUsers.filter(u => u.role === 'admin').length,
        recentSignups: allUsers.filter(u => new Date(u.created_at) > lastWeek).length
      };

      setStats(stats);
      setUsers(allUsers.slice(0, 10)); // Show latest 10 users

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Refresh data
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const fetchGalleryItems = async () => {
    setLoading(true);
    const result = await galleryService.getGalleryItems();
    if (result.success) {
      setGalleryItems(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    setUploadLoading(true);
    setError('');

    try {
      // Upload image to Supabase storage
      const uploadResult = await galleryService.uploadImage(selectedFile, galleryForm.category);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Get image dimensions
      const dimensions = await galleryService.getImageDimensions(selectedFile);

      // Create gallery item in database
      const galleryData = {
        title: galleryForm.title,
        description: galleryForm.description,
        category: galleryForm.category,
        imageUrl: uploadResult.url,
        storagePath: uploadResult.storagePath,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        width: dimensions.width,
        height: dimensions.height,
        date: galleryForm.date
      };

      const createResult = await galleryService.createGalleryItem(galleryData);

      if (createResult.success) {
        alert('Gallery item added successfully!');

        // Reset form
        setGalleryForm({
          title: '',
          description: '',
          category: 'concerts',
          date: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setImagePreview('');

        // If on gallery list view, refresh the list
        if (activeSection === 'galleryList') {
          fetchGalleryItems();
        }
      } else {
        throw new Error(createResult.error);
      }
    } catch (err) {
      setError('Failed to add gallery item: ' + err.message);
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    const result = await galleryService.deleteGalleryItem(id);
    if (result.success) {
      fetchGalleryItems();
    } else {
      alert('Failed to delete gallery item: ' + result.error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'gallery':
        return (
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Image className="h-6 w-6 mr-2 text-accent-600" />
              Add Gallery Item
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleGallerySubmit} className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="Enter image title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                  >
                    <option value="concerts">Concerts</option>
                    <option value="rehearsals">Rehearsals</option>
                    <option value="events">Events</option>
                    <option value="members">Members</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm({ ...galleryForm, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-accent-500 transition-colors flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100"
                    >
                      <Upload className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-600">
                        {selectedFile ? selectedFile.name : 'Choose an image'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="Enter image description"
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-64 object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setGalleryForm({
                      title: '',
                      description: '',
                      category: 'concerts',
                      date: new Date().toISOString().split('T')[0]
                    });
                    setSelectedFile(null);
                    setImagePreview('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      <span>Add to Gallery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 'galleryList':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <List className="h-6 w-6 mr-2 text-accent-600" />
                Gallery Items
              </div>
              <button
                onClick={() => setActiveSection('gallery')}
                className="px-4 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </button>
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No gallery items found</p>
                <button
                  onClick={() => setActiveSection('gallery')}
                  className="mt-4 px-6 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-colors"
                >
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleryItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="system-ui" font-size="14"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.category} • {new Date(item.date).toLocaleDateString()}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(item.image_url, '_blank')}
                            className="text-gray-600 hover:text-accent-600"
                            title="View Full Image"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGalleryItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'users':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
            {renderUsersTable()}
          </div>
        );

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

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Administrators</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adminCount}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">New This Week</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentSignups}</p>
          </div>
          <div className="bg-accent-100 p-3 rounded-xl">
            <TrendingUp className="h-8 w-8 text-accent-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTable = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {u.full_name || 'No name'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={u.role}
                    onChange={(e) => changeUserRole(u.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent-600"
                    disabled={u.id === user.id}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    u.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    disabled={u.id === user.id}
                    className={`px-3 py-1 rounded-lg font-medium ${
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-white shadow-lg min-h-screen transition-all duration-300 ease-in-out`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className={`font-bold text-xl text-gray-800 ${!sidebarOpen && 'hidden'}`}>
                Admin Panel
              </h1>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-accent-100 text-accent-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-accent-600" />
              {activeSection === 'dashboard' ? 'Dashboard' :
               activeSection === 'users' ? 'User Management' :
               activeSection === 'gallery' ? 'Gallery Management' :
               'Admin Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeSection === 'dashboard' ? 'Monitor system activity and manage users' :
               activeSection === 'gallery' ? 'Add and manage gallery items' :
               'Manage your application'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
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