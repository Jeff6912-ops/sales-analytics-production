'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GHLUserData {
  locationId: string
  userId: string
  companyId: string
  clientId?: string
  userData?: {
    email: string
    name: string
    role: string
  }
}

interface GHLAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  userData: GHLUserData | null
  error: string | null
  clientId: string | null
  locationId: string | null
  retry: () => void
}

const GHLAuthContext = createContext<GHLAuthContextType | undefined>(undefined)

interface GHLAuthProviderProps {
  children: ReactNode
}

export function GHLAuthProvider({ children }: GHLAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<GHLUserData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)

  const supabase = createClient()

  const mapGHLLocationToClient = async (ghlLocationId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('client_id')
        .eq('location_id', ghlLocationId)
        .single()

      if (error) {
        console.error('❌ Failed to map GHL location to client:', error)
        return null
      }

      return data?.client_id || null
    } catch (error) {
      console.error('❌ Error mapping location:', error)
      return null
    }
  }

  const decryptGHLUserData = async (encryptedData: string): Promise<GHLUserData | null> => {
    try {
      const response = await fetch('/api/auth/ghl-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encryptedData })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to decrypt user data`)
      }

      const decryptedData = await response.json()
      return decryptedData
    } catch (error) {
      console.error('❌ Failed to decrypt GHL user data:', error)
      return null
    }
  }

  const requestGHLUserData = async (): Promise<GHLUserData | null> => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⏰ GHL user data request timed out after 10 seconds')
        resolve(null)
      }, 10000)

      // Method 1: Official PostMessage API (Primary)
      const messageHandler = async (event: MessageEvent) => {
        if (event.data.message === 'REQUEST_USER_DATA_RESPONSE') {
          clearTimeout(timeout)
          window.removeEventListener('message', messageHandler)
          
          try {
            console.log('📨 Received GHL user data response')
            const decryptedData = await decryptGHLUserData(event.data.payload)
            resolve(decryptedData)
          } catch (error) {
            console.error('❌ Failed to process GHL user data:', error)
            resolve(null)
          }
        }
      }

      window.addEventListener('message', messageHandler)
      
      // Request user data from parent GHL window
      console.log('📤 Requesting user data from GHL parent window')
      window.parent.postMessage({ message: 'REQUEST_USER_DATA' }, '*')
    })
  }

  const requestGHLSessionDetails = async (): Promise<GHLUserData | null> => {
    try {
      const APP_ID = process.env.NEXT_PUBLIC_GHL_APP_ID
      if (!APP_ID) {
        console.warn('⚠️ GHL_APP_ID not configured')
        return null
      }

      // Method 2: exposeSessionDetails (Alternative)
      if (typeof window !== 'undefined' && 'exposeSessionDetails' in window) {
        console.log('🔍 Attempting to get session details via exposeSessionDetails')
        const encryptedData = await (window as any).exposeSessionDetails(APP_ID)
        return await decryptGHLUserData(encryptedData)
      }
      
      return null
    } catch (error) {
      console.error('❌ Failed to get session details:', error)
      return null
    }
  }

  const authenticateWithGHL = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 Starting GHL authentication process')

      // Try Method 1: PostMessage API (Primary)
      let ghlUserData = await requestGHLUserData()

      // Try Method 2: exposeSessionDetails (Fallback)
      if (!ghlUserData) {
        console.log('🔄 Trying alternative authentication method')
        ghlUserData = await requestGHLSessionDetails()
      }

      if (!ghlUserData) {
        // Development fallback - use test data
        if (process.env.NODE_ENV === 'development') {
          console.log('🧪 Using development fallback authentication')
          ghlUserData = {
            locationId: 'test-location-1',
            userId: 'test-user-1',
            companyId: 'test-company-1'
          }
        } else {
          throw new Error('Failed to obtain GHL user data')
        }
      }

      console.log('✅ GHL user data obtained:', { locationId: ghlUserData.locationId })
      setLocationId(ghlUserData.locationId)
      setUserData(ghlUserData)

      // Map GHL location to internal client_id
      const mappedClientId = await mapGHLLocationToClient(ghlUserData.locationId)
      
      if (!mappedClientId) {
        throw new Error(`No client mapping found for GHL location: ${ghlUserData.locationId}`)
      }

      console.log('✅ Client mapping successful:', { 
        locationId: ghlUserData.locationId, 
        clientId: mappedClientId 
      })
      
      setClientId(mappedClientId)
      ghlUserData.clientId = mappedClientId

      // Set Supabase RLS context
      const { error: contextError } = await supabase.rpc('set_config', {
        setting_name: 'app.current_client_id',
        new_value: mappedClientId,
        is_local: true
      })

      if (contextError) {
        console.warn('⚠️ Failed to set RLS context:', contextError)
      } else {
        console.log('✅ RLS context set successfully')
      }

      setIsAuthenticated(true)
    } catch (error) {
      console.error('❌ GHL authentication failed:', error)
      setError(error instanceof Error ? error.message : 'Authentication failed')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const retry = () => {
    authenticateWithGHL()
  }

  // Auto-authenticate on component mount
  useEffect(() => {
    authenticateWithGHL()
  }, [])

  // Monitor for GHL context changes (location switches, etc.)
  useEffect(() => {
    const handleGHLContextChange = (event: MessageEvent) => {
      if (event.data.message === 'LOCATION_CHANGED' || event.data.message === 'USER_CHANGED') {
        console.log('📡 GHL context changed, re-authenticating...')
        authenticateWithGHL()
      }
    }

    window.addEventListener('message', handleGHLContextChange)
    return () => window.removeEventListener('message', handleGHLContextChange)
  }, [])

  const contextValue: GHLAuthContextType = {
    isAuthenticated,
    isLoading,
    userData,
    error,
    clientId,
    locationId,
    retry
  }

  return (
    <GHLAuthContext.Provider value={contextValue}>
      {children}
    </GHLAuthContext.Provider>
  )
}

export function useGHLAuth() {
  const context = useContext(GHLAuthContext)
  if (context === undefined) {
    throw new Error('useGHLAuth must be used within a GHLAuthProvider')
  }
  return context
}

// Higher-order component for protecting routes
export function withGHLAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, error, retry } = useGHLAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold">Connecting to GoHighLevel...</h2>
            <p className="text-gray-600">Verifying your access permissions</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-600 text-6xl">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800">Authentication Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
            <div className="text-sm text-gray-500 mt-4">
              <p>If this issue persists, please contact support.</p>
            </div>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="text-gray-400 text-6xl">🔒</div>
            <h2 className="text-xl font-semibold">Access Required</h2>
            <p className="text-gray-600">Please access this dashboard through GoHighLevel</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
} 