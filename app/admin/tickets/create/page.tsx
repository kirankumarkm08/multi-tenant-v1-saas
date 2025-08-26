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
import { ArrowLeft, Save, Calendar, DollarSign, Hash, Clock, Users, Tag, Settings, Info } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

      await ticketService.createTicket(dataToSubmit);
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Overview Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Tag className="h-5 w-5" />
                Create New Ticket
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Design and configure your ticket with all the necessary details
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Main Form Card */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="h-5 w-5" />
                Ticket Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Fill in the details to create a new ticket for your events
              </CardDescription>
            </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Ticket Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., VIP Pass, General Admission"
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price (USD)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        placeholder="0.00"
                        className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Available Quantity
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="1"
                        placeholder="100"
                        className="pl-10 h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                        <SelectValue placeholder="Select ticket status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Available for purchase</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Inactive</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Not available</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Pending</Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Under review</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>
              </div>

              <Separator className="my-8" />

              {/* Sale Period Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sale Period</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ticket_start_date" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Sale Start Date
                    </Label>
                    <Input
                      id="ticket_start_date"
                      name="ticket_start_date"
                      type="datetime-local"
                      value={formData.ticket_start_date}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket_end_date" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Sale End Date
                    </Label>
                    <Input
                      id="ticket_end_date"
                      name="ticket_end_date"
                      type="datetime-local"
                      value={formData.ticket_end_date}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Additional Settings Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sort_order" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Display Order
                    </Label>
                    <Input
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Lower numbers appear first</p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Features</Label>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Checkbox
                        id="is_nft_enabled"
                        checked={formData.is_nft_enabled}
                        onCheckedChange={handleCheckboxChange}
                        className="border-gray-300 dark:border-gray-600"
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="is_nft_enabled" className="cursor-pointer font-medium text-gray-900 dark:text-white">
                          Enable NFT
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Create NFT tokens for ticket holders</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Description Section */}
              <div className="space-y-4">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Ticket Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Describe what's included with this ticket, special benefits, access levels, and any important details..."
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                />
              </div>

              {eventEditions.length > 0 && (
                <>
                  <Separator className="my-8" />
                  
                  {/* Event Assignment Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Event Assignment</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Select which events this ticket applies to</p>
                      </div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Events</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {selectedEvents.length === 0 ? 'No events selected' : `${selectedEvents.length} event(s) selected`}
                        </p>
                      </div>
                      <div className="max-h-48 overflow-y-auto p-4 space-y-3">
                        {eventEditions.map((event) => (
                          <div key={event.id} className="flex items-start space-x-3 p-3 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors">
                            <Checkbox
                              id={`event-${event.id}`}
                              checked={selectedEvents.includes(event.id)}
                              onCheckedChange={() => handleEventToggle(event.id)}
                              className="mt-0.5 border-gray-300 dark:border-gray-600"
                            />
                            <div className="flex-1 min-w-0">
                              <Label
                                htmlFor={`event-${event.id}`}
                                className="cursor-pointer font-medium text-gray-900 dark:text-white block"
                              >
                                {event.event_name}
                              </Label>
                              <div className="text-sm text-gray-500 dark:text-gray-400 space-x-2">
                                <span>{event.venue_city}, {event.venue_state}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-8" />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <Link href="/admin/tickets" className="sm:order-1">
                  <Button type="button" variant="outline" className="w-full sm:w-auto h-11 border-gray-300 dark:border-gray-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 sm:order-2"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Ticket...
                    </>
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
    </div>
  );
}
