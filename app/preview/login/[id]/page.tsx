"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LoginPage {
  id: string
  name: string
  title: string
  description: string
  settings: {
    usernameLabel: string
    passwordLabel: string
    submitButtonText: string
    forgotPasswordLink: boolean
    registerLink: boolean
    rememberMeOption: boolean
  }
}

export default function LoginPreview({ params }: { params: { id: string } }) {
  const [page, setPage] = useState<LoginPage | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('loginPages') || '[]')
    const foundPage = pages.find((p: LoginPage) => p.id === params.id)
    if (foundPage) {
      setPage(foundPage)
    }
  }, [params.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would normally authenticate with your API
    console.log('Login submitted:', formData)
    setIsSubmitted(true)
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login Successful!</h2>
            <p className="text-gray-600 mb-6">Welcome back! You have been successfully logged in.</p>
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
        <span>🔍 Preview Mode - This is how your login page will look to users</span>
        <Link href="/dashboard" className="ml-4 underline">
          Exit Preview
        </Link>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{page.title}</CardTitle>
              <p className="text-gray-600">{page.description}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username">{page.settings.usernameLabel}</Label>
                  <Input
                    id="username"
                    type="text"
                    required
                    placeholder={`Enter your ${page.settings.usernameLabel.toLowerCase()}`}
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">{page.settings.passwordLabel}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder={`Enter your ${page.settings.passwordLabel.toLowerCase()}`}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                {page.settings.rememberMeOption && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                )}
                
                <Button type="submit" className="w-full">
                  {page.settings.submitButtonText}
                </Button>
                
                <div className="text-center space-y-2">
                  {page.settings.forgotPasswordLink && (
                    <div>
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Forgot your password?
                      </a>
                    </div>
                  )}
                  {page.settings.registerLink && (
                    <div>
                      <span className="text-sm text-gray-600">Don't have an account? </span>
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        Create one here
                      </a>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
