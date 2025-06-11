import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test required dashboard fields exist and have data
    const { data: fieldData, error } = await supabase
      .from('dashboard_call_data_with_team')
      .select(`
        id,
        heatcheck_score,
        top_need_pain_point,
        main_objection,
        call_outcome,
        prospect_name,
        call_date
      `)
      .limit(100);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        data: null 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      data: fieldData,
      error: null 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null 
    }, { status: 500 });
  }
} 