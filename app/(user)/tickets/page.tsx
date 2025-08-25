"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/useComponents/Navbar";
import DynamicTickets from "@/components/useComponents/DynamicTickets";
import { ticketService, Ticket } from "@/services/ticket.service";
import { apiFetch } from "@/lib/api-config";
import { Loader2, Ticket as TicketIcon } from "lucide-react";

export default function TicketsPage() {
  const [pages, setPages] = useState<{ label: string; href: string }[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "upcoming">("active");

  useEffect(() => {
    fetchTickets();
    fetchPages();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getTickets();
      console.log("Fetched tickets:", data);
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await apiFetch("/tenant/pages");
      const pageData = Array.isArray(response) ? response : response?.data || [];
      
      // Filter pages with show_in_nav enabled
      const navItems = pageData
        .filter((p: any) => {
          const settings = typeof p.settings === "string" 
            ? JSON.parse(p.settings) 
            : p.settings;
          return settings?.show_in_nav === true && p.status === "published";
        })
        .map((p: any) => ({
          label: p.title,
          href: p.slug ? `/${p.slug}` : `/page/${p.id}`,
        }));
      
      // Add tickets page to navigation
      navItems.push({ label: "Tickets", href: "/tickets" });
      
      setPages(navItems);
    } catch (err) {
      console.error("Failed to load pages", err);
    }
  };

  const getFilteredTickets = () => {
    switch (filter) {
      case "active":
        return tickets.filter(t => t.status === "active");
      case "upcoming":
        const now = new Date();
        return tickets.filter(t => {
          const startDate = new Date(t.ticket_start_date);
          return startDate > now && t.status !== "inactive";
        });
      case "all":
      default:
        return tickets;
    }
  };

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar pages={pages} />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <TicketIcon className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Event Tickets</h1>
          <p className="text-xl">Secure your spot at amazing events</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter("active")}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            On Sale Now
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Coming Soon
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Tickets
          </button>
        </div>

        {/* Tickets Display */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tickets...</span>
          </div>
        ) : filteredTickets.length > 0 ? (
          <DynamicTickets 
            tickets={filteredTickets} 
            title=""
            showOnlyActive={false}
          />
        ) : (
          <div className="text-center py-20">
            <TicketIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No tickets available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === "upcoming" 
                ? "No upcoming tickets at the moment. Check back soon!"
                : "No tickets match your current filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
