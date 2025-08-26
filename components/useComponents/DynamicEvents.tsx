"use client";
import { Event } from "@/types/event";
import { Calendar, MapPin, Clock, Image as ImageIcon, Star, Users } from "lucide-react";
import { useState } from "react";

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

  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageError = (eventId: string | number) => {
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  const getImageUrl = (event: Event) => {
    // Handle different possible image URL formats
    if (event.event_banner) {
      // If it's already a full URL, use it
      if (event.event_banner.startsWith('http')) {
        return event.event_banner;
      }
      // If it's a relative path, construct the full URL
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://165.227.182.17';
      return `${baseUrl.replace('/api', '')}/${event.event_banner.replace(/^\//, '')}`;
    }
    return null;
  };

  if (displayEvents.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events available</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back later for upcoming events!</p>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Discover amazing events happening near you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayEvents.map((event) => {
            const imageUrl = getImageUrl(event);
            const hasImageError = imageErrors[event.id];
            
            return (
            <div 
              key={event.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
            >
              <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
                {imageUrl && !hasImageError ? (
                  <img 
                    src={imageUrl} 
                    alt={event.event_name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(event.id)}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Featured badge */}
                {event.is_featured && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </span>
                  </div>
                )}
                
                {/* Status badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {event.status === 'published' ? 'Live' : event.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                    {event.event_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {event.description || 'Join us for an amazing event experience!'}
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{formatDate(event.start_at)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Event Date</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">{formatTime(event.start_at)} - {formatTime(event.end_at)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg mt-0.5">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.venue_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {[event.venue_address, event.venue_city, event.venue_state, event.venue_country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                    View Event Details
                  </button>
                  
                  {/* Additional info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Event #{event.id}
                    </span>
                    {event.sort_order && (
                      <span>Priority: {event.sort_order}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        
        {/* Show more events hint */}
        {displayEvents.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {displayEvents.length} event{displayEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}