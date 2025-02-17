export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["admin_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          amount: number | null
          community_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          community_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          community_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_messages: {
        Row: {
          community_id: string
          created_at: string | null
          filter_data: Json | null
          filter_type: string | null
          id: string
          message: string
          sent_at: string | null
          sent_failed: number | null
          sent_success: number | null
          status: string | null
          subscription_plan_id: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          community_id: string
          created_at?: string | null
          filter_data?: Json | null
          filter_type?: string | null
          id?: string
          message: string
          sent_at?: string | null
          sent_failed?: number | null
          sent_success?: number | null
          status?: string | null
          subscription_plan_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string | null
          filter_data?: Json | null
          filter_type?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          sent_failed?: number | null
          sent_success?: number | null
          status?: string | null
          subscription_plan_id?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcast_messages_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          member_count: number | null
          miniapp_url: string | null
          name: string
          owner_id: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_id: string | null
          subscription_count: number | null
          subscription_revenue: number | null
          telegram_chat_id: string | null
          telegram_invite_link: string | null
          telegram_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number | null
          miniapp_url?: string | null
          name: string
          owner_id: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_id?: string | null
          subscription_count?: number | null
          subscription_revenue?: number | null
          telegram_chat_id?: string | null
          telegram_invite_link?: string | null
          telegram_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          member_count?: number | null
          miniapp_url?: string | null
          name?: string
          owner_id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          platform_id?: string | null
          subscription_count?: number | null
          subscription_revenue?: number | null
          telegram_chat_id?: string | null
          telegram_invite_link?: string | null
          telegram_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          platform_user_id: string | null
          role: Database["public"]["Enums"]["community_role"]
          subscription_expires_at: string | null
          subscription_status: boolean | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          platform_user_id?: string | null
          role?: Database["public"]["Enums"]["community_role"]
          subscription_expires_at?: string | null
          subscription_status?: boolean | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          platform_user_id?: string | null
          role?: Database["public"]["Enums"]["community_role"]
          subscription_expires_at?: string | null
          subscription_status?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          community_id: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string
        }
        Insert: {
          community_id: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          current_telegram_code: string | null
          email: string | null
          full_name: string | null
          id: string
          initial_telegram_code: string | null
          last_login: string | null
          notes: string | null
          phone: string | null
          registration_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          current_telegram_code?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          initial_telegram_code?: string | null
          last_login?: string | null
          notes?: string | null
          phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          current_telegram_code?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          initial_telegram_code?: string | null
          last_login?: string | null
          notes?: string | null
          phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_notifications: {
        Row: {
          community_id: string | null
          error: string | null
          id: string
          member_id: string | null
          notification_type: string
          sent_at: string | null
          status: string
        }
        Insert: {
          community_id?: string | null
          error?: string | null
          id?: string
          member_id?: string | null
          notification_type: string
          sent_at?: string | null
          status: string
        }
        Update: {
          community_id?: string | null
          error?: string | null
          id?: string
          member_id?: string | null
          notification_type?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_notifications_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "telegram_chat_members"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          community_id: string | null
          created_at: string
          id: string
          invite_link: string | null
          payment_method: string | null
          plan_id: string | null
          status: string
          telegram_payment_id: string | null
          telegram_user_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          community_id?: string | null
          created_at?: string
          id?: string
          invite_link?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status: string
          telegram_payment_id?: string | null
          telegram_user_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          community_id?: string | null
          created_at?: string
          id?: string
          invite_link?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          telegram_payment_id?: string | null
          telegram_user_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          community_id: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          details: string
          event_type: string
          id: number
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details: string
          event_type: string
          id?: never
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string
          event_type?: string
          id?: never
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_system_logs_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bot_settings: {
        Row: {
          auto_remove_expired: boolean | null
          auto_welcome_message: boolean | null
          bot_signature: string | null
          chat_id: string | null
          community_id: string
          created_at: string
          expired_subscription_message: string | null
          id: string
          is_admin: boolean | null
          language: string | null
          max_messages_per_day: number | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          renewal_discount_enabled: boolean | null
          renewal_discount_percentage: number | null
          subscription_reminder_days: number | null
          subscription_reminder_message: string | null
          updated_at: string
          verification_code: string | null
          verified_at: string | null
          welcome_message: string | null
        }
        Insert: {
          auto_remove_expired?: boolean | null
          auto_welcome_message?: boolean | null
          bot_signature?: string | null
          chat_id?: string | null
          community_id: string
          created_at?: string
          expired_subscription_message?: string | null
          id?: string
          is_admin?: boolean | null
          language?: string | null
          max_messages_per_day?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          verification_code?: string | null
          verified_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          auto_remove_expired?: boolean | null
          auto_welcome_message?: boolean | null
          bot_signature?: string | null
          chat_id?: string | null
          community_id?: string
          created_at?: string
          expired_subscription_message?: string | null
          id?: string
          is_admin?: boolean | null
          language?: string | null
          max_messages_per_day?: number | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          verification_code?: string | null
          verified_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_bot_settings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: true
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_chat_members: {
        Row: {
          community_id: string
          id: string
          is_active: boolean | null
          is_trial: boolean | null
          joined_at: string
          last_active: string | null
          last_checked: string | null
          subscription_end_date: string | null
          subscription_plan_id: string | null
          subscription_start_date: string | null
          subscription_status: boolean | null
          telegram_user_id: string
          telegram_username: string | null
          total_messages: number | null
          trial_end_date: string | null
        }
        Insert: {
          community_id: string
          id?: string
          is_active?: boolean | null
          is_trial?: boolean | null
          joined_at?: string
          last_active?: string | null
          last_checked?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: boolean | null
          telegram_user_id: string
          telegram_username?: string | null
          total_messages?: number | null
          trial_end_date?: string | null
        }
        Update: {
          community_id?: string
          id?: string
          is_active?: boolean | null
          is_trial?: boolean | null
          joined_at?: string
          last_active?: string | null
          last_checked?: string | null
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: boolean | null
          telegram_user_id?: string
          telegram_username?: string | null
          total_messages?: number | null
          trial_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_chat_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_chat_members_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_events: {
        Row: {
          chat_id: string | null
          created_at: string
          error: string | null
          event_type: string
          id: number
          message_id: string | null
          message_text: string | null
          raw_data: Json | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string
          error?: string | null
          event_type: string
          id?: number
          message_id?: string | null
          message_text?: string | null
          raw_data?: Json | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string
          error?: string | null
          event_type?: string
          id?: number
          message_id?: string | null
          message_text?: string | null
          raw_data?: Json | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      telegram_global_settings: {
        Row: {
          bot_token: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          bot_token: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          bot_token?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_modify_admin_users: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      can_view_admin_users: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      check_admin_role: {
        Args: {
          user_uuid: string
        }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      check_inactive_members: {
        Args: {
          community_id_param: string
        }
        Returns: {
          telegram_user_id: string
          is_active: boolean
          subscription_status: boolean
          is_trial: boolean
          trial_end_date: string
        }[]
      }
      handle_telegram_webhook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator"
      analytics_event_type:
        | "subscription_created"
        | "subscription_expired"
        | "subscription_renewed"
        | "member_joined"
        | "member_left"
        | "member_kicked"
        | "payment_received"
        | "notification_sent"
      community_role: "owner" | "admin" | "member"
      platform_type: "telegram" | "discord"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
