import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { encryptedData } = await request.json();
    
    // For development, simulate context
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        locationId: 'demo-location-id',
        userId: 'demo-user-id',
        clientId: 'KLINICS',
        businessName: 'Klinics Healthcare Practice'
      });
    }
    
    // Production: Decrypt GHL context
    const decryptedData = await decryptGHLContext(encryptedData);
    
    // Map locationId to clientId
    const supabase = await createClient();
    const { data: clientMapping, error } = await supabase
      .from('clients')
      .select('client_id, business_name')
      .eq('ghl_location_id', decryptedData.locationId)
      .single();
    
    if (error || !clientMapping) {
      return NextResponse.json(
        { error: 'Client not found for location' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      locationId: decryptedData.locationId,
      userId: decryptedData.userId,
      clientId: clientMapping.client_id,
      businessName: clientMapping.business_name
    });
    
  } catch (error) {
    console.error('GHL context validation failed:', error);
    return NextResponse.json(
      { error: 'Invalid context data' },
      { status: 400 }
    );
  }
}

async function decryptGHLContext(encryptedData: string) {
  // TODO: Implement actual GHL decryption
  // For now, return mock data based on encrypted input
  return {
    locationId: 'location_' + encryptedData.slice(0, 8),
    userId: 'user_' + Date.now(),
    companyId: 'company_' + Date.now()
  };
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    service: 'ghl-context-mapping' 
  });
} 