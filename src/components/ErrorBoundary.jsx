import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Check if it's a database-related error
    if (error.message.includes('supabase') ||
        error.message.includes('database') ||
        error.message.includes('fetch') ||
        error.message.includes('timed out')) {
      console.error('Database-related error detected:', error.message)
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>

              <p className="text-gray-600 mb-6 leading-relaxed">
                We encountered an unexpected error. This might be due to a temporary
                database connection issue or network problem.
              </p>

              {this.state.error?.message.includes('timed out') && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Timeout detected:</strong> The database connection timed out.
                    Please check your internet connection and try again.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRefresh}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh Page
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors inline-flex items-center justify-center"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Go to Home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                    Error Details (Development Mode)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary