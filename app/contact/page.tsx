"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api-config";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  order: number;
}

interface ContactSettings {
  nameLabel: string;
  emailLabel: string;
  phoneEnabled: boolean;
  phoneLabel: string;
  messageLabel: string;
  submitButtonText: string;
}

interface ContactPageConfig {
  id: string;
  title: string;
  description?: string;
  form_config: FormField[];
  settings: ContactSettings;
}

export default function ContactPage() {
  const [formDef, setFormDef] = useState<ContactPageConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let res: any = null;
        try {
          res = await apiFetch("/tenant/pages?type=contact");
        } catch (_e) {}
        if (
          !res ||
          (Array.isArray(res) && res.length === 0) ||
          (res?.data && Array.isArray(res.data) && res.data.length === 0)
        ) {
          try {
            res = await apiFetch("/tenant/pages?form_type=contact");
          } catch (_e2) {}
        }
        let first: any = null;
        if (Array.isArray(res)) first = res[0];
        else if (Array.isArray(res?.data)) first = res.data[0];
        else first = res;

        if (!first) {
          setFormDef(null);
        } else {
          const parsedConfig =
            typeof first.form_config === "string"
              ? JSON.parse(first.form_config)
              : first.form_config;
          const parsedSettings =
            typeof first.settings === "string"
              ? JSON.parse(first.settings)
              : first.settings;
          setFormDef({
            ...first,
            form_config: parsedConfig || [],
            settings: parsedSettings,
          });
        }
      } catch (e: any) {
        setError("Failed to load contact form.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDef) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Prepare payload from configured fields
      const payload: Record<string, any> = {};
      (formDef.form_config || []).forEach((f) => {
        if (formData[f.name] !== undefined) payload[f.name] = formData[f.name];
      });

      // Submit to contact endpoint (adjust if your API differs)
      await apiFetch("/tenant/contact", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess("Your message has been sent successfully.");
      setFormData({});
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Failed to submit message."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No contact form configured.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Mail className="mr-2 h-5 w-5 text-blue-600" />
              {formDef.title || "Contact Us"}
            </CardTitle>
            {formDef.description && (
              <p className="text-sm text-gray-600 mt-2">
                {formDef.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {(formDef.form_config || [])
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
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="mt-1"
                      />
                    ) : (
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
                    )}
                  </div>
                ))}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  formDef.settings?.submitButtonText || "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
