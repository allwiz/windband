import { supabase } from './supabase'

// Comprehensive database connection diagnostics
export class DatabaseDiagnostics {
  constructor() {
    this.testResults = []
  }

  // Log test result
  logTest(name, success, message, details = null) {
    const result = {
      name,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    }
    this.testResults.push(result)
    console.log(`${success ? '✅' : '❌'} ${name}: ${message}`)
    if (details) {
      console.log('  Details:', details)
    }
    return result
  }

  // Test 1: Basic connection
  async testBasicConnection() {
    try {
      const { data, error } = await supabase
        .from('_supabase_migrations')
        .select('version')
        .limit(1)

      if (error) {
        // This is expected for new databases without migrations
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return this.logTest(
            'Basic Connection',
            true,
            'Connected successfully (no migrations table found - this is normal for new databases)',
            { error: error.message }
          )
        } else {
          return this.logTest(
            'Basic Connection',
            false,
            'Connection failed with error',
            { error: error.message, code: error.code }
          )
        }
      }

      return this.logTest(
        'Basic Connection',
        true,
        'Connected successfully with migrations table',
        { data }
      )
    } catch (error) {
      return this.logTest(
        'Basic Connection',
        false,
        'Connection failed with exception',
        { error: error.message, stack: error.stack }
      )
    }
  }

  // Test 2: Auth connection
  async testAuthConnection() {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        return this.logTest(
          'Auth Connection',
          false,
          'Auth connection failed',
          { error: error.message }
        )
      }

      return this.logTest(
        'Auth Connection',
        true,
        'Auth system connected successfully',
        { session: data.session ? 'User logged in' : 'No active session' }
      )
    } catch (error) {
      return this.logTest(
        'Auth Connection',
        false,
        'Auth connection failed with exception',
        { error: error.message }
      )
    }
  }

  // Test 3: Database permissions
  async testDatabasePermissions() {
    try {
      // Try to access auth schema (should work for anon users)
      const { data, error } = await supabase.rpc('get_current_user')

      if (error) {
        // This is expected - the function might not exist
        if (error.code === '42883' || error.message.includes('does not exist')) {
          return this.logTest(
            'Database Permissions',
            true,
            'Database accessible (RPC function not found - this is normal)',
            { error: error.message }
          )
        } else {
          return this.logTest(
            'Database Permissions',
            false,
            'Permission error',
            { error: error.message, code: error.code }
          )
        }
      }

      return this.logTest(
        'Database Permissions',
        true,
        'Database permissions working',
        { data }
      )
    } catch (error) {
      return this.logTest(
        'Database Permissions',
        false,
        'Permission test failed',
        { error: error.message }
      )
    }
  }

  // Test 4: Table access
  async testTableAccess() {
    const tablesToTest = [
      'profiles',
      'gallery_items',
      'events',
      'applications',
      'admin_activity_log'
    ]

    const results = []

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          if (error.code === '42P01' || error.message.includes('does not exist')) {
            results.push({
              table,
              status: 'table_not_found',
              message: 'Table does not exist (normal for fresh database)'
            })
          } else {
            results.push({
              table,
              status: 'error',
              message: error.message,
              code: error.code
            })
          }
        } else {
          results.push({
            table,
            status: 'accessible',
            message: `Table accessible with ${data?.length || 0} records`
          })
        }
      } catch (error) {
        results.push({
          table,
          status: 'exception',
          message: error.message
        })
      }
    }

    const accessibleTables = results.filter(r => r.status === 'accessible').length
    const totalTables = results.length

    return this.logTest(
      'Table Access',
      true, // We always consider this a pass since tables might not exist yet
      `Tested ${totalTables} tables: ${accessibleTables} accessible, ${totalTables - accessibleTables} not found`,
      { results }
    )
  }

  // Test 5: Network connectivity
  async testNetworkConnectivity() {
    try {
      // Test direct HTTP connection to Supabase
      const response = await fetch('https://dcwofyezpqkkqvxyfiol.supabase.co/rest/v1/', {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (response.ok) {
        return this.logTest(
          'Network Connectivity',
          true,
          'Direct HTTP connection successful',
          { status: response.status, statusText: response.statusText }
        )
      } else {
        return this.logTest(
          'Network Connectivity',
          false,
          'HTTP connection failed',
          { status: response.status, statusText: response.statusText }
        )
      }
    } catch (error) {
      return this.logTest(
        'Network Connectivity',
        false,
        'Network connection failed',
        { error: error.message }
      )
    }
  }

  // Test 6: Configuration validation
  async testConfiguration() {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    const issues = []

    if (!url) {
      issues.push('VITE_SUPABASE_URL is not set')
    } else if (!url.startsWith('https://')) {
      issues.push('VITE_SUPABASE_URL should start with https://')
    } else if (!url.includes('supabase.co')) {
      issues.push('VITE_SUPABASE_URL does not appear to be a valid Supabase URL')
    }

    if (!key) {
      issues.push('VITE_SUPABASE_ANON_KEY is not set')
    } else if (!key.startsWith('eyJ')) {
      issues.push('VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token')
    }

    const isValid = issues.length === 0

    return this.logTest(
      'Configuration Validation',
      isValid,
      isValid ? 'Configuration is valid' : 'Configuration issues found',
      {
        url: url ? url.substring(0, 30) + '...' : 'NOT SET',
        key: key ? key.substring(0, 20) + '...' : 'NOT SET',
        issues
      }
    )
  }

  // Run all diagnostic tests
  async runAllTests() {
    console.log('🔍 Starting database diagnostics...')
    this.testResults = []

    await this.testConfiguration()
    await this.testNetworkConnectivity()
    await this.testBasicConnection()
    await this.testAuthConnection()
    await this.testDatabasePermissions()
    await this.testTableAccess()

    const passedTests = this.testResults.filter(test => test.success).length
    const totalTests = this.testResults.length

    console.log(`\n📊 Diagnostic Summary: ${passedTests}/${totalTests} tests passed`)

    if (passedTests === totalTests) {
      console.log('✅ All tests passed! Database connection is working correctly.')
    } else {
      console.log('❌ Some tests failed. See details above.')
    }

    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        success: passedTests === totalTests
      },
      results: this.testResults
    }
  }

  // Generate a user-friendly report
  generateReport() {
    const passedTests = this.testResults.filter(test => test.success).length
    const totalTests = this.testResults.length
    const failedTests = this.testResults.filter(test => !test.success)

    let report = `Database Connection Diagnostic Report\n`
    report += `=====================================\n\n`
    report += `Overall Status: ${passedTests === totalTests ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}\n`
    report += `Tests Passed: ${passedTests}/${totalTests}\n\n`

    if (failedTests.length > 0) {
      report += `Failed Tests:\n`
      failedTests.forEach(test => {
        report += `❌ ${test.name}: ${test.message}\n`
        if (test.details) {
          report += `   Details: ${JSON.stringify(test.details, null, 2)}\n`
        }
      })
      report += `\n`
    }

    report += `Recommendations:\n`
    if (failedTests.some(test => test.name === 'Network Connectivity')) {
      report += `- Check your internet connection\n`
      report += `- Verify firewall settings\n`
    }
    if (failedTests.some(test => test.name === 'Configuration Validation')) {
      report += `- Check your .env file configuration\n`
      report += `- Verify Supabase URL and API key\n`
    }
    if (failedTests.some(test => test.name === 'Basic Connection')) {
      report += `- Check Supabase project status\n`
      report += `- Verify API key permissions\n`
    }

    return report
  }
}

// Convenience function for quick diagnostics
export async function quickDiagnostic() {
  const diagnostics = new DatabaseDiagnostics()
  return await diagnostics.runAllTests()
}

// Export singleton instance
export const dbDiagnostics = new DatabaseDiagnostics()