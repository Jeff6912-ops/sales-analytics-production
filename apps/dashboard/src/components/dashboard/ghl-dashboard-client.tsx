'use client'

import { useState, useEffect } from 'react'
import { useGHLAuth } from '@/components/ghl/GHLAuthProvider'
import { DashboardClient } from './dashboard-client'
import { createClient } from '@/lib/supabase/client'

interface CallData {
  id: string
  client_id: string
  conversation_id: string
  date_created: string
  contact_name?: string
  analysis?: string
  call_source?: string
  direction?: string
  transcript?: string
  // Parsed fields
  prospect_name?: string
  heatcheck_score?: number
  top_need_pain_point?: string
  main_objection?: string
  call_outcome?: string
}

interface Client {
  id: string
  client_id: string
  business_name: string
  industry: string
  status: 'active' | 'suspended' | 'inactive'
  location_id: string
  ghl_api_token: string
  zoom_user_id?: string
  zoom_topic_prefix?: string
  assistant_id: string
  created_at: string
  updated_at: string
}

export function GHLDashboardClient() {
  const { isAuthenticated, isLoading, clientId, locationId, error } = useGHLAuth()
  const [calls, setCalls] = useState<CallData[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Fetch dashboard data when authentication is complete
  useEffect(() => {
    if (isAuthenticated && clientId) {
      fetchDashboardData(clientId)
    }
  }, [isAuthenticated, clientId])

  const fetchDashboardData = async (clientId: string) => {
    setDashboardLoading(true)
    setDashboardError(null)

    try {
      console.log('🔍 [GHL Dashboard] Fetching data for client:', clientId)

      const supabase = createClient()

      // Set RLS context
      await supabase.rpc('set_config', {
        setting_name: 'app.current_client_id',
        new_value: clientId,
        is_local: true
      })

      // Get client information
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (clientError) {
        throw new Error(`Failed to fetch client data: ${clientError.message}`)
      }

      console.log('✅ [GHL Dashboard] Client data loaded:', clientData?.business_name)
      setClient(clientData)

      // Get calls data
      const { data: callsData, error: callsError } = await supabase.rpc('get_client_call_messages', {
        p_client_id: clientId
      })

      if (callsError) {
        throw new Error(`Failed to fetch calls data: ${callsError.message}`)
      }

      console.log('✅ [GHL Dashboard] Calls data loaded:', callsData?.length, 'calls')
      setCalls(callsData || [])

    } catch (error) {
      console.error('❌ [GHL Dashboard] Error fetching data:', error)
      setDashboardError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setDashboardLoading(false)
    }
  }

  // Show authentication loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-xl font-semibold">Connecting to GoHighLevel...</h2>
          <p className="text-gray-600">Verifying your access permissions</p>
          <div className="text-sm text-gray-500">
            Location ID: {locationId || 'Detecting...'}
          </div>
        </div>
      </div>
    )
  }

  // Show authentication error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-600 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800">GHL Authentication Error</h2>
          <p className="text-gray-600">{error}</p>
          <div className="text-sm text-gray-500 mt-4">
            <p>Debug Info:</p>
            <p>Location ID: {locationId || 'None'}</p>
            <p>Client ID: {clientId || 'None'}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  // Show dashboard loading state
  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <h2 className="text-xl font-semibold">Loading Dashboard...</h2>
          <p className="text-gray-600">Fetching your sales call data</p>
          <div className="text-sm text-gray-500">
            Client: {client?.business_name || clientId}
          </div>
        </div>
      </div>
    )
  }

  // Show dashboard error
  if (dashboardError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-orange-600 text-6xl">📊</div>
          <h2 className="text-xl font-semibold text-orange-800">Dashboard Error</h2>
          <p className="text-gray-600">{dashboardError}</p>
          <div className="text-sm text-gray-500 mt-4">
            <p>GHL Location: {locationId}</p>
            <p>Client ID: {clientId}</p>
          </div>
          <button
            onClick={() => fetchDashboardData(clientId!)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Dashboard Load
          </button>
        </div>
      </div>
    )
  }

  // Show main dashboard
  if (isAuthenticated && clientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* GHL Integration Status Bar */}
        <div className="bg-green-100 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-green-400">✅</div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                <strong>Connected to GoHighLevel</strong> - {client?.business_name || clientId}
                {locationId && (
                  <span className="ml-2 text-green-600">
                    (Location: {locationId.substring(0, 8)}...)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <DashboardClient
          initialCalls={calls}
          client={client}
          clientId={clientId}
        />
      </div>
    )
  }

  // Fallback for unauthenticated state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-gray-400 text-6xl">🔒</div>
        <h2 className="text-xl font-semibold">Access Required</h2>
        <p className="text-gray-600">Please access this dashboard through GoHighLevel</p>
        <div className="text-sm text-gray-500">
          This page must be embedded in the GHL interface
        </div>
      </div>
    </div>
  )
} 