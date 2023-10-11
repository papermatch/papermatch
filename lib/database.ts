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
      preferences: {
        Row: {
          diet: Database["public"]["Enums"]["diet_type"][] | null
          gender: Database["public"]["Enums"]["gender_type"][] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"][] | null
          keywords: string[] | null
          kids: Database["public"]["Enums"]["kids_type"][] | null
          max_age: number | null
          min_age: number | null
          radius: number | null
          relationship:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          updated_at: string
        }
        Insert: {
          diet?: Database["public"]["Enums"]["diet_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id: string
          intention?: Database["public"]["Enums"]["intention_type"][] | null
          keywords?: string[] | null
          kids?: Database["public"]["Enums"]["kids_type"][] | null
          max_age?: number | null
          min_age?: number | null
          radius?: number | null
          relationship?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          updated_at?: string
        }
        Update: {
          diet?: Database["public"]["Enums"]["diet_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id?: string
          intention?: Database["public"]["Enums"]["intention_type"][] | null
          keywords?: string[] | null
          kids?: Database["public"]["Enums"]["kids_type"][] | null
          max_age?: number | null
          min_age?: number | null
          radius?: number | null
          relationship?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_url: string | null
          birthday: string | null
          diet: Database["public"]["Enums"]["diet_type"] | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"] | null
          kids: Database["public"]["Enums"]["kids_type"] | null
          lnglat: unknown | null
          relationship: Database["public"]["Enums"]["relationship_type"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          birthday?: string | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention?: Database["public"]["Enums"]["intention_type"] | null
          kids?: Database["public"]["Enums"]["kids_type"] | null
          lnglat?: unknown | null
          relationship?: Database["public"]["Enums"]["relationship_type"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          birthday?: string | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          intention?: Database["public"]["Enums"]["intention_type"] | null
          kids?: Database["public"]["Enums"]["kids_type"] | null
          lnglat?: unknown | null
          relationship?: Database["public"]["Enums"]["relationship_type"] | null
          updated_at?: string | null
          username?: string | null
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
      active: {
        Row: {
          id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      cube:
        | {
            Args: {
              "": number[]
            }
            Returns: unknown
          }
        | {
            Args: {
              "": number
            }
            Returns: unknown
          }
      cube_dim: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      cube_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      cube_is_point: {
        Args: {
          "": unknown
        }
        Returns: boolean
      }
      cube_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      cube_recv: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      cube_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      cube_size: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      current_date_override: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_avatar: {
        Args: {
          avatar_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_current_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      earth: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      gc_to_sec: {
        Args: {
          "": number
        }
        Returns: number
      }
      get_active_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean
          id: string
          updated_at: string
          user1_id: string
          user2_id: string
        }[]
      }
      get_active_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          about: string | null
          avatar_url: string | null
          birthday: string | null
          diet: Database["public"]["Enums"]["diet_type"] | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"] | null
          kids: Database["public"]["Enums"]["kids_type"] | null
          lnglat: unknown | null
          relationship: Database["public"]["Enums"]["relationship_type"] | null
          updated_at: string | null
          username: string | null
        }[]
      }
      get_compatibility_score: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: number
      }
      get_compatible_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          profile: unknown
          score: number
        }[]
      }
      is_profile_blocked: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: boolean
      }
      latitude: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      longitude: {
        Args: {
          "": unknown
        }
        Returns: number
      }
      sec_to_gc: {
        Args: {
          "": number
        }
        Returns: number
      }
    }
    Enums: {
      creditor_type: "init" | "match" | "stripe"
      diet_type:
        | "omnivore"
        | "pescatarian"
        | "vegetarian"
        | "vegan"
        | "kosher"
        | "halal"
        | "gluten"
        | "other"
      gender_type: "male" | "female" | "nonbinary"
      intention_type: "unsure" | "casual" | "serious" | "marriage" | "friends"
      interaction_type: "none" | "block" | "pass" | "like"
      kids_type: "none" | "unsure" | "want" | "have" | "more"
      relationship_type: "unsure" | "monog" | "enm"
      sort_type: "none" | "distance" | "recent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

