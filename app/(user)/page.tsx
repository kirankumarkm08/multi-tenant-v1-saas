"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/useComponents/Navbar";
import DynamicForm from "@/components/useComponents/forms/DynamicForm";
import DynamicEvents from "@/components/useComponents/DynamicEvents";
import DynamicTickets from "@/components/useComponents/DynamicTickets";
import { tenantApi } from "@/lib/api";
import { apiFetch } from "@/lib/api-config";
import { ticketService, Ticket } from "@/services/ticket.service";
import { Event } from "@/types/event";
import HeroSection from "@/components/useComponents/Hero";

export default function LandingPage() {
  const [pages, setPages] = useState<{ label: string; href: string }[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchTickets();
    fetchPages();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await tenantApi.getEvents();
      console.log("Events API response:", response);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
      } else if (response?.events && Array.isArray(response.events)) {
        data = response.events;
      }
      
      setEvents(data.filter((e) => e.status === "published"));
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    }
  };
   console.log("event data" , events)

   
  const fetchTickets = async () => {
    try {
      console.log("Attempting to fetch tickets...");
      const response = await tenantApi.getTickets();
      console.log("Tickets API response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response || {}));
      console.log("Response stringified:", JSON.stringify(response, null, 2));
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(response)) {
        data = response;
        console.log("Response is array, length:", data.length);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        console.log("Response has nested data array, length:", data.length);
      } else if (response?.data && Array.isArray(response.data)) {
        data = response.data;
        console.log("Response has data array, length:", data.length);
      } else if (response?.tickets && Array.isArray(response.tickets)) {
        data = response.tickets;
        console.log("Response has tickets array, length:", data.length);
      } else {
        console.log("Response structure not recognized:", response);
      }
      
      console.log("All tickets before filtering:", data);
      
      // First set all tickets without filtering to see if we get any data
      if (data.length > 0) {
        console.log("Found tickets, setting all tickets (no filter)");
        setTickets(data);
      } else {
        console.log("No tickets found in data");
        setTickets([]);
      }
    } catch (error) {
      console.error("Failed to fetch tickets via tenantApi:", error);
      console.error("Error details:", error.message);
      console.error("Error status:", error.status);
      console.error("Error data:", error.data);
      
      // Try fallback with ticketService
      try {
        console.log("Trying fallback with ticketService...");
        const fallbackData = await ticketService.getTickets();
        console.log("Fallback tickets response:", fallbackData);
        setTickets(fallbackData);
      } catch (fallbackError) {
        console.error("Fallback ticket service also failed:", fallbackError);
        setTickets([]);
      }
    }
  };
  console.log("ticket data", tickets)

  const fetchPages = async () => {
    try {
      console.log("Fetching pages...");
      const response = await tenantApi.getPages();
      console.log("Pages API response:", response.data);
  
      // Handle different response structures
      let pageData: any[] = [];
      if (Array.isArray(response)) {
        pageData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        pageData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        pageData = response.data.data;
      } else if (response?.pages && Array.isArray(response.pages)) {
        pageData = response.pages;
      }
  
      console.log("Processed page data:", pageData);
  
      const navItems = pageData.map((p: any) => ({
        label: p.title || p.name || p.type || "Untitled",
        href:
          p.type === "login"
            ? "/login" :"/registration"
      }));
  
      console.log("Navigation items:", navItems);
      setPages(navItems);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };
  

  return (
    <div>
      <Navbar pages={pages} />
      {/* Sections */}
      <main className="px-4 py-12">
      <HeroSection />
        <DynamicEvents events={events} />
        <DynamicTickets tickets={tickets} showOnlyActive={false} />
      </main>
    </div>
  );
}
