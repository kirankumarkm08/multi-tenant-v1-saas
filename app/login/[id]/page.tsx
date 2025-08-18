/* ---------------------------------------------------------------------
   LoginPageById.tsx
   – fully-typed, TS-safe version that eliminates all compile-time errors
--------------------------------------------------------------------- */

"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

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

interface PageSettings {
  submitButtonText?: string;
  successMessage?: string;
  title?: string;
  description?: string;
}

interface FormConfigPage {
  id: string;
  title: string;
  description?: string;
  form_config: FormField[];
  settings: PageSettings;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function LoginPageById() {
  /* -------- hooks -------- */
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { setToken } = useAuth();

  /* -------- state -------- */
  const [page, setPage] = useState<FormConfigPage | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------
     Fetch page data
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!id) return;

    const loadPage = async () => {
      try {
        const data = await apiFetch(`/tenant/pages/${id}`);

        const form_config: FormField[] = Array.isArray(data.form_config)
          ? data.form_config
          : JSON.parse(data.form_config ?? "[]");

        const settings: PageSettings =
          typeof data.settings === "string"
            ? JSON.parse(data.settings)
            : data.settings ?? {};

        setPage({
          id: String(data.id),
          title: data.title || settings.title || "Login",
          description: data.description || settings.description || "",
          form_config,
          settings,
        });
      } catch (err) {
        console.error("Failed to load login page:", err);
        setError("Failed to load login page");
      }
    };

    loadPage();
  }, [id]);

  /* ------------------------------------------------------------------
     Memo helpers
  ------------------------------------------------------------------ */
  const usernameFieldName = useMemo(() => {
    const fields = page?.form_config ?? [];
    return (
      fields.find((f) => f.name.toLowerCase() === "email")?.name ||
      fields.find((f) => f.name.toLowerCase() === "username")?.name ||
      fields.find((f) => f.type === "text")?.name ||
      "email"
    );
  }, [page]);

  const passwordFieldName = useMemo(() => {
    const fields = page?.form_config ?? [];
    return (
      fields.find((f) => f.type === "password")?.name ||
      fields.find((f) => f.name.toLowerCase() === "password")?.name ||
      "password"
    );
  }, [page]);

  /* ------------------------------------------------------------------
     Handlers
  ------------------------------------------------------------------ */
  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
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

      const accessToken =
        response?.data?.access_token ?? response?.access_token;
      if (!accessToken) {
        throw new Error(response?.message || "Invalid credentials");
      }

      setToken(accessToken);
      router.push("/admin/dashboard");
    } catch (err) {
      setError((err as Error).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
     Render
  ------------------------------------------------------------------ */
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
                  {page.form_config
                    .slice()
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
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    ))}

                  {error && (
                    <p className="text-center text-red-600 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : page.settings.submitButtonText || "Sign In"}
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
