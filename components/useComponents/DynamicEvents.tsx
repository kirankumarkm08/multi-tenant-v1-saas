"use client";
import { Event } from "@/types/event";
import { Calendar, MapPin, Clock } from "lucide-react";

interface DynamicEventsProps {
  events: Event[];
  title?: string;
  showFeatured?: boolean;
}

export default function DynamicEvents({ 
  events, 
  title = "Upcoming Events",
  showFeatured = false 
}: DynamicEventsProps) {
  const displayEvents = showFeatured 
    ? events.filter(e => e.is_featured) 
    : events;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (displayEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No events available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {event.event_banner && (
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={event.event_banner} 
                    alt={event.event_name}
                    className="w-full h-full object-cover"
                  />
                  {event.is_featured && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded text-sm font-semibold">
                      Featured
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{event.event_name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.start_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(event.start_at)} - {formatTime(event.end_at)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <div>
                      <p className="font-medium">{event.venue_name}</p>
                      <p className="text-xs">
                        {event.venue_address}, {event.venue_city}, {event.venue_state}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}