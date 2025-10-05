import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
  ArrowLeft
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
        } bg-white shadow-lg min-h-screen transition-all duration-300 ease-in-out flex flex-col`}>
          <div className="p-4 flex-1 flex flex-col">
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

            <nav className="space-y-2 flex-1">
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

            {/* Back to Home Button */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                title="Back to Home"
              >
                <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium">Back to Home</span>
                )}
              </button>
            </div>
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
               activeSection === 'galleryList' ? 'Gallery List' :
               activeSection === 'performance' ? 'Performance Management' :
               activeSection === 'performanceList' ? 'Performance List' :
               activeSection === 'openings' ? 'Openings Management' :
               activeSection === 'openingsList' ? 'Openings List' :
               'Admin Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeSection === 'dashboard' ? 'Monitor system activity and manage users' :
               activeSection === 'gallery' ? 'Add and manage gallery items' :
               activeSection === 'galleryList' ? 'View and manage gallery items' :
               activeSection === 'performance' ? 'Add and manage performances' :
               activeSection === 'performanceList' ? 'View and manage performances' :
               activeSection === 'openings' ? 'Add and manage instrument openings' :
               activeSection === 'openingsList' ? 'View and manage instrument openings' :
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