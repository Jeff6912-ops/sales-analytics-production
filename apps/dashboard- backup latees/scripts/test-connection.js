const { createClient } = require('@supabase/supabase-js')

// Test with anon key first
const SUPABASE_URL = 'https://gktdkjeflginpvgsndyy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdGRramVmbGdpbnB2Z3NuZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDc2ODUsImV4cCI6MjA2NDQ4MzY4NX0.0JJCuujqeSvWHew9jGeYzbszSDTrDh3vJnIX8pC2JSM'

console.log('🔍 Testing Supabase connection...')

async function testConnection() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  try {
    // Test read access
    console.log('📖 Testing read access...')
    const { data: readData, error: readError } = await supabase
      .from('call_messages')
      .select('id, client_id, contact_name')
      .limit(3)
    
    if (readError) {
      console.error('❌ Read error:', readError)
    } else {
      console.log('✅ Read successful:', readData?.length, 'records found')
    }
    
    // Test write access
    console.log('📝 Testing write access...')
    const testRecord = {
      client_id: 'TEST',
      contact_name: 'Test Contact',
      call_source: 'test',
      created_at: new Date().toISOString(),
      analysis: 'Test analysis. Intent: Testing. Sentiment: Neutral.'
    }
    
    const { data: writeData, error: writeError } = await supabase
      .from('call_messages')
      .insert([testRecord])
    
    if (writeError) {
      console.error('❌ Write error:', writeError)
      console.log('ℹ️  This might be expected if RLS policies prevent anon inserts')
      console.log('ℹ️  You might need the service role key for bulk inserts')
    } else {
      console.log('✅ Write successful:', writeData)
      
      // Clean up test record
      await supabase
        .from('call_messages')
        .delete()
        .eq('client_id', 'TEST')
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error)
  }
}

testConnection() 