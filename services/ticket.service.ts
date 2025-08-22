import { tenantApi } from "@/lib/api";

export interface PivotInfo {
  ticket_id: number;
  event_edition_id: number;
  available_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface EventEdition {
  id: number;
  tenant_id: string;
  event_name: string;
  slug: string;
  description: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  venue_postal_code: string;
  venue_latitude: string;
  venue_longitude: string;
  event_logo: string | null;
  event_banner: string | null;
  status: string;
  start_at: string;
  end_at: string;
  is_featured: boolean;
  sort_order: number;
  custom_fields: unknown | null;
  metadata: unknown | null;
  created_by_id: number;
  created_by_type: string;
  updated_by_id: number | null;
  updated_by_type: string | null;
  deleted_by_id: number | null;
  deleted_by_type: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  pivot: PivotInfo;
}

export interface Ticket {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  ticket_start_date: string;
  ticket_end_date: string;
  status: string;
  sort_order: number;
  is_nft_enabled: boolean;
  nft_contract_address: string | null;
  nft_metadata: string | null;
  tenant_id: string;
  created_by_id: number;
  created_by_type: string;
  created_at: string;
  updated_at: string;
  event_editions: EventEdition[];
}

export interface TicketCreateData {
  name: string;
  description: string;
  price: number;
  quantity: number;
  ticket_start_date: string;
  ticket_end_date: string;
  status?: string;
  sort_order?: number;
  is_nft_enabled?: boolean;
  event_edition_ids?: number[];
}

export const ticketService = {
  async getTickets(): Promise<Ticket[]> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await tenantApi.getTickets(token || undefined);
      console.log("Tickets API response:", response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.tickets && Array.isArray(response.tickets)) {
        return response.tickets;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        // If response is a single object, it might be a paginated response
        console.warn("Unexpected ticket response structure:", response);
        return [];
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      throw error;
    }
  },

  async getTicketById(id: number): Promise<Ticket> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await tenantApi.getTicketById(id, token || undefined);
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to fetch ticket ${id}:`, error);
      throw error;
    }
  },

  async createTicket(data: TicketCreateData): Promise<Ticket> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await tenantApi.createTicket(data, token || undefined);
      return response?.data || response;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  },

  async updateTicket(id: number, data: Partial<TicketCreateData>): Promise<Ticket> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await tenantApi.updateTicket(id, data, token || undefined);
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to update ticket ${id}:`, error);
      throw error;
    }
  },

  async deleteTicket(id: number): Promise<void> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      await tenantApi.deleteTicket(id, token || undefined);
    } catch (error) {
      console.error(`Failed to delete ticket ${id}:`, error);
      throw error;
    }
  },

  async getEventEditions(): Promise<EventEdition[]> {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const response = await tenantApi.getEvents(token || undefined);
      console.log("Event editions API response:", response);
      
      // Handle different response structures
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response?.event_editions && Array.isArray(response.event_editions)) {
        return response.event_editions;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        console.warn("Unexpected event editions response structure:", response);
        return [];
      }
      
      return [];
    } catch (error) {
      console.error("Failed to fetch event editions:", error);
      return [];
    }
  }
};