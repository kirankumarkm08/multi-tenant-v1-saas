"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Save, Eye, ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";

interface PageModule {
  id: string;
  type: "events" | "speakers" | "tickets" | "text" | "image" | "form";
  title: string;
  content: any;
  order: number;
}

interface Page {
  id: string;
  name: string;
  type: string;
  slug: string;
  modules: PageModule[];
  settings: {
    title: string;
    description: string;
    customFields?: any[];
  };
}

const moduleTypes = [
  {
    value: "events",
    label: "Events List",
    description: "Display upcoming events",
  },
  { value: "speakers", label: "Speakers", description: "Show event speakers" },
  {
    value: "tickets",
    label: "Tickets",
    description: "Ticket purchasing options",
  },
  { value: "text", label: "Text Block", description: "Rich text content" },
  { value: "image", label: "Image", description: "Image with caption" },
  { value: "form", label: "Form", description: "Custom form fields" },
];

export default function PageBuilder() {
  const searchParams = useSearchParams();
  const pageType = searchParams.get("type") || "custom";
  const pageId = searchParams.get("id");

  const [page, setPage] = useState<Page>({
    id: pageId || Date.now().toString(),
    name: "",
    type: pageType,
    slug: "",
    modules: [],
    settings: {
      title: "",
      description: "",
    },
  });

  const [draggedModule, setDraggedModule] = useState<string | null>(null);

  useEffect(() => {
    if (pageId) {
      // Load existing page
      const pages = JSON.parse(localStorage.getItem("pages") || "[]");
      const existingPage = pages.find((p: Page) => p.id === pageId);
      if (existingPage) {
        setPage(existingPage);
      }
    } else {
      // Set default based on page type
      const defaultSettings = getDefaultPageSettings(pageType);
      setPage((prev) => ({
        ...prev,
        ...defaultSettings,
      }));
    }
  }, [pageId, pageType]);

  const getDefaultPageSettings = (type: string) => {
    switch (type) {
      case "registration":
        return {
          name: "Registration Page",
          slug: "register",
          settings: {
            title: "Event Registration",
            description: "Register for our upcoming event",
            customFields: [
              {
                name: "full_name",
                label: "Full Name",
                type: "text",
                required: true,
              },
              { name: "email", label: "Email", type: "email", required: true },
            ],
          },
        };
      case "login":
        return {
          name: "Login Page",
          slug: "login",
          settings: {
            title: "Login",
            description: "Access your account",
          },
        };
      case "contact":
        return {
          name: "Contact Us",
          slug: "contact",
          settings: {
            title: "Contact Us",
            description: "Get in touch with us",
          },
        };
      default:
        return {
          name: "New Page",
          slug: "new-page",
          settings: {
            title: "New Page",
            description: "Page description",
          },
        };
    }
  };

  const addModule = (moduleType: string) => {
    const newModule: PageModule = {
      id: Date.now().toString(),
      type: moduleType as any,
      title: `New ${moduleType} Module`,
      content: getDefaultModuleContent(moduleType),
      order: page.modules.length,
    };

    setPage((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };

  const getDefaultModuleContent = (type: string) => {
    switch (type) {
      case "text":
        return { text: "Enter your text content here..." };
      case "image":
        return {
          src: "/placeholder.svg?height=300&width=600",
          alt: "Image",
          caption: "",
        };
      case "form":
        return { fields: [] };
      default:
        return {};
    }
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
  };

  const savePage = () => {
    const pages = JSON.parse(localStorage.getItem("pages") || "[]");
    const existingIndex = pages.findIndex((p: Page) => p.id === page.id);

    if (existingIndex >= 0) {
      pages[existingIndex] = page;
    } else {
      pages.push(page);
    }

    localStorage.setItem("pages", JSON.stringify(pages));
    alert("Page saved successfully!");
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

    setPage((prev) => ({ ...prev, modules: newModules }));
    setDraggedModule(null);
  };

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
                <h1 className="text-2xl font-bold">Page Builder</h1>
                <Badge variant="secondary">{pageType} page</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={savePage} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Page
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Page Settings & Modules */}
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
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter page name"
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
                    value={page.settings.title}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, title: e.target.value },
                      }))
                    }
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <Label htmlFor="page-description">Description</Label>
                  <Textarea
                    id="page-description"
                    value={page.settings.description}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          description: e.target.value,
                        },
                      }))
                    }
                    placeholder="Page description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {moduleTypes.map((moduleType) => (
                    <Button
                      key={moduleType.value}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => addModule(moduleType.value)}
                    >
                      <div>
                        <div className="font-medium">{moduleType.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {moduleType.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Page Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {page.modules.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>
                        No modules added yet. Use the sidebar to add content
                        modules.
                      </p>
                    </div>
                  ) : (
                    page.modules.map((module) => (
                      <div
                        key={module.id}
                        className="border rounded-lg p-4 bg-white relative group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, module.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, module.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <Badge variant="outline">{module.type}</Badge>
                            <span className="font-medium">{module.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModule(module.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <ModuleEditor
                          module={module}
                          onUpdate={(updates) =>
                            updateModule(module.id, updates)
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleEditor({
  module,
  onUpdate,
}: {
  module: PageModule;
  onUpdate: (updates: Partial<PageModule>) => void;
}) {
  switch (module.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={module.content.text || ""}
            onChange={(e) =>
              onUpdate({ content: { ...module.content, text: e.target.value } })
            }
            placeholder="Enter text content..."
            rows={4}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={module.content.src || ""}
            onChange={(e) =>
              onUpdate({ content: { ...module.content, src: e.target.value } })
            }
            placeholder="Image URL"
          />
          <Label>Alt Text</Label>
          <Input
            value={module.content.alt || ""}
            onChange={(e) =>
              onUpdate({ content: { ...module.content, alt: e.target.value } })
            }
            placeholder="Alt text"
          />
          <Label>Caption</Label>
          <Input
            value={module.content.caption || ""}
            onChange={(e) =>
              onUpdate({
                content: { ...module.content, caption: e.target.value },
              })
            }
            placeholder="Image caption"
          />
        </div>
      );

    case "events":
      return (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">
            This module will display your events list. Configure events in the
            Events section.
          </p>
        </div>
      );

    case "speakers":
      return (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">
            This module will display your speakers. Configure speakers in the
            Speakers section.
          </p>
        </div>
      );

    case "tickets":
      return (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">
            This module will display ticket options. Configure tickets in the
            Tickets section.
          </p>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-muted-foreground">
            Module configuration will appear here.
          </p>
        </div>
      );
  }
}
