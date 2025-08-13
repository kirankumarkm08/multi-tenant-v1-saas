"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Ticket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  sold: number
  eventId?: string
  features: string[]
  saleStart: string
  saleEnd: string
  status: 'active' | 'inactive' | 'sold_out'
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null)
  const [formData, setFormData] = useState<Partial<TicketType>>({
    name: '',
    description: '',
    price: 0,
    quantity: 100,
    sold: 0,
    eventId: '',
    features: [],
    saleStart: '',
    saleEnd: '',
    status: 'active'
  })

  useEffect(() => {
    const savedTickets = JSON.parse(localStorage.getItem('tickets') || '[]')
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]')
    setTickets(savedTickets)
    setEvents(savedEvents)
  }, [])

  const saveTickets = (updatedTickets: TicketType[]) => {
    localStorage.setItem('tickets', JSON.stringify(updatedTickets))
    setTickets(updatedTickets)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingTicket) {
      const updatedTickets = tickets.map(ticket =>
        ticket.id === editingTicket.id ? { ...ticket, ...formData } : ticket
      )
      saveTickets(updatedTickets)
    } else {
      const newTicket: TicketType = {
        // id: Date.now().toString(),
        ...formData as TicketType
      }
      saveTickets([...tickets, newTicket])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      sold: 0,
      eventId: '',
      features: [],
      saleStart: '',
      saleEnd: '',
      status: 'active'
    })
    setEditingTicket(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (ticket: TicketType) => {
    setEditingTicket(ticket)
    setFormData(ticket)
    setIsDialogOpen(true)
  }

  const handleDelete = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket type?')) {
      const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId)
      saveTickets(updatedTickets)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'sold_out': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId)
    return event ? event.title : 'No Event'
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
                <h1 className="text-2xl font-bold">Tickets Management</h1>
                <p className="text-gray-600">Create and manage ticket types</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ticket Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTicket ? 'Edit Ticket Type' : 'Create New Ticket Type'}</DialogTitle>
                  <DialogDescription>
                    Configure your ticket pricing and availability.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Ticket Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Early Bird, VIP, General"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventId">Event</Label>
                      <select
                        id="eventId"
                        value={formData.eventId}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what's included with this ticket..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Total Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="sold_out">Sold Out</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="saleStart">Sale Start Date</Label>
                      <Input
                        id="saleStart"
                        type="datetime-local"
                        value={formData.saleStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, saleStart: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="saleEnd">Sale End Date</Label>
                      <Input
                        id="saleEnd"
                        type="datetime-local"
                        value={formData.saleEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, saleEnd: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Input
                      id="features"
                      value={formData.features?.join(', ') || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                      }))}
                      placeholder="Access to all sessions, Lunch included, Networking event"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket types yet</h3>
              <p className="text-gray-600 mb-4">Create different ticket types for your events.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Ticket Type
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
              <CardDescription>Manage your event ticket pricing and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Sales Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getEventName(ticket.eventId || '')}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${ticket.price}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{ticket.sold || 0} / {ticket.quantity} sold</div>
                          <div className="text-gray-500">
                            {ticket.quantity - (ticket.sold || 0)} remaining
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ticket.saleStart && (
                            <div>Start: {new Date(ticket.saleStart).toLocaleDateString()}</div>
                          )}
                          {ticket.saleEnd && (
                            <div>End: {new Date(ticket.saleEnd).toLocaleDateString()}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(ticket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ticket.id)}
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
  )
}
