// Database types based on multi-tenant schema documentation

export interface Client {
  id: string
  client_id: string
  business_name: string
  industry: string
  status: 'active' | 'suspended' | 'inactive'
  onboarded_at: string
  updated_at: string
  location_id: string
  assistant_id: string
  zoom_user_id?: string
  zoom_topic_prefix?: string
  created_by?: string
  notes?: string
}

export interface CallMessage {
  id: string
  client_id: string
  conversation_id: string
  message_id?: string
  call_source: 'ghl_webhook' | 'zoom_polling'
  call_date: string
  call_duration?: number
  prospect_name?: string
  prospect_phone?: string
  prospect_email?: string
  heatcheck_score?: number
  top_need_pain_point?: string
  main_objection?: string
  call_outcome?: string
  analysis_summary?: Record<string, any>
  zoom_meeting_id?: number
  zoom_recording_id?: string
  recording_download_url?: string
  recording_file_path?: string
  audio_file_size?: number
  audio_duration?: number
  transcription_text?: string
  processed_at: string
  processing_status: 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  client_id: string
  member_name: string
  member_role: string
  ghl_user_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  phone_numbers?: string[]
  email_patterns?: string[]
  call_source_assignment?: string
  default_for_direction?: string
  common_phrases?: string[]
}

export interface CallTeamAssignment {
  id: string
  call_message_id: string
  team_member_id?: string
  assignment_method: 'auto_parsed' | 'transcript_parsed' | 'default_rules' | 'manual' | 'ghl_sync'
  confidence_score?: number
  assigned_by?: string
  created_at: string
}

// Dashboard-specific types derived from database views
export interface DashboardCallData {
  id: string
  client_id: string
  contact_id?: string
  message_id?: string
  heatcheck_score?: number
  prospect_name?: string
  top_need_pain_point?: string
  main_objection?: string
  call_outcome?: string
  team_member?: string
  member_role?: string
  assignment_method?: string
  confidence_score?: number
  sales_representative?: string
  call_date: string
  raw_created_at: string
  call_source: 'ghl_webhook' | 'zoom_polling'
  direction?: string
  transcript?: string
  analysis?: string
  business_name: string
  industry: string
}

// Team performance metrics type
export interface TeamPerformanceMetrics {
  team_member: string
  member_role: string
  total_calls: number
  appointment_calls: number
  price_presentations: number
  converted_calls: number
  avg_heatcheck: number
  deal_positive_responses: number
  deal_demos: number
  deal_closed: number
}

// Filter and query types
export interface DashboardFilters {
  startDate: string
  endDate: string
  clientId: string
  heatCheckScoreMin?: number
  heatCheckScoreMax?: number
  callOutcome?: string[]
  teamMembers?: string[]
  searchTerm?: string
}

export interface PerformanceMetrics {
  totalCalls: number
  avgHeatCheck: number
  topNeeds: Array<{ need: string; count: number }>
  topObjections: Array<{ objection: string; count: number }>
  conversionRate: number
}

// GHL Integration types
export interface GHLContext {
  locationId: string
  userId: string
  companyId: string
  clientId: string
} 