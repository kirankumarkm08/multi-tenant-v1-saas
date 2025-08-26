"use client";
import { Ticket } from "@/services/ticket.service";
import { DollarSign, Package, Calendar, ShoppingCart, CheckCircle } from "lucide-react";

interface DynamicTicketsProps {
  tickets: Ticket[];
  title?: string;
  showOnlyActive?: boolean;
}

export default function DynamicTickets({ 
  tickets, 
  title = "Available Tickets",
  showOnlyActive = true 
}: DynamicTicketsProps) {
  console.log("DynamicTickets received tickets:", tickets);
  console.log("DynamicTickets tickets length:", tickets?.length);
  console.log("DynamicTickets showOnlyActive:", showOnlyActive);
  
  const displayTickets = showOnlyActive 
    ? tickets.filter(t => t.status === "active") 
    : tickets;
    
  console.log("DynamicTickets displayTickets:", displayTickets);
  console.log("DynamicTickets displayTickets length:", displayTickets?.length);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAvailabilityPercentage = (ticket: Ticket) => {
    const sold = (ticket as any).sold || 0;
    const total = ticket.quantity;
    return Math.round(((total - sold) / total) * 100);
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage > 50) return "text-green-600 bg-green-50";
    if (percentage > 20) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "sold_out":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (displayTickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No tickets available at the moment.</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTickets.map((ticket) => {
            const availabilityPercentage = getAvailabilityPercentage(ticket);
            const availableTickets = ticket.quantity - ((ticket as any).sold || 0);
            
            return (
              <div 
                key={ticket.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{ticket.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{ticket.description}</p>
                  
                  {((ticket as any).event_name || (ticket.event_editions && ticket.event_editions.length > 0)) && (
                    <div className="mb-4 p-2 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-700">
                        Event: {(ticket as any).event_name || ticket.event_editions?.[0]?.event_name || "Event"}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Price</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(ticket.price)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Available</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getAvailabilityColor(availabilityPercentage)}`}>
                          {availableTickets} / {ticket.quantity}
                        </span>
                      </div>
                    </div>
                    
                    {((ticket as any).saleEnd || ticket.ticket_end_date) && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Sale ends</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatDate((ticket as any).saleEnd || ticket.ticket_end_date)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {(ticket as any).features && (ticket as any).features.length > 0 && (
                    <div className="mb-4 border-t pt-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">INCLUDES:</p>
                      <ul className="space-y-1">
                        {(ticket as any).features.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${100 - availabilityPercentage}%` }}
                    />
                  </div>
                  
                  <button 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={ticket.status === "sold_out" || availableTickets === 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {ticket.status === "sold_out" ? "Sold Out" : "Purchase Ticket"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show more tickets hint */}
        {displayTickets.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing {displayTickets.length} ticket{displayTickets.length !== 1 ? 's' : ''} • All prices include applicable fees
            </p>
          </div>
        )}
      </div>
    </section>
  );
}