"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  required: boolean
  placeholder?: string
  options?: string[]
  order: number
}

interface RegistrationPage {
  id: string
  name: string
  title: string
  description: string
  fields: FormField[]
  settings: {
    submitButtonText: string
    successMessage: string
    redirectUrl?: string
  }
}

const defaultFields: FormField[] = [
  {
    id: '1',
    name: 'first_name',
    label: 'First Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your first name',
    order: 0
  },
  {
    id: '2',
    name: 'last_name',
    label: 'Last Name',
    type: 'text',
    required: true,
    placeholder: 'Enter your last name',
    order: 1
  },
  {
    id: '3',
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
    order: 2
  }
]

export default function RegistrationPageBuilder() {
  const [page, setPage] = useState<RegistrationPage>({
    id: Date.now().toString(),
    name: 'Registration Page',
    title: 'Event Registration',
    description: 'Register for our upcoming event',
    fields: defaultFields,
    settings: {
      submitButtonText: 'Register Now',
      successMessage: 'Thank you for registering! We will contact you soon.',
      redirectUrl: ''
    }
  })

  const [draggedField, setDraggedField] = useState<string | null>(null)

  useEffect(() => {
    // Load existing page if editing
    const pageId = new URLSearchParams(window.location.search).get('id')
    if (pageId) {
      const pages = JSON.parse(localStorage.getItem('registrationPages') || '[]')
      const existingPage = pages.find((p: RegistrationPage) => p.id === pageId)
      if (existingPage) {
        setPage(existingPage)
      }
    }
  }, [])

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: 'Enter value',
      order: page.fields.length
    }

    setPage(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setPage(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const deleteField = (fieldId: string) => {
    // Don't allow deleting default required fields
    const field = page.fields.find(f => f.id === fieldId)
    if (field && ['first_name', 'last_name', 'email'].includes(field.name)) {
      alert('Cannot delete required default fields')
      return
    }

    setPage(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const savePage = () => {
    const pages = JSON.parse(localStorage.getItem('registrationPages') || '[]')
    const existingIndex = pages.findIndex((p: RegistrationPage) => p.id === page.id)

    if (existingIndex >= 0) {
      pages[existingIndex] = page
    } else {
      pages.push(page)
    }

    localStorage.setItem('registrationPages', JSON.stringify(pages))

    // Also save to general pages list
    const allPages = JSON.parse(localStorage.getItem('pages') || '[]')
    const pageData = {
      id: page.id,
      name: page.name,
      type: 'registration',
      slug: 'register',
      modules: [],
      settings: {
        title: page.title,
        description: page.description,
        customFields: page.fields
      }
    }

    const allPagesIndex = allPages.findIndex((p: any) => p.id === page.id)
    if (allPagesIndex >= 0) {
      allPages[allPagesIndex] = pageData
    } else {
      allPages.push(pageData)
    }

    localStorage.setItem('pages', JSON.stringify(allPages))
    alert('Registration page saved successfully!')
  }

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault()
    if (!draggedField || draggedField === targetFieldId) return

    const draggedIndex = page.fields.findIndex(f => f.id === draggedField)
    const targetIndex = page.fields.findIndex(f => f.id === targetFieldId)

    const newFields = [...page.fields]
    const [draggedItem] = newFields.splice(draggedIndex, 1)
    newFields.splice(targetIndex, 0, draggedItem)

    // Update order
    newFields.forEach((field, index) => {
      field.order = index
    })

    setPage(prev => ({ ...prev, fields: newFields }))
    setDraggedField(null)
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
                <h1 className="text-2xl font-bold">Registration Page Builder</h1>
                <Badge variant="secondary">Registration Form</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/preview/registration/${page.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Button onClick={savePage} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-name">Page Name</Label>
                  <Input
                    id="page-name"
                    value={page.name}
                    onChange={(e) => setPage(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Registration Page"
                  />
                </div>
                <div>
                  <Label htmlFor="page-title">Page Title</Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event Registration"
                  />
                </div>
                <div>
                  <Label htmlFor="page-description">Description</Label>
                  <Input
                    id="page-description"
                    value={page.description}
                    onChange={(e) => setPage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Register for our event"
                  />
                </div>
                <div>
                  <Label htmlFor="submit-button">Submit Button Text</Label>
                  <Input
                    id="submit-button"
                    value={page.settings.submitButtonText}
                    onChange={(e) => setPage(prev => ({
                      ...prev,
                      settings: { ...prev.settings, submitButtonText: e.target.value }
                    }))}
                    placeholder="Register Now"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Field</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={addField} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Registration Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {page.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 bg-white relative group"
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, field.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <Badge variant="outline">{field.type}</Badge>
                          {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                        {!['first_name', 'last_name', 'email'].includes(field.name) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteField(field.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Field label"
                          />
                        </div>
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="field_name"
                            disabled={['first_name', 'last_name', 'email'].includes(field.name)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateField(field.id, { type: value as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="tel">Phone</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="radio">Radio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            disabled={['first_name', 'last_name', 'email'].includes(field.name)}
                          />
                          <Label htmlFor={`required-${field.id}`}>Required</Label>
                        </div>
                      </div>

                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="Enter placeholder text"
                        />
                      </div>

                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="mt-4">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, {
                              options: e.target.value.split(',').map(o => o.trim()).filter(o => o)
                            })}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}

                      {/* Field Preview */}
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <Label className="text-sm font-medium">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <textarea
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder={field.placeholder}
                            disabled
                            rows={3}
                          />
                        ) : field.type === 'select' ? (
                          <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" disabled>
                            <option>{field.placeholder || 'Select an option'}</option>
                            {field.options?.map((option, index) => (
                              <option key={index}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <div className="mt-1 flex items-center space-x-2">
                            <input type="checkbox" disabled />
                            <span className="text-sm">{field.placeholder || field.label}</span>
                          </div>
                        ) : field.type === 'radio' ? (
                          <div className="mt-1 space-y-2">
                            {field.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input type="radio" name={field.name} disabled />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button className="w-full" disabled>
                      {page.settings.submitButtonText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
