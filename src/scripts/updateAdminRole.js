// Script to update allwiz@gmail.com to admin role
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcwofyezpqkkqvxyfiol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking current profiles and updating admin role...\n');

async function updateAdminRole() {
  try {
    // First, check current profiles
    console.log('📋 Current profiles in database:');
    const { data: currentProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, status')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log(`Found ${currentProfiles?.length || 0} profiles:`);
    currentProfiles?.forEach(profile => {
      console.log(`  - ${profile.email} (${profile.role || 'no role'}) - ${profile.status || 'no status'}`);
    });

    // Check if allwiz@gmail.com exists
    const targetEmail = 'allwiz@gmail.com';
    const existingProfile = currentProfiles?.find(p => p.email === targetEmail);

    if (existingProfile) {
      console.log(`\n✅ Found existing profile for ${targetEmail}`);
      console.log(`Current role: ${existingProfile.role || 'member'}`);

      if (existingProfile.role === 'admin' || existingProfile.role === 'super_admin') {
        console.log(`✅ ${targetEmail} already has admin privileges (${existingProfile.role})`);
        return;
      }

      // Update existing profile to admin
      console.log(`\n🔄 Updating ${targetEmail} role to admin...`);
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          status: 'active'
        })
        .eq('email', targetEmail)
        .select();

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }

      console.log('✅ Successfully updated profile to admin role');
      console.log('Updated profile:', updateData[0]);

    } else {
      console.log(`\n⚠️  Profile for ${targetEmail} not found in database`);
      console.log('This usually means the user needs to sign up first.');
      console.log('You can either:');
      console.log('1. Have the user sign up through the application first');
      console.log('2. Create the profile manually if you have the user ID');

      // Check auth.users table to see if the user exists in auth but not in profiles
      console.log('\n🔍 Checking if user exists in auth.users...');
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.log('❌ Cannot check auth users (admin permissions required)');
      } else {
        const authUser = authUsers.users?.find(u => u.email === targetEmail);
        if (authUser) {
          console.log(`✅ Found user in auth.users with ID: ${authUser.id}`);
          console.log('Creating profile entry...');

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: targetEmail,
              role: 'admin',
              status: 'active',
              full_name: 'Administrator'
            })
            .select();

          if (createError) {
            console.error('❌ Error creating profile:', createError);
          } else {
            console.log('✅ Successfully created admin profile');
            console.log('New profile:', newProfile[0]);
          }
        } else {
          console.log(`❌ User ${targetEmail} not found in auth.users either`);
        }
      }
    }

    // Final verification
    console.log('\n📊 Final verification - Current admin users:');
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('email, role, status')
      .in('role', ['admin', 'super_admin']);

    finalProfiles?.forEach(profile => {
      console.log(`  ✅ ${profile.email} - ${profile.role} (${profile.status})`);
    });

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

updateAdminRole().then(() => {
  console.log('\n🏁 Script completed');
});