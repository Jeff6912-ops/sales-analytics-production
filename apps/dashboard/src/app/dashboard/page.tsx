import { createClient } from '@/lib/supabase/server'
import { DashboardClientModern } from '@/components/dashboard/dashboard-client-modern'

async function getDashboardData(clientId: string) {
  const supabase = await createClient()

  try {
    // Set RLS context for this request
    await supabase.rpc('set_config', {
      setting_name: 'app.current_client_id',
      new_value: clientId,
      is_local: true
    })

    // Get client information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (clientError) {
      console.error('❌ Failed to fetch client:', clientError)
      return { calls: [], client: null }
    }

    // Get calls data using the client call function for RLS compliance
    const { data: calls, error: callsError } = await supabase.rpc('get_client_call_messages', {
      p_client_id: clientId
    })

    if (callsError) {
      console.error('❌ Failed to fetch calls:', callsError)
      return { calls: [], client }
    }

    console.log(`✅ Fetched ${calls?.length || 0} calls for client: ${clientId}`)
    
    return {
      calls: calls || [],
      client
    }
  } catch (error) {
    console.error('❌ Dashboard data fetch error:', error)
    return { calls: [], client: null }
  }
}

// Main Dashboard Page with Modern 2025 Design
export default async function DashboardPage() {
  // For development, we'll use KLINICS client with our generated mock data
  // In production, this would come from GHL context
  const clientId = 'KLINICS'
  
  const { calls, client } = await getDashboardData(clientId)

  return (
    <DashboardClientModern
      initialCalls={calls}
      client={client}
      clientId={clientId}
    />
  )
} 