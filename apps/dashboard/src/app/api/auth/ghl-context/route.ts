import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// For development - in production this would be handled securely
const DEVELOPMENT_ENCRYPTION_KEY = process.env.GHL_ENCRYPTION_KEY || 'development-key'

interface GHLEncryptedPayload {
  encryptedData: string
}

interface GHLUserData {
  locationId: string
  userId: string
  companyId: string
  userData?: {
    email: string
    name: string
    role: string
  }
}

// Simple decryption for development - production would use proper encryption
const decryptUserData = (encryptedData: string): GHLUserData | null => {
  try {
    // In development, we'll simulate decryption
    if (process.env.NODE_ENV === 'development') {
      // Return test data for development
      return {
        locationId: 'test-location-1',
        userId: 'test-user-1', 
        companyId: 'test-company-1',
        userData: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        }
      }
    }

    // Production decryption would happen here
    // const decrypted = decrypt(encryptedData, ENCRYPTION_KEY)
    // return JSON.parse(decrypted)
    
    console.warn('⚠️ Production decryption not implemented yet')
    return null
  } catch (error) {
    console.error('❌ Failed to decrypt user data:', error)
    return null
  }
}

const mapLocationToClient = async (locationId: string): Promise<string | null> => {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('clients')
      .select('client_id')
      .eq('location_id', locationId)
      .single()

    if (error) {
      console.error('❌ Database error mapping location:', error)
      return null
    }

    return data?.client_id || null
  } catch (error) {
    console.error('❌ Error in location mapping:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GHLEncryptedPayload = await request.json()
    
    if (!body.encryptedData) {
      return NextResponse.json(
        { error: 'Missing encrypted data' },
        { status: 400 }
      )
    }

    console.log('🔐 Processing GHL encrypted user data')

    // Decrypt the user data
    const decryptedData = decryptUserData(body.encryptedData)
    
    if (!decryptedData) {
      return NextResponse.json(
        { error: 'Failed to decrypt user data' },
        { status: 400 }
      )
    }

    console.log('✅ Successfully decrypted GHL user data:', {
      locationId: decryptedData.locationId,
      userId: decryptedData.userId
    })

    // Map GHL location to internal client ID
    const clientId = await mapLocationToClient(decryptedData.locationId)
    
    if (!clientId) {
      console.error('❌ No client mapping found for location:', decryptedData.locationId)
      
      // For development, create a test mapping
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 Using development client mapping')
        const response = {
          ...decryptedData,
          clientId: 'test-client-1'
        }
        
        return NextResponse.json(response)
      }
      
      return NextResponse.json(
        { error: `No client found for location: ${decryptedData.locationId}` },
        { status: 404 }
      )
    }

    console.log('✅ Successfully mapped location to client:', {
      locationId: decryptedData.locationId,
      clientId
    })

    // Return the decrypted data with client mapping
    const response = {
      ...decryptedData,
      clientId
    }

    // Log successful authentication for audit
    console.log('✅ GHL authentication successful:', {
      locationId: decryptedData.locationId,
      clientId,
      userId: decryptedData.userId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error processing GHL context:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 