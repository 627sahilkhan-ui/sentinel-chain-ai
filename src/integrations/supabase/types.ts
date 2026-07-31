export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          detail: string | null
          entity: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string
          created_at?: string
          detail?: string | null
          entity?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          detail?: string | null
          entity?: string | null
          id?: string
        }
        Relationships: []
      }
      dependencies: {
        Row: {
          checksum: string | null
          created_at: string
          id: string
          is_direct: boolean
          license: string | null
          package_name: string
          provenance_status: string
          repository_id: string
          sbom_id: string | null
          version: string
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          id?: string
          is_direct?: boolean
          license?: string | null
          package_name: string
          provenance_status?: string
          repository_id: string
          sbom_id?: string | null
          version: string
        }
        Update: {
          checksum?: string | null
          created_at?: string
          id?: string
          is_direct?: boolean
          license?: string | null
          package_name?: string
          provenance_status?: string
          repository_id?: string
          sbom_id?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependencies_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependencies_sbom_id_fkey"
            columns: ["sbom_id"]
            isOneToOne: false
            referencedRelation: "sboms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          job_title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          job_title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          job_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      remediations: {
        Row: {
          build_passed: boolean | null
          created_at: string
          id: string
          match_id: string | null
          new_version: string
          notes: string | null
          old_version: string
          package_name: string
          pull_request_url: string | null
          repository_id: string
          status: string
          tests_passed: boolean | null
        }
        Insert: {
          build_passed?: boolean | null
          created_at?: string
          id?: string
          match_id?: string | null
          new_version: string
          notes?: string | null
          old_version: string
          package_name: string
          pull_request_url?: string | null
          repository_id: string
          status?: string
          tests_passed?: boolean | null
        }
        Update: {
          build_passed?: boolean | null
          created_at?: string
          id?: string
          match_id?: string | null
          new_version?: string
          notes?: string | null
          old_version?: string
          package_name?: string
          pull_request_url?: string | null
          repository_id?: string
          status?: string
          tests_passed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "remediations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "vulnerability_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remediations_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          created_at: string
          criticality: string
          default_branch: string
          health_score: number
          id: string
          internet_facing: boolean
          language: string | null
          last_build_at: string | null
          monitored: boolean
          name: string
          owner: string
          owner_id: string | null
          provider: string
          webhook_status: string
        }
        Insert: {
          created_at?: string
          criticality?: string
          default_branch?: string
          health_score?: number
          id?: string
          internet_facing?: boolean
          language?: string | null
          last_build_at?: string | null
          monitored?: boolean
          name: string
          owner: string
          owner_id?: string | null
          provider?: string
          webhook_status?: string
        }
        Update: {
          created_at?: string
          criticality?: string
          default_branch?: string
          health_score?: number
          id?: string
          internet_facing?: boolean
          language?: string | null
          last_build_at?: string | null
          monitored?: boolean
          name?: string
          owner?: string
          owner_id?: string | null
          provider?: string
          webhook_status?: string
        }
        Relationships: []
      }
      sboms: {
        Row: {
          branch: string
          build_number: string
          commit_hash: string | null
          component_count: number
          format: string
          generated_at: string
          id: string
          repository_id: string
          signature: string | null
          verified: boolean
        }
        Insert: {
          branch?: string
          build_number: string
          commit_hash?: string | null
          component_count?: number
          format?: string
          generated_at?: string
          id?: string
          repository_id: string
          signature?: string | null
          verified?: boolean
        }
        Update: {
          branch?: string
          build_number?: string
          commit_hash?: string | null
          component_count?: number
          format?: string
          generated_at?: string
          id?: string
          repository_id?: string
          signature?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sboms_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vulnerabilities: {
        Row: {
          affected_versions: string | null
          cve_id: string
          cvss_score: number
          exploit_available: boolean
          fixed_version: string | null
          id: string
          package_name: string
          public_poc: boolean
          published_at: string
          severity: string
          source: string
          title: string
        }
        Insert: {
          affected_versions?: string | null
          cve_id: string
          cvss_score?: number
          exploit_available?: boolean
          fixed_version?: string | null
          id?: string
          package_name: string
          public_poc?: boolean
          published_at?: string
          severity: string
          source?: string
          title: string
        }
        Update: {
          affected_versions?: string | null
          cve_id?: string
          cvss_score?: number
          exploit_available?: boolean
          fixed_version?: string | null
          id?: string
          package_name?: string
          public_poc?: boolean
          published_at?: string
          severity?: string
          source?: string
          title?: string
        }
        Relationships: []
      }
      vulnerability_matches: {
        Row: {
          dependency_id: string | null
          detected_at: string
          id: string
          repository_id: string
          risk_level: string
          risk_score: number
          runtime_exposure: boolean
          status: string
          vulnerability_id: string
        }
        Insert: {
          dependency_id?: string | null
          detected_at?: string
          id?: string
          repository_id: string
          risk_level?: string
          risk_score?: number
          runtime_exposure?: boolean
          status?: string
          vulnerability_id: string
        }
        Update: {
          dependency_id?: string | null
          detected_at?: string
          id?: string
          repository_id?: string
          risk_level?: string
          risk_score?: number
          runtime_exposure?: boolean
          status?: string
          vulnerability_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vulnerability_matches_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "dependencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vulnerability_matches_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vulnerability_matches_vulnerability_id_fkey"
            columns: ["vulnerability_id"]
            isOneToOne: false
            referencedRelation: "vulnerabilities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "analyst", "viewer"],
    },
  },
} as const
