"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Users, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  permissions: {
    managePages: boolean
    manageEvents: boolean
    manageSpeakers: boolean
    manageTickets: boolean
    manageCoupons: boolean
    manageStaff: boolean
    viewAnalytics: boolean
  }
  status: 'active' | 'inactive'
  lastLogin?: string
}

const rolePermissions = {
  admin: {
    managePages: true,
    manageEvents: true,
    manageSpeakers: true,
    manageTickets: true,
    manageCoupons: true,
    manageStaff: true,
    viewAnalytics: true
  },
  editor: {
    managePages: true,
    manageEvents: true,
    manageSpeakers: true,
    manageTickets: true,
    manageCoupons: true,
    manageStaff: false,
    viewAnalytics: true
  },
  viewer: {
    managePages: false,
    manageEvents: false,
    manageSpeakers: false,
    manageTickets: false,
    manageCoupons: false,
    manageStaff: false,
    viewAnalytics: true
  }
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    role: 'viewer',
    permissions: rolePermissions.viewer,
    status: 'active'
  })

  useEffect(() => {
    const savedStaff = JSON.parse(localStorage.getItem('staff') || '[]')
    setStaff(savedStaff)
  }, [])

  const saveStaff = (updatedStaff: StaffMember[]) => {
    localStorage.setItem('staff', JSON.stringify(updatedStaff))
    setStaff(updatedStaff)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStaff) {
      const updatedStaff = staff.map(member =>
        member.id === editingStaff.id ? { ...member, ...formData } : member
      )
      saveStaff(updatedStaff)
    } else {
      const newStaff: StaffMember = {
        // id: Date.now().toString(),
        ...formData as StaffMember
      }
      saveStaff([...staff, newStaff])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      permissions: rolePermissions.viewer,
      status: 'active'
    })
    setEditingStaff(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member)
    setFormData(member)
    setIsDialogOpen(true)
  }

  const handleDelete = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      const updatedStaff = staff.filter(member => member.id !== staffId)
      saveStaff(updatedStaff)
    }
  }

  const handleRoleChange = (role: 'admin' | 'editor' | 'viewer') => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role]
    }))
  }

  const handlePermissionChange = (permission: keyof StaffMember['permissions'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions!,
        [permission]: checked
      }
    }))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
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
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <p className="text-gray-600">Manage team access and permissions</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                  <DialogDescription>
                    Set up access and permissions for team members.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
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
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="managePages"
                            checked={formData.permissions?.managePages || false}
                            onCheckedChange={(checked) => handlePermissionChange('managePages', checked as boolean)}
                          />
                          <Label htmlFor="managePages" className="text-sm">Manage Pages</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageEvents"
                            checked={formData.permissions?.manageEvents || false}
                            onCheckedChange={(checked) => handlePermissionChange('manageEvents', checked as boolean)}
                          />
                          <Label htmlFor="manageEvents" className="text-sm">Manage Events</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageSpeakers"
                            checked={formData.permissions?.manageSpeakers || false}
                            onCheckedChange={(checked) => handlePermissionChange('manageSpeakers', checked as boolean)}
                          />
                          <Label htmlFor="manageSpeakers" className="text-sm">Manage Speakers</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageTickets"
                            checked={formData.permissions?.manageTickets || false}
                            onCheckedChange={(checked) => handlePermissionChange('manageTickets', checked as boolean)}
                          />
                          <Label htmlFor="manageTickets" className="text-sm">Manage Tickets</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageCoupons"
                            checked={formData.permissions?.manageCoupons || false}
                            onCheckedChange={(checked) => handlePermissionChange('manageCoupons', checked as boolean)}
                          />
                          <Label htmlFor="manageCoupons" className="text-sm">Manage Coupons</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageStaff"
                            checked={formData.permissions?.manageStaff || false}
                            onCheckedChange={(checked) => handlePermissionChange('manageStaff', checked as boolean)}
                          />
                          <Label htmlFor="manageStaff" className="text-sm">Manage Staff</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="viewAnalytics"
                            checked={formData.permissions?.viewAnalytics || false}
                            onCheckedChange={(checked) => handlePermissionChange('viewAnalytics', checked as boolean)}
                          />
                          <Label htmlFor="viewAnalytics" className="text-sm">View Analytics</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {staff.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
              <p className="text-gray-600 mb-4">Add team members to manage your event website.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage access and permissions for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.lastLogin ? (
                          <span className="text-sm text-gray-600">{member.lastLogin}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
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
