"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  price: number
  status: 'draft' | 'published' | 'cancelled'
}

const events: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2025",
    description: "A gathering of tech enthusiasts to discuss the future of technology.",
    date: "2025-09-10",
    time: "10:00",
    location: "San Francisco Convention Center",
    capacity: 500,
    price: 99.99,
    status: "published"
  },
  {
    id: "2",
    title: "Music Festival",
    description: "Outdoor music festival featuring local and international artists.",
    date: "2025-08-20",
    time: "14:00",
    location: "Central Park, New York",
    capacity: 2000,
    price: 49.99,
    status: "draft"
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    description: "Pitch your startup idea to investors and get valuable feedback.",
    date: "2025-10-05",
    time: "18:00",
    location: "Online - Zoom",
    capacity: 100,
    price: 0,
    status: "cancelled"
  }
]

export default function EventsPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Events Management</h1>
                <p className="text-gray-600">View your events</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600 mb-4">There are no events to display.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>Static event listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-xs">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{event.capacity}</TableCell>
                      <TableCell>${event.price}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
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
  )
}
