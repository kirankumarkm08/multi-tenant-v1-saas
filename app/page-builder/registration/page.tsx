"use client";

import { useState, useEffect } from "react";
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
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";
import Link from "next/link";
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
}

interface RegistrationPage {
  id: string;
  title: string;
  slug: string;
  // position: number;
  page_type: string;
  form_config: FormField[];
  settings: PageSettings;
}

const defaultFields: FormField[] = [
  {
    id: "1",
    name: "first_name",
    label: "First Name",
    type: "text",
    required: true,
    placeholder: "Enter your first name",
    order: 0,
  },
  {
    id: "2",
    name: "last_name",
    label: "Last Name",
    type: "text",
    required: true,
    placeholder: "Enter your last name",
    order: 1,
  },
  {
    id: "3",
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "Enter your email address",
    order: 2,
  },
  {
    id: "4",
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter your password",
    order: 3,
  },
  {
    id: "5",
    name: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    placeholder: "Enter your phone number",
    order: 4,
  },
];

export default function RegistrationPageBuilder() {
  const { token, isInitialized } = useAuth();

  const [page, setPage] = useState<RegistrationPage>({
    id: "",
    title: "Event Registration",
    slug: "",
    // position: "",
    page_type: "register",
    form_config: defaultFields, // <-- fix: use array
    settings: {
      submitButtonText: "Register Now",
      successMessage: "Thank you for registering! We will contact you soon.",
      redirectUrl: "",
    },
  });

  console.log(
    "Registration Page Builder - Token:",
    token ? "Present" : "Missing"
  );
  console.log("Registration Page Builder - Is Initialized:", isInitialized);
  console.log(
    "Registration Page Builder - localStorage token:",
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
        ? "Present"
        : "Missing"
      : "Server-side"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      console.log("Registration Page Builder - Auth not initialized yet");
      return;
    }

    if (!token) {
      console.log("Registration Page Builder - No token available");
      return;
    }

    console.log(
      "Registration Page Builder - Token available, checking for page ID"
    );
    const pageId = new URLSearchParams(window.location.search).get("id");
    if (pageId) {
      console.log("Registration Page Builder - Loading page with ID:", pageId);
      loadPage(pageId);
    } else {
      console.log("Registration Page Builder - No page ID, using default page");
    }
  }, [token, isInitialized]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const formConfigRaw =
        typeof data.form_config === "string"
          ? JSON.parse(data.form_config)
          : data.form_config;
      const formConfig: FormField[] = Array.isArray(formConfigRaw)
        ? formConfigRaw
        : [];
  
      const settingsParsed =
        typeof data.settings === "string"
          ? JSON.parse(data.settings)
          : data.settings;
  
      setPage({
        ...data,
        form_config: formConfig,
        settings: settingsParsed || {
          submitButtonText: "Register Now",
          successMessage: "Thank you for registering! We will contact you soon.",
          redirectUrl: "",
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data");
    }
  };
  
  
  // const savePage = async () => {
  //   setIsSaving(true);
  //   try {
  //     const requestData = {
  //       title: page.title,
  //       slug: page.slug || null,
  //       page_type: page.page_type,
  //       form_config: JSON.stringify(page.form_config),
  //       settings: JSON.stringify(page.settings),
  //     };
  
  //     const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
  //     const method = page.id ? "PUT" : "POST";
  
  //     console.log("📤 Saving page:", { endpoint, method, requestData });
  
  //     const savedPage = await apiFetch(endpoint, {
  //       method,
  //       body: JSON.stringify(requestData),
  //     });
  
  //     if (!page.id) {
  //       setPage((prev) => ({ ...prev, id: savedPage.id }));
  //       window.history.pushState({}, "", `?id=${savedPage.id}`);
  //     }
  
  //     alert("Page saved successfully!");
  //   } catch (error: any) {
  //     console.error("Full error details:", error?.data || error);
  //     if (error?.data?.errors) {
  //       const errorMessages = Object.values(error.data.errors).flat().join("\n");
  //       alert(`Validation failed:\n${errorMessages}`);
  //     } else {
  //       alert(error.message || "Failed to save page");
  //     }
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value",
      order: page.form_config.length,
    };

    setPage((prev) => ({
      ...prev,
      form_config: [...prev.form_config, newField],
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setPage((prev) => ({
      ...prev,
      form_config: prev.form_config.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const deleteField = (fieldId: string) => {
    const field = page.form_config.find((f) => f.id === fieldId);
    if (
      field &&
      ["first_name", "last_name", "email", "password", "phone"].includes(
        field.name
      )
    ) {
      alert("Cannot delete required default fields");
      return;
    }

    setPage((prev) => ({
      ...prev,
      form_config: prev.form_config.filter((field) => field.id !== fieldId),
    }));
  };

  

  const savePage = async () => {
    setIsSaving(true);
    try {
      const requestData = {
        title: page.title,
        slug: page.slug || null,
        page_type: page.page_type,
        form_config: JSON.stringify(page.form_config), // Laravel expects string
        settings: JSON.stringify(page.settings),
      };
  
      const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
      const method = page.id ? "PUT" : "POST";
  
      console.log("📤 Saving page:", { endpoint, method, requestData });
  
      const savedPage = await apiFetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      if (!page.id) {
        setPage((prev) => ({ ...prev, id: savedPage.id }));
        window.history.pushState({}, "", `?id=${savedPage.id}`);
      }
  
      alert("Page saved successfully!");
    } catch (error: any) {
      console.error("Full error details:", error?.data || error);
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
    if (!draggedField || draggedField === targetFieldId) return;

    const draggedIndex = page.form_config.findIndex(
      (f) => f.id === draggedField
    );
    const targetIndex = page.form_config.findIndex(
      (f) => f.id === targetFieldId
    );

    const newFields = [...page.form_config];
    const [draggedItem] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedItem);

    // Update order
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setPage((prev) => ({ ...prev, form_config: updatedFields }));
    setDraggedField(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Registration Page Builder</h1>
              <Badge variant="secondary">Registration Form</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/preview/registration/${page.id}`}>
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-title">Page Title *</Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Event Registration"
                  />
                </div>
                <div>
                  <Label htmlFor="page-slug">Page Slug</Label>
                  <Input
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="event-registration"
                  />
                </div>
                <div>
                  <Label htmlFor="form-type">Form Type</Label>
                  <Select
                    value={page.page_type}
                    onValueChange={(value) =>
                      setPage((prev) => ({ ...prev, page_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="register">Registration</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="contact_us">Contact Us</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="submit-text">Submit Button Text</Label>
                  <Input
                    id="submit-text"
                    value={page.settings.submitButtonText}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          submitButtonText: e.target.value,
                        },
                      }))
                    }
                    placeholder="Register Now"
                  />
                </div>
                <div>
                  <Label htmlFor="success-message">Success Message</Label>
                  <Input
                    id="success-message"
                    value={page.settings.successMessage}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          successMessage: e.target.value,
                        },
                      }))
                    }
                    placeholder="Thank you for registering!"
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
                <CardTitle>Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(page.form_config || [])
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="border rounded-lg p-4 bg-white relative group hover:shadow-md transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, field.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
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
                            <Label>Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateField(field.id, { label: e.target.value })
                              }
                              placeholder="Field label"
                            />
                          </div>
                          <div>
                            <Label>Field Name</Label>
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
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value) =>
                                updateField(field.id, { type: value as any })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="tel">Phone</SelectItem>
                                <SelectItem value="password">
                                  Password
                                </SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="textarea">
                                  Textarea
                                </SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="checkbox">
                                  Checkbox
                                </SelectItem>
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
                                updateField(field.id, {
                                  required: e.target.checked,
                                })
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
                            <Label htmlFor={`required-${field.id}`}>
                              Required
                            </Label>
                          </div>
                        </div>

                        <div>
                          <Label>Placeholder</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Enter placeholder text"
                          />
                        </div>

                        {(field.type === "select" ||
                          field.type === "radio") && (
                          <div className="mt-4">
                            <Label>Options (comma-separated)</Label>
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
                            />
                          </div>
                        )}

                        {/* Field Preview */}
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <Label className="text-sm font-medium">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          {field.type === "textarea" ? (
                            <textarea
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                              placeholder={field.placeholder}
                              disabled
                              rows={3}
                            />
                          ) : field.type === "select" ? (
                            <select
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                              disabled
                            >
                              <option>
                                {field.placeholder || "Select an option"}
                              </option>
                              {field.options?.map((option, index) => (
                                <option key={index}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === "checkbox" ? (
                            <div className="mt-1 flex items-center space-x-2">
                              <input
                                type="checkbox"
                                disabled
                                className="h-4 w-4"
                              />
                              <span className="text-sm">
                                {field.placeholder || field.label}
                              </span>
                            </div>
                          ) : field.type === "radio" ? (
                            <div className="mt-1 space-y-2">
                              {field.options?.map((option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="radio"
                                    name={field.name}
                                    disabled
                                    className="h-4 w-4"
                                  />
                                  <span className="text-sm">{option}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
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
  );
}
