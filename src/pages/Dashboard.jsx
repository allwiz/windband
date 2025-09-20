import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, LogOut, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container-custom">
          <div className="flex justify-between items-center py-6">
            <h1 className="font-serif text-2xl font-bold text-primary-900">
              Member Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-primary-900 text-sm font-medium rounded-lg text-primary-900 bg-white hover:bg-primary-50 transition-colors duration-300"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-900 hover:bg-primary-800 transition-colors duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="font-serif text-xl font-bold text-primary-900 mb-4">
              Welcome to GMWB Member Portal
            </h2>
            <p className="text-gray-700">
              Welcome to the Global Mission Wind Band member portal! Here you can access
              exclusive content, updates, and resources for band members.
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="font-serif text-lg font-bold text-primary-900 mb-4">
              Your Profile
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {user?.user_metadata?.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-serif font-bold text-primary-900 mb-2">
                Rehearsal Schedule
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                View upcoming rehearsals and events
              </p>
              <button className="text-brass-600 hover:text-brass-700 font-medium text-sm">
                View Schedule →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-serif font-bold text-primary-900 mb-2">
                Sheet Music
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Access your digital sheet music library
              </p>
              <button className="text-brass-600 hover:text-brass-700 font-medium text-sm">
                Browse Music →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="font-serif font-bold text-primary-900 mb-2">
                Announcements
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                Stay updated with important band news
              </p>
              <button className="text-brass-600 hover:text-brass-700 font-medium text-sm">
                Read Updates →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard