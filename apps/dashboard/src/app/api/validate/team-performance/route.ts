import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test team performance function with test client
    const { data: teamData, error } = await supabase
      .rpc('get_team_performance_metrics', {
        p_client_id: 'test-client-1',
        p_start_date: '2024-12-01',
        p_end_date: '2024-12-31'
      });

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        data: null 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      data: teamData,
      error: null 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null 
    }, { status: 500 });
  }
} 