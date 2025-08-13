"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";

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
  const { token } = useAuth();
  const [page, setPage] = useState<FormConfigPage | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    const loadPage = async () => {
      try {
        const data = await apiFetch(`/tenant/pages/${id}`, {
          token: token || undefined,
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
  }, [token, id]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fields = page?.form_config || [];
      const payload = fields.reduce((acc, field) => {
        const value = formData[field.name];
        if (value !== undefined) acc[field.name] = value;
        return acc;
      }, {} as Record<string, any>);

      console.log("login submit payload:", payload);
      alert(page?.settings?.successMessage || "Login submitted successfully!");

      const cleared: Record<string, any> = { ...formData };
      fields.forEach((f) => delete cleared[f.name]);
      setFormData(cleared);
    } catch (err) {
      alert("Failed to submit login");
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
