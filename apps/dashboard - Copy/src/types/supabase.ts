// Supabase Database Types - Auto-generated types would go here
// For now, using manual types based on our database schema

export interface Database {
  public: {
    Tables: {
      call_messages: {
        Row: {
          id: string
          client_id: string
          call_date: string
          prospect_name: string | null
          heatcheck_score: number | null
          top_need_pain_point: string | null
          main_objection: string | null
          call_outcome: string | null
          analysis: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          call_date: string
          prospect_name?: string | null
          heatcheck_score?: number | null
          top_need_pain_point?: string | null
          main_objection?: string | null
          call_outcome?: string | null
          analysis?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          call_date?: string
          prospect_name?: string | null
          heatcheck_score?: number | null
          top_need_pain_point?: string | null
          main_objection?: string | null
          call_outcome?: string | null
          analysis?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          client_id: string
          business_name: string
          ghl_location_id: string | null
          industry: string | null
          created_at: string
        }
        Insert: {
          client_id: string
          business_name: string
          ghl_location_id?: string | null
          industry?: string | null
          created_at?: string
        }
        Update: {
          client_id?: string
          business_name?: string
          ghl_location_id?: string | null
          industry?: string | null
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          client_id: string
          member_name: string
          member_role: string
          common_phrases: string[]
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          member_name: string
          member_role: string
          common_phrases: string[]
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          member_name?: string
          member_role?: string
          common_phrases?: string[]
          created_at?: string
        }
      }
      call_team_assignments: {
        Row: {
          id: string
          call_id: string
          team_member_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          call_id: string
          team_member_id: string
          assigned_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          team_member_id?: string
          assigned_at?: string
        }
      }
    }
    Views: {
      dashboard_call_data_with_team: {
        Row: {
          id: string
          client_id: string
          call_date: string
          prospect_name: string | null
          heatcheck_score: number | null
          top_need_pain_point: string | null
          main_objection: string | null
          call_outcome: string | null
          team_member_id: string | null
          team_member_name: string | null
          team_member_role: string | null
          analysis: string | null
          created_at: string
        }
      }
    }
    Functions: {
      get_team_performance_metrics: {
        Args: {
          p_client_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          member_name: string
          member_role: string
          appointment_calls: number
          price_presentations: number
          converted: number
          deal_positive_responses: number
          deal_demos: number
          deal_closed: number
          total_calls: number
          avg_heatcheck_score: number
        }[]
      }
      bulk_assign_sales_reps: {
        Args: {
          p_client_id: string
        }
        Returns: void
      }
    }
  }
} 