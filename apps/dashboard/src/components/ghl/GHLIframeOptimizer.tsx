'use client'

import { useEffect, useState } from 'react'
import { useGHLAuth } from './GHLAuthProvider'

interface GHLIframeOptimizerProps {
  children: React.ReactNode
}

export function GHLIframeOptimizer({ children }: GHLIframeOptimizerProps) {
  const [isIframe, setIsIframe] = useState(false)
  const [parentOrigin, setParentOrigin] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState<number>(0)
  const { isAuthenticated, locationId } = useGHLAuth()

  // Detect if we're running in an iframe
  useEffect(() => {
    const inIframe = window !== window.parent
    setIsIframe(inIframe)
    
    if (inIframe) {
      console.log('🖼️ Running inside GHL iframe')
      
      // Get parent origin for secure communication
      try {
        setParentOrigin(document.referrer ? new URL(document.referrer).origin : null)
      } catch (error) {
        console.warn('⚠️ Could not determine parent origin:', error)
      }
    }
  }, [])

  // Auto-resize iframe based on content
  useEffect(() => {
    if (!isIframe) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height
        if (newHeight !== iframeHeight && newHeight > 0) {
          setIframeHeight(newHeight)
          
          // Notify parent of height change
          window.parent.postMessage({
            message: 'IFRAME_RESIZE',
            height: newHeight,
            locationId
          }, '*')
          
          console.log('📏 Iframe resized to:', newHeight)
        }
      }
    })

    // Observe document body for size changes
    if (document.body) {
      resizeObserver.observe(document.body)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [isIframe, iframeHeight, locationId])

  // Notify parent when dashboard is ready
  useEffect(() => {
    if (isIframe && isAuthenticated) {
      window.parent.postMessage({
        message: 'DASHBOARD_READY',
        locationId,
        timestamp: new Date().toISOString()
      }, '*')
      
      console.log('✅ Notified parent: Dashboard ready')
    }
  }, [isIframe, isAuthenticated, locationId])

  // Handle messages from parent GHL window
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      // Only accept messages from known GHL origins in production
      if (process.env.NODE_ENV === 'production') {
        const allowedOrigins = [
          'https://app.gohighlevel.com',
          'https://app.mygohighlevel.com',
          'https://app.leadconnectorhq.com'
        ]
        
        if (!allowedOrigins.includes(event.origin)) {
          console.warn('⚠️ Rejected message from unknown origin:', event.origin)
          return
        }
      }

      const { message, data } = event.data

      switch (message) {
        case 'GHL_THEME_CHANGED':
          console.log('🎨 GHL theme changed:', data)
          // Apply theme changes to dashboard
          applyGHLTheme(data.theme)
          break

        case 'GHL_LOCATION_CHANGED':
          console.log('📍 GHL location changed:', data)
          // Trigger re-authentication
          window.location.reload()
          break

        case 'GHL_USER_CHANGED':
          console.log('👤 GHL user changed:', data)
          // Handle user context change
          window.location.reload()
          break

        case 'GHL_RESIZE_REQUEST':
          console.log('📏 GHL resize request:', data)
          // Handle parent requesting specific size
          if (data.height) {
            document.body.style.minHeight = `${data.height}px`
          }
          break

        default:
          // Ignore unknown messages
          break
      }
    }

    window.addEventListener('message', handleParentMessage)
    return () => window.removeEventListener('message', handleParentMessage)
  }, [])

  // Apply GHL theme to dashboard
  const applyGHLTheme = (theme: any) => {
    try {
      if (theme.primaryColor) {
        document.documentElement.style.setProperty('--ghl-primary', theme.primaryColor)
      }
      if (theme.backgroundColor) {
        document.documentElement.style.setProperty('--ghl-background', theme.backgroundColor)
      }
      if (theme.textColor) {
        document.documentElement.style.setProperty('--ghl-text', theme.textColor)
      }
      
      console.log('✅ Applied GHL theme successfully')
    } catch (error) {
      console.error('❌ Failed to apply GHL theme:', error)
    }
  }

  // Performance optimizations for iframe
  useEffect(() => {
    if (!isIframe) return

    // Disable smooth scrolling for better iframe performance
    document.documentElement.style.scrollBehavior = 'auto'
    
    // Optimize animations for iframe
    const style = document.createElement('style')
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          animation-delay: 0s !important;
          transition-duration: 0.1s !important;
          transition-delay: 0s !important;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
      document.documentElement.style.scrollBehavior = 'smooth'
    }
  }, [isIframe])

  // Error boundary for iframe-specific issues
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('🚨 Iframe error:', error)
      setHasError(true)
      
      // Notify parent of error
      if (isIframe) {
        window.parent.postMessage({
          message: 'DASHBOARD_ERROR',
          error: {
            message: error.message,
            filename: error.filename,
            lineno: error.lineno
          },
          locationId
        }, '*')
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [isIframe, locationId])

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-6xl">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800">Dashboard Error</h2>
          <p className="text-gray-600">
            An error occurred while loading the dashboard. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`ghl-iframe-container ${isIframe ? 'in-iframe' : 'standalone'}`}
      style={{
        // Optimize for iframe display
        ...(isIframe && {
          overflow: 'hidden',
          height: '100vh',
          margin: 0,
          padding: 0
        })
      }}
    >
      {/* Add GHL-specific CSS variables */}
      <style jsx>{`
        .ghl-iframe-container {
          --ghl-primary: #3b82f6;
          --ghl-background: #ffffff;
          --ghl-text: #1f2937;
        }
        
        .in-iframe {
          border: none;
          outline: none;
          box-shadow: none;
        }
        
        .in-iframe .container {
          max-width: 100% !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        
        /* Optimize buttons for iframe */
        .in-iframe button {
          touch-action: manipulation;
        }
        
        /* Ensure tables are responsive in iframe */
        .in-iframe table {
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .in-iframe {
            padding: 8px !important;
          }
        }
      `}</style>
      
      {children}
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && isIframe && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 text-xs p-2 rounded">
          📍 Iframe Mode | Height: {iframeHeight}px
        </div>
      )}
    </div>
  )
}

// Hook for iframe-specific utilities
export function useGHLIframe() {
  const [isIframe, setIsIframe] = useState(false)
  const [parentOrigin, setParentOrigin] = useState<string | null>(null)

  useEffect(() => {
    const inIframe = window !== window.parent
    setIsIframe(inIframe)
    
    if (inIframe) {
      try {
        setParentOrigin(document.referrer ? new URL(document.referrer).origin : null)
      } catch (error) {
        console.warn('Could not determine parent origin:', error)
      }
    }
  }, [])

  const sendMessageToParent = (message: any) => {
    if (isIframe) {
      window.parent.postMessage(message, '*')
    }
  }

  const requestParentAction = (action: string, data?: any) => {
    sendMessageToParent({
      message: 'DASHBOARD_REQUEST',
      action,
      data,
      timestamp: new Date().toISOString()
    })
  }

  return {
    isIframe,
    parentOrigin,
    sendMessageToParent,
    requestParentAction
  }
} 