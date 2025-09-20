// Test database connection script
import { quickDiagnostic, DatabaseDiagnostics } from '../lib/dbDiagnostics.js'
import { db } from '../lib/database.js'

console.log('🔍 Running database connection diagnostics...\n')

// Run the comprehensive diagnostics
try {
  const results = await quickDiagnostic()

  console.log('\n📋 DIAGNOSTIC RESULTS:')
  console.log('=====================')

  if (results.summary.success) {
    console.log('✅ DATABASE CONNECTION IS WORKING CORRECTLY!')
    console.log(`All ${results.summary.total} tests passed.`)
  } else {
    console.log('❌ DATABASE CONNECTION ISSUES DETECTED!')
    console.log(`${results.summary.failed} out of ${results.summary.total} tests failed.`)
    console.log('\nFailed tests:')
    results.results.filter(test => !test.success).forEach(test => {
      console.log(`  ❌ ${test.name}: ${test.message}`)
      if (test.details) {
        console.log(`     Details:`, test.details)
      }
    })
  }

  // Generate detailed report
  const diagnostics = new DatabaseDiagnostics()
  diagnostics.testResults = results.results
  const report = diagnostics.generateReport()

  console.log('\n📊 DETAILED REPORT:')
  console.log('==================')
  console.log(report)

} catch (error) {
  console.error('❌ Failed to run diagnostics:', error)
  console.error('Stack trace:', error.stack)
}

// Test basic database operations
console.log('\n🧪 Testing basic database operations...')

try {
  console.log('Testing health check...')
  const healthResult = await db.healthCheck()
  console.log('Health check result:', healthResult)

  console.log('\nTesting gallery items fetch...')
  const galleryItems = await db.fetchGalleryItems()
  console.log(`Gallery items result: ${galleryItems.length} items found`)

  console.log('\nTesting profiles fetch...')
  const profiles = await db.fetchProfiles()
  console.log(`Profiles result: ${profiles.length} profiles found`)

} catch (error) {
  console.error('❌ Database operation failed:', error)
}

console.log('\n✅ Database diagnostics complete!')