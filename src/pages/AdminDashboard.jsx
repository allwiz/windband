import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import MemberManagement from '../components/admin/MemberManagement'
import ContentManagement from '../components/admin/ContentManagement'
import {
  Users,
  Settings,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Bell,
  Edit3,
  UserCheck,
  UserX,
  Crown,
  Activity,
  LogOut
} from 'lucide-react'

const AdminDashboard = () => {
  const { user, profile, signOut, isSuperAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    totalEvents: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch member stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, status, role, created_at')

      // Fetch application stats
      const { data: applications } = await supabase
        .from('applications')
        .select('id, status')

      // Fetch event stats
      const { data: events } = await supabase
        .from('events')
        .select('id, status, start_date')

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('admin_activity_log')
        .select(`
          id, action, target_type, created_at,
          profiles!admin_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalMembers: profiles?.length || 0,
        activeMembers: profiles?.filter(p => p.status === 'active').length || 0,
        pendingApplications: applications?.filter(a => a.status === 'pending').length || 0,
        totalEvents: events?.filter(e => e.status === 'scheduled').length || 0,
        recentActivity: activity || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'applications', label: 'Applications', icon: UserCheck },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    ...(isSuperAdmin() ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="nav-blur border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-accent-600 p-2 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Global Mission Wind Band Management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 p-2 rounded-full">
                  {isSuperAdmin() ? (
                    <Crown className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-accent-600" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {profile?.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-accent-50 text-accent-700 border border-accent-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">
                  Dashboard Overview
                </h2>
                <p className="text-gray-600">
                  Welcome back! Here's what's happening with your band.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className="bg-accent-100 p-3 rounded-2xl">
                      <Users className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                      <p className="text-sm text-gray-600">Total Members</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-2xl">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                      <p className="text-sm text-gray-600">Active Members</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-100 p-3 rounded-2xl">
                      <UserX className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                      <p className="text-sm text-gray-600">Pending Applications</p>
                    </div>
                  </div>
                </div>

                <div className="card hover-lift">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-2xl">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                      <p className="text-sm text-gray-600">Upcoming Events</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-display font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>

                <div className="space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="bg-accent-100 p-2 rounded-full">
                          <Activity className="h-4 w-4 text-accent-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.profiles?.full_name || activity.profiles?.email || 'Unknown user'}
                            {' '}{activity.action} {activity.target_type}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && <MemberManagement />}
          {activeTab === 'content' && <ContentManagement />}

          {activeTab !== 'overview' && activeTab !== 'members' && activeTab !== 'content' && (
            <div className="card">
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Edit3 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-display font-semibold text-gray-900 mb-2">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
                </h3>
                <p className="text-gray-600 mb-6">
                  This section is under development. Full {activeTab} management features coming soon.
                </p>
                <button className="btn-primary">
                  Coming Soon
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard