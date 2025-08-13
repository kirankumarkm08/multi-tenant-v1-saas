"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed'
  value: number
  usageLimit: number
  usedCount: number
  eventIds: string[]
  validFrom: string
  validUntil: string
  status: 'active' | 'inactive' | 'expired'
  minOrderAmount?: number
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    name: '',
    type: 'percentage',
    value: 0,
    usageLimit: 100,
    usedCount: 0,
    eventIds: [],
    validFrom: '',
    validUntil: '',
    status: 'active',
    minOrderAmount: 0
  })

  useEffect(() => {
    const savedCoupons = JSON.parse(localStorage.getItem('coupons') || '[]')
    const savedEvents = JSON.parse(localStorage.getItem('events') || '[]')
    setCoupons(savedCoupons)
    setEvents(savedEvents)
  }, [])

  const saveCoupons = (updatedCoupons: Coupon[]) => {
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons))
    setCoupons(updatedCoupons)
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCoupon) {
      const updatedCoupons = coupons.map(coupon =>
        coupon.id === editingCoupon.id ? { ...coupon, ...formData } : coupon
      )
      saveCoupons(updatedCoupons)
    } else {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        ...formData as Coupon
      }
      saveCoupons([...coupons, newCoupon])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: 0,
      usageLimit: 100,
      usedCount: 0,
      eventIds: [],
      validFrom: '',
      validUntil: '',
      status: 'active',
      minOrderAmount: 0
    })
    setEditingCoupon(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData(coupon)
    setIsDialogOpen(true)
  }

  const handleDelete = (couponId: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      const updatedCoupons = coupons.filter(coupon => coupon.id !== couponId)
      saveCoupons(updatedCoupons)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventNames = (eventIds: string[]) => {
    if (eventIds.length === 0) return 'All Events'
    const eventNames = eventIds.map(id => {
      const event = events.find(e => e.id === id)
      return event ? event.title : 'Unknown'
    })
    return eventNames.join(', ')
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
                <h1 className="text-2xl font-bold">Coupons Management</h1>
                <p className="text-gray-600">Create and manage discount coupons</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                  <DialogDescription>
                    Set up discount codes for your events.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Coupon Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Early Bird Discount"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Coupon Code</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="DISCOUNT20"
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateCouponCode}>
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Discount Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="value">
                        {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        step={formData.type === 'percentage' ? '1' : '0.01'}
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                        min="0"
                        max={formData.type === 'percentage' ? '100' : undefined}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="usageLimit">Usage Limit</Label>
                      <Input
                        id="usageLimit"
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) }))}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="validFrom">Valid From</Label>
                      <Input
                        id="validFrom"
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input
                        id="validUntil"
                        type="datetime-local"
                        value={formData.validUntil}
                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minOrderAmount">Minimum Order Amount ($)</Label>
                      <Input
                        id="minOrderAmount"
                        type="number"
                        step="0.01"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: parseFloat(e.target.value) }))}
                        min="0"
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
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Applicable Events</Label>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="all-events"
                          checked={formData.eventIds?.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, eventIds: [] }))
                            }
                          }}
                        />
                        <Label htmlFor="all-events" className="text-sm font-medium">
                          All Events
                        </Label>
                      </div>
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`event-${event.id}`}
                            checked={formData.eventIds?.includes(event.id) || false}
                            onChange={(e) => {
                              const eventIds = formData.eventIds || []
                              if (e.target.checked) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  eventIds: [...eventIds, event.id] 
                                }))
                              } else {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  eventIds: eventIds.filter(id => id !== event.id) 
                                }))
                              }
                            }}
                          />
                          <Label htmlFor={`event-${event.id}`} className="text-sm">
                            {event.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons yet</h3>
              <p className="text-gray-600 mb-4">Create discount coupons to boost ticket sales.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Discount Coupons</CardTitle>
              <CardDescription>Manage your promotional discount codes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="font-medium">{coupon.name}</div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                        </span>
                        {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                          <div className="text-xs text-gray-500">
                            Min: ${coupon.minOrderAmount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{coupon.usedCount || 0} / {coupon.usageLimit}</div>
                          <div className="text-gray-500">
                            {coupon.usageLimit - (coupon.usedCount || 0)} remaining
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {new Date(coupon.validFrom).toLocaleDateString()}</div>
                          <div>Until: {new Date(coupon.validUntil).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm truncate max-w-xs block">
                          {getEventNames(coupon.eventIds)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(coupon.status)}>
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon.id)}
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
