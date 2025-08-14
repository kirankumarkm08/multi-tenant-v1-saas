"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Eye, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";

interface ContactPageSettings {
  nameLabel: string;
  emailLabel: string;
  phoneEnabled: boolean;
  phoneLabel: string;
  messageLabel: string;
  submitButtonText: string;
}

interface ContactPage {
  id: string;
  name: string;
  slug?: string;
  title: string;
  description: string;
  settings: ContactPageSettings;
}

export default function ContactPageBuilder() {
  const [page, setPage] = useState<ContactPage>({
    id: "",
    name: "Contact Page",
    slug: "contact",
    title: "Contact Us",
    description:
      "We'd love to hear from you. Fill out the form and we'll respond soon.",
    settings: {
      nameLabel: "Your Name",
      emailLabel: "Email",
      phoneEnabled: true,
      phoneLabel: "Phone",
      messageLabel: "Message",
      submitButtonText: "Send Message",
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availablePages, setAvailablePages] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageId = params.get("id");

      // Load available pages first
      loadAvailablePages();

      if (pageId) {
        loadPage(pageId);
      }
    }
  }, []);

  const loadAvailablePages = async () => {
    try {
      setIsLoadingPages(true);
      let response: any = null;
      try {
        response = await apiFetch("/tenant/pages?type=contact");
      } catch (_e) {}
      if (
        !response ||
        (Array.isArray(response) && response.length === 0) ||
        (response?.data &&
          Array.isArray(response.data) &&
          response.data.length === 0)
      ) {
        try {
          response = await apiFetch("/tenant/pages?form_type=contact");
        } catch (_e2) {}
      }

      let pages: any[] = [];
      if (Array.isArray(response)) {
        pages = response;
      } else if (response?.data && Array.isArray(response.data)) {
        pages = response.data;
      } else if (response && !Array.isArray(response)) {
        pages = [response];
      }

      setAvailablePages(
        pages.map((p: any) => ({
          id: p.id,
          name: p.name || "Unnamed Page",
          slug: p.slug || "contact",
        }))
      );
    } catch (error) {
      console.error("Failed to load available pages:", error);
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handlePageSelect = (pageId: string) => {
    if (pageId === "new") {
      // Create new page
      setPage({
        id: "",
        name: "New Contact Page",
        slug: "contact",
        title: "Contact Us",
        description:
          "We'd love to hear from you. Fill out the form and we'll respond soon.",
        settings: {
          nameLabel: "Your Name",
          emailLabel: "Email",
          phoneEnabled: true,
          phoneLabel: "Phone",
          messageLabel: "Message",
          submitButtonText: "Send Message",
        },
      });
      window.history.pushState({}, "", "?");
    } else {
      loadPage(pageId);
      window.history.pushState({}, "", `?id=${pageId}`);
    }
  };

  const loadPage = async (pageId: string) => {
    try {
      // Fetch the specific page by ID
      const data = await apiFetch(`/tenant/pages/${pageId}`);

      if (!data) {
        throw new Error("Page not found");
      }

      const formConfig =
        typeof data.form_config === "string"
          ? JSON.parse(data.form_config)
          : data.form_config;

      const settings =
        typeof data.settings === "string"
          ? JSON.parse(data.settings)
          : data.settings || {};

      const nameField = formConfig?.find(
        (f: { name?: string }) => f.name === "name"
      );
      const emailField = formConfig?.find(
        (f: { name?: string; type?: string }) => f.name === "email"
      );
      const phoneField = formConfig?.find(
        (f: { name?: string }) => f.name === "phone"
      );
      const messageField = formConfig?.find(
        (f: { name?: string }) => f.name === "message"
      );

      setPage({
        id: data.id,
        name: data.name || "Contact Page",
        slug: data.slug || "contact",
        title: data.title || "Contact Us",
        description: data.description || "",
        settings: {
          nameLabel: nameField?.label || settings?.nameLabel || "Your Name",
          emailLabel: emailField?.label || settings?.emailLabel || "Email",
          phoneEnabled: Boolean(settings?.phoneEnabled ?? Boolean(phoneField)),
          phoneLabel: phoneField?.label || settings?.phoneLabel || "Phone",
          messageLabel:
            messageField?.label || settings?.messageLabel || "Message",
          submitButtonText: settings?.submitButtonText || "Send Message",
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data. Please check if the page exists.");
    }
  };

  const savePage = async () => {
    setIsSaving(true);

    try {
      const baseSlug = (page.slug || "contact").trim() || "contact";

      // Upsert by slug to avoid 422 on duplicates
      let targetId = page.id;
      if (!targetId) {
        try {
          let existingResponse: any = null;
          try {
            existingResponse = await apiFetch("/tenant/pages?type=contact");
          } catch (_e) {}
          if (
            !existingResponse ||
            (Array.isArray(existingResponse) &&
              existingResponse.length === 0) ||
            (existingResponse?.data &&
              Array.isArray(existingResponse.data) &&
              existingResponse.data.length === 0)
          ) {
            try {
              existingResponse = await apiFetch(
                "/tenant/pages?form_type=contact"
              );
            } catch (_e2) {}
          }
          const existingList = Array.isArray(existingResponse)
            ? existingResponse
            : existingResponse?.data || [];
          const match = (existingList || []).find(
            (p: any) => p?.slug === baseSlug
          );
          if (match?.id) {
            targetId = match.id;
          }
        } catch (_ignored) {}
      }

      const form_config: any[] = [
        {
          id: "name",
          name: "name",
          label: page.settings.nameLabel,
          type: "text",
          required: true,
          placeholder: `Enter your ${page.settings.nameLabel.toLowerCase()}`,
          order: 0,
        },
        {
          id: "email",
          name: "email",
          label: page.settings.emailLabel,
          type: "email",
          required: true,
          placeholder: `Enter your ${page.settings.emailLabel.toLowerCase()}`,
          order: 1,
        },
      ];

      if (page.settings.phoneEnabled) {
        form_config.push({
          id: "phone",
          name: "phone",
          label: page.settings.phoneLabel,
          type: "text",
          required: false,
          placeholder: `Enter your ${page.settings.phoneLabel.toLowerCase()}`,
          order: 2,
        });
      }

      form_config.push({
        id: "message",
        name: "message",
        label: page.settings.messageLabel,
        type: "textarea",
        required: true,
        placeholder: `Enter your ${page.settings.messageLabel.toLowerCase()}`,
        order: 3,
      });

      const buildRequestData = (slug: string) => ({
        title: page.title,
        name: page.name,
        slug,
        form_type: "contact",
        type: "contact",
        form_config: JSON.stringify(form_config),
        description: page.description || "",
        settings: JSON.stringify({
          nameLabel: page.settings.nameLabel,
          emailLabel: page.settings.emailLabel,
          phoneEnabled: page.settings.phoneEnabled,
          phoneLabel: page.settings.phoneLabel,
          messageLabel: page.settings.messageLabel,
          submitButtonText: page.settings.submitButtonText,
        }),
      });

      const endpoint = targetId ? `/tenant/pages/${targetId}` : `/tenant/pages`;
      const method = targetId ? "PATCH" : "POST";

      const saved = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(buildRequestData(baseSlug)),
      });

      if (saved?.id) {
        setPage((prev) => ({ ...prev, id: saved.id }));
        window.history.pushState({}, "", `?id=${saved.id}`);
      }

      alert("Contact page saved successfully!");
    } catch (error: any) {
      console.error("Failed to save page:", error);
      const message =
        error?.data?.message || error?.message || "Failed to save page";
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const deletePage = async () => {
    if (!page.id) return;
    if (!confirm("Are you sure you want to delete this page?")) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, { method: "DELETE" });
      alert("Contact page deleted");
      setPage((prev) => ({ ...prev, id: "" }));
      window.history.pushState({}, "", `?`);
      // Refresh list
      loadAvailablePages();
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Failed to delete page");
    } finally {
      setIsDeleting(false);
    }
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
                <h1 className="text-2xl font-bold">Contact Page Builder</h1>
                <Badge variant="secondary">Contact Form</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Page Selector */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="page-select" className="text-sm font-medium">
                  Select Page:
                </Label>
                <select
                  id="page-select"
                  value={page.id || "new"}
                  onChange={(e) => handlePageSelect(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingPages}
                >
                  <option value="new">+ Create New Page</option>
                  {availablePages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              {page.id && (
                <Link href={`/preview/contact/${page.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </Link>
              )}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
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
                    placeholder="Contact Page"
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
                    placeholder="contact"
                  />
                </div>
                <div>
                  <Label htmlFor="page-title">Title</Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Contact Us"
                  />
                </div>
                <div>
                  <Label htmlFor="page-desc">Description</Label>
                  <Input
                    id="page-desc"
                    value={page.description}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="We'd love to hear from you. Fill out the form and we'll respond soon."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name-label">Name Label</Label>
                  <Input
                    id="name-label"
                    value={page.settings.nameLabel}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          nameLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <Label htmlFor="email-label">Email Label</Label>
                  <Input
                    id="email-label"
                    value={page.settings.emailLabel}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          emailLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone-enabled"
                      checked={page.settings.phoneEnabled}
                      onCheckedChange={(checked) =>
                        setPage((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            phoneEnabled: Boolean(checked),
                          },
                        }))
                      }
                    />
                    <Label htmlFor="phone-enabled" className="text-sm">
                      Include Phone Field
                    </Label>
                  </div>
                  {page.settings.phoneEnabled && (
                    <div>
                      <Label htmlFor="phone-label">Phone Label</Label>
                      <Input
                        id="phone-label"
                        value={page.settings.phoneLabel}
                        onChange={(e) =>
                          setPage((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              phoneLabel: e.target.value,
                            },
                          }))
                        }
                        placeholder="Phone"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="message-label">Message Label</Label>
                  <Input
                    id="message-label"
                    value={page.settings.messageLabel}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          messageLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Message"
                  />
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
                    placeholder="Send Message"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Form Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div>
                    <Label>{page.settings.nameLabel}</Label>
                    <Input placeholder={page.settings.nameLabel} />
                  </div>
                  <div>
                    <Label>{page.settings.emailLabel}</Label>
                    <Input
                      type="email"
                      placeholder={page.settings.emailLabel}
                    />
                  </div>
                  {page.settings.phoneEnabled && (
                    <div>
                      <Label>{page.settings.phoneLabel}</Label>
                      <Input placeholder={page.settings.phoneLabel} />
                    </div>
                  )}
                  <div>
                    <Label>{page.settings.messageLabel}</Label>
                    <Textarea placeholder={page.settings.messageLabel} />
                  </div>
                  <Button type="button" className="w-full" disabled>
                    {page.settings.submitButtonText}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
