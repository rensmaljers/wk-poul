export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
        }
      }
      matches: {
        Row: {
          id: number
          external_id: number
          stage: string
          group_name: string | null
          home_team: string
          away_team: string
          home_flag: string | null
          away_flag: string | null
          home_score: number | null
          away_score: number | null
          match_date: string
          status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          external_id: number
          stage: string
          group_name?: string | null
          home_team: string
          away_team: string
          home_flag?: string | null
          away_flag?: string | null
          home_score?: number | null
          away_score?: number | null
          match_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          home_score?: number | null
          away_score?: number | null
          status?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: number
          user_id: string
          match_id: number
          home_score: number
          away_score: number
          points: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          match_id: number
          home_score: number
          away_score: number
          points?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          home_score?: number
          away_score?: number
          points?: number | null
          updated_at?: string
        }
      }
      bonus_predictions: {
        Row: {
          id: number
          user_id: string
          question_key: string
          answer: string
          points: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          question_key: string
          answer: string
          points?: number | null
          created_at?: string
        }
        Update: {
          answer?: string
          points?: number | null
        }
      }
    }
  }
}

export type LeaderboardEntry = {
  id: string
  display_name: string
  avatar_url: string | null
  total_points: number
  matches_scored: number
  exact_scores: number
  correct_differences: number
  correct_winners: number
  bonus_points: number
  grand_total: number
}
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Prediction = Database['public']['Tables']['predictions']['Row']
export type BonusPrediction = Database['public']['Tables']['bonus_predictions']['Row']
