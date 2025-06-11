import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({
        hasTeamData: false,
        error: 'Client ID is required'
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Set RLS context for this request (required for team_members access)
    await supabase.rpc('set_config', {
      setting_name: 'app.current_client_id',
      new_value: clientId,
      is_local: true
    });

    console.log('🔍 [TeamData] Checking team data for client:', clientId);

    // Check if team members exist for this client
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*')
      .eq('client_id', clientId);

    if (teamError) {
      console.error('❌ [TeamData] Error fetching team members:', teamError);
      return NextResponse.json({
        hasTeamData: false,
        error: teamError.message
      }, { status: 500 });
    }

    console.log('📊 [TeamData] Found team members:', teamMembers?.length || 0);

    // If team members exist, get performance metrics with current year dates
    let performanceMetrics = [];
    if (teamMembers && teamMembers.length > 0) {
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;
      
      console.log('📈 [TeamData] Fetching metrics for date range:', startDate, 'to', endDate);
      
      const { data: metrics, error: metricsError } = await supabase
        .rpc('get_team_performance_metrics', {
          p_client_id: clientId,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (metricsError) {
        console.error('❌ [TeamData] Error fetching metrics:', metricsError);
      } else {
        console.log('📊 [TeamData] Found performance metrics:', metrics?.length || 0);
        performanceMetrics = metrics || [];
      }
    }

    const result = {
      hasTeamData: teamMembers && teamMembers.length > 0,
      teamMembers: teamMembers || [],
      performanceMetrics: performanceMetrics,
      clientId
    };

    console.log('✅ [TeamData] Returning result:', {
      hasTeamData: result.hasTeamData,
      teamMemberCount: result.teamMembers.length,
      metricsCount: result.performanceMetrics.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 [TeamData] Unexpected error:', error);
    return NextResponse.json({
      hasTeamData: false,
      teamMembers: [],
      performanceMetrics: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 