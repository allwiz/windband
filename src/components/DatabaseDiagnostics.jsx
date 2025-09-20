import { useState } from 'react'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Wifi, Settings } from 'lucide-react'
import { quickDiagnostic } from '../lib/dbDiagnostics'

const DatabaseDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [lastRun, setLastRun] = useState(null)

  const runDiagnostics = async () => {
    setIsRunning(true)
    try {
      console.log('🔍 Running database diagnostics...')
      const diagnosticResults = await quickDiagnostic()
      setResults(diagnosticResults)
      setLastRun(new Date())
    } catch (error) {
      console.error('Failed to run diagnostics:', error)
      setResults({
        summary: { total: 0, passed: 0, failed: 1, success: false },
        results: [{
          name: 'Diagnostic System',
          success: false,
          message: 'Failed to run diagnostics: ' + error.message,
          details: { error: error.message }
        }]
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (success) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getStatusColor = (success) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Database Diagnostics</h2>
            <p className="text-gray-600">Test and validate database connection</p>
          </div>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
        >
          <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Tests...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {lastRun && (
        <div className="mb-6 text-sm text-gray-500">
          Last run: {lastRun.toLocaleString()}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className={`rounded-xl p-6 border-2 ${
            results.summary.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {results.summary.success ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {results.summary.success ? 'All Tests Passed!' : 'Issues Detected'}
                </h3>
                <p className="text-gray-700">
                  {results.summary.passed} of {results.summary.total} tests passed
                </p>
              </div>
            </div>

            {!results.summary.success && (
              <div className="bg-white rounded-lg p-4 border border-red-300">
                <h4 className="font-semibold text-red-800 mb-2">Recommendations:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {results.results.some(test => test.name === 'Network Connectivity' && !test.success) && (
                    <>
                      <li>• Check your internet connection</li>
                      <li>• Verify firewall settings allow Supabase access</li>
                    </>
                  )}
                  {results.results.some(test => test.name === 'Configuration Validation' && !test.success) && (
                    <>
                      <li>• Verify .env file configuration</li>
                      <li>• Check Supabase URL and API key</li>
                    </>
                  )}
                  {results.results.some(test => test.name === 'Basic Connection' && !test.success) && (
                    <>
                      <li>• Check Supabase project status</li>
                      <li>• Verify API key permissions</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Individual Test Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Details</h3>
            {results.results.map((test, index) => (
              <div key={index} className={`rounded-xl p-4 border-2 ${getStatusColor(test.success)}`}>
                <div className="flex items-start space-x-3">
                  {getStatusIcon(test.success)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{test.name}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{test.message}</p>

                    {test.details && (
                      <details className="mt-3">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          View Details
                        </summary>
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Display */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Current Configuration</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-gray-700">Supabase URL:</label>
                <p className="text-gray-600 font-mono text-xs break-all">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                </p>
              </div>
              <div>
                <label className="font-medium text-gray-700">API Key:</label>
                <p className="text-gray-600 font-mono text-xs">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY
                    ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...`
                    : 'Not configured'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!results && (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Test Database Connection
          </h3>
          <p className="text-gray-600 mb-6">
            Click "Run Diagnostics" to test your database connection and identify any issues.
          </p>
        </div>
      )}
    </div>
  )
}

export default DatabaseDiagnostics