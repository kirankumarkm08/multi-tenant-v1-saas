"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Copy,
  ChevronUp,
  ChevronDown,
  Edit2,
  X,
  Loader2,
  Check,
  AlertCircle,
  Image,
  Type,
  Layout,
  FormInput,
  Calendar,
  Users,
  Ticket,
  Map,
  Code,
  FileText,
} from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  id: string;
  type: string;
  title: string;
  content: any;
  order: number;
  settings?: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    className?: string;
    visible?: boolean;
  };
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  is_active: number;
  show_in_nav: number;
  show_in_footer: number;
  page_layout: {
    sections: Section[];
    settings?: any;
  };
  metadata?: any;
}

const sectionTypes = [
  { value: "hero", label: "Hero Section", icon: Layout, color: "bg-blue-500" },
  { value: "text", label: "Text Block", icon: Type, color: "bg-gray-500" },
  { value: "image", label: "Image Gallery", icon: Image, color: "bg-green-500" },
  { value: "form", label: "Form", icon: FormInput, color: "bg-purple-500" },
  { value: "events", label: "Events List", icon: Calendar, color: "bg-red-500" },
  { value: "speakers", label: "Speakers", icon: Users, color: "bg-indigo-500" },
  { value: "tickets", label: "Tickets", icon: Ticket, color: "bg-yellow-500" },
  { value: "map", label: "Location Map", icon: Map, color: "bg-teal-500" },
  { value: "custom", label: "Custom HTML", icon: Code, color: "bg-pink-500" },
  { value: "cta", label: "Call to Action", icon: FileText, color: "bg-orange-500" },
];

function SortableSection({ section, onEdit, onDelete, onDuplicate }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sectionType = sectionTypes.find(t => t.value === section.type);
  const Icon = sectionType?.icon || Layout;

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={`border ${isDragging ? 'border-blue-500 shadow-lg' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className={`p-2 rounded ${sectionType?.color || 'bg-gray-500'} text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">{section.title || 'Untitled Section'}</h4>
                <p className="text-sm text-muted-foreground">
                  {sectionType?.label || section.type}
                </p>
              </div>

              {!section.settings?.visible && (
                <Badge variant="outline" className="text-xs">Hidden</Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(section)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(section)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(section.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const pageId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("sections");

  // Fetch page data
  // useEffect(() => {
  //   fetchPageData();
  // }, [pageId]);

  // const fetchPageData = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await apiFetch(`/customer/pages/${pageId}`, {
  //       userRole: 'customer',
  //       tenantId: user?.tenantId,
  //     });

  //     if (response.success && response.data) {
  //       const page = response.data as PageData;
  //       setPageData(page);
  //       setSections(page.page_layout?.sections || []);
  //     } else {
  //       throw new Error('Failed to fetch page data');
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to load page');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order property
        return newItems.map((item, index) => ({
          ...item,
          order: index
        }));
      });
    }
  };

  const handleAddSection = (type: string) => {
    const sectionType = sectionTypes.find(t => t.value === type);
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: type,
      title: `New ${sectionType?.label || 'Section'}`,
      content: getDefaultSectionContent(type),
      order: sections.length,
      settings: {
        visible: true,
        backgroundColor: '#ffffff',
        padding: '2rem',
        margin: '0',
        className: '',
      }
    };
    
    setSections([...sections, newSection]);
    setShowAddSectionDialog(false);
    setSelectedSection(newSection);
    setShowSectionDialog(true);
  };

  const getDefaultSectionContent = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          heading: 'Welcome to Our Site',
          subheading: 'Your success starts here',
          buttonText: 'Get Started',
          buttonLink: '#',
          backgroundImage: ''
        };
      case 'text':
        return {
          content: '<p>Enter your text content here...</p>'
        };
      case 'image':
        return {
          images: [],
          layout: 'grid',
          columns: 3
        };
      case 'form':
        return {
          fields: [],
          submitText: 'Submit',
          successMessage: 'Thank you for your submission!'
        };
      case 'events':
        return {
          limit: 6,
          showPastEvents: false,
          layout: 'grid'
        };
      case 'cta':
        return {
          heading: 'Ready to get started?',
          description: 'Join thousands of satisfied customers',
          primaryButton: { text: 'Start Now', link: '#' },
          secondaryButton: { text: 'Learn More', link: '#' }
        };
      default:
        return {};
    }
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setShowSectionDialog(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter(s => s.id !== sectionId));
      setSuccess('Section deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDuplicateSection = (section: Section) => {
    const newSection = {
      ...section,
      id: `section-${Date.now()}`,
      title: `${section.title} (Copy)`,
      order: sections.length
    };
    setSections([...sections, newSection]);
    setSuccess('Section duplicated successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveSection = () => {
    if (selectedSection) {
      setSections(sections.map(s => 
        s.id === selectedSection.id ? selectedSection : s
      ));
      setShowSectionDialog(false);
      setSelectedSection(null);
      setSuccess('Section updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // const handleSavePage = async () => {
  //   try {
  //     setSaving(true);
  //     setError(null);

  //     const updateData = {
  //       ...pageData,
  //       page_layout: {
  //         ...pageData?.page_layout,
  //         sections: sections
  //       }
  //     };

  //     const response = await apiFetch(`/customer/pages/${pageId}`, {
  //       method: 'PUT',
  //       userRole: 'customer',
  //       tenantId: user?.tenantId,
  //       body: updateData
  //     });

  //     if (response.success) {
  //       setSuccess('Page saved successfully!');
  //       setTimeout(() => setSuccess(null), 3000);
  //     } else {
  //       throw new Error(response.message || 'Failed to save page');
  //     }
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to save page');
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg">Page not found</p>
        <Button onClick={() => router.push('/custom')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pages
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/custom')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold">{pageData.title}</h1>
                <p className="text-sm text-muted-foreground">/{pageData.slug}</p>
              </div>

              <Badge variant={pageData.status === 'published' ? 'default' : 'secondary'}>
                {pageData.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/preview/customer/${pageId}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button
                // onClick={handleSavePage}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccess(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Sections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Page Sections</CardTitle>
                  <Button
                    onClick={() => setShowAddSectionDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <Layout className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-muted-foreground mb-4">No sections yet</p>
                    <Button
                      onClick={() => setShowAddSectionDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Section
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sections.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          onEdit={handleEditSection}
                          onDelete={handleDeleteSection}
                          onDuplicate={handleDuplicateSection}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Page Settings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={pageData.status}
                    onValueChange={(value: any) => 
                      setPageData({...pageData, status: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={pageData.is_active === 1}
                    onCheckedChange={(checked) =>
                      setPageData({...pageData, is_active: checked ? 1 : 0})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show in Navigation</Label>
                  <Switch
                    checked={pageData.show_in_nav === 1}
                    onCheckedChange={(checked) =>
                      setPageData({...pageData, show_in_nav: checked ? 1 : 0})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Show in Footer</Label>
                  <Switch
                    checked={pageData.show_in_footer === 1}
                    onCheckedChange={(checked) =>
                      setPageData({...pageData, show_in_footer: checked ? 1 : 0})
                    }
                  />
                </div>

                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={pageData.title}
                    onChange={(e) =>
                      setPageData({...pageData, title: e.target.value})
                    }
                  />
                </div>

                <div>
                  <Label>URL Slug</Label>
                  <Input
                    value={pageData.slug}
                    onChange={(e) =>
                      setPageData({...pageData, slug: e.target.value})
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Section Dialog */}
      <Dialog open={showAddSectionDialog} onOpenChange={setShowAddSectionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Choose a section type to add to your page
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {sectionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => handleAddSection(type.value)}
                >
                  <div className={`p-2 rounded ${type.color} text-white mr-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{type.label}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          
          {selectedSection && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={selectedSection.title}
                  onChange={(e) =>
                    setSelectedSection({
                      ...selectedSection,
                      title: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <Label>Visibility</Label>
                <Switch
                  checked={selectedSection.settings?.visible !== false}
                  onCheckedChange={(checked) =>
                    setSelectedSection({
                      ...selectedSection,
                      settings: {
                        ...selectedSection.settings,
                        visible: checked
                      }
                    })
                  }
                />
              </div>

              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {/* Dynamic content editor based on section type */}
                  {selectedSection.type === 'hero' && (
                    <>
                      <div>
                        <Label>Heading</Label>
                        <Input
                          value={selectedSection.content.heading || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                heading: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Subheading</Label>
                        <Input
                          value={selectedSection.content.subheading || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                subheading: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={selectedSection.content.buttonText || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                buttonText: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Button Link</Label>
                        <Input
                          value={selectedSection.content.buttonLink || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                buttonLink: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  {selectedSection.type === 'text' && (
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={selectedSection.content.content || ''}
                        onChange={(e) =>
                          setSelectedSection({
                            ...selectedSection,
                            content: {
                              ...selectedSection.content,
                              content: e.target.value
                            }
                          })
                        }
                        rows={10}
                      />
                    </div>
                  )}

                  {selectedSection.type === 'cta' && (
                    <>
                      <div>
                        <Label>Heading</Label>
                        <Input
                          value={selectedSection.content.heading || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                heading: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={selectedSection.content.description || ''}
                          onChange={(e) =>
                            setSelectedSection({
                              ...selectedSection,
                              content: {
                                ...selectedSection.content,
                                description: e.target.value
                              }
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={selectedSection.settings?.backgroundColor || '#ffffff'}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          settings: {
                            ...selectedSection.settings,
                            backgroundColor: e.target.value
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Padding</Label>
                    <Input
                      value={selectedSection.settings?.padding || '2rem'}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          settings: {
                            ...selectedSection.settings,
                            padding: e.target.value
                          }
                        })
                      }
                      placeholder="e.g., 2rem, 20px"
                    />
                  </div>

                  <div>
                    <Label>Margin</Label>
                    <Input
                      value={selectedSection.settings?.margin || '0'}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          settings: {
                            ...selectedSection.settings,
                            margin: e.target.value
                          }
                        })
                      }
                      placeholder="e.g., 1rem 0"
                    />
                  </div>

                  <div>
                    <Label>Custom CSS Classes</Label>
                    <Input
                      value={selectedSection.settings?.className || ''}
                      onChange={(e) =>
                        setSelectedSection({
                          ...selectedSection,
                          settings: {
                            ...selectedSection.settings,
                            className: e.target.value
                          }
                        })
                      }
                      placeholder="e.g., container mx-auto"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSectionDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSection}>
                  Save Section
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}