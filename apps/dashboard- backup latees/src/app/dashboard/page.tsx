import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

async function getDashboardData() {
  const supabase = await createClient()
  
  try {
    // Get calls data with the structure your original dashboard expects
    const { data: calls, error: callsError } = await supabase
      .from('call_messages')
      .select(`
        id,
        client_id,
        contact_name,
        transcript,
        analysis,
        call_source,
        outcome_sentiment,
        created_at,
        processed
      `)
      .order('created_at', { ascending: false })
      .limit(200)

    // Get clients data
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')

    if (callsError) {
      console.error('Calls error:', callsError)
      return { calls: [], clients: [], teamPerformance: [], error: callsError.message }
    }
    
    if (clientsError) {
      console.error('Clients error:', clientsError)
      return { calls: calls || [], clients: [], teamPerformance: [], error: clientsError.message }
    }

    // Transform calls data to match the original interface
    const transformedCalls = (calls || []).map(call => ({
      id: call.id,
      client_id: call.client_id || '',
      prospect_name: call.contact_name || 'Unknown',
      heatcheck_score: call.outcome_sentiment === 1 ? 8 : 
                      call.outcome_sentiment === 0 ? 5 : 
                      call.outcome_sentiment === -1 ? 2 : 0,
      top_need_pain_point: call.analysis ? 
        extractNeedFromAnalysis(call.analysis) : 
        'Customer needs more information about our services',
      main_objection: call.analysis ? 
        extractObjectionFromAnalysis(call.analysis) : 
        'Price concerns',
      call_outcome: call.outcome_sentiment === 1 ? 'Positive engagement, scheduling follow-up' : 
                   call.outcome_sentiment === 0 ? 'Neutral discussion, gathering requirements' : 
                   call.outcome_sentiment === -1 ? 'Objections raised, needs nurturing' : 
                   'Call completed, outcome pending',
      team_member: 'Sales Team',
      member_role: 'Sales Representative',
      call_date: call.created_at,
      call_source: call.call_source || 'unknown',
      business_name: call.client_id || '',
      industry: 'Healthcare'
    }))

    // Transform clients to match original interface
    const transformedClients = (clients || []).map(client => ({
      client_id: client.client_id,
      business_name: client.business_name,
      industry: client.industry,
      status: 'active'
    }))

    // Mock team performance for now (you can enhance this later)
    const teamPerformance = [
      {
        member_name: 'Sales Team',
        appointment_calls: Math.floor(transformedCalls.length * 0.3),
        price_presentations: Math.floor(transformedCalls.length * 0.2),
        converted_calls: transformedCalls.filter(c => c.heatcheck_score >= 7).length,
        deal_positive_responses: transformedCalls.filter(c => c.heatcheck_score >= 6).length,
        deal_demos: Math.floor(transformedCalls.length * 0.1),
        deal_closed: Math.floor(transformedCalls.length * 0.05)
      }
    ]

    return {
      calls: transformedCalls,
      clients: transformedClients,
      teamPerformance,
      error: null
    }
  } catch (error) {
    console.error('Dashboard data error:', error)
    return {
      calls: [],
      clients: [],
      teamPerformance: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper functions to extract insights from analysis
function extractNeedFromAnalysis(analysis: string): string {
  if (!analysis) return 'Customer needs consultation'
  
  // Look for common need patterns
  const needPatterns = [
    /need[s]?\s+([^.!?]*)/i,
    /looking for\s+([^.!?]*)/i,
    /want[s]?\s+([^.!?]*)/i,
    /require[s]?\s+([^.!?]*)/i
  ]
  
  for (const pattern of needPatterns) {
    const match = analysis.match(pattern)
    if (match && match[1]) {
      return match[1].trim().substring(0, 100)
    }
  }
  
  return analysis.substring(0, 80) + '...'
}

function extractObjectionFromAnalysis(analysis: string): string {
  if (!analysis) return 'No specific objections noted'
  
  const objectionPatterns = [
    /concern[s]?\s+about\s+([^.!?]*)/i,
    /worried\s+about\s+([^.!?]*)/i,
    /but\s+([^.!?]*)/i,
    /however\s+([^.!?]*)/i
  ]
  
  for (const pattern of objectionPatterns) {
    const match = analysis.match(pattern)
    if (match && match[1]) {
      return match[1].trim().substring(0, 100)
    }
  }
  
  return 'Price and timing considerations'
}

export default async function DashboardPage() {
  const { calls, clients, teamPerformance, error } = await getDashboardData()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800">Dashboard Error</h1>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your sales call performance
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        }>
          <DashboardClient 
            calls={calls}
            clients={clients}
            teamPerformance={teamPerformance}
          />
        </Suspense>
      </div>
    </div>
  )
}
