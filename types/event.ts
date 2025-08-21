export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  available?: number;
}

export interface Event {
  id?: number;
  event_name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  venue_postal_code: string;
  venue_latitude?: string;
  venue_longitude?: string;
  event_logo?: string | null;
  event_banner?: string | null;
  status: 'draft' | 'published' | 'cancelled';
  start_at: string;
  end_at: string;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: string;
  custom_fields?: any;
  metadata?: any;
  tenant_id?: string;
  slug?: string;
  created_by_id?: number;
  created_by_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventFormData {
  event_name: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  venue_postal_code: string;
  venue_latitude?: string;
  venue_longitude?: string;
  status: 'draft' | 'published' | 'cancelled';
  sort_order?: string;
}