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
      announcements: {
        Row: {
          content: string
          created_at: string | null
          expiry_date: string | null
          id: string
          important: boolean | null
          publish_date: string
          title: string
          updated_at: string | null
          action:string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          important?: boolean | null
          publish_date?: string
          title: string
          updated_at?: string | null
          action:string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          important?: boolean | null
          publish_date?: string
          title?: string
          updated_at?: string | null
          action:string | null
        }
        Relationships: []
      }
      billing: {
        Row: {
          billing_month: string
          created_at: string
          due_date: string
          electricity_cost: number
          electricity_units: number
          id: string
          occupancy_id: string
          paid_date: string | null
          room_id: string
          room_rent: number
          status: string
          tenant_id: string
          sum: number
          updated_at: string
          water_cost: number
          water_units: number
          receipt_number: string
        }
        Insert: {
          billing_month: string
          created_at?: string
          due_date: string
          electricity_cost?: number
          electricity_units?: number
          id?: string
          occupancy_id: string
          paid_date?: string | null
          room_id: string
          room_rent?: number
          status?: string
          tenant_id: string
          total_amount?: number
          updated_at?: string
          water_cost?: number
          water_units?: number
          receipt_number: string
        }
        Update: {
          billing_month?: string
          created_at?: string
          due_date?: string
          electricity_cost?: number
          electricity_units?: number
          id?: string
          occupancy_id?: string
          paid_date?: string | null
          room_id?: string
          room_rent?: number
          status?: string
          tenant_id?: string
          total_amount?: number
          updated_at?: string
          water_cost?: number
          water_units?: number
          receipt_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_occupancy_id_fkey"
            columns: ["occupancy_id"]
            isOneToOne: false
            referencedRelation: "occupancy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          tenant_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          tenant_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          max_participants: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          max_participants?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      occupancy: {
        Row: {
          check_in_date: string
          check_out_date: string | null
          created_at: string | null
          id: string
          is_current: boolean | null
          latest_meter_reading: number | null
          room_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          check_in_date: string
          check_out_date?: string | null
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          latest_meter_reading?: number | null
          room_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          check_in_date?: string
          check_out_date?: string | null
          created_at?: string | null
          id?: string
          is_current?: boolean | null
          latest_meter_reading?: number | null
          room_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_occupancy_room"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_occupancy_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupancy_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occupancy_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          occupancy_id: string
          payment_date: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          occupancy_id: string
          payment_date: string
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          occupancy_id?: string
          payment_date?: string
          payment_method?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_occupancy_id_fkey"
            columns: ["occupancy_id"]
            isOneToOne: false
            referencedRelation: "occupancy"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string | null
          staff_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          tenant_id?: string | null
          staff_id: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string | null
          staff_id: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      repairs: {
        Row: {
          completed_date: string | null
          created_at: string | null
          description: string
          id: string
          reported_date: string
          room_id: string
          room_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          description: string
          id?: string
          reported_date?: string
          room_id: string
          room_number: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          description?: string
          id?: string
          reported_date?: string
          room_id?: string
          room_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "repairs_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repairs_room_number_fkey"
            columns: ["room_number"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["room_number"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string | null
          floor: number
          id: string
          price: number
          room_number: string
          room_type: string
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          floor: number
          id?: string
          price: number
          room_number: string
          room_type: string
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          floor?: number
          id?: string
          price?: number
          room_number?: string
          room_type?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_tenants_fkey"
            columns: ["tenants"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          created_by: string | null
          deposit_rate: number
          electricity_rate: number
          id: string
          late_fee: number
          updated_at: string
          water_rate: number
          floor:number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deposit_rate?: number
          electricity_rate?: number
          id?: string
          late_fee?: number
          updated_at?: string
          water_rate?: number
          floor:number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deposit_rate?: number
          electricity_rate?: number
          id?: string
          late_fee?: number
          updated_at?: string
          water_rate?: number
          floor:number
        }
        Relationships: []
      }
      tenants: {
        Row: {
          address: string | null
          auth_email: string | null
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          room_id: string
          room_number: string
          updated_at: string | null
          image:string
          residents: string
          action: string
        }
        Insert: {
          address?: string | null
          auth_email?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
           room_id: string
          room_number: string
          updated_at?: string | null
          residents: string
          image:string
          action: string
        }
        Update: {
          address?: string | null
          auth_email?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          room_id: string
          room_number?: string
          updated_at?: string | null
          residents: string
          image:string
          action: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_room_number_fkey"
            columns: ["room_number"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["room_number"]
          },
        ]
      }
      staffs: {
          Row: {
            id: string
            first_name: string
            last_name: string
            email: string
            phone: string | null
            address: string | null
            department: string | null
            role: string
            status: string
            emergency_contact: string | null
            created_at: string | null
            updated_at: string | null
          }
          Insert: {
            id?: string
            first_name: string
            last_name: string
            email: string
            phone?: string | null
            address?: string | null
            department?: string | null
            role?: string
            status?: string
            emergency_contact?: string | null
            created_at?: string | null
            updated_at?: string | null
          }
          Update: {
            id?: string
            first_name?: string
            last_name?: string
            email?: string
            phone?: string | null
            address?: string | null
            department?: string | null
            role?: string
            status?: string
            emergency_contact?: string | null
            created_at?: string | null
            updated_at?: string | null
          }
          Relationships: []
        },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
    Enums: {},
  },
} as const
