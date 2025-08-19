"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-config";
import { useSearchParams } from "next/navigation";

export default function ClientContactPage() {
  const [formConfig, setFormConfig] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant") || "default";

  useEffect(() => {
    async function fetchConfig() {
      if (!tenant) return;
      setLoading(true);
      setError(null);

      try {
        let res: any = null;

        // ✅ Fetch only contact_us type pages
        try {
          res = await apiFetch(`/customer/pages/type/contact_us`);
        } catch (_e) {
          // fallback for tenant-specific
          // try {
          //   res = await apiFetch(`/tenant/pages?type=contact_us&tenant=${tenant}`);
          // } catch (_e2) {}
        }

        // Normalize
        const maybeArray = Array.isArray(res?.data)
          ? res.data
          : res?.data
          ? [res.data]
          : [];

        if (maybeArray.length === 0) {
          setFormConfig(null);
          setLoading(false);
          return;
        }

        // ✅ Sort latest
        const sortedArray = maybeArray
          .filter((item: any) => item && item.form_config)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.created_at || a.updated_at || 0);
            const dateB = new Date(b.created_at || b.updated_at || 0);
            return dateB.getTime() - dateA.getTime();
          });

        const latest = sortedArray[0] || null;
        if (!latest) {
          setFormConfig(null);
        } else {
          const parsedFormConfig =
            typeof latest.form_config === "string"
              ? (() => {
                  try {
                    return JSON.parse(latest.form_config);
                  } catch {
                    return null;
                  }
                })()
              : latest.form_config;

          setFormConfig({ ...latest, form_config: parsedFormConfig });
        }
      } catch (e) {
        console.error("Error fetching form config:", e);
        setError("Failed to load contact form");
        setFormConfig(null);
      }

      setLoading(false);
    }

    fetchConfig();
  }, [tenant]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 text-center p-4">Error: {error}</div>
    );

  if (!formConfig || !Array.isArray(formConfig.form_config)) {
    return <div className="text-center p-4">No contact form found.</div>;
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // ✅ Send to contact API
      await apiFetch("/tenant/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      alert(formConfig.settings?.successMessage || "Message sent successfully!");
      setFormData({});
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to send your message. Please try again.");
    }
    setSubmitting(false);
  };

  // fields
  const formFields: any[] = Array.isArray(formConfig.form_config)
    ? formConfig.form_config
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8"
      >
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {formConfig.title || "Contact Us"}
          </h2>
          {formConfig.description && (
            <p className="text-sm text-gray-500">{formConfig.description}</p>
          )}
        </div>

        {formFields.length > 0 ? (
          <div className="space-y-6">
            {formFields
              .slice()
              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
              .map((field: any) => {
                if (!field.name || !field.type) return null;

                const commonLabel = (
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                );

                if (field.type === "textarea") {
                  return (
                    <div key={field.id || field.name} className="mb-6">
                      {commonLabel}
                      <textarea
                        required={field.required}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  );
                }

                // default input types
                const inputType = [
                  "text",
                  "email",
                  "tel",
                  "number",
                  "url",
                  "date",
                ].includes(field.type)
                  ? field.type
                  : "text";

                return (
                  <div key={field.id || field.name} className="mb-6">
                    {commonLabel}
                    <input
                      type={inputType}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleChange(field.name, e.target.value)
                      }
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No fields configured.
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {submitting
            ? "Sending..."
            : formConfig.settings?.submitButtonText || "Send Message"}
        </button>
      </form>
    </div>
  );
}
