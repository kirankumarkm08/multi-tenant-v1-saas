"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
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

export default function RegistrationPreview({ params }: { params: { id: string } }) {
  const [page, setPage] = useState<RegistrationPage | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('registrationPages') || '[]')
    const foundPage = pages.find((p: RegistrationPage) => p.id === params.id)
    if (foundPage) {
      setPage(foundPage)
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally submit to your API
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">{page.settings.successMessage}</p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Preview Header */}
      <div className="bg-blue-600 text-white p-2 text-center text-sm">
        <span>🔍 Preview Mode - This is how your registration page will look to users</span>
        <Link href="/dashboard" className="ml-4 underline">
          Exit Preview
        </Link>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{page.title}</CardTitle>
              <p className="text-gray-600">{page.description}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {page.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                  <div key={field.id}>
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{field.placeholder || 'Select an option'}</option>
                        {field.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.name}
                          name={field.name}
                          required={field.required}
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor={field.name} className="text-sm">
                          {field.placeholder || field.label}
                        </Label>
                      </div>
                    ) : field.type === 'radio' ? (
                      <div className="mt-1 space-y-2">
                        {field.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`${field.name}-${index}`}
                              name={field.name}
                              value={option}
                              required={field.required}
                              checked={formData[field.name] === option}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className="border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={`${field.name}-${index}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="mt-1"
                      />
                    )}
                  </div>
                ))}
                
                <Button type="submit" className="w-full">
                  {page.settings.submitButtonText}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
