export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          category: string
          created_at: string
          deal_id: string
          description: string | null
          estimated_benefit: number | null
          id: string
          impact_score: number | null
          implementation_difficulty: number | null
          priority: number | null
          status: string | null
          timeframe: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          deal_id: string
          description?: string | null
          estimated_benefit?: number | null
          id?: string
          impact_score?: number | null
          implementation_difficulty?: number | null
          priority?: number | null
          status?: string | null
          timeframe?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          deal_id?: string
          description?: string | null
          estimated_benefit?: number | null
          id?: string
          impact_score?: number | null
          implementation_difficulty?: number | null
          priority?: number | null
          status?: string | null
          timeframe?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deal_analysis: {
        Row: {
          analysis_summary: string | null
          confidence_level: number | null
          created_at: string
          deal_id: string
          financial_score: number | null
          id: string
          key_insights: Json | null
          market_score: number | null
          opportunities: string[] | null
          overall_score: number | null
          recommendation: string | null
          red_flags: string[] | null
          risk_score: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_summary?: string | null
          confidence_level?: number | null
          created_at?: string
          deal_id: string
          financial_score?: number | null
          id?: string
          key_insights?: Json | null
          market_score?: number | null
          opportunities?: string[] | null
          overall_score?: number | null
          recommendation?: string | null
          red_flags?: string[] | null
          risk_score?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_summary?: string | null
          confidence_level?: number | null
          created_at?: string
          deal_id?: string
          financial_score?: number | null
          id?: string
          key_insights?: Json | null
          market_score?: number | null
          opportunities?: string[] | null
          overall_score?: number | null
          recommendation?: string | null
          red_flags?: string[] | null
          risk_score?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          deal_data: Json
          deal_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_data?: Json
          deal_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_data?: Json
          deal_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_analysis: {
        Row: {
          confidence_level: number | null
          created_at: string
          deal_id: string
          expense_name: string
          id: string
          is_reasonable: boolean | null
          market_average: number | null
          reported_amount: number | null
          suggestions: string[] | null
          user_id: string | null
          validation_notes: string | null
          variance_percentage: number | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          deal_id: string
          expense_name: string
          id?: string
          is_reasonable?: boolean | null
          market_average?: number | null
          reported_amount?: number | null
          suggestions?: string[] | null
          user_id?: string | null
          validation_notes?: string | null
          variance_percentage?: number | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          deal_id?: string
          expense_name?: string
          id?: string
          is_reasonable?: boolean | null
          market_average?: number | null
          reported_amount?: number | null
          suggestions?: string[] | null
          user_id?: string | null
          validation_notes?: string | null
          variance_percentage?: number | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          address: string
          city: string | null
          competition_data: Json | null
          competition_score: number | null
          created_at: string
          demographic_score: number | null
          id: string
          income_data: Json | null
          location_key: string
          market_opportunity_score: number | null
          market_trends: Json | null
          population_data: Json | null
          rent_analysis: Json | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          city?: string | null
          competition_data?: Json | null
          competition_score?: number | null
          created_at?: string
          demographic_score?: number | null
          id?: string
          income_data?: Json | null
          location_key: string
          market_opportunity_score?: number | null
          market_trends?: Json | null
          population_data?: Json | null
          rent_analysis?: Json | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          competition_data?: Json | null
          competition_score?: number | null
          created_at?: string
          demographic_score?: number | null
          id?: string
          income_data?: Json | null
          location_key?: string
          market_opportunity_score?: number | null
          market_trends?: Json | null
          population_data?: Json | null
          rent_analysis?: Json | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_projections: {
        Row: {
          confidence_level: number | null
          created_at: string
          current_revenue: number | null
          deal_id: string
          equipment_recommendations: Json | null
          id: string
          optimization_opportunities: Json | null
          pricing_recommendations: Json | null
          projected_revenue: number | null
          roi_projection: number | null
          service_recommendations: Json | null
          timeline_months: number | null
          user_id: string | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          current_revenue?: number | null
          deal_id: string
          equipment_recommendations?: Json | null
          id?: string
          optimization_opportunities?: Json | null
          pricing_recommendations?: Json | null
          projected_revenue?: number | null
          roi_projection?: number | null
          service_recommendations?: Json | null
          timeline_months?: number | null
          user_id?: string | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          current_revenue?: number | null
          deal_id?: string
          equipment_recommendations?: Json | null
          id?: string
          optimization_opportunities?: Json | null
          pricing_recommendations?: Json | null
          projected_revenue?: number | null
          roi_projection?: number | null
          service_recommendations?: Json | null
          timeline_months?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          break_even_analysis: Json | null
          created_at: string
          deal_id: string
          exit_strategy_projection: Json | null
          financial_risk_score: number | null
          id: string
          market_risk_score: number | null
          mitigation_strategies: Json | null
          operational_risk_score: number | null
          overall_risk_score: number | null
          risk_factors: Json | null
          success_probability: number | null
          user_id: string | null
        }
        Insert: {
          break_even_analysis?: Json | null
          created_at?: string
          deal_id: string
          exit_strategy_projection?: Json | null
          financial_risk_score?: number | null
          id?: string
          market_risk_score?: number | null
          mitigation_strategies?: Json | null
          operational_risk_score?: number | null
          overall_risk_score?: number | null
          risk_factors?: Json | null
          success_probability?: number | null
          user_id?: string | null
        }
        Update: {
          break_even_analysis?: Json | null
          created_at?: string
          deal_id?: string
          exit_strategy_projection?: Json | null
          financial_risk_score?: number | null
          id?: string
          market_risk_score?: number | null
          mitigation_strategies?: Json | null
          operational_risk_score?: number | null
          overall_risk_score?: number | null
          risk_factors?: Json | null
          success_probability?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_id: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          limits: Json
          name: string
          plan_id: string
          price_monthly: number | null
          price_yearly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name: string
          plan_id: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          limits?: Json
          name?: string
          plan_id?: string
          price_monthly?: number | null
          price_yearly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      enhance_local_market_data: {
        Args: { zip_code: string }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_subscription: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>
      }
    }
    Enums: {
      user_role: "free" | "basic" | "professional" | "enterprise" | "admin"
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
      user_role: ["free", "basic", "professional", "enterprise", "admin"],
    },
  },
} as const
