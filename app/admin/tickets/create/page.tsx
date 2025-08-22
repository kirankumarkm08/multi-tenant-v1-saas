"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ticketService, TicketCreateData, EventEdition } from "@/services/ticket.service";
import { tenantApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateTicketPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventEditions, setEventEditions] = useState<EventEdition[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [formData, setFormData] = useState<TicketCreateData>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    ticket_start_date: "",
    ticket_end_date: "",
    status: "active",
    sort_order: 0,
    is_nft_enabled: false,
    event_edition_ids: [],
  });

  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
      return;
    }
    fetchEventEditions();
  }, [token]);

  const fetchEventEditions = async () => {
    try {
      const events = await ticketService.getEventEditions();
      setEventEditions(events);
    } catch (error) {
      console.error("Failed to fetch event editions:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_nft_enabled: checked,
    }));
  };

  const handleEventToggle = (eventId: number) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      }
      return [...prev, eventId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        event_edition_ids: selectedEvents,
      };
      
      // Method 1: Using ticketService (recommended - handles response structure)
      await ticketService.createTicket(dataToSubmit);
      
      // Method 2: Direct API call (alternative)
      // await tenantApi.createTicket(dataToSubmit, token || undefined);
      router.push("/admin/tickets");
    } catch (error: any) {
      alert(error?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/tickets">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Ticket
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Create a new ticket for your events
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>
              Fill in the details to create a new ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ticket Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="VIP Pass"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ticket_start_date">Sale Start Date</Label>
                  <Input
                    id="ticket_start_date"
                    name="ticket_start_date"
                    type="datetime-local"
                    value={formData.ticket_start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ticket_end_date">Sale End Date</Label>
                  <Input
                    id="ticket_end_date"
                    name="ticket_end_date"
                    type="datetime-local"
                    value={formData.ticket_end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    name="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="is_nft_enabled"
                    checked={formData.is_nft_enabled}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_nft_enabled" className="cursor-pointer">
                    Enable NFT
                  </Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe the ticket benefits and features..."
                />
              </div>

              {eventEditions.length > 0 && (
                <div>
                  <Label>Assign to Events</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {eventEditions.map((event) => (
                      <div key={event.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`event-${event.id}`}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                        />
                        <Label
                          htmlFor={`event-${event.id}`}
                          className="cursor-pointer flex-1"
                        >
                          {event.event_name} - {event.venue_city}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link href="/admin/tickets">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}