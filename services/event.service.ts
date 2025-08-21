import { apiFetch } from '@/lib/api-config';
import { Event, EventFormData } from '@/types/event';

class EventService {
  private baseUrl = '/tenant/event-edition';

  private formatDateTimeForAPI(date: string, time: string): string {
    // Format as Y-m-d H:i:s (e.g., 2025-09-12 14:30:00)
    return `${date} ${time}:00`;
  }

  async createEvent(eventData: EventFormData): Promise<Event> {
    try {
      // Format the data according to API requirements
      const apiData = {
        event_name: eventData.event_name,
        description: eventData.description,
        venue_name: eventData.venue_name,
        venue_address: eventData.venue_address,
        venue_city: eventData.venue_city,
        venue_state: eventData.venue_state,
        venue_country: eventData.venue_country,
        venue_postal_code: eventData.venue_postal_code,
        venue_latitude: eventData.venue_latitude || "0",
        venue_longitude: eventData.venue_longitude || "0",
        status: eventData.status,
        start_at: this.formatDateTimeForAPI(eventData.start_date, eventData.start_time),
        end_at: this.formatDateTimeForAPI(eventData.end_date, eventData.end_time),
        is_active: true,
        is_featured: false,
        sort_order: eventData.sort_order || "1",
      };

      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      return response.data || response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEvents(): Promise<Event[]> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'GET',
      });
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEvent(id: string): Promise<Event> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<Event> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
      return response;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();