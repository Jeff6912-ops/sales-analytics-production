import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test connection to production database
    const { data: clientData, error } = await supabase
      .from('clients')
      .select('client_id, business_name, ghl_location_id')
      .limit(10);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        connected: false 
      }, { status: 500 });
    }

    // Validate we have active clients with GHL integration
    const activeClients = clientData?.filter(client => client.ghl_location_id);

    return NextResponse.json({
      connected: true,
      totalClients: clientData?.length || 0,
      activeGHLClients: activeClients?.length || 0,
      sampleClients: clientData?.map(c => ({ 
        id: c.client_id, 
        name: c.business_name,
        hasGHL: !!c.ghl_location_id 
      })) || []
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false 
    }, { status: 500 });
  }
} 