import { createClient } from '@/lib/supabase/server';

interface DummyDataSetupResult {
  success: boolean;
  clientsSetup: string[];
  teamMembersCreated: number;
  callsAssigned: number;
  errors: string[];
}

export async function setupDummyTeamData(): Promise<DummyDataSetupResult> {
  const supabase = await createClient();
  const errors: string[] = [];
  let teamMembersCreated = 0;
  let callsAssigned = 0;
  const clientsSetup: string[] = [];
  
  try {
    // Setup dummy team members for each test client
    const dummyTeamData = [
      // KLINICS Healthcare team
      {
        client_id: 'KLINICS',
        members: [
          { name: 'Dr. Lisa Rodriguez', role: 'Insurance Specialist', phrases: ['Lisa here', 'Good morning', 'This is Lisa'] },
          { name: 'David Park', role: 'Scheduling Coordinator', phrases: ['David speaking', 'Hi, David here', 'David from'] },
          { name: 'Amanda Foster', role: 'Nurse Practitioner', phrases: ['Amanda here', 'Nurse Amanda', 'This is Amanda'] }
        ]
      },
      // REALTY Real Estate team  
      {
        client_id: 'REALTY',
        members: [
          { name: 'Carlos Martinez', role: 'Lead Agent', phrases: ['Carlos here', 'Hey, Carlos', 'Carlos speaking'] },
          { name: 'Ashley Williams', role: 'Buyer Specialist', phrases: ['Ashley here', 'Hi, Ashley', 'This is Ashley'] },
          { name: 'Robert Kim', role: 'Listing Agent', phrases: ['Robert here', 'Bob speaking', 'This is Robert'] }
        ]
      },
      // SAASCO Technology team
      {
        client_id: 'SAASCO',
        members: [
          { name: 'Alex Chen', role: 'Sales Manager', phrases: ['Alex here', 'Hey, Alex', 'This is Alex'] },
          { name: 'Priya Patel', role: 'Account Executive', phrases: ['Priya speaking', 'Hi, Priya', 'Priya here'] },
          { name: 'Jordan Taylor', role: 'SDR', phrases: ['Jordan here', 'Hey there', 'Jordan speaking'] },
          { name: 'Sam Wilson', role: 'Senior AE', phrases: ['Sam here', 'Hi, Sam', 'Sam Wilson'] },
          { name: 'Maria Santos', role: 'Customer Success', phrases: ['Maria here', 'Hi, Maria', 'This is Maria'] },
          { name: 'Chris Brown', role: 'Solution Engineer', phrases: ['Chris here', 'Hey, Chris', 'Chris speaking'] }
        ]
      }
    ];
    
    // Create team members for each client (only if they don't already exist)
    for (const clientData of dummyTeamData) {
      for (const member of clientData.members) {
        // Check if member already exists
        const { data: existingMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('client_id', clientData.client_id)
          .eq('member_name', member.name)
          .single();
          
        if (!existingMember) {
          const { error } = await supabase
            .from('team_members')
            .insert({
              client_id: clientData.client_id,
              member_name: member.name,
              member_role: member.role,
              common_phrases: member.phrases,
              is_active: true,
              created_at: new Date().toISOString()
            });
            
          if (error) {
            errors.push(`Failed to create ${member.name}: ${error.message}`);
          } else {
            teamMembersCreated++;
          }
        }
      }
      
      // Run bulk assignment for this client
      const { data: assignmentResult, error: assignmentError } = await supabase
        .rpc('bulk_assign_sales_reps', { p_client_id: clientData.client_id });
        
      if (assignmentError) {
        errors.push(`Failed to assign calls for ${clientData.client_id}: ${assignmentError.message}`);
      } else {
        clientsSetup.push(clientData.client_id);
        // Count how many calls were assigned (approximate)
        const { count } = await supabase
          .from('dashboard_call_data_with_team')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientData.client_id)
          .not('team_member', 'is', null);
        callsAssigned += count || 0;
      }
    }
    
  } catch (error) {
    errors.push(`Setup exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    success: errors.length === 0 || (teamMembersCreated > 0 && clientsSetup.length > 0),
    clientsSetup,
    teamMembersCreated,
    callsAssigned,
    errors
  };
}

export async function validateTeamPerformance(clientId: string) {
  const supabase = await createClient();
  
  try {
    // Get team performance metrics for the client
    const { data: metrics, error } = await supabase
      .rpc('get_team_performance_metrics', {
        p_client_id: clientId,
        p_start_date: '2024-12-01',
        p_end_date: '2024-12-31'
      });
      
    if (error) {
      throw new Error(`Team performance validation failed: ${error.message}`);
    }
    
    // Get team member count
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId);
      
    // Check assignment quality
    const { data: assignmentStats } = await supabase
      .from('dashboard_call_data_with_team')
      .select('team_member, call_date')
      .eq('client_id', clientId)
      .gte('call_date', '2024-12-01');
      
    const totalCalls = assignmentStats?.length || 0;
    const assignedCalls = assignmentStats?.filter(s => s.team_member).length || 0;
    
    return {
      metricsCalculated: metrics && metrics.length > 0,
      teamMemberCount: teamCount || 0,
      performanceMetrics: metrics || [],
      hasRealisticData: metrics?.some((m: any) => m.total_calls > 0) || false,
      assignmentStats: {
        totalCalls,
        assignedCalls,
        assignmentRate: totalCalls > 0 ? (assignedCalls / totalCalls) * 100 : 0
      }
    };
    
  } catch (error) {
    throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDummyTeamClients() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('client_id')
    .in('client_id', ['KLINICS', 'REALTY', 'SAASCO'])
    .limit(1);
    
  return {
    hasDummyData: !error && data && data.length > 0,
    availableClients: ['KLINICS', 'REALTY', 'SAASCO']
  };
} 