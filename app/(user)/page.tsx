"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/useComponents/Navbar";
import DynamicForm from "@/components/useComponents/forms/DynamicForm";
import DynamicEvents from "@/components/useComponents/DynamicEvents";
import DynamicTickets from "@/components/useComponents/DynamicTickets";
import { eventService } from "@/services/event.service";
import { ticketService, Ticket } from "@/services/ticket.service";
import { apiFetch } from "@/lib/api-config";
import { Event } from "@/types/event";

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
    const data = await eventService.getEvents();
    setEvents(data.filter((e) => e.status === "published"));
  };
   console.log("event data" , events)

  const fetchTickets = async () => {
    const data = await ticketService.getTickets();
    setTickets(data.filter((t) => t.status === "active"));
  };
  console.log("ticket data", tickets)

  const fetchPages = async () => {
    try {
      const response = await apiFetch("/tenant/pages");
      const pageData = Array.isArray(response) ? response : response?.data || [];
      const navItems = pageData.map((p: any) => ({
        label: p.title || p.type,
        href: `/${p.type}`,
      }));
      setPages(navItems);
    } catch (err) {
      console.error("Failed to load pages", err);
    }
  };

  return (
    <div>
      <Navbar pages={pages} />
      {/* Sections */}
      <main className="px-4 py-12">
        <DynamicEvents events={events} />
        <DynamicTickets tickets={tickets} />
      </main>
    </div>
  );
}
