export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          match_id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          match_id: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          match_id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          diet: Database["public"]["Enums"]["diet_type"][] | null
          education: Database["public"]["Enums"]["education_type"][] | null
          family: Database["public"]["Enums"]["family_type"][] | null
          gender: Database["public"]["Enums"]["gender_type"][] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"][] | null
          keywords: string[] | null
          max_age: number | null
          min_age: number | null
          radius: number | null
          relationship:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          religion: Database["public"]["Enums"]["religion_type"][] | null
          sexuality: Database["public"]["Enums"]["sexuality_type"][] | null
          updated_at: string | null
        }
        Insert: {
          diet?: Database["public"]["Enums"]["diet_type"][] | null
          education?: Database["public"]["Enums"]["education_type"][] | null
          family?: Database["public"]["Enums"]["family_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id: string
          intention?: Database["public"]["Enums"]["intention_type"][] | null
          keywords?: string[] | null
          max_age?: number | null
          min_age?: number | null
          radius?: number | null
          relationship?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          religion?: Database["public"]["Enums"]["religion_type"][] | null
          sexuality?: Database["public"]["Enums"]["sexuality_type"][] | null
          updated_at?: string | null
        }
        Update: {
          diet?: Database["public"]["Enums"]["diet_type"][] | null
          education?: Database["public"]["Enums"]["education_type"][] | null
          family?: Database["public"]["Enums"]["family_type"][] | null
          gender?: Database["public"]["Enums"]["gender_type"][] | null
          id?: string
          intention?: Database["public"]["Enums"]["intention_type"][] | null
          keywords?: string[] | null
          max_age?: number | null
          min_age?: number | null
          radius?: number | null
          relationship?:
            | Database["public"]["Enums"]["relationship_type"][]
            | null
          religion?: Database["public"]["Enums"]["religion_type"][] | null
          sexuality?: Database["public"]["Enums"]["sexuality_type"][] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preferences_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          avatar_urls: string[]
          birthday: string | null
          diet: Database["public"]["Enums"]["diet_type"] | null
          education: Database["public"]["Enums"]["education_type"] | null
          family: Database["public"]["Enums"]["family_type"] | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"] | null
          lnglat: unknown | null
          relationship: Database["public"]["Enums"]["relationship_type"] | null
          religion: Database["public"]["Enums"]["religion_type"] | null
          sexuality: Database["public"]["Enums"]["sexuality_type"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          about?: string | null
          avatar_urls?: string[]
          birthday?: string | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          education?: Database["public"]["Enums"]["education_type"] | null
          family?: Database["public"]["Enums"]["family_type"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention?: Database["public"]["Enums"]["intention_type"] | null
          lnglat?: unknown | null
          relationship?: Database["public"]["Enums"]["relationship_type"] | null
          religion?: Database["public"]["Enums"]["religion_type"] | null
          sexuality?: Database["public"]["Enums"]["sexuality_type"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          about?: string | null
          avatar_urls?: string[]
          birthday?: string | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          education?: Database["public"]["Enums"]["education_type"] | null
          family?: Database["public"]["Enums"]["family_type"] | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          intention?: Database["public"]["Enums"]["intention_type"] | null
          lnglat?: unknown | null
          relationship?: Database["public"]["Enums"]["relationship_type"] | null
          religion?: Database["public"]["Enums"]["religion_type"] | null
          sexuality?: Database["public"]["Enums"]["sexuality_type"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["reason_type"]
          reporter_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database["public"]["Enums"]["reason_type"]
          reporter_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["reason_type"]
          reporter_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          avatar_urls: string[]
          birthday: string | null
          diet: Database["public"]["Enums"]["diet_type"] | null
          education: Database["public"]["Enums"]["education_type"] | null
          family: Database["public"]["Enums"]["family_type"] | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          intention: Database["public"]["Enums"]["intention_type"] | null
          lnglat: unknown | null
          relationship: Database["public"]["Enums"]["relationship_type"] | null
          religion: Database["public"]["Enums"]["religion_type"] | null
          sexuality: Database["public"]["Enums"]["sexuality_type"] | null
          updated_at: string | null
          username: string | null
        }[]
      }
      get_matches_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          match: unknown
          profile: unknown
          message: unknown
          unread: boolean
        }[]
      }
      get_mean_score: {
        Args: {
          s1: number
          s2: number
        }
        Returns: number
      }
      get_test_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_distance: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: number
      }
      get_user_score: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: number
      }
      get_users_score: {
        Args: {
          user_id: string
        }
        Returns: number
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
      search_active_profiles: {
        Args: {
          hide_interactions?: boolean
          hide_preferences?: boolean
        }
        Returns: {
          profile: unknown
          distance: number
          score: number
        }[]
      }
      sec_to_gc: {
        Args: {
          "": number
        }
        Returns: number
      }
      send_onesignal_notify: {
        Args: {
          user_id: string
          contents: string
        }
        Returns: boolean
      }
      set_message_read: {
        Args: {
          msg_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      creditor_type: "init" | "match" | "stripe" | "revenuecat" | "admin"
      diet_type:
        | "omnivore"
        | "pescatarian"
        | "vegetarian"
        | "vegan"
        | "kosher"
        | "halal"
        | "gluten"
        | "other"
      education_type: "high" | "undergrad" | "postgrad"
      family_type: "none" | "unsure" | "want" | "have" | "more"
      gender_type: "male" | "female" | "nonbinary"
      intention_type:
        | "unsure"
        | "casual"
        | "serious"
        | "marriage"
        | "friends"
        | "networking"
      interaction_type: "none" | "block" | "pass" | "like"
      reason_type:
        | "contact"
        | "fake"
        | "harassment"
        | "inappropriate"
        | "selling"
        | "underage"
        | "other"
      relationship_type: "unsure" | "monog" | "enm"
      religion_type:
        | "agnostic"
        | "atheist"
        | "buddhist"
        | "catholic"
        | "christian"
        | "hindu"
        | "jewish"
        | "muslim"
        | "spiritual"
        | "other"
      sexuality_type:
        | "straight"
        | "gay"
        | "lesbian"
        | "bi"
        | "pan"
        | "demi"
        | "ace"
        | "other"
      sort_type: "none" | "distance" | "recent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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

