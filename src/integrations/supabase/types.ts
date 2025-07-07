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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          area: string | null
          city: string
          created_at: string
          house_building: string | null
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          area?: string | null
          city: string
          created_at?: string
          house_building?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          area?: string | null
          city?: string
          created_at?: string
          house_building?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      addresses_temp: {
        Row: {
          address_line1: string
          address_line2: string | null
          area: string | null
          city: string
          created_at: string
          house_building: string | null
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          postal_code: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          area?: string | null
          city: string
          created_at?: string
          house_building?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          area?: string | null
          city?: string
          created_at?: string
          house_building?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          postal_code?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_temp_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "temp_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_area: {
        Row: {
          created_at: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_customer_number: {
        Row: {
          created_at: string
          id: string
          phone_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number: number
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: number
        }
        Relationships: []
      }
      admin_facility: {
        Row: {
          created_at: string
          facility_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          facility_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          facility_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_orders: {
        Row: {
          amount: number
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone_number: number
          delivery_date: string | null
          delivery_driver: string
          facility_used: string
          order_id: string
          pickup_date: string
          pickup_driver: string
          pickup_slot: string
          service_id: string
          special_message: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone_number: number
          delivery_date?: string | null
          delivery_driver: string
          facility_used: string
          order_id?: string
          pickup_date: string
          pickup_driver: string
          pickup_slot?: string
          service_id?: string
          special_message?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone_number?: number
          delivery_date?: string | null
          delivery_driver?: string
          facility_used?: string
          order_id?: string
          pickup_date?: string
          pickup_driver?: string
          pickup_slot?: string
          service_id?: string
          special_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_slot: {
        Row: {
          created_at: string
          end_time: string
          id: string
          label: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          label: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          label?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver: {
        Row: {
          created_at: string
          id: string
          name: string
          phone_number: string
          salary: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone_number: string
          salary: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone_number?: string
          salary?: string
          updated_at?: string
        }
        Relationships: []
      }
      driver_tasks: {
        Row: {
          created_at: string
          customer_id: string | null
          driver_id: string | null
          id: string
          order_id: string | null
          status: string
          task_priority: number | null
          temp_customer_id: string | null
          temp_order_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status: string
          task_priority?: number | null
          temp_customer_id?: string | null
          temp_order_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status?: string
          task_priority?: number | null
          temp_customer_id?: string | null
          temp_order_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_tasks_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_tasks_temp_customer_id_fkey"
            columns: ["temp_customer_id"]
            isOneToOne: false
            referencedRelation: "temp_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_tasks_temp_order_id_fkey"
            columns: ["temp_order_id"]
            isOneToOne: false
            referencedRelation: "orders_temp"
            referencedColumns: ["id"]
          },
        ]
      }
      order_dry_cleaning_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          item_price: number
          order_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          item_price: number
          order_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          item_price?: number
          order_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_id: string
          created_at: string
          delivery_date: string
          delivery_slot_id: string
          estimated_weight: number | null
          id: string
          pickup_date: string
          pickup_slot_id: string
          service_id: string
          special_instructions: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id: string
          created_at?: string
          delivery_date: string
          delivery_slot_id: string
          estimated_weight?: number | null
          id?: string
          pickup_date: string
          pickup_slot_id: string
          service_id: string
          special_instructions?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string
          created_at?: string
          delivery_date?: string
          delivery_slot_id?: string
          estimated_weight?: number | null
          id?: string
          pickup_date?: string
          pickup_slot_id?: string
          service_id?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_slot_id_fkey"
            columns: ["delivery_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pickup_slot_id_fkey"
            columns: ["pickup_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_temp: {
        Row: {
          address_id: string
          created_at: string
          delivery_date: string
          delivery_slot_id: string
          estimated_weight: number | null
          id: string
          pickup_date: string
          pickup_slot_id: string
          service_id: string
          special_instructions: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id: string
          created_at?: string
          delivery_date: string
          delivery_slot_id: string
          estimated_weight?: number | null
          id?: string
          pickup_date: string
          pickup_slot_id: string
          service_id: string
          special_instructions?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string
          created_at?: string
          delivery_date?: string
          delivery_slot_id?: string
          estimated_weight?: number | null
          id?: string
          pickup_date?: string
          pickup_slot_id?: string
          service_id?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_temp_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses_temp"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_temp_delivery_slot_id_fkey"
            columns: ["delivery_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_temp_pickup_slot_id_fkey"
            columns: ["pickup_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_temp_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_temp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "temp_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          id: number
          phone: string
        }
        Insert: {
          id?: number
          phone: string
        }
        Update: {
          id?: number
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          mobile_number: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          mobile_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          mobile_number?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          discount_price: number | null
          icon: string
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_price?: number | null
          icon: string
          id?: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_price?: number | null
          icon?: string
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      temp_customers: {
        Row: {
          created_at: string
          customer_email_address: string
          customer_name: string
          customer_phone_number: string
          id: string
        }
        Insert: {
          created_at?: string
          customer_email_address: string
          customer_name: string
          customer_phone_number: string
          id?: string
        }
        Update: {
          created_at?: string
          customer_email_address?: string
          customer_name?: string
          customer_phone_number?: string
          id?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string
          enabled: boolean
          end_time: string
          id: string
          label: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          end_time: string
          id?: string
          label: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          end_time?: string
          id?: string
          label?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_order_permanently: {
        Args: { order_id_param: string }
        Returns: boolean
      }
      migrate_temp_customer_data: {
        Args: { user_phone: string; authenticated_user_id: string }
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
