/**
 * COMPAWION OS — Database Types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          org_id: string;
          display_name: string;
          avatar_url: string | null;
          role: "owner" | "admin" | "member" | "viewer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id: string;
          display_name: string;
          avatar_url?: string | null;
          role?: "owner" | "admin" | "member" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          role?: "owner" | "admin" | "member" | "viewer";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      pets: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          species: "dog" | "cat";
          breed: string | null;
          birth_date: string | null;
          weight_kg: number | null;
          sex: "male" | "female" | "neutered_male" | "spayed_female" | null;
          avatar_url: string | null;
          identity_embeddings: Json;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          species: "dog" | "cat";
          breed?: string | null;
          birth_date?: string | null;
          weight_kg?: number | null;
          sex?: "male" | "female" | "neutered_male" | "spayed_female" | null;
          avatar_url?: string | null;
          identity_embeddings?: Json;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          species?: "dog" | "cat";
          breed?: string | null;
          birth_date?: string | null;
          weight_kg?: number | null;
          sex?: "male" | "female" | "neutered_male" | "spayed_female" | null;
          avatar_url?: string | null;
          identity_embeddings?: Json;
          preferences?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pets_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_profiles: {
        Row: {
          id: string;
          pet_id: string;
          normal_sleep_hours: Json;
          normal_activity_level: Json;
          normal_eating_pattern: Json;
          normal_water_intake: Json;
          favorite_locations: Json;
          walking_patterns: Json;
          barking_patterns: Json;
          daily_routine: Json;
          last_computed: string | null;
        };
        Insert: {
          id?: string;
          pet_id: string;
          normal_sleep_hours?: Json;
          normal_activity_level?: Json;
          normal_eating_pattern?: Json;
          normal_water_intake?: Json;
          favorite_locations?: Json;
          walking_patterns?: Json;
          barking_patterns?: Json;
          daily_routine?: Json;
          last_computed?: string | null;
        };
        Update: {
          normal_sleep_hours?: Json;
          normal_activity_level?: Json;
          normal_eating_pattern?: Json;
          normal_water_intake?: Json;
          favorite_locations?: Json;
          walking_patterns?: Json;
          barking_patterns?: Json;
          daily_routine?: Json;
          last_computed?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pet_profiles_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: true;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          }
        ];
      };
      devices: {
        Row: {
          id: string;
          org_id: string;
          serial_number: string;
          device_type: "camera" | "tablet" | "collar" | "feeder" | "water_station" | "scale";
          name: string;
          firmware_version: string | null;
          status: "online" | "offline" | "updating" | "error";
          hardware_info: Json;
          last_heartbeat: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          serial_number: string;
          device_type: "camera" | "tablet" | "collar" | "feeder" | "water_station" | "scale";
          name: string;
          firmware_version?: string | null;
          status?: "online" | "offline" | "updating" | "error";
          hardware_info?: Json;
          last_heartbeat?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          serial_number?: string;
          device_type?: "camera" | "tablet" | "collar" | "feeder" | "water_station" | "scale";
          name?: string;
          firmware_version?: string | null;
          status?: "online" | "offline" | "updating" | "error";
          hardware_info?: Json;
          last_heartbeat?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "devices_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      device_locations: {
        Row: {
          id: string;
          device_id: string;
          location_name: string;
          position_metadata: Json;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          location_name: string;
          position_metadata?: Json;
          assigned_at?: string;
        };
        Update: {
          device_id?: string;
          location_name?: string;
          position_metadata?: Json;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "device_locations_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          }
        ];
      };
      pet_events: {
        Row: {
          id: string;
          org_id: string;
          pet_id: string | null;
          device_id: string | null;
          event_type:
            | "sleeping"
            | "eating"
            | "drinking"
            | "barking"
            | "whining"
            | "vomiting"
            | "garbage"
            | "danger"
            | "destroying"
            | "scratching"
            | "anxiety"
            | "limping"
            | "seizure"
            | "inactivity"
            | "unusual"
            | "leaving_zone"
            | "interaction_pet"
            | "interaction_stranger";
          severity: "info" | "warning" | "critical";
          confidence: number;
          metadata: Json;
          video_clip_url: string | null;
          thumbnail_url: string | null;
          recommended_action: string | null;
          ai_resolved: boolean;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
          source: string;
          category: string;
          title: string | null;
          description: string | null;
          location: string | null;
          observers: Json;
          related_events: Json;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          pet_id?: string | null;
          device_id?: string | null;
          event_type:
            | "sleeping"
            | "eating"
            | "drinking"
            | "barking"
            | "whining"
            | "vomiting"
            | "garbage"
            | "danger"
            | "destroying"
            | "scratching"
            | "anxiety"
            | "limping"
            | "seizure"
            | "inactivity"
            | "unusual"
            | "leaving_zone"
            | "interaction_pet"
            | "interaction_stranger";
          severity?: "info" | "warning" | "critical";
          confidence?: number;
          metadata?: Json;
          video_clip_url?: string | null;
          thumbnail_url?: string | null;
          recommended_action?: string | null;
          ai_resolved?: boolean;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
          source?: string;
          category?: string;
          title?: string | null;
          description?: string | null;
          location?: string | null;
          observers?: Json;
          related_events?: Json;
          created_by?: string | null;
        };
        Update: {
          severity?: "info" | "warning" | "critical";
          confidence?: number;
          metadata?: Json;
          video_clip_url?: string | null;
          thumbnail_url?: string | null;
          recommended_action?: string | null;
          ai_resolved?: boolean;
          ended_at?: string | null;
          source?: string;
          category?: string;
          title?: string | null;
          description?: string | null;
          location?: string | null;
          observers?: Json;
          related_events?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "pet_events_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pet_events_device_id_fkey";
            columns: ["device_id"];
            isOneToOne: false;
            referencedRelation: "devices";
            referencedColumns: ["id"];
          }
        ];
      };
      health_metrics: {
        Row: {
          id: string;
          pet_id: string;
          metric_type: string;
          value: number;
          unit: string;
          measured_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          metric_type: string;
          value: number;
          unit: string;
          measured_date?: string;
          created_at?: string;
        };
        Update: {
          value?: number;
          unit?: string;
          measured_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "health_metrics_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          }
        ];
      };
      timeline_entries: {
        Row: {
          id: string;
          pet_id: string;
          event_id: string | null;
          entry_type: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          metadata: Json;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          pet_id: string;
          event_id?: string | null;
          entry_type: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          metadata?: Json;
          occurred_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "timeline_entries_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "timeline_entries_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "pet_events";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          event_id: string | null;
          title: string;
          body: string;
          priority: "low" | "medium" | "high" | "critical";
          read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          event_id?: string | null;
          title: string;
          body: string;
          priority?: "low" | "medium" | "high" | "critical";
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read?: boolean;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "pet_events";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          org_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          org_id: string;
          title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          tool_calls: Json | null;
          tool_results: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          tool_calls?: Json | null;
          tool_results?: Json | null;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          plan: "free" | "essential" | "premium" | "enterprise";
          status: "active" | "past_due" | "canceled" | "trialing";
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          max_cameras: number;
          max_pets: number;
          cloud_storage_gb: number;
          vet_reports_enabled: boolean;
          ai_assistant_enabled: boolean;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          plan?: "free" | "essential" | "premium" | "enterprise";
          status?: "active" | "past_due" | "canceled" | "trialing";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          max_cameras?: number;
          max_pets?: number;
          cloud_storage_gb?: number;
          vet_reports_enabled?: boolean;
          ai_assistant_enabled?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
        };
        Update: {
          plan?: "free" | "essential" | "premium" | "enterprise";
          status?: "active" | "past_due" | "canceled" | "trialing";
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          max_cameras?: number;
          max_pets?: number;
          cloud_storage_gb?: number;
          vet_reports_enabled?: boolean;
          ai_assistant_enabled?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_org_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: "owner" | "admin" | "member" | "viewer";
      pet_species: "dog" | "cat";
      pet_sex: "male" | "female" | "neutered_male" | "spayed_female";
      device_type: "camera" | "tablet" | "collar" | "feeder" | "water_station" | "scale";
      device_status: "online" | "offline" | "updating" | "error";
      event_type:
        | "sleeping"
        | "eating"
        | "drinking"
        | "barking"
        | "whining"
        | "vomiting"
        | "garbage"
        | "danger"
        | "destroying"
        | "scratching"
        | "anxiety"
        | "limping"
        | "seizure"
        | "inactivity"
        | "unusual"
        | "leaving_zone"
        | "interaction_pet"
        | "interaction_stranger";
      event_severity: "info" | "warning" | "critical";
      action_type: "play_music" | "play_voice" | "adjust_feeder" | "notify_owner";
      action_status: "pending" | "executing" | "completed" | "failed" | "escalated";
      notification_priority: "low" | "medium" | "high" | "critical";
      notification_channel: "push" | "websocket" | "email";
      delivery_status: "pending" | "sent" | "delivered" | "failed";
      subscription_plan: "free" | "essential" | "premium" | "enterprise";
      subscription_status: "active" | "past_due" | "canceled" | "trialing";
      message_role: "user" | "assistant" | "system";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
