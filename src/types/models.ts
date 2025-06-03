export interface Profile {
  id: string;
  username?: string;
  mobile_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  house_building?: string;
  address_line1: string;
  address_line2?: string;
  area?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default?: boolean;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  label: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  service_id: string;
  pickup_date: string;
  pickup_slot_id: string;
  delivery_date: string;
  delivery_slot_id: string;
  special_instructions?: string;
  estimated_weight?: number;
  status: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
  // Include joined relations with optional error handling
  address?: Address;
  service?: Service;
  pickup_slot?: TimeSlot | any; // Allow for error cases
  delivery_slot?: TimeSlot | any; // Allow for error cases
}
