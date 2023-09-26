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
      credits: {
        Row: {
          created_at: string
          creditor: Database["public"]["Enums"]["creditor_type"]
          creditor_id: string | null
          credits: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creditor: Database["public"]["Enums"]["creditor_type"]
          creditor_id?: string | null
          credits: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creditor?: Database["public"]["Enums"]["creditor_type"]
          creditor_id?: string | null
          credits?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      interactions: {
        Row: {
          interaction: Database["public"]["Enums"]["interaction_type"]
          target_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          interaction: Database["public"]["Enums"]["interaction_type"]
          target_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          interaction?: Database["public"]["Enums"]["interaction_type"]
          target_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_target_id_fkey"
            columns: ["target_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          active: boolean
          id: string
          updated_at: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          active?: boolean
          id?: string
          updated_at?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          active?: boolean
          id?: string
          updated_at?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          match_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_avatar: {
        Args: {
          avatar_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      get_active_matches: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_active_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }[]
      }
      is_profile_blocked: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      creditor_type: "init" | "match" | "stripe"
      interaction_type: "none" | "block" | "pass" | "like"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

