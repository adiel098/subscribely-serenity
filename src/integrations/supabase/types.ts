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
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          project_id: string | null
          telegram_chat_id: string | null
          telegram_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          project_id?: string | null
          telegram_chat_id?: string | null
          telegram_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          project_id?: string | null
          telegram_chat_id?: string | null
          telegram_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_payment_methods: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          owner_id: string | null
          provider: string
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          provider: string
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          owner_id?: string | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_global_settings: {
        Row: {
          bot_token: string
          bot_username: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          bot_token: string
          bot_username?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          bot_token?: string
          bot_username?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_payment_methods: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          owner_id: string
          payment_method: string | null
          payment_status: string | null
          plan_id: string
          subscription_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          owner_id: string
          payment_method?: string | null
          payment_status?: string | null
          plan_id: string
          subscription_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          owner_id?: string
          payment_method?: string | null
          payment_status?: string | null
          plan_id?: string
          subscription_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_payments_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "platform_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interval: Database["public"]["Enums"]["platform_plan_interval"]
          is_active: boolean | null
          max_communities: number | null
          max_members_per_community: number | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval: Database["public"]["Enums"]["platform_plan_interval"]
          is_active?: boolean | null
          max_communities?: number | null
          max_members_per_community?: number | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: Database["public"]["Enums"]["platform_plan_interval"]
          is_active?: boolean | null
          max_communities?: number | null
          max_members_per_community?: number | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          id: string
          owner_id: string
          plan_id: string
          status: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          id?: string
          owner_id: string
          plan_id: string
          status?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          id?: string
          owner_id?: string
          plan_id?: string
          status?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_subscriptions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      project_coupons: {
        Row: {
          code: string
          community_id: string | null
          created_at: string | null
          description: string | null
          discount_amount: number
          discount_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          owner_id: string | null
          updated_at: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount: number
          discount_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          owner_id?: string | null
          updated_at?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          community_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number
          discount_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          owner_id?: string | null
          updated_at?: string | null
          used_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_coupons_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          has_trial_period: boolean | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price: number
          project_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          has_trial_period?: boolean | null
          id?: string
          interval: string
          is_active?: boolean | null
          name: string
          price: number
          project_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          has_trial_period?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price?: number
          project_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_subscribers: {
        Row: {
          id: string
          is_active: boolean | null
          is_trial: boolean | null
          joined_at: string
          last_active: string | null
          last_checked: string | null
          project_id: string
          subscription_end_date: string | null
          subscription_plan_id: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          telegram_user_id: string
          telegram_username: string | null
          trial_end_date: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          is_trial?: boolean | null
          joined_at?: string
          last_active?: string | null
          last_checked?: string | null
          project_id: string
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          telegram_user_id: string
          telegram_username?: string | null
          trial_end_date?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          is_trial?: boolean | null
          joined_at?: string
          last_active?: string | null
          last_checked?: string | null
          project_id?: string
          subscription_end_date?: string | null
          subscription_plan_id?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          telegram_user_id?: string
          telegram_username?: string | null
          trial_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_subscribers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_chat_members_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "project_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          bot_token: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          bot_token?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          bot_token?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          amount: number
          coupon_id: string | null
          created_at: string
          discount_amount: number | null
          first_name: string | null
          id: string
          invite_link: string | null
          last_name: string | null
          original_amount: number | null
          payment_method: string | null
          plan_id: string | null
          project_id: string | null
          status: string
          telegram_user_id: string | null
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          first_name?: string | null
          id?: string
          invite_link?: string | null
          last_name?: string | null
          original_amount?: number | null
          payment_method?: string | null
          plan_id?: string | null
          project_id?: string | null
          status: string
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          first_name?: string | null
          id?: string
          invite_link?: string | null
          last_name?: string | null
          original_amount?: number | null
          payment_method?: string | null
          plan_id?: string | null
          project_id?: string | null
          status?: string
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "project_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "project_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bot_settings: {
        Row: {
          created_at: string
          expired_subscription_message: string | null
          first_reminder_days: number | null
          first_reminder_image: string | null
          first_reminder_message: string | null
          id: string
          language: string | null
          project_id: string | null
          renewal_discount_enabled: boolean | null
          renewal_discount_percentage: number | null
          second_reminder_days: number | null
          second_reminder_image: string | null
          second_reminder_message: string | null
          subscription_reminder_days: number | null
          subscription_reminder_message: string | null
          updated_at: string
          welcome_image: string | null
          welcome_message: string | null
        }
        Insert: {
          created_at?: string
          expired_subscription_message?: string | null
          first_reminder_days?: number | null
          first_reminder_image?: string | null
          first_reminder_message?: string | null
          id?: string
          language?: string | null
          project_id?: string | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          second_reminder_days?: number | null
          second_reminder_image?: string | null
          second_reminder_message?: string | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          welcome_image?: string | null
          welcome_message?: string | null
        }
        Update: {
          created_at?: string
          expired_subscription_message?: string | null
          first_reminder_days?: number | null
          first_reminder_image?: string | null
          first_reminder_message?: string | null
          id?: string
          language?: string | null
          project_id?: string | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          second_reminder_days?: number | null
          second_reminder_image?: string | null
          second_reminder_message?: string | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          welcome_image?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_bot_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_mini_app_users: {
        Row: {
          community_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_active: string | null
          last_name: string | null
          photo_url: string | null
          telegram_id: string
          username: string | null
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_active?: string | null
          last_name?: string | null
          photo_url?: string | null
          telegram_id: string
          username?: string | null
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_active?: string | null
          last_name?: string | null
          photo_url?: string | null
          telegram_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_mini_app_users_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          registration_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          registration_date?: string | null
          status?: string | null
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
        Args: { user_uuid: string }
        Returns: boolean
      }
      can_view_admin_users: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_admin_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      check_inactive_members: {
        Args: { community_id_param: string }
        Returns: {
          telegram_user_id: string
          is_active: boolean
          subscription_status: boolean
          is_trial: boolean
          trial_end_date: string
        }[]
      }
      check_is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      delete_all_platform_subscriptions: {
        Args: { owner_id_param: string }
        Returns: undefined
      }
      get_admin_status: {
        Args: { user_id_param: string }
        Returns: {
          is_admin: boolean
          admin_role: string
        }[]
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["admin_role"]
          created_at: string
          updated_at: string
        }[]
      }
      get_available_groups: {
        Args: { group_id_param: string }
        Returns: {
          id: string
          name: string
          description: string
          owner_id: string
          telegram_chat_id: string
          telegram_invite_link: string
        }[]
      }
      get_available_payment_methods: {
        Args: { community_id_param: string }
        Returns: {
          id: string
          provider: string
          is_active: boolean
          config: Json
          community_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_bot_preference: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_members_to_check: {
        Args: Record<PropertyKey, never>
        Returns: {
          member_id: string
          community_id: string
          telegram_user_id: string
          subscription_end_date: string
          is_active: boolean
          subscription_status: boolean
        }[]
      }
      get_members_to_check_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          member_id: string
          community_id: string
          telegram_user_id: string
          subscription_end_date: string
          is_active: boolean
          subscription_status: string
        }[]
      }
      get_payment_methods_by_owner: {
        Args: { owner_id_param: string }
        Returns: {
          id: string
          provider: string
          is_active: boolean
          config: Json
          owner_id: string
          community_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_project_bot_token: {
        Args: { project_id_param: string }
        Returns: string
      }
      handle_telegram_webhook: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      is_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      set_bot_preference: {
        Args: { use_custom: boolean; custom_token?: string }
        Returns: undefined
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
      platform_plan_interval: "monthly" | "quarterly" | "yearly" | "lifetime"
      platform_type: "telegram" | "discord"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "moderator"],
      analytics_event_type: [
        "subscription_created",
        "subscription_expired",
        "subscription_renewed",
        "member_joined",
        "member_left",
        "member_kicked",
        "payment_received",
        "notification_sent",
      ],
      community_role: ["owner", "admin", "member"],
      platform_plan_interval: ["monthly", "quarterly", "yearly", "lifetime"],
      platform_type: ["telegram", "discord"],
    },
  },
} as const
