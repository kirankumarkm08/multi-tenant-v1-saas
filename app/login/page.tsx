"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";

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

interface FormConfig {
  id: string;
  title: string;
  form_config: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
  };
}

export default function LoginPage() {
  const { token } = useAuth();
  const [loginForm, setLoginForm] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchLoginForm = async () => {
      try {
        const loginResponse = await apiFetch("/tenant/pages?type=login", {
          token: token || undefined,
        });
        const loginData = Array.isArray(loginResponse)
          ? loginResponse[0]
          : loginResponse?.data?.[0] || loginResponse;
        if (loginData) {
          const parsedFormConfig =
            typeof loginData.form_config === "string"
              ? JSON.parse(loginData.form_config)
              : loginData.form_config;
          setLoginForm({ ...loginData, form_config: parsedFormConfig });
        }
      } catch (error) {
        console.error("Failed to fetch login form:", error);
      }
    };
    fetchLoginForm();
  }, [token]);

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formFields = loginForm?.form_config || [];
      const formDataToSubmit = formFields.reduce((acc, field) => {
        const value = formData[field.name];
        if (value !== undefined) acc[field.name] = value;
        return acc;
      }, {} as Record<string, any>);

      console.log("login form submitted:", formDataToSubmit);
      alert("Login form submitted successfully!");

      const newFormData = { ...formData };
      formFields.forEach((field) => {
        delete newFormData[field.name];
      });
      setFormData(newFormData);
    } catch (error) {
      alert("Failed to submit login form");
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
              <CardTitle className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5 text-blue-600" />
                Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loginForm ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">
                    {loginForm.title}
                  </h3>
                  {(loginForm.form_config || [])
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
                            handleFormChange(field.name, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? "Submitting..."
                      : loginForm.settings.submitButtonText}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No login form configured yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
