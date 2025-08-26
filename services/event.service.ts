import { apiFetch } from '@/lib/api-config';
import { Event, EventFormData } from '@/types/event';

class EventService {
  private baseUrl = '/tenant/event-edition';

  private formatDateTimeForAPI(date: string, time: string): string {
    // Format as Y-m-d H:i:s (e.g., 2025-09-12 14:30:00)
    return `${date} ${time}:00`;
  }

  async createEvent(eventData: any): Promise<Event> {
    try {
      // Handle both FormData and regular object
      let apiData: any;
      
      if (eventData instanceof FormData) {
        // For FormData, we need to add the 'name' field if it's missing
        console.log('Sending FormData to API...');
        
        // Check if 'name' field exists, if not, copy from 'event_name'
        if (!eventData.has('name') && eventData.has('event_name')) {
          eventData.append('name', eventData.get('event_name') as string);
        }
        
        // Log FormData contents for debugging
        console.log('FormData contents:');
        for (let [key, value] of eventData.entries()) {
          console.log(`${key}:`, value);
        }
        
        // Check specifically for name field
        console.log('FormData has name field:', eventData.has('name'));
        console.log('FormData name value:', eventData.get('name'));
        
        const response = await apiFetch(this.baseUrl, {
          method: 'POST',
          body: eventData,
          // apiFetch will now automatically handle FormData headers
        });
        return response.data || response;
      } else {
        // Format datetime-local strings to API format
        const formatDateTime = (datetimeLocal: string): string => {
          if (!datetimeLocal) return '';
          // datetime-local format is YYYY-MM-DDTHH:mm
          // Convert to YYYY-MM-DD HH:mm:ss format
          const [date, time] = datetimeLocal.split('T');
          return `${date} ${time}:00`;
        };

        // Validate required fields
        const requiredFields = ['event_name', 'description', 'venue_name', 'venue_city', 'start_at', 'end_at'];
        const missingFields = requiredFields.filter(field => !eventData[field] || eventData[field].trim() === '');
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Generate slug if not provided
        const slug = eventData.slug || eventData.event_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        apiData = {
          name: eventData.event_name.trim(),
          event_name: eventData.event_name.trim(), // Keep both for compatibility
          description: eventData.description.trim(),
          venue_name: eventData.venue_name.trim(),
          venue_address: eventData.venue_address?.trim() || '',
          venue_city: eventData.venue_city.trim(),
          venue_state: eventData.venue_state?.trim() || '',
          venue_country: eventData.venue_country?.trim() || 'US',
          venue_postal_code: eventData.venue_postal_code?.trim() || '',
          venue_latitude: eventData.venue_latitude || "0.0",
          venue_longitude: eventData.venue_longitude || "0.0",
          status: eventData.status || 'draft',
          start_at: formatDateTime(eventData.start_at),
          end_at: formatDateTime(eventData.end_at),
          is_active: Boolean(eventData.is_active ?? true),
          is_featured: Boolean(eventData.is_featured || false),
          sort_order: parseInt(eventData.sort_order || "1", 10),
          slug: slug,
          custom_fields: eventData.custom_fields || null,
          metadata: eventData.metadata || null,
        };

        console.log('Sending event data to API:', apiData);

        const response = await apiFetch(this.baseUrl, {
          method: 'POST',
          body: JSON.stringify(apiData),
        });
        return response.data || response;
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      
      // Enhanced error reporting
      if (error.status === 422 || error.message?.includes('Validation failed')) {
        const validationErrors = error.data?.errors || error.data?.message || 'Unknown validation error';
        console.error('Validation errors:', validationErrors);
        
        if (typeof validationErrors === 'object') {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        } else {
          throw new Error(`Validation failed: ${validationErrors}`);
        }
      }
      
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