"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageModule {
  id: string
  type: 'hero' | 'text' | 'image' | 'events' | 'speakers' | 'tickets' | 'contact' | 'gallery' | 'testimonials'
  title: string
  content: any
  order: number
  layout: 'full' | 'container' | 'narrow'
}

interface CustomPage {
  id: string
  name: string
  slug: string
  title: string
  description: string
  modules: PageModule[]
  settings: {
    headerStyle: 'default' | 'minimal' | 'centered'
    footerStyle: 'default' | 'minimal' | 'none'
    backgroundColor: string
    textColor: string
  }
}

export default function CustomPagePreview({ params }: { params: { id: string } }) {
  const [page, setPage] = useState<CustomPage | null>(null)

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem('customPages') || '[]')
    const foundPage = pages.find((p: CustomPage) => p.id === params.id)
    if (foundPage) {
      setPage(foundPage)
    }
  }, [params.id])

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: page.settings.backgroundColor, color: page.settings.textColor }}>
      {/* Admin Preview Header */}
      <div className="bg-blue-600 text-white p-2 text-center text-sm">
        <span>🔍 Preview Mode - This is how your custom page will look to users</span>
        <Link href="/dashboard" className="ml-4 underline">
          Exit Preview
        </Link>
      </div>

      {/* Page Content */}
      <div>
        {page.modules
          .sort((a, b) => a.order - b.order)
          .map((module) => (
          <div key={module.id} className={getModuleLayoutClass(module.layout)}>
            <ModuleRenderer module={module} />
          </div>
        ))}
      </div>
    </div>
  )
}

function getModuleLayoutClass(layout: string) {
  switch (layout) {
    case 'full':
      return 'w-full'
    case 'narrow':
      return 'container mx-auto px-6 max-w-4xl'
    default:
      return 'container mx-auto px-6'
  }
}

function ModuleRenderer({ module }: { module: PageModule }) {
  switch (module.type) {
    case 'hero':
      return (
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-6">{module.content.title}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">{module.content.subtitle}</p>
            {module.content.buttonText && (
              <a
                href={module.content.buttonLink || '#'}
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {module.content.buttonText}
              </a>
            )}
          </div>
        </div>
      )
    
    case 'text':
      return (
        <div className="py-16">
          <div className={`text-${module.content.alignment || 'left'}`}>
            <h2 className="text-3xl font-bold mb-6">{module.content.title}</h2>
            <div className="text-lg leading-relaxed whitespace-pre-wrap">
              {module.content.content}
            </div>
          </div>
        </div>
      )
    
    case 'image':
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
          <div className={`grid ${module.content.layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {module.content.images?.map((img: any, index: number) => (
              <div key={index} className="group">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={img.src || "/placeholder.svg?height=300&width=400"}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {img.caption && (
                  <p className="mt-2 text-sm text-gray-600 text-center">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    
    case 'events':
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{module.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would load actual events from localStorage */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Sample Event</h3>
              <p className="text-gray-600 mb-4">This is a sample event description.</p>
              <div className="text-sm text-gray-500">
                <p>📅 Date: Coming Soon</p>
                <p>📍 Location: TBD</p>
                <p>💰 Price: $99</p>
              </div>
            </div>
          </div>
        </div>
      )
    
    case 'speakers':
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{module.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would load actual speakers from localStorage */}
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold">Sample Speaker</h3>
              <p className="text-gray-600">Speaker Title</p>
            </div>
          </div>
        </div>
      )
    
    case 'tickets':
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{module.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* This would load actual tickets from localStorage */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Early Bird</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">$99</div>
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li>✓ Full event access</li>
                <li>✓ Lunch included</li>
                <li>✓ Networking session</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Ticket
              </button>
            </div>
          </div>
        </div>
      )
    
    default:
      return (
        <div className="py-16">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              {module.type} module content will be displayed here
            </p>
          </div>
        </div>
      )
  }
}
