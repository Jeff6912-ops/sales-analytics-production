// Dashboard TypeScript Types - Based on actual database schema

export interface CallMessage {
  id: string;
  client_id: string;
  contact_id: string;
  conversation_id: string | null;
  message_id: string;
  comm_type: string | null;
  direction: 'inbound' | 'outbound' | null;
  call_url: string | null;
  transcript: string | null;
  analysis: string | null;
  date_created: string | null;
  contact_name: string | null;
  segment_date: string | null;
  call_source: 'ghl' | 'zoom' | null;
  processed: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard-specific interface with extracted metrics
export interface DashboardCallData {
  id: string;
  client_id: string;
  prospect_name: string | null;
  call_date: string;
  heatcheck_score: number | null;
  top_need_pain_point: string | null;
  main_objection: string | null;
  call_outcome: string | null;
  direction: 'inbound' | 'outbound' | null;
  call_source: 'ghl' | 'zoom' | null;
  business_name: string;
  industry: string | null;
  team_member_name?: string | null;
  team_member_role?: string | null;
}

export interface Client {
  id: string;
  client_id: string;
  business_name: string;
  industry: string;
  location_id: string;
  ghl_api_token: string;
  zoom_user_id: string | null;
  zoom_topic_prefix: string | null;
  assistant_id: string;
  status: 'active' | 'inactive' | 'suspended' | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  client_id: string;
  member_name: string;
  member_role: string | null;
  ghl_user_id: string | null;
  is_active: boolean | null;
  phone_numbers: string[] | null;
  email_patterns: string[] | null;
  call_source_assignment: string | null;
  default_for_direction: string | null;
  common_phrases: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CallTeamAssignment {
  id: string;
  call_message_id: string;
  team_member_id: string | null;
  assignment_method: string;
  confidence_score: number | null;
  assigned_by: string | null;
  created_at: string;
}

// Dashboard section interfaces matching PRD requirements
export interface DashboardMetrics {
  totalCalls: number;
  avgHeatCheck: number;
  topNeeds: Array<{ need: string; count: number }>;
  topObjections: Array<{ objection: string; count: number }>;
  conversionRate: number;
  totalAppointments?: number;
  totalPresentations?: number;
  totalConversions?: number;
}

export interface TopPerformingCall {
  id: string;
  prospectName: string;
  heatCheckScore: number;
  callDate: string;
  successFactors: string;
  teamMember?: string;
}

export interface TeamPerformanceMetrics {
  memberName: string;
  memberRole: string;
  appointmentCalls: number;
  presentations: number;
  conversions: number;
  avgHeatCheck: number;
  totalCalls: number;
}

// Filter and state management interfaces
export interface DateRange {
  start: string;
  end: string;
}

export interface DashboardFilters {
  dateRange: DateRange;
  selectedTeamMembers: string[];
  selectedOutcomes: string[];
  selectedSources: ('ghl' | 'zoom')[];
  searchQuery: string;
  minHeatCheck?: number;
  maxHeatCheck?: number;
}

// API response interfaces
export interface DashboardData {
  metrics: DashboardMetrics;
  topPerformingCalls: TopPerformingCall[];
  callBreakdown: DashboardCallData[];
  teamPerformance: TeamPerformanceMetrics[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Export interfaces
export interface ExportOptions {
  format: 'pdf' | 'csv';
  includeCharts: boolean;
  dateRange: DateRange;
  filters: DashboardFilters;
  clientInfo: {
    businessName: string;
    industry: string;
  };
}

// Real-time subscription interfaces
export interface RealtimeCallUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: DashboardCallData;
  old?: DashboardCallData;
}

// Error handling interfaces
export interface DashboardError {
  code: string;
  message: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Performance Metrics (exact report format)
export interface PerformanceMetrics {
  totalCalls: number;
  avgHeatCheck: number;
  topNeeds: string[];
  topObjections: string[];
  conversionRate: number;
  timeframe: 'daily' | 'weekly' | 'custom';
  endingDate: string;
}

// Team Performance Metrics (from get_team_performance_metrics function)
export interface TeamPerformanceMetric {
  member_name: string;
  member_role: string;
  appointment_calls: number;
  price_presentations: number;
  converted: number;
  deal_positive_responses: number;
  deal_demos: number;
  deal_closed: number;
  total_calls: number;
  avg_heatcheck_score: number;
}

// Dashboard Report Structure (exact report format replication)
export interface DashboardReport {
  reportHeader: {
    title: string;
    endingDate: string;
    clientName: string;
    generationTime: string;
  };
  performanceMetrics: PerformanceMetrics;
  topPerformingCalls: TopPerformingCall[];
  callBreakdown: DashboardCallData[];
  teamPerformance: TeamPerformanceMetric[];
}

// Authentication Types
export interface GHLContext {
  locationId: string;
  userId: string;
  companyId: string;
  clientId: string; // Mapped from locationId
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  ghlContext?: GHLContext;
  clientId: string;
}

export interface SubscriptionStatus {
  connected: boolean;
  channelId: string;
  lastUpdate: string;
  errorCount: number;
}

// Export Types
export interface ExportProgress {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  downloadUrl?: string;
  error?: string;
  estimatedTime?: number; // seconds
}

// Database Validation Types
export interface DatabaseValidationResult {
  fieldsValid: boolean;
  teamPerformanceValid: boolean;
  rlsValid: boolean;
  performanceValid: boolean;
  completionRates: {
    heatcheck: number;
    needs: number;
    objections: number;
    outcomes: number;
  };
  timestamp: string;
  errors: string[];
}

// Component Props Types
export interface DashboardShellProps {
  children: React.ReactNode;
  clientId: string;
  ghlContext?: GHLContext;
}

export interface CallBreakdownTableProps {
  calls: DashboardCallData[];
  loading: boolean;
  onRowClick: (call: DashboardCallData) => void;
  onExport: (format: 'csv' | 'pdf') => void;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export interface TeamPerformanceTableProps {
  metrics: TeamPerformanceMetric[];
  loading: boolean;
  dateRange: DateRange;
}

export interface PerformanceMetricsCardsProps {
  metrics: PerformanceMetrics;
  loading: boolean;
  onRefresh: () => void;
}

// Utility Types
export type ReportTimeframe = 'daily' | 'weekly' | 'custom';

export type HeatCheckScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type CallOutcomeType = 
  | 'converted'
  | 'presentation_scheduled' 
  | 'follow_up_needed'
  | 'not_interested'
  | 'no_answer'
  | 'voicemail'
  | 'callback_requested'
  | 'other';

// Error Types
export interface ValidationError extends DashboardError {
  field: string;
  value: any;
  constraint: string;
}

export interface ComponentLoadingStates {
  dashboard: LoadingState;
  callBreakdown: LoadingState;
  teamPerformance: LoadingState;
  performanceMetrics: LoadingState;
  export: LoadingState;
} 