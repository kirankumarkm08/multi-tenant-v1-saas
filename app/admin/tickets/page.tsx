"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Tag, Edit, Trash2, Plus, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ticketService, Ticket } from "@/services/ticket.service";
import { tenantApi } from "@/lib/api";
import { format } from "date-fns";

export default function TicketsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
      return;
    }
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Using tenantApi.getTickets method directly
      const response = await tenantApi.getTickets(token || undefined);
      console.log("Fetched tickets response:", response);
      
      // Handle different response structures
      let ticketsArray: Ticket[] = [];
      if (Array.isArray(response)) {
        ticketsArray = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        ticketsArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        ticketsArray = response.data;
      } else if (response?.tickets && Array.isArray(response.tickets)) {
        ticketsArray = response.tickets;
      }
      
      setTickets(ticketsArray);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch tickets:", err);
      setError(err?.message || "Failed to fetch tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await tenantApi.deleteTicket(id, token || undefined);
      await fetchTickets();
    } catch (err: any) {
      alert(err?.message || "Failed to delete ticket");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your tickets</p>
          </div>
          <Link href="/admin/tickets/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Ticket
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchTickets} className="mt-4" variant="outline">Retry</Button>
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tickets yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Create your first ticket to get started.</p>
              <Link href="/admin/tickets/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-gray-900 dark:text-white">All Tickets</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Manage and view all your tickets</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">Ticket</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Start Date</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">End Date</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(tickets) && tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{ticket.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{ticket.description}</div>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        ${typeof ticket.price === 'number' ? ticket.price.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {ticket.ticket_start_date ? format(new Date(ticket.ticket_start_date), "PPP") : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {ticket.ticket_end_date ? format(new Date(ticket.ticket_end_date), "PPP") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status || 'pending')}>
                          {ticket.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/tickets/edit/${ticket.id}`)}
                            aria-label={`Edit ticket ${ticket.name}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-600 hover:text-red-700"
                            aria-label={`Delete ticket ${ticket.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
