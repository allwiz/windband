// Script to check actual database schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcwofyezpqkkqvxyfiol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking database schema and existing data...\n');

async function checkSchema() {
  try {
    // Check profiles table structure by trying to select all columns
    console.log('📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);

      if (profilesError.code === '42P01') {
        console.log('⚠️  Profiles table does not exist yet');
        console.log('Need to create the profiles table first');
        return;
      }
    } else {
      console.log('✅ Profiles table exists');
      console.log(`Found ${profiles?.length || 0} profiles`);

      if (profiles && profiles.length > 0) {
        console.log('Sample profile structure:');
        console.log(JSON.stringify(profiles[0], null, 2));
      } else {
        console.log('No profiles found in table');
      }
    }

    // Check auth.users to see what we have
    console.log('\n👤 Checking auth.users...');
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('❌ Cannot get current user:', authError.message);
    } else {
      console.log('✅ Auth is working');
      if (authData.user) {
        console.log(`Current user: ${authData.user.email}`);
        console.log(`User ID: ${authData.user.id}`);
      } else {
        console.log('No user currently logged in');
      }
    }

    // Try to get a session
    console.log('\n🔑 Checking session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.log('❌ Cannot get session:', sessionError.message);
    } else {
      console.log('✅ Session check working');
      if (sessionData.session) {
        console.log(`Session user: ${sessionData.session.user.email}`);
      } else {
        console.log('No active session');
      }
    }

    // Check other tables that might exist
    console.log('\n📊 Checking other tables...');

    const tablesToCheck = ['gallery_items', 'events', 'applications', 'admin_activity_log'];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: exists (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema().then(() => {
  console.log('\n🏁 Schema check completed');
});