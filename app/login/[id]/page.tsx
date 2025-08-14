"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

interface FormConfigPage {
  id: string;
  title: string;
  description?: string;
  form_config: FormField[];
  settings: {
    submitButtonText?: string;
    successMessage?: string;
  };
}

export default function LoginPageById() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const { setToken } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState<FormConfigPage | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadPage = async () => {
      try {
        const data = await apiFetch(`/tenant/pages/${id}`);
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
            : data.settings || {};

        setPage({
          id: String(data.id),
          title: data.title || settingsParsed?.title || "Login",
          description: data.description || settingsParsed?.description || "",
          form_config: formConfig,
          settings: settingsParsed || {},
        });
      } catch (error) {
        console.error("Failed to load login page:", error);
        alert("Failed to load login page");
      }
    };
    loadPage();
  }, [id]);

  const usernameFieldName = useMemo(() => {
    const fields = page?.form_config || [];
    const emailField = fields.find((f) => f.name?.toLowerCase() === "email");
    if (emailField) return emailField.name;
    const userField = fields.find((f) => f.name?.toLowerCase() === "username");
    if (userField) return userField.name;
    const firstText = fields.find((f as any) => (f as any).type === "text");
    return (firstText as any)?.name || "email";
  }, [page]);

  const passwordFieldName = useMemo(() => {
    const fields = page?.form_config || [];
    const pwdType = fields.find((f as any) => (f as any).type === "password");
    if (pwdType) return (pwdType as any).name;
    const pwdName = fields.find((f) => f.name?.toLowerCase() === "password");
    return pwdName?.name || "password";
  }, [page]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const identifier = formData[usernameFieldName];
      const password = formData[passwordFieldName];
      if (!identifier || !password) {
        throw new Error("Please enter credentials");
      }

      const response = await apiFetch("/tenant/login", {
        method: "POST",
        body: JSON.stringify({
          email: identifier,
          username: identifier,
          password,
        }),
      });

      const accessToken = response?.data?.access_token || response?.access_token;
      if (!accessToken) {
        throw new Error(response?.message || "Invalid credentials");
      }

      setToken(accessToken);
      router.push("/admin/dashboard");
    } catch (err) {
      setError((err as any)?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {page?.title || "Login"}
              </CardTitle>
              {page?.description && (
                <p className="text-gray-600">{page.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {page ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {(page.form_config || [])
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                      <div key={field.id}>
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id={field.name}
                          type={field.type}
                          required={field.required}
                          placeholder={field.placeholder}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  {error && (
                    <p className="text-center text-red-600 text-sm">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Submitting..."
                      : page.settings?.submitButtonText || "Sign In"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading login page...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
