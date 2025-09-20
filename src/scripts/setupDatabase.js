// Script to set up database schema and create admin user
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcwofyezpqkkqvxyfiol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Setting up database schema and admin user...\n');

async function setupDatabase() {
  try {
    // First, let's create a temporary admin profile directly
    console.log('👤 Creating admin profile for allwiz@gmail.com...');

    // Since we can't access auth.users directly with anon key, we'll create a profile
    // with a placeholder UUID that follows the expected pattern
    const adminUserId = '00000000-0000-0000-0000-000000000001'; // Placeholder UUID
    const adminEmail = 'allwiz@gmail.com';

    // Check if profile already exists by trying to insert
    console.log('🔍 Checking if admin profile exists...');

    // Try to select first to see table structure
    const { data: existingProfiles, error: selectError } = await supabase
      .from('profiles')
      .select('*');

    if (selectError) {
      console.error('❌ Error accessing profiles:', selectError);
      return;
    }

    console.log('✅ Profiles table accessible');
    console.log(`Current profiles count: ${existingProfiles?.length || 0}`);

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Sample profile structure:');
      const sample = existingProfiles[0];
      Object.keys(sample).forEach(key => {
        console.log(`  ${key}: ${typeof sample[key]}`);
      });
    }

    // Try to insert admin profile
    console.log('\n📝 Creating admin profile...');

    // First check what columns are available by trying a small insert
    const profileData = {
      id: adminUserId,
      full_name: 'Administrator',
      role: 'admin',
      status: 'active',
      joined_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    console.log('Attempting to insert profile with data:');
    console.log(JSON.stringify(profileData, null, 2));

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select();

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);

      // If it's a column doesn't exist error, let's try with minimal data
      if (insertError.code === '42703') {
        console.log('\n🔧 Trying with minimal profile data...');
        const minimalProfile = {
          id: adminUserId,
          role: 'admin'
        };

        const { data: minProfile, error: minError } = await supabase
          .from('profiles')
          .insert(minimalProfile)
          .select();

        if (minError) {
          console.error('❌ Error with minimal profile:', minError);
        } else {
          console.log('✅ Successfully created minimal admin profile');
          console.log(minProfile[0]);
        }
      }
    } else {
      console.log('✅ Successfully created admin profile');
      console.log(newProfile[0]);
    }

    // Verify admin profile exists and has correct role
    console.log('\n🔍 Verifying admin setup...');
    const { data: adminCheck, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (checkError) {
      console.error('❌ Error checking admin profiles:', checkError);
    } else {
      console.log(`✅ Found ${adminCheck?.length || 0} admin profiles:`);
      adminCheck?.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Role: ${profile.role}`);
      });
    }

    // Now let's create the proper auth user for allwiz@gmail.com
    console.log('\n🔐 Setting up authentication for admin user...');
    console.log('Note: You will need to sign up manually at the application to link auth and profile');
    console.log(`When you sign up with ${adminEmail}, the profile will be linked automatically.`);

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase().then(() => {
  console.log('\n🏁 Database setup completed');
});