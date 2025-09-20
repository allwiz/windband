import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    // If loading takes too long, show a timeout message
    const timer = setTimeout(() => {
      if (loading) {
        setShowTimeout(true)
      }
    }, 15000) // 15 seconds timeout

    return () => clearTimeout(timer)
  }, [loading])

  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Loading is taking longer than expected
            </h3>
            <p className="text-yellow-700 mb-4">
              Please check your internet connection and try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute