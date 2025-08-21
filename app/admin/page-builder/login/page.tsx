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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

interface LoginPageSettings {
  usernameLabel: string;
  passwordLabel: string;
  submitButtonText: string;
  forgotPasswordLink: boolean;
  registerLink: boolean;
  rememberMeOption: boolean;
}

interface LoginPage {
  id: string;
  name: string;
  slug?: string;
  title: string;
  description: string;
  settings: LoginPageSettings;
}

export default function LoginPageBuilder() {
  const { token } = useAuth();

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
  const [availablePages, setAvailablePages] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  useEffect(() => {
    if (!token) {
      console.log("Login Page Builder - No token available");
      return;
    }

    console.log("Login Page Builder - Token available, checking for page ID");
    const pageId = new URLSearchParams(window.location.search).get("id");
    if (pageId) {
      console.log("Login Page Builder - Loading page with ID:", pageId);
      loadPage(pageId);
    } else {
      console.log("Login Page Builder - No page ID, creating new page");
      setPage({
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
      window.history.pushState({}, "", "?");
    }
  }, [token]);

  const loadAvailablePages = async () => {
    try {
      setIsLoadingPages(true);
      let response: any = null;
      try {
        response = await apiFetch("/tenant/pages?page_type=login");
      } catch (_e) {}
      if (
        !response ||
        (Array.isArray(response) && response.length === 0) ||
        (response?.data &&
          Array.isArray(response.data) &&
          response.data.length === 0)
      ) {
        try {
          response = await apiFetch("/tenant/pages?type=login");
        } catch (_e2) {}
      }
      if (
        !response ||
        (Array.isArray(response) && response.length === 0) ||
        (response?.data &&
          Array.isArray(response.data) &&
          response.data.length === 0)
      ) {
        try {
          response = await apiFetch("/tenant/pages?form_type=login");
        } catch (_e3) {}
      }

      let pages = [];
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
          slug: p.slug || "login",
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
        name: "New Login Page",
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
      window.history.pushState({}, "", "?");
    } else {
      // Load existing page
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

      // Find username and password fields from form config
      const usernameField = formConfig?.find(
        (f: { name?: string }) => f.name === "username"
      );
      const passwordField = formConfig?.find(
        (f: { name?: string; type?: string }) =>
          f.name === "password" || f.type === "password"
      );

      setPage({
        id: data.id,
        name: data.name || "Login Page",
        slug: data.slug || "login",
        title: data.title || "Login to Your Account",
        description: data.description || "",
        settings: {
          usernameLabel:
            usernameField?.label ||
            settings?.usernameLabel ||
            "Username or Email",
          passwordLabel:
            passwordField?.label || settings?.passwordLabel || "Password",
          submitButtonText: settings?.submitButtonText || "Sign In",
          forgotPasswordLink: Boolean(settings?.forgotPasswordLink ?? true),
          registerLink: Boolean(settings?.registerLink ?? true),
          rememberMeOption: Boolean(settings?.rememberMeOption ?? true),
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      alert("Failed to load page data. Please check if the page exists.");
    }
  };

  const savePage = async () => {
    // apiFetch auto-attaches token from localStorage
    setIsSaving(true);

    try {
      const baseSlug = (page.slug || "login").trim() || "login";

      // If this is a create and a page with the same slug already exists,
      // switch to update to avoid 422 validation errors from duplicate slugs.
      let targetId = page.id;
      if (!targetId) {
        try {
          let existingResponse: any = null;
          try {
            existingResponse = await apiFetch("/tenant/pages?page_type=login");
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
              existingResponse = await apiFetch("/tenant/pages?type=login");
            } catch (_e2) {}
          }
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
                "/tenant/pages?form_type=login"
              );
            } catch (_e3) {}
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
        } catch (_ignored) {
          // best-effort; proceed if list cannot be fetched
        }
      }

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

      const buildRequestData = (slug: string) => ({
        title: page.title,
        slug,
        page_type: "login",
        form_config: JSON.stringify(form_config),
        settings: JSON.stringify({
          submitButtonText: page.settings.submitButtonText,
          description: page.description,
          forgotPasswordLink: page.settings.forgotPasswordLink,
          registerLink: page.settings.registerLink,
          rememberMeOption: page.settings.rememberMeOption,
        }),
      });

      const endpoint = targetId ? `/tenant/pages/${targetId}` : `/tenant/pages`;
      const method = targetId ? "PUT" : "POST";

      const saved = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(buildRequestData(baseSlug)),
      });

      // Always update the page ID and URL after saving
      if (saved?.id) {
        setPage((prev) => ({ ...prev, id: saved.id }));
        // Push the page ID to URL for both new and existing pages
        window.history.pushState({}, "", `?id=${saved.id}`);
      }

      alert("Login page saved successfully!");
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
      await apiFetch(`/tenant/pages/${page.id}`, {
        method: "DELETE",
      });
      alert("Login page deleted");
      setPage((prev) => ({
        ...prev,
        id: "",
      }));
      window.history.pushState({}, "", `?`);
    } catch (error) {
      console.error("Failed to delete page:", error);
      alert("Failed to delete page");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
          
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Login Page Builder
                </h1>
                <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                  Login Form
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Page Selector */}
              {/* <div className="flex items-center space-x-2">
                <Label htmlFor="page-select" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Select Page:
                </Label>
                <select
                  id="page-select"
                  value={page.id || "new"}
                  onChange={(e) => handlePageSelect(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  disabled={isLoadingPages}
                >
                  <option value="new">+ Create New Page</option>
                  {availablePages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div> */}

              {page.id && (
                <Link href={`/preview/login/${page.id}`}>
                  <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-name" className="dark:text-gray-200">
                    Page Name
                  </Label>
                  <Input
                    id="page-name"
                    value={page.name}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Login Page"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="page-slug" className="dark:text-gray-200">
                    URL Slug
                  </Label>
                  <Input
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="login"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="form-type" className="dark:text-gray-200">
                    Form Type
                  </Label>
                  <Badge> login type</Badge>
                </div>
                <div>
                  <Label htmlFor="page-title" className="dark:text-gray-200">
                    Title
                  </Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Login to Your Account"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="page-desc" className="dark:text-gray-200">
                    Description
                  </Label>
                  <Input
                    id="page-desc"
                    value={page.description}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Please enter your credentials to access your account"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username-label" className="dark:text-gray-200">
                    Username/Email Label
                  </Label>
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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="password-label" className="dark:text-gray-200">
                    Password Label
                  </Label>
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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
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
                        settings: {
                          ...prev.settings,
                          submitButtonText: e.target.value,
                        },
                      }))
                    }
                    placeholder="Sign In"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="forgot"
                      checked={page.settings.forgotPasswordLink}
                      onCheckedChange={(checked) =>
                        setPage((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            forgotPasswordLink: Boolean(checked),
                          },
                        }))
                      }
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="forgot" className="text-sm dark:text-gray-200">
                      Show Forgot Password Link
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="registerLink"
                      checked={page.settings.registerLink}
                      onCheckedChange={(checked) =>
                        setPage((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            registerLink: Boolean(checked),
                          },
                        }))
                      }
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="registerLink" className="text-sm dark:text-gray-200">
                      Show Register Link
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={page.settings.rememberMeOption}
                      onCheckedChange={(checked) =>
                        setPage((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            rememberMeOption: Boolean(checked),
                          },
                        }))
                      }
                      className="dark:border-gray-600 dark:data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="rememberMe" className="text-sm dark:text-gray-200">
                      Enable Remember Me
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
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
                    <div>
                      <Label className="dark:text-gray-200">
                        {page.settings.usernameLabel}
                      </Label>
                      <Input 
                        placeholder={`Enter your ${page.settings.usernameLabel.toLowerCase()}`}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="dark:text-gray-200">
                        {page.settings.passwordLabel}
                      </Label>
                      <Input
                        type="password"
                        placeholder={`Enter your ${page.settings.passwordLabel.toLowerCase()}`}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        disabled
                      />
                    </div>
                    
                    {page.settings.rememberMeOption && (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="preview-remember" 
                          disabled
                          className="dark:border-gray-600"
                        />
                        <Label htmlFor="preview-remember" className="text-sm dark:text-gray-200">
                          Remember me
                        </Label>
                      </div>
                    )}
                    
                    <Button type="button" className="w-full" disabled>
                      {page.settings.submitButtonText}
                    </Button>
                    
                    {(page.settings.forgotPasswordLink || page.settings.registerLink) && (
                      <div className="text-center space-y-2">
                        {page.settings.forgotPasswordLink && (
                          <div>
                            <button
                              type="button"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              disabled
                            >
                              Forgot your password?
                            </button>
                          </div>
                        )}
                        {page.settings.registerLink && (
                          <div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Don't have an account?{" "}
                            </span>
                            <button
                              type="button"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              disabled
                            >
                              Sign up
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
