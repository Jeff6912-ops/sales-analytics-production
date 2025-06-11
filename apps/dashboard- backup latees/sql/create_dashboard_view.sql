-- Create Dashboard View for Sales Call Analysis
-- This view combines call data with team assignments and client information
-- Uses existing SQL extraction functions to parse analysis text

CREATE OR REPLACE VIEW dashboard_call_data_with_team AS
SELECT 
  -- Call identifiers
  cm.id,
  cm.client_id,
  
  -- Call metadata
  cm.contact_name as prospect_name,
  COALESCE(cm.date_created, cm.created_at)::date as call_date,
  cm.direction,
  cm.call_source,
  
  -- Extracted metrics from analysis
  extract_heatcheck_score(cm.analysis) as heatcheck_score,
  extract_top_need(cm.analysis) as top_need_pain_point,
  extract_main_objection(cm.analysis) as main_objection,
  extract_call_outcome(cm.analysis) as call_outcome,
  
  -- Client information
  cl.business_name,
  cl.industry,
  
  -- Team member assignment
  tm.id as team_member_id,
  tm.member_name as team_member_name,
  tm.member_role as team_member_role,
  
  -- Additional fields for filtering
  cm.analysis,
  cm.created_at,
  cta.confidence_score as assignment_confidence
  
FROM call_messages cm
LEFT JOIN clients cl ON cm.client_id = cl.client_id
LEFT JOIN call_team_assignments cta ON cm.id = cta.call_message_id
LEFT JOIN team_members tm ON cta.team_member_id = tm.id
WHERE cm.analysis IS NOT NULL;

-- Add comment to describe the view
COMMENT ON VIEW dashboard_call_data_with_team IS 
'Dashboard view combining call messages with extracted metrics, client info, and team assignments. Used for sales analytics dashboard.';

-- Grant appropriate permissions (adjust based on your RLS policies)
GRANT SELECT ON dashboard_call_data_with_team TO authenticated;
GRANT SELECT ON dashboard_call_data_with_team TO anon; 