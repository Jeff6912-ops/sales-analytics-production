-- Test Queries for Dashboard Development
-- Run these queries to validate the dashboard view and data

-- 1. Test if view exists and returns data
SELECT COUNT(*) as total_records
FROM dashboard_call_data_with_team;

-- 2. Check data quality and extracted fields
SELECT 
  client_id,
  COUNT(*) as total_calls,
  COUNT(heatcheck_score) as calls_with_score,
  COUNT(top_need_pain_point) as calls_with_needs,
  COUNT(main_objection) as calls_with_objections,
  COUNT(team_member_id) as assigned_calls,
  AVG(heatcheck_score) as avg_heatcheck
FROM dashboard_call_data_with_team
GROUP BY client_id
ORDER BY total_calls DESC;

-- 3. Sample dashboard data for development
SELECT 
  prospect_name,
  call_date,
  heatcheck_score,
  top_need_pain_point,
  main_objection,
  call_outcome,
  team_member_name,
  business_name
FROM dashboard_call_data_with_team
WHERE client_id = 'KLINICS'  -- Replace with actual client_id
ORDER BY call_date DESC
LIMIT 10;

-- 4. Test performance metrics query
SELECT 
  COUNT(*) as total_calls,
  ROUND(AVG(heatcheck_score), 1) as avg_heatcheck,
  COUNT(CASE WHEN heatcheck_score >= 7 THEN 1 END) as high_scoring_calls,
  ROUND(COUNT(CASE WHEN heatcheck_score >= 7 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as conversion_rate
FROM dashboard_call_data_with_team
WHERE client_id = 'KLINICS'  -- Replace with actual client_id
  AND call_date >= CURRENT_DATE - INTERVAL '7 days';

-- 5. Test top needs aggregation
SELECT 
  top_need_pain_point,
  COUNT(*) as frequency
FROM dashboard_call_data_with_team
WHERE client_id = 'KLINICS'  -- Replace with actual client_id
  AND call_date >= CURRENT_DATE - INTERVAL '7 days'
  AND top_need_pain_point IS NOT NULL
GROUP BY top_need_pain_point
ORDER BY frequency DESC
LIMIT 5;

-- 6. Test team performance data
SELECT 
  team_member_name,
  team_member_role,
  COUNT(*) as total_calls,
  AVG(heatcheck_score) as avg_score,
  COUNT(CASE WHEN heatcheck_score >= 7 THEN 1 END) as high_scoring_calls
FROM dashboard_call_data_with_team
WHERE client_id = 'KLINICS'  -- Replace with actual client_id
  AND call_date >= CURRENT_DATE - INTERVAL '30 days'
  AND team_member_id IS NOT NULL
GROUP BY team_member_name, team_member_role
ORDER BY total_calls DESC;

-- 7. Get list of active clients
SELECT DISTINCT 
  client_id,
  business_name,
  industry,
  COUNT(*) as total_calls
FROM dashboard_call_data_with_team
GROUP BY client_id, business_name, industry
ORDER BY total_calls DESC;

-- 8. Test extraction functions directly
SELECT 
  analysis,
  extract_heatcheck_score(analysis) as score,
  extract_top_need(analysis) as need,
  extract_main_objection(analysis) as objection,
  extract_call_outcome(analysis) as outcome
FROM call_messages
WHERE analysis IS NOT NULL
LIMIT 5; 