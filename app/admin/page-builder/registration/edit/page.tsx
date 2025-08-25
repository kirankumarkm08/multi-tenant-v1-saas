"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";

interface FormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "password";
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

interface PageSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl?: string;
  show_in_nav: boolean;
}

interface RegistrationPage {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  form_config: FormField[];
  settings: PageSettings;
  status: "draft" | "published" | "archived";
}

export default function EditRegistrationPage() {
  const { token, isInitialized } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get("id");

  const [page, setPage] = useState<RegistrationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (!pageId) {
      alert("No page ID provided");
      router.push("/admin/page-builder/registration");
      return;
    }

    loadPage(pageId);
  }, [token, isInitialized, pageId, router]);

  const loadPage = async (id: string) => {
    try {
      setLoading(true);
      console.log("Loading page with ID:", id);
      console.log("Token available:", !!token);
      
      const data = await apiFetch(`/tenant/pages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Page data received:", data);

      const formConfigRaw =
        typeof data.form_config === "string"
          ? JSON.parse(data.form_config)
          : data.form_config;
      
      // Handle both direct array and nested fields structure
      const formConfig: FormField[] = Array.isArray(formConfigRaw) 
        ? formConfigRaw 
        : Array.isArray(formConfigRaw?.fields) 
          ? formConfigRaw.fields 
          : [];

      const settingsParsed =
        typeof data.settings === "string" ? JSON.parse(data.settings) : data.settings;

      setPage({
        ...data,
        form_config: formConfig,
        settings: {
          submitButtonText: settingsParsed?.submitButtonText || "Register Now",
          successMessage: settingsParsed?.successMessage || "Thank you for registering!",
          redirectUrl: settingsParsed?.redirectUrl || "",
          show_in_nav: settingsParsed?.show_in_nav ?? false,
        },
        status: data.status || "draft",
      });
    } catch (error: any) {
      console.error("Failed to load page:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        data: error.data
      });
      
      if (error.status === 404) {
        alert(`Page with ID ${id} not found`);
      } else if (error.status === 401) {
        alert("Authentication failed. Please login again.");
        router.push("/login");
        return;
      } else {
        alert(`Failed to load page: ${error.message || "Unknown error"}`);
      }
      router.push("/admin/page-builder/registration");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (!page) return;
    
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value",
      order: page.form_config.length,
    };

    setPage({
      ...page,
      form_config: [...page.form_config, newField],
    });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!page) return;
    
    setPage({
      ...page,
      form_config: page.form_config.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const deleteField = (fieldId: string) => {
    if (!page) return;
    
    const field = page.form_config.find((f) => f.id === fieldId);
    if (
      field &&
      ["first_name", "last_name", "email", "password", "phone"].includes(field.name)
    ) {
      alert("Cannot delete required default fields");
      return;
    }

    setPage({
      ...page,
      form_config: page.form_config.filter((field) => field.id !== fieldId),
    });
  };

  const savePage = async () => {
    if (!page) return;
    
    setIsSaving(true);
    try {
      const requestData = {
        title: page.title,
        slug: page.slug || null,
        page_type: page.page_type,
        form_config: JSON.stringify({ fields: page.form_config }),
        settings: JSON.stringify(page.settings),
        status: page.status || "draft",
      };

      console.log("Saving page with PATCH method:", requestData);

      const response = await apiFetch(`/tenant/pages/${page.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Page saved successfully:", response);
      alert("Page updated successfully!");
    } catch (error: any) {
      console.error("Save error:", error);
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert(error.message || "Failed to save page");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetFieldId || !page) return;

    const draggedIndex = page.form_config.findIndex((f) => f.id === draggedField);
    const targetIndex = page.form_config.findIndex((f) => f.id === targetFieldId);

    const newFields = [...page.form_config];
    const [draggedItem] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedItem);

    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setPage({ ...page, form_config: updatedFields });
    setDraggedField(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading page...</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Page not found</h2>
          <Button onClick={() => router.push("/admin/page-builder/registration")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Registration Pages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/admin/page-builder/registration")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Registration Page
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                  ID: {page.id}
                </Badge>
                <Badge
                  variant={
                    page.status === "published"
                      ? "default"
                      : page.status === "archived"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={savePage} size="sm" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-title" className="dark:text-gray-200">
                    Page Title *
                  </Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    placeholder="Event Registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="page-slug" className="dark:text-gray-200">
                    Page Slug
                  </Label>
                  <Input
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) => setPage({ ...page, slug: e.target.value })}
                    placeholder="event-registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="page-status" className="dark:text-gray-200">
                    Status
                  </Label>
                  <Select
                    value={page.status}
                    onValueChange={(value: "draft" | "published" | "archived") =>
                      setPage({ ...page, status: value })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="submit-text" className="dark:text-gray-200">
                    Submit Button Text
                  </Label>
                  <Input
                    id="submit-text"
                    value={page.settings.submitButtonText}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        settings: { ...page.settings, submitButtonText: e.target.value },
                      })
                    }
                    placeholder="Register Now"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="success-message" className="dark:text-gray-200">
                    Success Message
                  </Label>
                  <Input
                    id="success-message"
                    value={page.settings.successMessage}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        settings: { ...page.settings, successMessage: e.target.value },
                      })
                    }
                    placeholder="Thank you for registering!"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="pt-4">
                  <Label className="dark:text-gray-200 mb-2 block">Show in Navigation</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={page.settings.show_in_nav ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage({
                        ...page,
                        settings: { ...page.settings, show_in_nav: true },
                      })}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={!page.settings.show_in_nav ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage({
                        ...page,
                        settings: { ...page.settings, show_in_nav: false },
                      })}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Add New Field</CardTitle>
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Form Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {page.form_config
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative group hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, field.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          {![
                            "first_name",
                            "last_name",
                            "email",
                            "password",
                            "phone",
                          ].includes(field.name) && (
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
                            <Label className="dark:text-gray-200">Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, { label: e.target.value })
                              }
                              placeholder="Field label"
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <Label className="dark:text-gray-200">Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) =>
                                updateField(field.id, { name: e.target.value })
                              }
                              placeholder="field_name"
                              disabled={[
                                "first_name",
                                "last_name",
                                "email",
                                "password",
                                "phone",
                              ].includes(field.name)}
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="dark:text-gray-200">Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(field.id, { type: value as any })
                              }
                            >
                              <SelectTrigger className="dark:bg-gray-600 dark:border-gray-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Phone</SelectItem>
                                <SelectItem value="password">Password</SelectItem>
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
                              onChange={(e) =>
                                updateField(field.id, { required: e.target.checked })
                              }
                              disabled={[
                                "first_name",
                                "last_name",
                                "email",
                                "password",
                                "phone",
                              ].includes(field.name)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`required-${field.id}`} className="dark:text-gray-200">
                              Required
                            </Label>
                          </div>
                        </div>

                        <div>
                          <Label className="dark:text-gray-200">Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateField(field.id, { placeholder: e.target.value })
                            }
                            placeholder="Enter placeholder text"
                            className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>

                        {(field.type === "select" || field.type === "radio") && (
                          <div className="mt-4">
                            <Label className="dark:text-gray-200">Options (comma-separated)</Label>
                            <Input
                              value={field.options?.join(", ") || ""}
                              onChange={(e) =>
                                updateField(field.id, {
                                  options: e.target.value
                                    .split(",")
                                    .map((o) => o.trim())
                                    .filter((o) => o),
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
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
  );
}