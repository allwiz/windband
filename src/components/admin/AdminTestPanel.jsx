import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  TestTube,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Database,
  RefreshCw
} from 'lucide-react'

const AdminTestPanel = () => {
  const { user, getAllUsers, setUserRole } = useAuth()
  const [testResults, setTestResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tests = [
      {
        name: 'User Authentication',
        test: async () => {
          if (!user) throw new Error('No user authenticated')
          if (!user.id) throw new Error('User ID missing')
          if (!user.email) throw new Error('User email missing')
          if (!user.role) throw new Error('User role missing')
          return `User: ${user.email} (${user.role})`
        }
      },
      {
        name: 'Admin Role Check',
        test: async () => {
          if (user?.role !== 'admin') throw new Error('User is not admin')
          return 'Admin role confirmed'
        }
      },
      {
        name: 'Get All Users',
        test: async () => {
          const result = await getAllUsers()
          if (!result.success) throw new Error(result.message)
          return `Found ${result.users.length} users`
        }
      },
      {
        name: 'User Role Management',
        test: async () => {
          // Test with own user (safe test)
          const result = await setUserRole(user.id, user.role)
          if (!result.success) throw new Error(result.message)
          return 'Role management working'
        }
      }
    ]

    const results = []

    for (const test of tests) {
      try {
        const result = await test.test()
        results.push({
          name: test.name,
          success: true,
          message: result,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      }
      setTestResults([...results])
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (success) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusColor = (success) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900">
            Admin System Tests
          </h2>
          <p className="text-gray-600">
            Verify admin functionality is working correctly
          </p>
        </div>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="btn-primary inline-flex items-center disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-xl">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Current User</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user?.email || 'Not available'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-accent-600" />
              <p className="text-gray-900 capitalize">{user?.role || 'Not available'}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">User ID</label>
            <p className="text-gray-900 text-xs font-mono">{user?.id || 'Not available'}</p>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-xl">
              <TestTube className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <span className="text-sm text-gray-500">
              {testResults.filter(t => t.success).length} / {testResults.length} passed
            </span>
          </div>

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`rounded-xl p-4 border-2 ${getStatusColor(result.success)}`}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(result.success)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{result.name}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{result.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Test Summary</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {testResults.every(t => t.success)
                ? '✅ All tests passed! Admin functionality is working correctly.'
                : '⚠️ Some tests failed. Admin functionality may have issues.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {testResults.length === 0 && (
        <div className="card text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <TestTube className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Admin System Testing
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Run Tests" to verify that all admin functionality is working correctly.
            This will test authentication, role management, and user operations.
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminTestPanel