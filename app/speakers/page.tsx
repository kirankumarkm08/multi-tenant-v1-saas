"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Speaker {
  id: string
  name: string
  title: string
  company: string
  bio: string
  image: string
  email: string
  social: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  topics: string[]
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [formData, setFormData] = useState<Partial<Speaker>>({
    name: '',
    title: '',
    company: '',
    bio: '',
    image: '',
    email: '',
    social: {},
    topics: []
  })

  useEffect(() => {
    const savedSpeakers = JSON.parse(localStorage.getItem('speakers') || '[]')
    setSpeakers(savedSpeakers)
  }, [])

  const saveSpeakers = (updatedSpeakers: Speaker[]) => {
    localStorage.setItem('speakers', JSON.stringify(updatedSpeakers))
    setSpeakers(updatedSpeakers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingSpeaker) {
      const updatedSpeakers = speakers.map(speaker =>
        speaker.id === editingSpeaker.id ? { ...speaker, ...formData } : speaker
      )
      saveSpeakers(updatedSpeakers)
    } else {
      const newSpeaker: Speaker = {
        // id: Date.now().toString(),
        ...formData as Speaker
      }
      saveSpeakers([...speakers, newSpeaker])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      bio: '',
      image: '',
      email: '',
      social: {},
      topics: []
    })
    setEditingSpeaker(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker)
    setFormData(speaker)
    setIsDialogOpen(true)
  }

  const handleDelete = (speakerId: string) => {
    if (confirm('Are you sure you want to delete this speaker?')) {
      const updatedSpeakers = speakers.filter(speaker => speaker.id !== speakerId)
      saveSpeakers(updatedSpeakers)
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
                <h1 className="text-2xl font-bold">Speakers Management</h1>
                <p className="text-gray-600">Manage your event speakers</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Speaker
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingSpeaker ? 'Edit Speaker' : 'Add New Speaker'}</DialogTitle>
                  <DialogDescription>
                    Fill in the speaker details below.
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
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Senior Developer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Speaker biography..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="topics">Topics (comma-separated)</Label>
                    <Input
                      id="topics"
                      value={formData.topics?.join(', ') || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        topics: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                      }))}
                      placeholder="React, JavaScript, Web Development"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={formData.social?.twitter || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          social: { ...prev.social, twitter: e.target.value }
                        }))}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.social?.linkedin || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          social: { ...prev.social, linkedin: e.target.value }
                        }))}
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.social?.website || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          social: { ...prev.social, website: e.target.value }
                        }))}
                        placeholder="https://website.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {speakers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No speakers yet</h3>
              <p className="text-gray-600 mb-4">Add speakers to showcase at your events.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Speaker
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 relative">
                    {speaker.image ? (
                      <img
                        src={speaker.image || "/placeholder.svg"}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{speaker.name}</h3>
                    <p className="text-sm text-gray-600">{speaker.title}</p>
                    <p className="text-sm text-gray-500 mb-2">{speaker.company}</p>
                    {speaker.bio && (
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">{speaker.bio}</p>
                    )}
                    {speaker.topics && speaker.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {speaker.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                        {speaker.topics.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{speaker.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {speaker.social?.twitter && (
                          <a
                            href={`https://twitter.com/${speaker.social.twitter.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Twitter
                          </a>
                        )}
                        {speaker.social?.linkedin && (
                          <a
                            href={speaker.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(speaker)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(speaker.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
