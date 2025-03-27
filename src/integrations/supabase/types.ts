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
      broadcast_messages: {
        Row: {
          community_id: string
          created_at: string | null
          filter_data: Json | null
          filter_type: string | null
          id: string
          image: string | null
          include_button: boolean | null
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
          image?: string | null
          include_button?: boolean | null
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
          image?: string | null
          include_button?: boolean | null
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
          custom_link: string | null
          description: string | null
          id: string
          is_group: boolean | null
          name: string
          owner_id: string
          telegram_chat_id: string | null
          telegram_photo_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_link?: string | null
          description?: string | null
          id?: string
          is_group?: boolean | null
          name: string
          owner_id: string
          telegram_chat_id?: string | null
          telegram_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_link?: string | null
          description?: string | null
          id?: string
          is_group?: boolean | null
          name?: string
          owner_id?: string
          telegram_chat_id?: string | null
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
      community_logs: {
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
      community_relationships: {
        Row: {
          added_at: string | null
          community_id: string
          display_order: number | null
          member_id: string
          relationship_type: string
        }
        Insert: {
          added_at?: string | null
          community_id: string
          display_order?: number | null
          member_id: string
          relationship_type?: string
        }
        Update: {
          added_at?: string | null
          community_id?: string
          display_order?: number | null
          member_id?: string
          relationship_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_relationships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_relationships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_subscribers: {
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
          subscription_status: string | null
          telegram_user_id: string
          telegram_username: string | null
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
          subscription_status?: string | null
          telegram_user_id: string
          telegram_username?: string | null
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
          subscription_status?: string | null
          telegram_user_id?: string
          telegram_username?: string | null
          trial_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_telegram_chat_members_bot_settings"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "telegram_bot_settings"
            referencedColumns: ["community_id"]
          },
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
      payment_methods: {
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
            referencedRelation: "profiles"
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
            referencedRelation: "profiles"
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
      profiles: {
        Row: {
          created_at: string
          current_telegram_code: string | null
          custom_bot_token: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          initial_telegram_code: string | null
          is_suspended: boolean | null
          last_login: string | null
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_step: string | null
          phone: string | null
          registration_date: string | null
          status: string | null
          updated_at: string
          use_custom_bot: boolean | null
        }
        Insert: {
          created_at?: string
          current_telegram_code?: string | null
          custom_bot_token?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          initial_telegram_code?: string | null
          is_suspended?: boolean | null
          last_login?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string
          use_custom_bot?: boolean | null
        }
        Update: {
          created_at?: string
          current_telegram_code?: string | null
          custom_bot_token?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          initial_telegram_code?: string | null
          is_suspended?: boolean | null
          last_login?: string | null
          last_name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string
          use_custom_bot?: boolean | null
        }
        Relationships: []
      }
      subscription_activity_logs: {
        Row: {
          activity_type: string
          community_id: string
          created_at: string | null
          details: string | null
          id: string
          status: string | null
          telegram_user_id: string
        }
        Insert: {
          activity_type: string
          community_id: string
          created_at?: string | null
          details?: string | null
          id?: string
          status?: string | null
          telegram_user_id: string
        }
        Update: {
          activity_type?: string
          community_id?: string
          created_at?: string | null
          details?: string | null
          id?: string
          status?: string | null
          telegram_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_activity_logs_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_coupons: {
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
            referencedRelation: "community_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          community_id: string | null
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
          status: string
          telegram_user_id: string | null
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          community_id?: string | null
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
          status: string
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          community_id?: string | null
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
          status?: string
          telegram_user_id?: string | null
          telegram_username?: string | null
          updated_at?: string
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
            foreignKeyName: "subscription_payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "subscription_coupons"
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
          community_id: string | null
          created_at: string
          description: string | null
          features: Json | null
          has_trial_period: boolean | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price: number
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          has_trial_period?: boolean | null
          id?: string
          interval: string
          is_active?: boolean | null
          name: string
          price: number
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          community_id?: string | null
          created_at?: string
          description?: string | null
          features?: Json | null
          has_trial_period?: boolean | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price?: number
          trial_days?: number | null
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
          community_id: string | null
          created_at: string
          expired_subscription_message: string | null
          first_reminder_days: number | null
          first_reminder_image: string | null
          first_reminder_message: string | null
          id: string
          is_admin: boolean | null
          language: string | null
          max_messages_per_day: number | null
          renewal_discount_enabled: boolean | null
          renewal_discount_percentage: number | null
          second_reminder_days: number | null
          second_reminder_image: string | null
          second_reminder_message: string | null
          subscription_reminder_days: number | null
          subscription_reminder_message: string | null
          updated_at: string
          verification_code: string | null
          verified_at: string | null
          welcome_image: string | null
          welcome_message: string | null
        }
        Insert: {
          auto_remove_expired?: boolean | null
          auto_welcome_message?: boolean | null
          bot_signature?: string | null
          chat_id?: string | null
          community_id?: string | null
          created_at?: string
          expired_subscription_message?: string | null
          first_reminder_days?: number | null
          first_reminder_image?: string | null
          first_reminder_message?: string | null
          id?: string
          is_admin?: boolean | null
          language?: string | null
          max_messages_per_day?: number | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          second_reminder_days?: number | null
          second_reminder_image?: string | null
          second_reminder_message?: string | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          verification_code?: string | null
          verified_at?: string | null
          welcome_image?: string | null
          welcome_message?: string | null
        }
        Update: {
          auto_remove_expired?: boolean | null
          auto_welcome_message?: boolean | null
          bot_signature?: string | null
          chat_id?: string | null
          community_id?: string | null
          created_at?: string
          expired_subscription_message?: string | null
          first_reminder_days?: number | null
          first_reminder_image?: string | null
          first_reminder_message?: string | null
          id?: string
          is_admin?: boolean | null
          language?: string | null
          max_messages_per_day?: number | null
          renewal_discount_enabled?: boolean | null
          renewal_discount_percentage?: number | null
          second_reminder_days?: number | null
          second_reminder_image?: string | null
          second_reminder_message?: string | null
          subscription_reminder_days?: number | null
          subscription_reminder_message?: string | null
          updated_at?: string
          verification_code?: string | null
          verified_at?: string | null
          welcome_image?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_telegram_bot_settings_community"
            columns: ["community_id"]
            isOneToOne: true
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_bot_settings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: true
            referencedRelation: "communities"
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
      check_is_admin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      delete_all_platform_subscriptions: {
        Args: {
          owner_id_param: string
        }
        Returns: undefined
      }
      get_admin_status: {
        Args: {
          user_id_param: string
        }
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
        Args: {
          group_id_param: string
        }
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
        Args: {
          community_id_param: string
        }
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
        Args: {
          owner_id_param: string
        }
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
      get_system_logs: {
        Args: {
          event_types?: string[]
          limit_count?: number
        }
        Returns: {
          created_at: string
          details: string
          event_type: string
          id: number
          metadata: Json | null
          user_id: string | null
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
      set_bot_preference: {
        Args: {
          use_custom: boolean
          custom_token?: string
        }
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
