"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

interface LoginPageSettings {
  submitButtonText: string;
  description: string;
  forgotPasswordLink: boolean;
  registerLink: boolean;
  rememberMeOption: boolean;
}

interface LoginPage {
  id: string;
  title: string;
  description: string;
  form_config: FormField[];
  settings: LoginPageSettings;
}

export default function LoginPage() {
  const { setToken } = useAuth();
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<LoginPage | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  useEffect(() => {
    const fetchLoginForm = async () => {
      try {
        setIsLoadingForm(true);
        // Fetch the first available login page
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

        let loginData;
        if (Array.isArray(response)) {
          loginData = response[0];
        } else if (response?.data && Array.isArray(response.data)) {
          loginData = response.data[0];
        } else {
          loginData = response;
        }

        if (loginData) {
          const parsedFormConfig =
            typeof loginData.form_config === "string"
              ? JSON.parse(loginData.form_config)
              : loginData.form_config;

          const parsedSettings =
            typeof loginData.settings === "string"
              ? JSON.parse(loginData.settings)
              : loginData.settings;

          setLoginForm({
            ...loginData,
            form_config: parsedFormConfig,
            settings: parsedSettings || {
              submitButtonText: "Sign In",
              description: "",
              forgotPasswordLink: true,
              registerLink: true,
              rememberMeOption: true,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch login form:", error);
        setError("Failed to load login form. Please try again later.");
      } finally {
        setIsLoadingForm(false);
      }
    };

    fetchLoginForm();
  }, []);

  const handleFormChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Extract username/email and password from form data
      const usernameField = loginForm?.form_config.find(
        (f) => f.name === "username"
      );
      const passwordField = loginForm?.form_config.find(
        (f) => f.name === "password"
      );

      if (!usernameField || !passwordField) {
        throw new Error("Login form is not properly configured");
      }

      const username = formData[usernameField.name];
      const password = formData[passwordField.name];

      if (!username || !password) {
        throw new Error("Please fill in all required fields");
      }

      // Submit login request
      const loginResponse = await apiFetch("/tenant/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (loginResponse.access_token) {
        // Save token and redirect
        setToken(loginResponse.access_token);
        router.push("/admin/dashboard");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      setError(
        error.data?.message ||
          error.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading login form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <LogIn className="mr-2 h-5 w-5 text-blue-600" />
                {loginForm?.title || "Login"}
              </CardTitle>
              {loginForm?.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {loginForm.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {loginForm ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Dynamic Form Fields */}
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

                  {/* Remember Me Option */}
                  {loginForm.settings.rememberMeOption && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm text-gray-700"
                      >
                        Remember me
                      </Label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      loginForm.settings.submitButtonText || "Sign In"
                    )}
                  </Button>

                  {/* Additional Links */}
                  <div className="flex items-center justify-between text-sm">
                    {loginForm.settings.forgotPasswordLink && (
                      <Link
                        href="/forgot-password"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                    {loginForm.settings.registerLink && (
                      <Link
                        href="/registration"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Don't have an account? Sign up
                      </Link>
                    )}
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    No login form configured yet.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please contact an administrator to set up the login form.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
