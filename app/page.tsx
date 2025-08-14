"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { Home, User, LogIn, UserPlus, Menu, X } from "lucide-react";
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

interface FormConfig {
  id: string;
  title: string;
  form_config: FormField[];
  settings: {
    submitButtonText: string;
    successMessage: string;
  };
}

export default function LandingPage() {
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState<FormConfig | null>(null);
  const [registrationForm, setRegistrationForm] = useState<FormConfig | null>(
    null
  );
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const navItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Login",
      href: "/login",
    },
    {
      label: "Register",
      href: "/registration",
    },
  ];

  useEffect(() => {
    if (token) {
      fetchForms();
    }
  }, [token]);

  const fetchForms = async () => {
    try {
      // Fetch login form
      const loginResponse = await apiFetch("/tenant/pages?type=login");
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

      // Fetch registration form
      const regResponse = await apiFetch("/tenant/pages?type=register");
      const regData = Array.isArray(regResponse)
        ? regResponse[0]
        : regResponse?.data?.[0] || regResponse;

      if (regData) {
        const parsedFormConfig =
          typeof regData.form_config === "string"
            ? JSON.parse(regData.form_config)
            : regData.form_config;
        setRegistrationForm({ ...regData, form_config: parsedFormConfig });
      }
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    }
  };

  const handleFormChange = (
    formName: string,
    fieldName: string,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [`${formName}_${fieldName}`]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent, formType: string) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter form data for this specific form
      const formFields =
        formType === "login"
          ? loginForm?.form_config || []
          : registrationForm?.form_config || [];

      const formDataToSubmit = formFields.reduce((acc, field) => {
        const value = formData[`${formType}_${field.name}`];
        if (value !== undefined) acc[field.name] = value;
        return acc;
      }, {} as Record<string, any>);

      console.log(`${formType} form submitted:`, formDataToSubmit);
      alert(`${formType} form submitted successfully!`);

      // Clear form data
      const newFormData = { ...formData };
      formFields.forEach((field) => {
        delete newFormData[`${formType}_${field.name}`];
      });
      setFormData(newFormData);
    } catch (error) {
      alert(`Failed to submit ${formType} form`);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (formConfig: FormConfig | null, formType: string) => {
    if (!formConfig) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No {formType} form configured yet.</p>
        </div>
      );
    }

    return (
      <form
        onSubmit={(e) => handleFormSubmit(e, formType)}
        className="space-y-4"
      >
        <h3 className="text-xl font-semibold mb-4">{formConfig.title}</h3>

        {formConfig.form_config
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <div key={field.id}>
              <Label htmlFor={`${formType}_${field.name}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={`${formType}_${field.name}`}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={formData[`${formType}_${field.name}`] || ""}
                onChange={(e) =>
                  handleFormChange(formType, field.name, e.target.value)
                }
                className="mt-1"
              />
            </div>
          ))}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : formConfig.settings.submitButtonText}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">YourApp</span>
            </div>

            {/* Desktop Navigation */}
            <div className=" flex gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="outline" size="sm">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {/* {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setActiveSection("home");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setActiveSection("about");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    setActiveSection("login");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setActiveSection("register");
                    setMobileMenuOpen(false);
                  }}
                  className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Register
                </button>
                <Link href="/admin-login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    admin login
                  </Button>
                </Link>
              </div>
            </div>
          )} */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Home Section */}
        {activeSection === "home" && (
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">YourApp</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A powerful platform for building dynamic forms and managing your
              business needs. Create, customize, and deploy forms with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setActiveSection("register")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveSection("about")}
              >
                Learn More
              </Button>
              <Link href="/admin-login">
                <Button variant="outline" size="lg">
                  <User className="mr-2 h-5 w-5" />
                  admin-login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === "about" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              About Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    To provide businesses with powerful, flexible tools for
                    creating and managing dynamic forms that adapt to their
                    specific needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="mr-2 h-5 w-5 text-blue-600" />
                    What We Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We offer a comprehensive platform for building, customizing,
                    and deploying forms with real-time data collection and
                    management capabilities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Login Section */}
        {activeSection === "login" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5 text-blue-600" />
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent>{renderForm(loginForm, "login")}</CardContent>
            </Card>
          </div>
        )}

        {/* Registration Section */}
        {activeSection === "register" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                  Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderForm(registrationForm, "register")}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
