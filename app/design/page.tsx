"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Palette, Type, Layout } from "lucide-react";
import Link from "next/link";

interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: {
    url: string;
    alt: string;
  };
  layout: {
    maxWidth: string;
    spacing: string;
  };
}

const colorPresets = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af", accent: "#60a5fa" },
  {
    name: "Green",
    primary: "#10b981",
    secondary: "#047857",
    accent: "#34d399",
  },
  {
    name: "Purple",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
  },
  { name: "Red", primary: "#ef4444", secondary: "#dc2626", accent: "#f87171" },
  {
    name: "Orange",
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fb923c",
  },
];

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
];

export default function DesignPage() {
  const [settings, setSettings] = useState<DesignSettings>({
    colors: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      background: "#ffffff",
      text: "#1f2937",
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
    logo: {
      url: "",
      alt: "Logo",
    },
    layout: {
      maxWidth: "1200px",
      spacing: "normal",
    },
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("designSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("designSettings", JSON.stringify(settings));
    alert("Design settings saved successfully!");
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
      },
    }));
  };

  const updateColor = (
    colorKey: keyof DesignSettings["colors"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const updateFont = (
    fontKey: keyof DesignSettings["fonts"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Design Customization</h1>
                <p className="text-gray-600">
                  Customize your website appearance
                </p>
              </div>
            </div>
            <Button onClick={saveSettings}>Save Changes</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="colors" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="colors">
                  <Palette className="mr-2 h-4 w-4" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="fonts">
                  <Type className="mr-2 h-4 w-4" />
                  Fonts
                </TabsTrigger>
                <TabsTrigger value="logo">
                  <Upload className="mr-2 h-4 w-4" />
                  Logo
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="mr-2 h-4 w-4" />
                  Layout
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Presets</CardTitle>
                    <CardDescription>
                      Quick color schemes to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="flex flex-col items-center space-y-2 p-3 rounded-lg border hover:border-gray-400 transition-colors"
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Colors</CardTitle>
                    <CardDescription>
                      Fine-tune your color palette
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={settings.colors.primary}
                            onChange={(e) =>
                              updateColor("primary", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.primary}
                            onChange={(e) =>
                              updateColor("primary", e.target.value)
                            }
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={settings.colors.secondary}
                            onChange={(e) =>
                              updateColor("secondary", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.secondary}
                            onChange={(e) =>
                              updateColor("secondary", e.target.value)
                            }
                            placeholder="#1e40af"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="accent-color"
                            type="color"
                            value={settings.colors.accent}
                            onChange={(e) =>
                              updateColor("accent", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.accent}
                            onChange={(e) =>
                              updateColor("accent", e.target.value)
                            }
                            placeholder="#60a5fa"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="background-color">
                          Background Color
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            id="background-color"
                            type="color"
                            value={settings.colors.background}
                            onChange={(e) =>
                              updateColor("background", e.target.value)
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.background}
                            onChange={(e) =>
                              updateColor("background", e.target.value)
                            }
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fonts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>
                      Choose fonts for headings and body text
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <select
                        id="heading-font"
                        value={settings.fonts.heading}
                        onChange={(e) => updateFont("heading", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="body-font">Body Font</Label>
                      <select
                        id="body-font"
                        value={settings.fonts.body}
                        onChange={(e) => updateFont("body", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo Upload</CardTitle>
                    <CardDescription>Upload your brand logo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={settings.logo.url}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, url: e.target.value },
                          }))
                        }
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo-alt">Alt Text</Label>
                      <Input
                        id="logo-alt"
                        value={settings.logo.alt}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            logo: { ...prev.logo, alt: e.target.value },
                          }))
                        }
                        placeholder="Your company logo"
                      />
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop your logo here, or click to browse
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                    <CardDescription>
                      Configure your website layout
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="max-width">Maximum Width</Label>
                      <select
                        id="max-width"
                        value={settings.layout.maxWidth}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            layout: {
                              ...prev.layout,
                              maxWidth: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="1200px">1200px (Default)</option>
                        <option value="1400px">1400px (Wide)</option>
                        <option value="100%">Full Width</option>
                        <option value="1000px">1000px (Narrow)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="spacing">Spacing</Label>
                      <select
                        id="spacing"
                        value={settings.layout.spacing}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            layout: { ...prev.layout, spacing: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your changes look</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border rounded-lg p-4 space-y-4"
                  style={{
                    backgroundColor: settings.colors.background,
                    color: settings.colors.text,
                    fontFamily: settings.fonts.body,
                  }}
                >
                  {settings.logo.url && (
                    <img
                      src={settings.logo.url || "/placeholder.svg"}
                      alt={settings.logo.alt}
                      className="h-8 object-contain"
                    />
                  )}
                  <h1
                    className="text-xl font-bold"
                    style={{
                      color: settings.colors.primary,
                      fontFamily: settings.fonts.heading,
                    }}
                  >
                    Sample Heading
                  </h1>
                  <p className="text-sm">
                    This is how your body text will appear on your website.
                  </p>
                  <button
                    className="px-4 py-2 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: settings.colors.primary }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded text-sm font-medium border ml-2"
                    style={{
                      borderColor: settings.colors.secondary,
                      color: settings.colors.secondary,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
