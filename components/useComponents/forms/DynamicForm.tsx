"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

export default function DynamicForm({
  formConfig,
  formType,
  onSubmit,
}: {
  formConfig: FormConfig | null;
  formType: string;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  if (!formConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No {formType} form configured yet.</p>
      </div>
    );
  }

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 dark:text-white">{formConfig.title}</h3>

      {formConfig.form_config.sort((a, b) => a.order - b.order).map((field) => {
        const value = formData[field.name] || "";

        const labelEl = (
          <Label htmlFor={field.name} className="dark:text-gray-200">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        );

        // Example: input handling (you can copy from your current implementation)
        return (
          <div key={field.id}>
            {labelEl}
            <Input
              id={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          </div>
        );
      })}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : formConfig.settings.submitButtonText}
      </Button>
    </form>
  );
}
