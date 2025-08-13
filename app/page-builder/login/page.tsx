"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Eye, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";

interface LoginPage {
  id: string;
  name: string;
  slug?: string;
  title: string;
  description: string;
  settings: {
    usernameLabel: string;
    passwordLabel: string;
    submitButtonText: string;
    forgotPasswordLink: boolean;
    registerLink: boolean;
    rememberMeOption: boolean;
  };
}

export default function LoginPageBuilder() {
  const token = process.env.NEXT_PUBLIC_API_BEARER_TOKEN;
  const [page, setPage] = useState<LoginPage>({
    id: "",
    name: "Login Page",
    slug: "login",
    title: "Login to Your Account",
    description: "Please enter your credentials to access your account",
    settings: {
      usernameLabel: "Username or Email",
      passwordLabel: "Password",
      submitButtonText: "Sign In",
      forgotPasswordLink: true,
      registerLink: true,
      rememberMeOption: true,
    },
  });
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
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        token: token || undefined,
      });
      const formConfig =
        typeof data.form_config === "string"
          ? JSON.parse(data.form_config)
          : data.form_config;

      // Derive settings from stored config if available
      const usernameField = formConfig?.find((f: any) => f.name === "username");
      const passwordField = formConfig?.find(
        (f: any) => f.name === "password" || f.type === "password"
      );

      setPage({
        id: data.id,
        name: data.name || "Login Page",
        slug: data.slug || "login",
        title: data.title || "Login to Your Account",
        description: data.settings?.description || "",
        settings: {
          usernameLabel:
            usernameField?.label ||
            data.settings?.usernameLabel ||
            "Username or Email",
          passwordLabel:
            passwordField?.label || data.settings?.passwordLabel || "Password",
          submitButtonText: data.settings?.submitButtonText || "Sign In",
          forgotPasswordLink: Boolean(
            data.settings?.forgotPasswordLink ?? true
          ),
          registerLink: Boolean(data.settings?.registerLink ?? true),
          rememberMeOption: Boolean(data.settings?.rememberMeOption ?? true),
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data");
    }
  };

  const savePage = async () => {
    if (!token) {
      alert("API key missing or invalid. Access denied.");
      return;
    }
    setIsSaving(true);
    try {
      const isCreate = !page.id;
      const baseSlug = (page.slug || "login").trim() || "login";
      let slugToUse = baseSlug;
      // Build form_config for login from settings
      const form_config = [
        {
          id: "username",
          name: "username",
          label: page.settings.usernameLabel,
          type: "text",
          required: true,
          placeholder: `Enter your ${page.settings.usernameLabel.toLowerCase()}`,
          order: 0,
        },
        {
          id: "password",
          name: "password",
          label: page.settings.passwordLabel,
          type: "password",
          required: true,
          placeholder: `Enter your ${page.settings.passwordLabel.toLowerCase()}`,
          order: 1,
        },
      ];

      const buildRequestData = (slug: string): Record<string, any> => ({
        title: page.title,
        name: page.name,
        slug,
        form_type: "login",
        form_config: JSON.stringify(form_config),
        settings: JSON.stringify({
          submitButtonText: page.settings.submitButtonText,
          description: page.description,
          forgotPasswordLink: page.settings.forgotPasswordLink,
          registerLink: page.settings.registerLink,
          rememberMeOption: page.settings.rememberMeOption,
        }),
      });

      const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
      const method = page.id ? "PUT" : "POST";

      let saved = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(buildRequestData(slugToUse)),
        token: token || undefined,
      });

      if (!page.id && saved?.id) {
        setPage((prev) => ({ ...prev, id: saved.id }));
        window.history.pushState({}, "", `?id=${saved.id}`);
      }

      alert("Login page saved successfully!");
    } catch (error: any) {
      // If slug is taken, retry once with a unique slug (create or update)
      const errorsVal = error?.data?.errors;
      const isSlugTaken =
        typeof errorsVal === "string"
          ? /slug/i.test(errorsVal)
          : JSON.stringify(errorsVal || {})
              .toLowerCase()
              .includes("slug");
      const isCreate = !page.id;
      if (isSlugTaken) {
        try {
          const uniqueSlug = `${
            (page.slug || "login").trim() || "login"
          }-${Date.now()}`;
          const endpoint = isCreate
            ? `/tenant/pages`
            : `/tenant/pages/${page.id}`;
          const methodRetry = isCreate ? "POST" : "PUT";
          const payloadRetry = buildRequestData(uniqueSlug);
          const savedRetry = await apiFetch(endpoint, {
            method: methodRetry,
            body: JSON.stringify(payloadRetry),
            token: token || undefined,
          });
          if (savedRetry?.id) {
            setPage((prev) => ({
              ...prev,
              id: savedRetry.id,
              slug: uniqueSlug,
            }));
            window.history.pushState({}, "", `?id=${savedRetry.id}`);
            alert("Login page saved successfully!");
            return;
          }
        } catch (retryErr: any) {
          console.error(
            "Retry after slug conflict failed:",
            retryErr?.data || retryErr
          );
          alert(retryErr?.message || "Failed to save page");
          return;
        }
      }

      // Fallback: try alternate payload shape (non-stringified) once on 5xx/JSON-RPC
      const shouldAltRetry =
        (!page.id &&
          (error?.status >= 500 ||
            /json-rpc/i.test(String(error?.message || "")))) ||
        false;
      if (shouldAltRetry) {
        try {
          const altPayload = {
            title: page.title,
            name: page.name,
            slug: (page.slug || "login").trim() || "login",
            form_type: "login",
            form_config: [
              {
                id: "username",
                name: "username",
                label: page.settings.usernameLabel,
                type: "text",
                required: true,
                placeholder: `Enter your ${page.settings.usernameLabel.toLowerCase()}`,
                order: 0,
              },
              {
                id: "password",
                name: "password",
                label: page.settings.passwordLabel,
                type: "password",
                required: true,
                placeholder: `Enter your ${page.settings.passwordLabel.toLowerCase()}`,
                order: 1,
              },
            ],
            settings: {
              submitButtonText: page.settings.submitButtonText,
              description: page.description,
              forgotPasswordLink: page.settings.forgotPasswordLink,
              registerLink: page.settings.registerLink,
              rememberMeOption: page.settings.rememberMeOption,
            },
          };
          const savedAlt = await apiFetch(`/tenant/pages`, {
            method: "POST",
            body: JSON.stringify(altPayload),
            token: token || undefined,
          });
          if (savedAlt?.id) {
            setPage((prev) => ({ ...prev, id: savedAlt.id }));
            window.history.pushState({}, "", `?id=${savedAlt.id}`);
            alert("Login page saved successfully!");
            return;
          }
        } catch (altErr: any) {
          console.error(
            "Alternate payload save failed:",
            altErr?.data || altErr
          );
          alert(altErr?.message || "Failed to save page");
          return;
        }
      }

      console.error(
        "Failed to save page:",
        error?.status,
        error?.data || error
      );
      alert(error?.data?.message || error?.message || "Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePage = async () => {
    if (!page.id) return;
    if (!confirm("Are you sure you want to delete this page?")) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, {
        method: "DELETE",
        token: token || undefined,
      });
      alert("Login page deleted");
      setPage((prev) => ({
        ...prev,
        id: "",
      }));
      window.history.pushState({}, "", `?`);
    } catch (error: any) {
      console.error("Failed to delete page:", error?.data || error);
      alert(error?.message || "Failed to delete page");
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Login Page Builder</h1>
                <Badge variant="secondary">Login Form</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/preview/login/${page.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
              {page.id && (
                <Link href={`/login/${page.id}`}>
                  <Button variant="outline" size="sm">
                    Open Live
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
                    placeholder="Login Page"
                  />
                </div>
                <div>
                  <Label htmlFor="page-slug">Page Slug</Label>
                  <Input
                    id="page-slug"
                    value={page.slug || ""}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="login"
                  />
                </div>
                <div>
                  <Label htmlFor="page-title">Page Title</Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Login to Your Account"
                  />
                </div>
                <div>
                  <Label htmlFor="page-description">Description</Label>
                  <Input
                    id="page-description"
                    value={page.description}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Please enter your credentials"
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
                  <Label htmlFor="username-label">Username Field Label</Label>
                  <Input
                    id="username-label"
                    value={page.settings.usernameLabel}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          usernameLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Username or Email"
                  />
                </div>
                <div>
                  <Label htmlFor="password-label">Password Field Label</Label>
                  <Input
                    id="password-label"
                    value={page.settings.passwordLabel}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          passwordLabel: e.target.value,
                        },
                      }))
                    }
                    placeholder="Password"
                  />
                </div>
                <div>
                  <Label htmlFor="submit-button">Submit Button Text</Label>
                  <Input
                    id="submit-button"
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
                    placeholder="Sign In"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={page.settings.rememberMeOption}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          rememberMeOption: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="remember-me">Show "Remember Me" option</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="forgot-password"
                    checked={page.settings.forgotPasswordLink}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          forgotPasswordLink: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="forgot-password">
                    Show "Forgot Password" link
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="register-link"
                    checked={page.settings.registerLink}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          registerLink: e.target.checked,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="register-link">
                    Show "Create Account" link
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Form Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {page.title}
                    </h2>
                    <p className="text-gray-600 mt-2">{page.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">
                        {page.settings.usernameLabel}
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder={`Enter your ${page.settings.usernameLabel.toLowerCase()}`}
                        disabled
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">
                        {page.settings.passwordLabel}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder={`Enter your ${page.settings.passwordLabel.toLowerCase()}`}
                        disabled
                      />
                    </div>

                    {page.settings.rememberMeOption && (
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="remember" disabled />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                    )}

                    <Button className="w-full" disabled>
                      {page.settings.submitButtonText}
                    </Button>

                    <div className="text-center space-y-2">
                      {page.settings.forgotPasswordLink && (
                        <div>
                          <a
                            href="#"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                      )}
                      {page.settings.registerLink && (
                        <div>
                          <span className="text-sm text-gray-600">
                            Don't have an account?{" "}
                          </span>
                          <a
                            href="#"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Create one here
                          </a>
                        </div>
                      )}
                    </div>
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
