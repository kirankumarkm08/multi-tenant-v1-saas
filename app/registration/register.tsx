"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-config";
import { useSearchParams } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

export default function ClientRegistrationPage() {
  const token = process.env.NEXT_PUBLIC_API_BEARER_TOKEN;
  const [formConfig, setFormConfig] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<any>(null);
  const searchParams = useSearchParams();
  const tenant = searchParams.get("tenant") || "default";

  useEffect(() => {
    async function fetchConfig() {
      if (!tenant) return;
      setLoading(true);
      try {
        const res = await apiFetch(
          `/tenant/pages?type=register&tenant=${tenant}`,
          {
            token: token || undefined,
          }
        );
        setRaw(res);
        // Normalize possible shapes: {data: [...]}, [...], or single object
        const maybeArray = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : res?.data
          ? [res.data]
          : [res];
        const first = maybeArray && maybeArray.length ? maybeArray[0] : null;
        if (!first) {
          setFormConfig(null);
        } else {
          const parsedFormConfig =
            typeof first.form_config === "string"
              ? (() => {
                  try {
                    return JSON.parse(first.form_config);
                  } catch {
                    return null;
                  }
                })()
              : first.form_config;
          setFormConfig({ ...first, form_config: parsedFormConfig });
        }
      } catch (e) {
        setFormConfig(null);
      }
      setLoading(false);
    }
    fetchConfig();
  }, [tenant, token]);

  if (loading) return <div>Loading...</div>;
  if (!formConfig || !formConfig.form_config)
    return <div>No registration form found.</div>;

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Submitted: " + JSON.stringify(formData));
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">
          {formConfig.title || "Register"}
        </h2>
        {Array.isArray(formConfig.form_config) &&
        formConfig.form_config.length > 0 ? (
          formConfig.form_config
            .slice()
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
            .map((field: any) => (
              <div key={field.id} className="mb-4">
                <label className="block font-medium mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            ))
        ) : (
          <div className="text-gray-500 mb-4">No fields configured.</div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {formConfig.settings?.submitButtonText || "Register"}
        </button>
      </form>
      {/* Optional debug of GET response */}
      {/* <pre className="mt-6 text-xs bg-gray-50 p-3 rounded overflow-auto">
        {JSON.stringify(raw, null, 2)}
      </pre> */}
    </div>
  );
}
