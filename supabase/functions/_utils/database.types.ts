
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string
          name: string
          created_at: string
          chat_id: string | null
          welcome_message: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          chat_id?: string | null
          welcome_message?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          chat_id?: string | null
          welcome_message?: string | null
          updated_at?: string | null
        }
      }
      community_logs: {
        Row: {
          id: string
          community_id: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          user_id: string | null
          metadata: Json | null
          created_at: string
          amount: number | null
        }
        Insert: {
          id?: string
          community_id: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          user_id?: string | null
          metadata?: Json | null
          created_at?: string
          amount?: number | null
        }
        Update: {
          id?: string
          community_id?: string
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          user_id?: string | null
          metadata?: Json | null
          created_at?: string
          amount?: number | null
        }
      }
    }
    Enums: {
      analytics_event_type: "member_joined" | "member_left" | "notification_sent" | "payment_received"
    }
  }
}
