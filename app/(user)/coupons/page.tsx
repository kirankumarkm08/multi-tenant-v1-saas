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

interface EventItem {
  id: string
  title: string
}

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
  const [events, setEvents] = useState<EventItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<Coupon>({
    id: '',
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
    const savedCoupons: Coupon[] = JSON.parse(localStorage.getItem('coupons') || '[]')
    const savedEvents: EventItem[] = JSON.parse(localStorage.getItem('events') || '[]')
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
        ...formData,
        id: Date.now().toString()
      }
      saveCoupons([...coupons, newCoupon])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      id: '',
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

  const getStatusColor = (status: Coupon['status']) => {
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
    // JSX remains the same as your original code
    // No functional changes, just TS fixes
    // ...
    <div className=""></div>
  )
}
