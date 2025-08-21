"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Eye, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

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
  slug: string;
  title: string;
  description: string;
  settings: ContactPageSettings;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const sanitizeSlug = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const placeholder = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("name")) return "Enter your name";
  if (l.includes("email")) return "Enter your email";
  if (l.includes("phone")) return "Enter your phone";
  if (l.includes("message")) return "Enter your message";
  return `Enter your ${l.replace(/^your\s+/, "")}`;
};

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ContactPageBuilder() {
  /* ------------------ state ------------------ */
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

  const [availablePages, setAvailablePages] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  /* ------------------ effects ------------------ */
  useEffect(() => {
    loadAvailablePages();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) loadPage(id);
  }, []);

  /* ------------------ api ------------------ */
  const loadAvailablePages = async () => {
    try {
      setIsLoadingPages(true);
      const res = await apiFetch("/tenant/pages?page_type=contact_us");
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setAvailablePages(
        list.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
        }))
      );
    } finally {
      setIsLoadingPages(false);
    }
  };

  const loadPage = async (id: string) => {
    const data = await apiFetch(`/tenant/pages/${id}`);
    const cfg =
      typeof data.form_config === "string"
        ? JSON.parse(data.form_config)
        : data.form_config;

    const settings =
      typeof data.settings === "string"
        ? JSON.parse(data.settings)
        : data.settings;

    setPage({
      id: data.id,
      name: data.name,
      slug: data.slug,
      title: data.title,
      description: data.description,
      settings: {
        nameLabel: cfg.find((f: any) => f.id === "name")?.label ?? "Your Name",
        emailLabel:
          cfg.find((f: any) => f.id === "email")?.label ?? "Email",
        phoneEnabled:
          settings?.phoneEnabled ??
          Boolean(cfg.find((f: any) => f.id === "phone")),
        phoneLabel:
          cfg.find((f: any) => f.id === "phone")?.label ?? "Phone",
        messageLabel:
          cfg.find((f: any) => f.id === "message")?.label ?? "Message",
        submitButtonText: settings?.submitButtonText ?? "Send Message",
      },
    });
  };

  /* ------------------ save ------------------ */
  const savePage = async () => {
    setIsSaving(true);
    setErrors([]);

    const slug = sanitizeSlug(page.slug || page.name);
    const validation: string[] = [];
    if (!page.name.trim()) validation.push("Page name is required");
    if (!page.title.trim()) validation.push("Page title is required");
    if (!page.settings.nameLabel.trim())
      validation.push("Name label is required");
    if (!page.settings.emailLabel.trim())
      validation.push("Email label is required");
    if (validation.length) {
      setErrors(validation);
      setIsSaving(false);
      return;
    }

    const form_config: any[] = [
      {
        id: "name",
        name: "name",
        label: page.settings.nameLabel.trim(),
        type: "text",
        required: true,
        placeholder: placeholder(page.settings.nameLabel),
        order: 0,
      },
      {
        id: "email",
        name: "email",
        label: page.settings.emailLabel.trim(),
        type: "email",
        required: true,
        placeholder: placeholder(page.settings.emailLabel),
        order: 1,
      },
    ];

    if (page.settings.phoneEnabled) {
      form_config.push({
        id: "phone",
        name: "phone",
        label: page.settings.phoneLabel.trim(),
        type: "text",
        required: false,
        placeholder: placeholder(page.settings.phoneLabel),
        order: 2,
      });
    }

    form_config.push({
      id: "message",
      name: "message",
      label: page.settings.messageLabel.trim(),
      type: "textarea",
      required: true,
      placeholder: placeholder(page.settings.messageLabel),
      order: page.settings.phoneEnabled ? 3 : 2,
    });

    const body = {
      title: page.title.trim(),
      name: page.name.trim(),
      slug,
      page_type: "contact_us",
      form_config: JSON.stringify(form_config),
      description: page.description.trim(),
      settings: JSON.stringify({
        nameLabel: page.settings.nameLabel.trim(),
        emailLabel: page.settings.emailLabel.trim(),
        phoneEnabled: page.settings.phoneEnabled,
        phoneLabel: page.settings.phoneLabel.trim(),
        messageLabel: page.settings.messageLabel.trim(),
        submitButtonText: page.settings.submitButtonText.trim(),
      }),
    };

    const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
    const method = page.id ? "PATCH" : "POST";

    try {
      const saved = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (saved?.id) {
        setPage((prev) => ({ ...prev, id: saved.id, slug }));
        window.history.pushState({}, "", `?id=${saved.id}`);
        loadAvailablePages();
        alert("Contact page saved");
      }
    } catch (e: any) {
      setErrors([e?.message ?? "Failed to save page"]);
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------ delete ------------------ */
  const del = async () => {
    if (!page.id) return;
    if (!confirm("Delete this page?")) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, { method: "DELETE" });
      alert("Deleted");
      setPage((p) => ({ ...p, id: "" }));
      loadAvailablePages();
      window.history.pushState({}, "", "?");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  render                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* top bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
           
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contact Page Builder
              </h1>
              <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                Contact Form
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* page selector */}
            {/* <select
              value={page.id || "new"}
              onChange={(e) =>
                e.target.value === "new"
                  ? setPage({
                      id: "",
                      name: "New Contact Page",
                      slug: "contact_us",
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
                    })
                  : loadPage(e.target.value)
              }
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isLoadingPages}
            >
              <option value="new">+ New Page</option>
              {availablePages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select> */}

            <Button onClick={savePage} size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>

            {page.id && (
              <Button
                onClick={del}
                size="sm"
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting…
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

      {/* Errors */}
      {errors.length > 0 && (
        <div className="container mx-auto mt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">Errors:</h3>
            <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
              {errors.map((e, i) => (
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* main */}
      <div className="container mx-auto p-6 grid lg:grid-cols-3 gap-6">
        {/* settings */}
        <div className="space-y-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <CardTitle className="dark:text-white">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Page Name"
                value={page.name}
                onChange={(e) =>
                  setPage((p) => ({ ...p, name: e.target.value }))
                }
              />
              <Input
                label="URL Slug"
                value={page.slug}
                onChange={(e) =>
                  setPage((p) => ({ ...p, slug: sanitizeSlug(e.target.value) }))
                }
              />
              <Input
                label="Title"
                value={page.title}
                onChange={(e) =>
                  setPage((p) => ({ ...p, title: e.target.value }))
                }
              />
              <Textarea
                label="Description"
                rows={3}
                placeholder="Description"
                value={page.description}
                onChange={(e) =>
                  setPage((p) => ({ ...p, description: e.target.value }))
                }
              />
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <CardTitle className="dark:text-white">Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name Label"
                value={page.settings.nameLabel}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    settings: { ...p.settings, nameLabel: e.target.value },
                  }))
                }
              />
              <Input
                label="Email Label"
                value={page.settings.emailLabel}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    settings: { ...p.settings, emailLabel: e.target.value },
                  }))
                }
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={page.settings.phoneEnabled}
                  onCheckedChange={(c) =>
                    setPage((p) => ({
                      ...p,
                      settings: { ...p.settings, phoneEnabled: Boolean(c) },
                    }))
                  }
                  className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                />
                <span className="text-sm text-gray-900 dark:text-gray-200">
                  Include Phone Field
                </span>
              </div>
              {page.settings.phoneEnabled && (
                <Input
                  label="Phone Label"
                  value={page.settings.phoneLabel}
                  onChange={(e) =>
                    setPage((p) => ({
                      ...p,
                      settings: { ...p.settings, phoneLabel: e.target.value },
                    }))
                  }
                />
              )}
              <Input
                label="Message Label"
                value={page.settings.messageLabel}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    settings: { ...p.settings, messageLabel: e.target.value },
                  }))
                }
              />
              <Input
                label="Submit Button Text"
                value={page.settings.submitButtonText}
                onChange={(e) =>
                  setPage((p) => ({
                    ...p,
                    settings: {
                      ...p.settings,
                      submitButtonText: e.target.value,
                    },
                  }))
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* preview */}
        <div className="lg:col-span-2">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <CardTitle className="dark:text-white">Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {page.title}
                  </h2>
                  {page.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {page.description}
                    </p>
                  )}
                </div>
                
                <form className="space-y-4">
                  <Input label={page.settings.nameLabel} disabled />
                  <Input
                    type="email"
                    label={page.settings.emailLabel}
                    disabled
                  />
                  {page.settings.phoneEnabled && (
                    <Input label={page.settings.phoneLabel} disabled />
                  )}
                  <Textarea
                    label={page.settings.messageLabel}
                    rows={4}
                    placeholder={placeholder(page.settings.messageLabel)}
                    disabled
                  />
                  <Button type="button" className="w-full" disabled>
                    {page.settings.submitButtonText}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Primitive wrappers (Input/Textarea with label)                     */
/* ------------------------------------------------------------------ */
function Input({
  label,
  ...props
}: React.ComponentProps<"input"> & { label?: string }) {
  return (
    <div>
      {label && <Label className="mb-1 block dark:text-gray-200">{label}</Label>}
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
      />
    </div>
  );
}

function Textarea({
  label,
  ...props
}: React.ComponentProps<"textarea"> & { label?: string }) {
  return (
    <div>
      {label && <Label className="mb-1 block dark:text-gray-200">{label}</Label>}
      <textarea
        {...props}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 resize-vertical"
      />
    </div>
  );
}
