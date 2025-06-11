import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Performance validation - test query speed
    const startTime = Date.now();
    
    const { data: perfData, error } = await supabase
      .from('dashboard_call_data_with_team')
      .select('*')
      .order('call_date', { ascending: false })
      .limit(100);
      
    const queryTime = Date.now() - startTime;

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        data: null,
        queryTime 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      data: perfData,
      error: null,
      queryTime,
      recordCount: perfData?.length || 0
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      queryTime: 0 
    }, { status: 500 });
  }
} 