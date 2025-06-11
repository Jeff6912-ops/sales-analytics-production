import { NextRequest, NextResponse } from 'next/server';
import { validateTeamPerformance } from '@/utils/dummy-data-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json({
        error: 'clientId parameter is required'
      }, { status: 400 });
    }
    
    const result = await validateTeamPerformance(clientId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 