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
  const token: string = process.env.NEXT_PUBLIC_API_BEARER_TOKEN ?? "";

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

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pageId = params.get("id");
      if (pageId) {
        loadPage(pageId);
      }
    }
  }, [token]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        token,
      });

      const formConfig =
        typeof data.form_config === "string"
          ? JSON.parse(data.form_config)
          : data.form_config;

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

      const saved = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(buildRequestData(baseSlug)),
        token,
      });

      if (!page.id && saved?.id) {
        setPage((prev) => ({ ...prev, id: saved.id }));
        window.history.pushState({}, "", `?id=${saved.id}`);
      }

      alert("Login page saved successfully!");
    } catch (error) {
      console.error("Failed to save page:", error);
      alert("Failed to save page");
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
        token,
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
    // JSX same as your original code (no changes to structure)
    // ...
    <div className=""></div>
  );
}
