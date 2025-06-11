import { createContext, useContext, useEffect, useState } from 'react'

interface GHLContext {
  locationId: string | null
  userId: string | null
  clientId: string | null
  businessName: string | null
  loading: boolean
  error: string | null
}

const GHLContext = createContext<GHLContext | null>(null)

export function GHLContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<GHLContext>({
    locationId: null,
    userId: null,
    clientId: null,
    businessName: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const requestGHLContext = async () => {
      try {
        // Check if running in iframe
        if (window === window.parent) {
          // Development mode - use demo client
          setContext({
            locationId: 'demo-location',
            userId: 'demo-user',
            clientId: 'KLINICS', // Default to KLINICS for testing
            businessName: 'Klinics Healthcare Practice',
            loading: false,
            error: null
          })
          return
        }

        // Production GHL iframe mode
        const encryptedUserData = await new Promise<any>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('GHL context request timeout'))
          }, 5000)

          const messageHandler = ({ data }: MessageEvent) => {
            if (data.message === 'REQUEST_USER_DATA_RESPONSE') {
              clearTimeout(timeout)
              window.removeEventListener('message', messageHandler)
              resolve(data.payload)
            }
          }

          window.addEventListener('message', messageHandler)
          window.parent.postMessage({ message: 'REQUEST_USER_DATA' }, '*')
        })

        // Send to backend for decryption and mapping
        const response = await fetch('/api/auth/ghl-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedData: encryptedUserData })
        })

        if (!response.ok) {
          throw new Error(`Context validation failed: ${response.status}`)
        }

        const userData = await response.json()
        
        setContext({
          locationId: userData.locationId,
          userId: userData.userId,
          clientId: userData.clientId,
          businessName: userData.businessName,
          loading: false,
          error: null
        })

      } catch (error) {
        console.error('Failed to get GHL context:', error)
        setContext(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    }

    requestGHLContext()
  }, [])

  return (
    <GHLContext.Provider value={context}>
      {children}
    </GHLContext.Provider>
  )
}

export const useGHLContext = () => {
  const context = useContext(GHLContext)
  if (!context) {
    throw new Error('useGHLContext must be used within GHLContextProvider')
  }
  return context
} 