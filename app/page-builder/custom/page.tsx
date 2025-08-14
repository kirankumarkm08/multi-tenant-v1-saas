"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Layout,
  Type,
  Image,
  Calendar,
  Users,
  Ticket,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";

interface PageModule {
  id: string;
  type:
    | "hero"
    | "text"
    | "image"
    | "events"
    | "speakers"
    | "tickets"
    | "contact"
    | "gallery"
    | "testimonials";
  title: string;
  content: any;
  order: number;
  layout: "full" | "container" | "narrow";
}

interface CustomPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  modules: PageModule[];
  settings: {
    headerStyle: "default" | "minimal" | "centered";
    footerStyle: "default" | "minimal" | "none";
    backgroundColor: string;
    textColor: string;
  };
}

const moduleTemplates = [
  {
    type: "hero",
    name: "Hero Section",
    icon: Layout,
    description: "Large banner with title and call-to-action",
    defaultContent: {
      title: "Welcome to Our Event",
      subtitle: "Join us for an amazing experience",
      buttonText: "Get Started",
      buttonLink: "#",
      backgroundImage:
        "/placeholder.svg?height=400&width=800&text=Hero+Background",
      overlay: true,
    },
  },
  {
    type: "text",
    name: "Text Block",
    icon: Type,
    description: "Rich text content section",
    defaultContent: {
      title: "About Our Event",
      content:
        "This is where you can add detailed information about your event, speakers, agenda, and more.",
      alignment: "left",
    },
  },
  {
    type: "image",
    name: "Image Gallery",
    icon: Image,
    description: "Image showcase with captions",
    defaultContent: {
      images: [
        {
          src: "/placeholder.svg?height=300&width=400&text=Gallery+Image+1",
          alt: "Gallery Image 1",
          caption: "Event Photo 1",
        },
        {
          src: "/placeholder.svg?height=300&width=400&text=Gallery+Image+2",
          alt: "Gallery Image 2",
          caption: "Event Photo 2",
        },
      ],
      layout: "grid",
    },
  },
  {
    type: "events",
    name: "Events List",
    icon: Calendar,
    description: "Display upcoming events",
    defaultContent: {
      title: "Upcoming Events",
      showDate: true,
      showLocation: true,
      showPrice: true,
      limit: 6,
    },
  },
  {
    type: "speakers",
    name: "Speakers",
    icon: Users,
    description: "Showcase event speakers",
    defaultContent: {
      title: "Our Speakers",
      showBio: true,
      showSocial: true,
      layout: "grid",
      limit: 8,
    },
  },
  {
    type: "tickets",
    name: "Ticket Options",
    icon: Ticket,
    description: "Display ticket types and pricing",
    defaultContent: {
      title: "Get Your Tickets",
      showFeatures: true,
      showAvailability: true,
      layout: "cards",
    },
  },
];

export default function CustomPageBuilder() {
  const { token } = useAuth();
  const [page, setPage] = useState<CustomPage>({
    id: "",
    name: "New Custom Page",
    slug: "custom-page",
    title: "Custom Page",
    description: "A custom page built with drag and drop",
    modules: [],
    settings: {
      headerStyle: "default",
      footerStyle: "default",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    },
  });

  const [draggedModule, setDraggedModule] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Load existing page if editing
    const pageId = new URLSearchParams(window.location.search).get("id");
    if (pageId) {
      loadPage(pageId);
    }
  }, [token]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`);
      const modules =
        typeof data.modules === "string"
          ? JSON.parse(data.modules)
          : data.modules || [];
      const settings =
        typeof data.settings === "string"
          ? JSON.parse(data.settings)
          : data.settings || {};

      setPage({
        id: String(data.id),
        name: data.name || "New Custom Page",
        slug: data.slug || "custom-page",
        title: data.title || "Custom Page",
        description:
          data.description ||
          settings.description ||
          "A custom page built with drag and drop",
        modules: Array.isArray(modules) ? modules : [],
        settings: {
          headerStyle: settings.headerStyle || "default",
          footerStyle: settings.footerStyle || "default",
          backgroundColor: settings.backgroundColor || "#ffffff",
          textColor: settings.textColor || "#1f2937",
        },
      });
    } catch (error) {
      console.error(
        "Failed to load custom page:",
        (error as any)?.data || error
      );
      alert("Failed to load custom page");
    }
  };

  const addModule = (moduleType: string) => {
    const template = moduleTemplates.find((t) => t.type === moduleType);
    if (!template) return;

    const newModule: PageModule = {
      id: Date.now().toString(),
      type: moduleType as any,
      title: template.name,
      content: template.defaultContent,
      order: page.modules.length,
      layout: "container",
    };

    setPage((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };

  const updateModule = (moduleId: string, updates: Partial<PageModule>) => {
    setPage((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId ? { ...module, ...updates } : module
      ),
    }));
  };

  const deleteModule = (moduleId: string) => {
    setPage((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
    }));
    setSelectedModule(null);
  };

  const savePage = async () => {
    // token is auto-attached by apiFetch from localStorage
    setIsSaving(true);
    try {
      const requestData = {
        title: page.title,
        slug: page.slug,
        form_type: "custom",
        // Persist complex structures as JSON strings (Laravel-friendly)
        modules: JSON.stringify(page.modules),
        settings: JSON.stringify({
          ...page.settings,
          description: page.description,
          name: page.name,
        }),
      };

      const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
      const method = page.id ? "PUT" : "POST";

      const saved = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(requestData),
      });

      if (!page.id && saved?.id) {
        setPage((prev) => ({ ...prev, id: String(saved.id) }));
        window.history.pushState({}, "", `?id=${saved.id}`);
      }

      alert("Custom page saved successfully!");
    } catch (error: any) {
      console.error("Failed to save custom page:", error?.data || error);
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors)
          .flat()
          .join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert(error?.message || "Failed to save custom page");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deletePage = async () => {
    if (!page.id) return;
    if (!confirm("Are you sure you want to delete this custom page?")) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, { method: "DELETE" });
      alert("Custom page deleted");
      setPage((prev) => ({ ...prev, id: "" }));
      window.history.pushState({}, "", `?`);
    } catch (error: any) {
      console.error("Failed to delete custom page:", error?.data || error);
      alert(error?.message || "Failed to delete custom page");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModule(moduleId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedModule || draggedModule === targetModuleId) return;

    const draggedIndex = page.modules.findIndex((m) => m.id === draggedModule);
    const targetIndex = page.modules.findIndex((m) => m.id === targetModuleId);

    const newModules = [...page.modules];
    const [draggedItem] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedItem);

    // Update order
    newModules.forEach((module, index) => {
      module.order = index;
    });

    setPage((prev) => ({ ...prev, modules: newModules }));
    setDraggedModule(null);
  };

  const selectedModuleData = page.modules.find((m) => m.id === selectedModule);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Custom Page Builder</h1>
                <Badge variant="secondary">Drag & Drop Builder</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/preview/custom/${page.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Button onClick={savePage} size="sm" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Page
                  </>
                )}
              </Button>
              {page.id && (
                <Button
                  onClick={deletePage}
                  size="sm"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="modules" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="modules" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {moduleTemplates.map((template) => (
                        <Button
                          key={template.type}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => addModule(template.type)}
                        >
                          <div className="flex items-start space-x-3">
                            <template.icon className="h-5 w-5 mt-0.5 text-gray-500" />
                            <div>
                              <div className="font-medium text-sm">
                                {template.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
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
                        onChange={(e) =>
                          setPage((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Page name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-slug">URL Slug</Label>
                      <Input
                        id="page-slug"
                        value={page.slug}
                        onChange={(e) =>
                          setPage((prev) => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder="page-url"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-title">Page Title</Label>
                      <Input
                        id="page-title"
                        value={page.title}
                        onChange={(e) =>
                          setPage((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Page title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="page-description">Description</Label>
                      <Textarea
                        id="page-description"
                        value={page.description}
                        onChange={(e) =>
                          setPage((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Page description"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {page.modules.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                      <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p>
                        No modules added yet. Use the sidebar to add content
                        modules.
                      </p>
                    </div>
                  ) : (
                    page.modules
                      .sort((a, b) => a.order - b.order)
                      .map((module) => (
                        <div
                          key={module.id}
                          className={`border rounded-lg p-4 bg-white relative group cursor-pointer transition-all ${
                            selectedModule === module.id
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, module.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, module.id)}
                          onClick={() => setSelectedModule(module.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Badge variant="outline">{module.type}</Badge>
                              <span className="font-medium">
                                {module.title}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteModule(module.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <ModulePreview module={module} />
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Editor */}
          <div className="lg:col-span-1">
            {selectedModuleData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <ModuleEditor
                    module={selectedModuleData}
                    onUpdate={(updates) =>
                      updateModule(selectedModuleData.id, updates)
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <p>Select a module to edit its properties</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulePreview({ module }: { module: PageModule }) {
  switch (module.type) {
    case "hero":
      return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded">
          <h2 className="text-2xl font-bold mb-2">{module.content.title}</h2>
          <p className="mb-4">{module.content.subtitle}</p>
          <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium">
            {module.content.buttonText}
          </button>
        </div>
      );

    case "text":
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{module.content.title}</h3>
          <p className="text-gray-600">{module.content.content}</p>
        </div>
      );

    case "image":
      return (
        <div className="grid grid-cols-2 gap-2">
          {module.content.images?.slice(0, 2).map((img: any, index: number) => (
            <div
              key={index}
              className="aspect-video bg-gray-200 rounded flex items-center justify-center"
            >
              <span className="text-gray-500 text-sm">Image {index + 1}</span>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded text-center">
          <p className="text-sm text-muted-foreground">
            {module.type} module - Click to configure
          </p>
        </div>
      );
  }
}

function ModuleEditor({
  module,
  onUpdate,
}: {
  module: PageModule;
  onUpdate: (updates: Partial<PageModule>) => void;
}) {
  switch (module.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={module.content.title || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, title: e.target.value },
                })
              }
              placeholder="Hero title"
            />
          </div>
          <div>
            <Label>Subtitle</Label>
            <Textarea
              value={module.content.subtitle || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, subtitle: e.target.value },
                })
              }
              placeholder="Hero subtitle"
              rows={2}
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <Input
              value={module.content.buttonText || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, buttonText: e.target.value },
                })
              }
              placeholder="Button text"
            />
          </div>
          <div>
            <Label>Button Link</Label>
            <Input
              value={module.content.buttonLink || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, buttonLink: e.target.value },
                })
              }
              placeholder="Button URL"
            />
          </div>
        </div>
      );

    case "text":
      return (
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={module.content.title || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, title: e.target.value },
                })
              }
              placeholder="Section title"
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={module.content.content || ""}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, content: e.target.value },
                })
              }
              placeholder="Section content"
              rows={4}
            />
          </div>
          <div>
            <Label>Text Alignment</Label>
            <select
              value={module.content.alignment || "left"}
              onChange={(e) =>
                onUpdate({
                  content: { ...module.content, alignment: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">
            Module configuration will appear here based on the selected module
            type.
          </p>
        </div>
      );
  }
}
