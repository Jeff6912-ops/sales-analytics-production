import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test dashboard view works
    const { data: viewData, error } = await supabase
      .from('dashboard_call_data_with_team')
      .select('*')
      .limit(10);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        data: null 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      data: viewData,
      error: null 
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null 
    }, { status: 500 });
  }
} 