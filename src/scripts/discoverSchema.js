// Script to discover the actual table schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcwofyezpqkkqvxyfiol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Discovering actual database schema...\n');

async function discoverSchema() {
  try {
    // Try to insert an empty record to see what's required
    console.log('📋 Testing profiles table structure...');

    // First try to get error message by inserting minimal data
    const { data, error } = await supabase
      .from('profiles')
      .insert({})
      .select();

    if (error) {
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error.details);
    }

    // Try with just ID
    console.log('\n🆔 Testing with just ID...');
    const testId = '00000000-0000-0000-0000-000000000001';

    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .insert({ id: testId })
      .select();

    if (testError) {
      console.log('ID-only error:', testError.message);
    } else {
      console.log('✅ Successfully inserted with just ID');
      console.log('Inserted data:', testData[0]);

      // Now try to update it to add more fields
      console.log('\n🔄 Testing field updates...');

      // Try adding each field one by one
      const fieldsToTest = [
        { field: 'email', value: 'allwiz@gmail.com' },
        { field: 'full_name', value: 'Administrator' },
        { field: 'role', value: 'admin' },
        { field: 'status', value: 'active' },
        { field: 'created_at', value: new Date().toISOString() },
        { field: 'updated_at', value: new Date().toISOString() },
        { field: 'joined_date', value: new Date().toISOString() },
        { field: 'last_login', value: new Date().toISOString() },
        { field: 'phone', value: '+1-555-0123' },
        { field: 'bio', value: 'System Administrator' }
      ];

      for (const { field, value } of fieldsToTest) {
        try {
          const updateData = {};
          updateData[field] = value;

          const { data: updateResult, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', testId)
            .select();

          if (updateError) {
            console.log(`❌ ${field}: ${updateError.message}`);
          } else {
            console.log(`✅ ${field}: success`);
          }
        } catch (err) {
          console.log(`❌ ${field}: ${err.message}`);
        }
      }

      // Get final record to see what was actually set
      console.log('\n📊 Final record state:');
      const { data: finalData, error: finalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testId)
        .single();

      if (finalError) {
        console.log('Error getting final data:', finalError.message);
      } else {
        console.log('Final record:');
        console.log(JSON.stringify(finalData, null, 2));
      }

      // Clean up test record
      console.log('\n🧹 Cleaning up test record...');
      await supabase.from('profiles').delete().eq('id', testId);
    }

  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

discoverSchema().then(() => {
  console.log('\n🏁 Schema discovery completed');
});