  "use client";

  import { useState, useEffect } from "react";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Badge } from "@/components/ui/badge";
  import { apiFetch } from "@/lib/api-config";
  import { useAuth } from "@/context/AuthContext";
  import { Home, User, LogIn, UserPlus, Menu, X, Calendar, MapPin, Clock, Ticket } from "lucide-react";
  import Link from "next/link";
  import { eventService } from "@/services/event.service";
  import { Event } from "@/types/event";

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
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);

    const navItems = [
      {
        label: "Home",
        href: "/",
      },
      {
        label: "Contact us",
        href: "/contact",
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
      fetchEvents();
      if (token) {
        fetchForms();
      }
    }, [token]);

    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const data = await eventService.getEvents();
        setEvents(data.filter(e => e.status === 'published'));
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    const fetchForms = async () => {
      try {
        // Fetch login form
        const loginResponse = await apiFetch("/tenant/pages?type=login");
        const loginData = Array.isArray(loginResponse)
          ? loginResponse[0]
          : loginResponse?.data;

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
          : regResponse?.data;

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
            <p className="text-gray-600 dark:text-gray-400">No {formType} form configured yet.</p>
          </div>
        );
      }

      return (
        <form
          onSubmit={(e) => handleFormSubmit(e, formType)}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{formConfig.title}</h3>

          {formConfig.form_config
            .sort((a, b) => a.order - b.order)
            .map((field) => {
              const value = formData[`${formType}_${field.name}`] || "";
              const setVal = (v: any) =>
                handleFormChange(formType, field.name, v);

              const labelEl = (
                <Label htmlFor={`${formType}_${field.name}`} className="text-gray-900 dark:text-gray-200">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              );

              if (field.type === "textarea") {
                return (
                  <div key={field.id}>
                    {labelEl}
                    <textarea
                      id={`${formType}_${field.name}`}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={value}
                      onChange={(e) => setVal(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                      rows={4}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                const options = Array.isArray(field.options) ? field.options : [];
                return (
                  <div key={field.id}>
                    {labelEl}
                    <select
                      id={`${formType}_${field.name}`}
                      required={field.required}
                      value={value}
                      onChange={(e) => setVal(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="" disabled>
                        {field.placeholder || "Select an option"}
                      </option>
                      {options.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === "checkbox") {
                const checked = Boolean(value);
                return (
                  <div key={field.id}>
                    <label className="inline-flex items-center space-x-2 mt-1">
                      <input
                        id={`${formType}_${field.name}`}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setVal(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                      />
                      <span className="text-gray-900 dark:text-gray-200">{field.placeholder || field.label}</span>
                    </label>
                  </div>
                );
              }

              if (field.type === "radio") {
                const options = Array.isArray(field.options) ? field.options : [];
                return (
                  <div key={field.id}>
                    {labelEl}
                    <div className="mt-1 space-y-2">
                      {options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="inline-flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            name={`${formType}_${field.name}`}
                            value={opt}
                            checked={value === opt}
                            onChange={(e) => setVal(e.target.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700"
                          />
                          <span className="text-gray-900 dark:text-gray-200">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              const inputType = [
                "text",
                "email",
                "tel",
                "number",
                "password",
              ].includes(field.type)
                ? field.type
                : "text";
              return (
                <div key={field.id}>
                  {labelEl}
                  <Input
                    id={`${formType}_${field.name}`}
                    type={inputType}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) => setVal(e.target.value)}
                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              );
            })}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : formConfig.settings.submitButtonText}
          </Button>
        </form>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">YourApp</span>
              </div>

              {/* Desktop Navigation */}
              <div className="flex gap-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
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
                  className="dark:hover:bg-gray-700"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Home Section */}
          {activeSection === "home" && (
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome to <span className="text-blue-600 dark:text-blue-400">YourApp</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Discover and book amazing events. From conferences to concerts,
                find your next unforgettable experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => setActiveSection("register")}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setActiveSection("about")}
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Learn More
                </Button>
                <Link href="/admin-login">
                  <Button variant="outline" size="lg" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                    <User className="mr-2 h-5 w-5" />
                    admin-login
                  </Button>
                </Link>
              </div>

              {/* Events Section */}
              <div className="mt-16">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Upcoming Events</h2>
                {eventsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  </div>
                ) : events.length === 0 ? (
                  <Card className="text-center py-12 dark:bg-gray-800 dark:border-gray-700">
                    <CardContent>
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No upcoming events at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.slice(0, 6).map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-900/25">
                        <CardHeader className="dark:border-gray-700">
                          <CardTitle className="text-lg text-gray-900 dark:text-white">{event.event_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(event.start_at).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="truncate">{event.venue_name}, {event.venue_city}</span>
                            </div>
                          </div>
                          <div className="pt-3">
                            <Button className="w-full" size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {events.length > 6 && (
                  <div className="text-center mt-8">
                    <Button variant="outline" size="lg" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      View All Events
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          {activeSection === "about" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                About Us
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="dark:border-gray-700">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <User className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Our Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
                      To provide businesses with powerful, flexible tools for
                      creating and managing dynamic forms that adapt to their
                      specific needs.
                    </p>
                  </CardContent>
                </Card>
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="dark:border-gray-700">
                    <CardTitle className="flex items-center text-gray-900 dark:text-white">
                      <Home className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      What We Do
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">
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
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="text-center dark:border-gray-700">
                  <CardTitle className="flex items-center justify-center text-gray-900 dark:text-white">
                    <LogIn className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
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
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="text-center dark:border-gray-700">
                  <CardTitle className="flex items-center justify-center text-gray-900 dark:text-white">
                    <UserPlus className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
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
