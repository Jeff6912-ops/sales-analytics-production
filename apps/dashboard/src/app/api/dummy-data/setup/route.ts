import { NextRequest, NextResponse } from 'next/server';
import { setupDummyTeamData } from '@/utils/dummy-data-helpers';

export async function POST(request: NextRequest) {
  try {
    const result = await setupDummyTeamData();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      clientsSetup: [],
      teamMembersCreated: 0,
      callsAssigned: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 });
  }
} 