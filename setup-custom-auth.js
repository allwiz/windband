import { supabase } from './src/lib/supabase.js'

// Setup script for custom authentication system
async function setupCustomAuth() {
  try {
    console.log('🔧 Setting up custom authentication system...')

    // Test database connection
    console.log('📡 Testing database connection...')
    const { error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (testError && !testError.message.includes('relation "user_profiles" does not exist')) {
      console.error('❌ Database connection failed:', testError.message)
      return
    }

    if (testError?.message.includes('relation "user_profiles" does not exist')) {
      console.log('⚠️  Custom authentication tables not found.')
      console.log('📋 Please run the SQL script first:')
      console.log('   1. Go to: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol/sql')
      console.log('   2. Copy and paste the content from profile-auth-setup.sql')
      console.log('   3. Run the script')
      console.log('   4. Then run this setup script again')
      return
    }

    console.log('✅ Database connection successful')

    // Create admin user
    const adminEmail = 'admin@windband.com'
    const adminPassword = 'admin123'

    console.log(`👤 Creating admin user: ${adminEmail}`)

    // Register admin user
    const { data: registerData, error: registerError } = await supabase
      .rpc('register_user', {
        p_email: adminEmail,
        p_password: adminPassword,
        p_full_name: 'Admin User'
      })

    if (registerError) {
      console.error('❌ Error creating admin user:', registerError.message)
      return
    }

    const result = registerData[0]
    if (!result.success) {
      console.log('⚠️  Admin user might already exist:', result.message)

      // Try to update existing user to admin role
      console.log('🔄 Updating existing user to admin role...')
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('email', adminEmail)

      if (updateError) {
        console.error('❌ Error updating user role:', updateError.message)
        return
      }

      console.log('✅ Successfully updated existing user to admin role')
    } else {
      console.log('✅ Admin user created successfully')

      // Set admin role
      console.log('🛡️  Setting admin role...')
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', result.user_id)

      if (updateError) {
        console.error('❌ Error setting admin role:', updateError.message)
        return
      }

      console.log('✅ Admin role set successfully')
    }

    // Test login
    console.log('🔐 Testing admin login...')
    const { data: loginData, error: loginError } = await supabase
      .rpc('login_user', {
        p_email: adminEmail,
        p_password: adminPassword
      })

    if (loginError) {
      console.error('❌ Error testing login:', loginError.message)
      return
    }

    const loginResult = loginData[0]
    if (loginResult.success) {
      console.log('✅ Admin login test successful')
      console.log(`   User ID: ${loginResult.user_id}`)
      console.log(`   Role: ${loginResult.role}`)
      console.log(`   Name: ${loginResult.full_name}`)
    } else {
      console.error('❌ Login test failed:', loginResult.message)
      return
    }

    // Show summary
    console.log('\n🎉 Custom authentication system setup complete!')
    console.log('\n📋 Setup Summary:')
    console.log(`   Admin Email: ${adminEmail}`)
    console.log(`   Admin Password: ${adminPassword}`)
    console.log('   Authentication: Profile table-based')
    console.log('   Roles: admin, user')
    console.log('\n🚀 You can now:')
    console.log('   1. Start your application: npm run dev')
    console.log('   2. Login with the admin credentials above')
    console.log('   3. Access the admin panel to manage users')
    console.log('\n⚠️  Important:')
    console.log('   - Change the admin password after first login')
    console.log('   - The old Supabase auth system is now disabled')
    console.log('   - All authentication is handled through user_profiles table')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setupCustomAuth()