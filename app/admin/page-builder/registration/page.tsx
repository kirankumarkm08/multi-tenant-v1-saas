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
  Plus,
  Trash2,
  GripVertical,
  Loader2,
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
  show_in_nav: boolean; // Add show_in_nav here at page level
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
    page_type: "register",
    form_config: defaultFields,
    settings: {
      submitButtonText: "Register Now",
      successMessage: "Thank you for registering! We will contact you soon.",
      redirectUrl: "",
      show_in_nav: false, // default value
    },
    status: "draft",
  });

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

    console.log("Registration Page Builder - Token available, checking for page ID");
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

      console.log("Loaded page data:", data);

      // Parse form_config if it's a string
      let formConfigRaw = data.form_config;
      if (typeof formConfigRaw === "string") {
        try {
          formConfigRaw = JSON.parse(formConfigRaw);
        } catch (e) {
          console.error("Failed to parse form_config:", e);
          formConfigRaw = { fields: [] };
        }
      }

      // Extract fields array from the parsed config
      let formConfig: FormField[] = [];
      if (Array.isArray(formConfigRaw)) {
        formConfig = formConfigRaw;
      } else if (formConfigRaw && Array.isArray(formConfigRaw.fields)) {
        formConfig = formConfigRaw.fields;
      } else {
        console.warn("Unexpected form_config structure, using default fields");
        formConfig = defaultFields;
      }

      // Parse settings if it's a string
      let settingsParsed = data.settings;
      if (typeof settingsParsed === "string") {
        try {
          settingsParsed = JSON.parse(settingsParsed);
        } catch (e) {
          console.error("Failed to parse settings:", e);
          settingsParsed = {};
        }
      }

      setPage({
        ...data,
        form_config: formConfig,
        settings: {
          submitButtonText: settingsParsed?.submitButtonText || "Register Now",
          successMessage: settingsParsed?.successMessage || "Thank you for registering! We will contact you soon.",
          redirectUrl: settingsParsed?.redirectUrl || "",
          show_in_nav: settingsParsed?.show_in_nav ?? false,
        },
        status: data.status || "draft",
      });

      console.log("Page state updated successfully");
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data");
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `company_${Date.now()}`,
      label: "Company",
      type: "text",
      required: false,
      placeholder: "Enter your company",
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
      ["first_name", "last_name", "email", "password", "phone"].includes(field.name)
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
    // Validate required fields
    if (!page.title || page.title.trim() === "") {
      alert("Page title is required");
      return;
    }

    if (!page.form_config || page.form_config.length === 0) {
      alert("At least one form field is required");
      return;
    }

    setIsSaving(true);
    try {
      // Ensure form_config has proper structure
      const formConfigToSave = {
        fields: page.form_config.map((field, index) => ({
          ...field,
          order: field.order !== undefined ? field.order : index,
        })),
      };

      const requestData = {
        title: page.title.trim(),
        slug: page.slug?.trim() || null,
        page_type: page.page_type,
        form_config: JSON.stringify(formConfigToSave),
        settings: JSON.stringify(page.settings),
        status: page.status || "draft",
      };

      const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
      const method = page.id ? "PATCH" : "POST";

      console.log(`Saving page with ${method} method to ${endpoint}:`, requestData);

      const savedPage = await apiFetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!page.id && savedPage.id) {
        // Update state with new ID and update URL for future saves
        setPage((prev) => ({ ...prev, id: savedPage.id }));
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("id", savedPage.id);
        window.history.replaceState({}, "", newUrl.toString());
      }

      console.log("Page saved successfully:", savedPage);
      alert(page.id ? "Page updated successfully!" : "Page created successfully!");
      
      // If it was a new page, reload the page data to ensure consistency
      if (!page.id && savedPage.id) {
        await loadPage(savedPage.id);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else if (error?.data?.message) {
        alert(`Error: ${error.data.message}`);
      } else {
        alert(error.message || "Failed to save page. Please check the console for details.");
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

    const draggedIndex = page.form_config.findIndex((f) => f.id === draggedField);
    const targetIndex = page.form_config.findIndex((f) => f.id === targetFieldId);

    const newFields = [...page.form_config];
    const [draggedItem] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedItem);

    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setPage((prev) => ({ ...prev, form_config: updatedFields }));
    setDraggedField(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Registration Page Builder
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                  Registration Form
                </Badge>
                <Badge
                  variant={
                    page.status === "published"
                      ? "default"
                      : page.status === "archived"
                      ? "destructive"
                      : "outline"
                  }
                  className={
                    page.status === "published"
                      ? ""
                      : page.status === "archived"
                      ? ""
                      : "dark:border-gray-600 dark:text-gray-200"
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
                    onChange={(e) => setPage((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Event Registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="page-slug" className="dark:text-gray-200">
                    Page Slug
                  </Label>
                  <Input
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) => setPage((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="event-registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="form-type" className="dark:text-gray-200">
                    Form Type
                  </Label>
                  <Badge>{page.page_type}</Badge>
                </div>

                <div>
                  <Label htmlFor="page-status" className="dark:text-gray-200">
                    Status
                  </Label>
                  <Select
                    value={page.status}
                    onValueChange={(value: "draft" | "published" | "archived") =>
                      setPage((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger id="page-status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="draft" className="dark:text-gray-200 dark:focus:bg-gray-700">
                        Draft
                      </SelectItem>
                      <SelectItem value="published" className="dark:text-gray-200 dark:focus:bg-gray-700">
                        Published
                      </SelectItem>
                      <SelectItem value="archived" className="dark:text-gray-200 dark:focus:bg-gray-700">
                        Archived
                      </SelectItem>
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
                      setPage((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, submitButtonText: e.target.value },
                      }))
                    }
                    placeholder="Register Now"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                      setPage((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, successMessage: e.target.value },
                      }))
                    }
                    placeholder="Thank you for registering!"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                {/* NEW show_in_nav toggle button group */}
                <div className="pt-4">
                  <Label className="dark:text-gray-200 mb-2 block">Show in Nav:</Label>
                  <Button
                    variant={page.settings.show_in_nav ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, show_in_nav: true },
                    }))}
                    className="mr-2"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!page.settings.show_in_nav ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, show_in_nav: false },
                    }))}
                  >
                    No
                  </Button>
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
                <CardTitle className="dark:text-white">Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(page.form_config || [])
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 dark:bg-gray-750 relative group hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow"
                        draggable
                        onDragStart={(e) => handleDragStart(e, field.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field.id)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-move" />
                            <Badge
                              variant="outline"
                              className="dark:border-gray-600 dark:text-gray-300"
                            >
                              {field.type}
                            </Badge>
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-gray-600"
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
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
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
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400 disabled:dark:bg-gray-700 disabled:dark:text-gray-500"
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
                              <SelectTrigger className="dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                                <SelectItem
                                  value="text"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Text
                                </SelectItem>
                                <SelectItem
                                  value="email"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Email
                                </SelectItem>
                                <SelectItem
                                  value="tel"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Phone
                                </SelectItem>
                                <SelectItem
                                  value="password"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Password
                                </SelectItem>
                                <SelectItem
                                  value="number"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Number
                                </SelectItem>
                                <SelectItem
                                  value="textarea"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Textarea
                                </SelectItem>
                                <SelectItem
                                  value="select"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Select
                                </SelectItem>
                                <SelectItem
                                  value="checkbox"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Checkbox
                                </SelectItem>
                                <SelectItem
                                  value="radio"
                                  className="dark:text-white dark:hover:bg-gray-600"
                                >
                                  Radio
                                </SelectItem>
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
                              className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
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
                            className="dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
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
                              className="dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                            />
                          </div>
                        )}

                        {/* Field Preview */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <Label className="text-sm font-medium dark:text-gray-200">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.type === "textarea" ? (
                            <textarea
                              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                              placeholder={field.placeholder}
                              disabled
                              rows={3}
                            />
                          ) : field.type === "select" ? (
                            <select
                              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white"
                              disabled
                            >
                              <option>{field.placeholder || "Select an option"}</option>
                              {field.options?.map((option, index) => (
                                <option key={index}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === "checkbox" ? (
                            <div className="mt-1 flex items-center space-x-2">
                              <input
                                type="checkbox"
                                disabled
                                className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
                              />
                              <span className="text-sm dark:text-gray-300">
                                {field.placeholder || field.label}
                              </span>
                            </div>
                          ) : field.type === "radio" ? (
                            <div className="mt-1 space-y-2">
                              {field.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={field.name}
                                    disabled
                                    className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
                                  />
                                  <span className="text-sm dark:text-gray-300">{option}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={field.type}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                              placeholder={field.placeholder}
                              disabled
                            />
                          )}
                        </div>
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
