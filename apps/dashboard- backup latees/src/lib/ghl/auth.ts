// GHL PostMessage API Integration
// Following official GHL PostMessage patterns for iframe integration

export interface GHLUserData {
  locationId: string;
  userId: string;
  companyId: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

export interface GHLContext {
  isInGHLFrame: boolean;
  userData: GHLUserData | null;
  clientId: string | null;
  error: string | null;
}

// Official GHL PostMessage pattern for requesting user data
export async function getGHLUserData(): Promise<GHLUserData | null> {
  return new Promise((resolve, reject) => {
    // Check if we're in an iframe (GHL context)
    if (window.self === window.top) {
      reject(new Error('Not running in GHL iframe context'));
      return;
    }

    // Set up timeout for request
    const timeout = setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      reject(new Error('GHL user data request timeout'));
    }, 10000); // 10 second timeout

    // Message handler for GHL response
    const messageHandler = (event: MessageEvent) => {
      // Verify origin for security (in production, check specific GHL origins)
      if (!event.origin.includes('gohighlevel.com') && !event.origin.includes('localhost')) {
        return;
      }

      if (event.data && event.data.message === 'REQUEST_USER_DATA_RESPONSE') {
        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        
        try {
          const encryptedUserData = event.data.payload;
          if (encryptedUserData) {
            // In a real implementation, send to backend for decryption
            // For now, we'll assume the data is in a readable format for development
            resolve({
              locationId: encryptedUserData.locationId || 'demo-location',
              userId: encryptedUserData.userId || 'demo-user',
              companyId: encryptedUserData.companyId || 'demo-company',
              userEmail: encryptedUserData.userEmail,
              userName: encryptedUserData.userName,
              userRole: encryptedUserData.userRole
            });
          } else {
            reject(new Error('No user data received from GHL'));
          }
        } catch (error) {
          reject(new Error('Failed to parse GHL user data'));
        }
      }
    };

    // Add event listener for GHL response
    window.addEventListener('message', messageHandler);

    // Send request to GHL parent frame
    try {
      window.parent.postMessage({ 
        message: 'REQUEST_USER_DATA' 
      }, '*');
    } catch (error) {
      clearTimeout(timeout);
      window.removeEventListener('message', messageHandler);
      reject(new Error('Failed to send message to GHL parent frame'));
    }
  });
}

// Map GHL location ID to our client ID
export async function mapGHLLocationToClientId(locationId: string): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/ghl-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locationId })
    });

    if (!response.ok) {
      throw new Error('Failed to map GHL location to client');
    }

    const data = await response.json();
    return data.clientId || null;
  } catch (error) {
    console.error('Error mapping GHL location to client:', error);
    return null;
  }
}

// Initialize GHL context
export async function initializeGHLContext(): Promise<GHLContext> {
  const isInGHLFrame = window.self !== window.top;
  
  if (!isInGHLFrame) {
    // Development mode - return demo context
    return {
      isInGHLFrame: false,
      userData: {
        locationId: 'demo-location',
        userId: 'demo-user',
        companyId: 'demo-company',
        userEmail: 'demo@example.com',
        userName: 'Demo User'
      },
      clientId: 'KLINICS', // Default to Klinics for development
      error: null
    };
  }

  try {
    const userData = await getGHLUserData();
    
    if (!userData) {
      return {
        isInGHLFrame: true,
        userData: null,
        clientId: null,
        error: 'Failed to retrieve user data from GHL'
      };
    }
    
    const clientId = await mapGHLLocationToClientId(userData.locationId);

    return {
      isInGHLFrame: true,
      userData,
      clientId,
      error: clientId ? null : 'Client mapping not found'
    };
  } catch (error) {
    return {
      isInGHLFrame: true,
      userData: null,
      clientId: null,
      error: error instanceof Error ? error.message : 'Unknown GHL context error'
    };
  }
}

// Detect if running in GHL environment
export function isGHLEnvironment(): boolean {
  return window.self !== window.top;
}

// Listen for GHL theme changes or other messages
export function setupGHLMessageListener(callback: (message: any) => void) {
  const messageHandler = (event: MessageEvent) => {
    // Verify origin for security
    if (!event.origin.includes('gohighlevel.com') && !event.origin.includes('localhost')) {
      return;
    }

    if (event.data && event.data.message) {
      callback(event.data);
    }
  };

  window.addEventListener('message', messageHandler);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', messageHandler);
  };
}

// Notify GHL of app ready state
export function notifyGHLAppReady() {
  if (isGHLEnvironment()) {
    try {
      window.parent.postMessage({
        message: 'APP_READY',
        timestamp: new Date().toISOString()
      }, '*');
    } catch (error) {
      console.warn('Failed to notify GHL app ready:', error);
    }
  }
} 