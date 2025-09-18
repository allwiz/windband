import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dcwofyezpqkkqvxyfiol.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupFirstAdmin() {
  console.log('🚀 Setting up first admin user...')

  // Create admin user
  const adminEmail = 'admin@gmwb.com'
  const adminPassword = 'AdminPassword123!'

  console.log('📧 Creating admin user with email:', adminEmail)

  try {
    // Sign up the admin user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'System Administrator'
        }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('✅ Admin user already exists')

        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })

        if (signInError) {
          console.error('❌ Error signing in existing admin:', signInError.message)
          return false
        }

        const userId = signInData.user.id
        console.log('👤 Found existing admin user ID:', userId)

        // Update their role to super_admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'super_admin',
            status: 'active',
            full_name: 'System Administrator'
          })
          .eq('id', userId)

        if (updateError) {
          console.error('❌ Error updating admin role:', updateError.message)
          return false
        }

        console.log('✅ Admin role updated successfully')
        return true

      } else {
        console.error('❌ Error creating admin user:', signUpError.message)
        return false
      }
    }

    console.log('✅ Admin user created successfully!')
    console.log('👤 User ID:', signUpData.user?.id)

    if (signUpData.user) {
      // Wait a moment for the profile trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update the user's role to super_admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'super_admin',
          status: 'active',
          full_name: 'System Administrator'
        })
        .eq('id', signUpData.user.id)

      if (updateError) {
        console.error('❌ Error updating admin role:', updateError.message)
        console.log('🔧 You may need to manually update the role in Supabase dashboard')
        return false
      }

      console.log('✅ Admin role set to super_admin')
    }

    return true

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

async function insertSampleContent() {
  console.log('📝 Adding sample content...')

  const sampleContent = [
    {
      page: 'home',
      section: 'hero_title',
      content_type: 'text',
      title: 'Main Hero Title',
      content: 'Global Mission Wind Band'
    },
    {
      page: 'home',
      section: 'hero_subtitle',
      content_type: 'text',
      title: 'Hero Subtitle',
      content: 'Excellence in Musical Performance'
    },
    {
      page: 'home',
      section: 'hero_description',
      content_type: 'text',
      title: 'Hero Description',
      content: 'Experience the power and beauty of wind ensemble music with our passionate community of musicians'
    },
    {
      page: 'about',
      section: 'mission_statement',
      content_type: 'html',
      title: 'Mission Statement',
      content: '<p>To provide excellence in musical performance and foster community through wind ensemble music.</p>'
    },
    {
      page: 'contact',
      section: 'email',
      content_type: 'text',
      title: 'Contact Email',
      content: 'info@gmwb.org'
    },
    {
      page: 'contact',
      section: 'phone',
      content_type: 'text',
      title: 'Contact Phone',
      content: '(555) 123-4567'
    }
  ]

  try {
    for (const content of sampleContent) {
      const { error } = await supabase
        .from('site_content')
        .upsert(content, {
          onConflict: 'page,section'
        })

      if (error) {
        console.error(`❌ Error inserting content for ${content.page}/${content.section}:`, error.message)
      } else {
        console.log(`✅ Added content: ${content.page}/${content.section}`)
      }
    }

    return true
  } catch (error) {
    console.error('❌ Error inserting sample content:', error.message)
    return false
  }
}

async function main() {
  console.log('🎵 Global Mission Wind Band - Admin Setup\n')

  // Setup admin user
  const adminSetup = await setupFirstAdmin()

  if (adminSetup) {
    console.log('\n📝 Setting up sample content...')
    await insertSampleContent()
  }

  console.log('\n📋 Setup Summary:')
  console.log('✅ Database tables created (run admin-database-setup.sql first)')
  console.log('✅ Admin user created/updated')
  console.log('✅ Sample content added')
  console.log('\n🔐 Admin Login Credentials:')
  console.log('Email: admin@gmwb.com')
  console.log('Password: AdminPassword123!')
  console.log('\n🌐 Access the admin dashboard at: http://localhost:5173/admin')
  console.log('\n⚠️  Important: Change the admin password after first login!')

  process.exit(0)
}

main().catch(console.error)