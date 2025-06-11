import { createClient } from '@/lib/supabase/server';
import type { 
  DashboardCallData, 
  DashboardMetrics, 
  TeamPerformanceMetrics, 
  TopPerformingCall,
  DateRange,
  DashboardFilters 
} from '@/types/dashboard';

// Main dashboard data query with extracted metrics
export async function getDashboardCallData(
  clientId: string, 
  filters: DashboardFilters,
  page: number = 1,
  limit: number = 50
): Promise<{ data: DashboardCallData[]; totalCount: number }> {
  const supabase = await createClient();
  
  // Build the main query with extracted metrics
  let query = `
    SELECT 
      cm.id,
      cm.client_id,
      cm.contact_name as prospect_name,
      COALESCE(cm.date_created::date, cm.created_at::date) as call_date,
      extract_heatcheck_score(cm.analysis) as heatcheck_score,
      SUBSTRING(cm.analysis FROM 'NEEDS AND PAIN POINTS[^*]*\\*\\s*([^\\n]+)') as top_need_pain_point,
      SUBSTRING(cm.analysis FROM 'OBJECTIONS RAISED[^*]*\\*\\s*([^\\n]+)') as main_objection,
      extract_call_outcome(cm.analysis) as call_outcome,
      cm.direction,
      cm.call_source,
      cl.business_name,
      cl.industry,
      tm.member_name as team_member_name,
      tm.member_role as team_member_role
    FROM call_messages cm
    JOIN clients cl ON cm.client_id = cl.client_id
    LEFT JOIN call_team_assignments cta ON cm.id = cta.call_message_id
    LEFT JOIN team_members tm ON cta.team_member_id = tm.id
    WHERE cm.client_id = $1
      AND cm.analysis IS NOT NULL
  `;
  
  const params: any[] = [clientId];
  let paramIndex = 2;
  
  // Add date range filter
  if (filters.dateRange.start) {
    query += ` AND COALESCE(cm.date_created::date, cm.created_at::date) >= $${paramIndex}`;
    params.push(filters.dateRange.start);
    paramIndex++;
  }
  
  if (filters.dateRange.end) {
    query += ` AND COALESCE(cm.date_created::date, cm.created_at::date) <= $${paramIndex}`;
    params.push(filters.dateRange.end);
    paramIndex++;
  }
  
  // Add team member filter
  if (filters.selectedTeamMembers.length > 0) {
    query += ` AND tm.id = ANY($${paramIndex})`;
    params.push(filters.selectedTeamMembers);
    paramIndex++;
  }
  
  // Add call source filter
  if (filters.selectedSources.length > 0) {
    query += ` AND cm.call_source = ANY($${paramIndex})`;
    params.push(filters.selectedSources);
    paramIndex++;
  }
  
  // Add search filter
  if (filters.searchQuery) {
    query += ` AND (cm.contact_name ILIKE $${paramIndex} OR cm.analysis ILIKE $${paramIndex})`;
    params.push(`%${filters.searchQuery}%`);
    paramIndex++;
  }
  
  // Add HeatCheck range filter
  if (filters.minHeatCheck !== undefined) {
    query += ` AND extract_heatcheck_score(cm.analysis) >= $${paramIndex}`;
    params.push(filters.minHeatCheck);
    paramIndex++;
  }
  
  if (filters.maxHeatCheck !== undefined) {
    query += ` AND extract_heatcheck_score(cm.analysis) <= $${paramIndex}`;
    params.push(filters.maxHeatCheck);
    paramIndex++;
  }
  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
  const { data: countData, error: countError } = await supabase.rpc('execute_sql', {
    query: countQuery,
    params
  });
  
  if (countError) throw countError;
  const totalCount = countData?.[0]?.total || 0;
  
  // Add pagination and ordering
  query += ` ORDER BY COALESCE(cm.date_created, cm.created_at) DESC`;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);
  
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params
  });
  
  if (error) throw error;
  
  return {
    data: data || [],
    totalCount
  };
}

// Get dashboard performance metrics
export async function getDashboardMetrics(
  clientId: string,
  dateRange: DateRange
): Promise<DashboardMetrics> {
  const supabase = await createClient();
  
  const query = `
    WITH call_stats AS (
      SELECT 
        COUNT(*) as total_calls,
        AVG(extract_heatcheck_score(analysis)) as avg_heatcheck,
        COUNT(CASE WHEN extract_heatcheck_score(analysis) >= 7 THEN 1 END) as high_scoring_calls
      FROM call_messages cm
      WHERE cm.client_id = $1
        AND cm.analysis IS NOT NULL
        AND COALESCE(cm.date_created::date, cm.created_at::date) BETWEEN $2 AND $3
    ),
    top_needs AS (
      SELECT 
        SUBSTRING(analysis FROM 'NEEDS AND PAIN POINTS[^*]*\\*\\s*([^\\n]+)') as need,
        COUNT(*) as count
      FROM call_messages
      WHERE client_id = $1
        AND analysis IS NOT NULL
        AND COALESCE(date_created::date, created_at::date) BETWEEN $2 AND $3
        AND SUBSTRING(analysis FROM 'NEEDS AND PAIN POINTS[^*]*\\*\\s*([^\\n]+)') IS NOT NULL
      GROUP BY need
      ORDER BY count DESC
      LIMIT 5
    ),
    top_objections AS (
      SELECT 
        SUBSTRING(analysis FROM 'OBJECTIONS RAISED[^*]*\\*\\s*([^\\n]+)') as objection,
        COUNT(*) as count
      FROM call_messages
      WHERE client_id = $1
        AND analysis IS NOT NULL
        AND COALESCE(date_created::date, created_at::date) BETWEEN $2 AND $3
        AND SUBSTRING(analysis FROM 'OBJECTIONS RAISED[^*]*\\*\\s*([^\\n]+)') IS NOT NULL
      GROUP BY objection
      ORDER BY count DESC
      LIMIT 5
    )
    SELECT 
      cs.total_calls,
      ROUND(cs.avg_heatcheck, 1) as avg_heatcheck,
      ROUND((cs.high_scoring_calls::float / NULLIF(cs.total_calls, 0)) * 100, 1) as conversion_rate,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('need', tn.need, 'count', tn.count)
        ) FILTER (WHERE tn.need IS NOT NULL), 
        '[]'::json
      ) as top_needs,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('objection', tobj.objection, 'count', tobj.count)
        ) FILTER (WHERE tobj.objection IS NOT NULL), 
        '[]'::json
      ) as top_objections
    FROM call_stats cs
    LEFT JOIN top_needs tn ON true
    LEFT JOIN top_objections tobj ON true
    GROUP BY cs.total_calls, cs.avg_heatcheck, cs.high_scoring_calls
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params: [clientId, dateRange.start, dateRange.end]
  });
  
  if (error) throw error;
  
  const result = data?.[0];
  if (!result) {
    return {
      totalCalls: 0,
      avgHeatCheck: 0,
      topNeeds: [],
      topObjections: [],
      conversionRate: 0
    };
  }
  
  return {
    totalCalls: result.total_calls || 0,
    avgHeatCheck: result.avg_heatcheck || 0,
    topNeeds: result.top_needs || [],
    topObjections: result.top_objections || [],
    conversionRate: result.conversion_rate || 0
  };
}

// Get top performing calls
export async function getTopPerformingCalls(
  clientId: string,
  dateRange: DateRange,
  limit: number = 10
): Promise<TopPerformingCall[]> {
  const supabase = await createClient();
  
  const query = `
    SELECT 
      cm.id,
      cm.contact_name as prospect_name,
      extract_heatcheck_score(cm.analysis) as heatcheck_score,
      COALESCE(cm.date_created::date, cm.created_at::date) as call_date,
      SUBSTRING(cm.analysis FROM 'SUCCESS FACTORS[^*]*\\*\\s*([^\\n]+)') as success_factors,
      tm.member_name as team_member
    FROM call_messages cm
    LEFT JOIN call_team_assignments cta ON cm.id = cta.call_message_id
    LEFT JOIN team_members tm ON cta.team_member_id = tm.id
    WHERE cm.client_id = $1
      AND cm.analysis IS NOT NULL
      AND extract_heatcheck_score(cm.analysis) >= 6
      AND COALESCE(cm.date_created::date, cm.created_at::date) BETWEEN $2 AND $3
    ORDER BY extract_heatcheck_score(cm.analysis) DESC, cm.created_at DESC
    LIMIT $4
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params: [clientId, dateRange.start, dateRange.end, limit]
  });
  
  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    id: row.id,
    prospectName: row.prospect_name || 'Unknown',
    heatCheckScore: row.heatcheck_score || 0,
    callDate: row.call_date,
    successFactors: row.success_factors || 'No specific success factors identified',
    teamMember: row.team_member
  }));
}

// Get team performance metrics
export async function getTeamPerformanceMetrics(
  clientId: string,
  dateRange: DateRange
): Promise<TeamPerformanceMetrics[]> {
  const supabase = await createClient();
  
  const query = `
    SELECT 
      tm.member_name,
      tm.member_role,
      COUNT(cm.id) as total_calls,
      AVG(extract_heatcheck_score(cm.analysis)) as avg_heatcheck,
      COUNT(CASE WHEN extract_heatcheck_score(cm.analysis) >= 6 THEN 1 END) as presentations,
      COUNT(CASE WHEN extract_heatcheck_score(cm.analysis) >= 8 THEN 1 END) as conversions,
      COUNT(CASE WHEN cm.analysis ILIKE '%appointment%' OR cm.analysis ILIKE '%meeting%' THEN 1 END) as appointment_calls
    FROM team_members tm
    LEFT JOIN call_team_assignments cta ON tm.id = cta.team_member_id
    LEFT JOIN call_messages cm ON cta.call_message_id = cm.id 
      AND cm.client_id = $1
      AND cm.analysis IS NOT NULL
      AND COALESCE(cm.date_created::date, cm.created_at::date) BETWEEN $2 AND $3
    WHERE tm.client_id = $1
      AND tm.is_active = true
    GROUP BY tm.id, tm.member_name, tm.member_role
    ORDER BY total_calls DESC
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params: [clientId, dateRange.start, dateRange.end]
  });
  
  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    memberName: row.member_name,
    memberRole: row.member_role || 'Sales Representative',
    appointmentCalls: row.appointment_calls || 0,
    presentations: row.presentations || 0,
    conversions: row.conversions || 0,
    avgHeatCheck: Math.round((row.avg_heatcheck || 0) * 10) / 10,
    totalCalls: row.total_calls || 0
  }));
}

// Get available team members for filtering
export async function getClientTeamMembers(clientId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('team_members')
    .select('id, member_name, member_role, is_active')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('member_name');
  
  if (error) throw error;
  return data || [];
}

// Get client information
export async function getClientInfo(clientId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('clients')
    .select('client_id, business_name, industry, location_id')
    .eq('client_id', clientId)
    .single();
  
  if (error) throw error;
  return data;
} 