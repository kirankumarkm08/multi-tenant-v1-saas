"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageModule {
  id: string;
  type:
    | "hero"
    | "text"
    | "image"
    | "events"
    | "speakers"
    | "tickets"
    | "contact"
    | "gallery"
    | "testimonials";
  title: string;
  content: any;
  order: number;
  layout: "full" | "container" | "narrow";
}

interface CustomPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  modules: PageModule[];
  settings: {
    headerStyle: "default" | "minimal" | "centered";
    footerStyle: "default" | "minimal" | "none";
    backgroundColor: string;
    textColor: string;
  };
}

export default function CustomLivePage() {
  const params = useParams();
  const id = params.id as string;
  const token = process.env.NEXT_PUBLIC_API_BEARER_TOKEN;

  const [page, setPage] = useState<CustomPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;
    const load = async () => {
      try {
        const data = await apiFetch(`/tenant/pages/${id}`, { token });
        const modules =
          typeof data.modules === "string"
            ? JSON.parse(data.modules)
            : data.modules || [];
        const settings =
          typeof data.settings === "string"
            ? JSON.parse(data.settings)
            : data.settings || {};
             console.log(data)

        setPage({
          id: String(data.id),
          name: data.name || "Custom Page",
          slug: data.slug || "custom-page",
          title: data.title || settings.title || "",
          description: data.description || settings.description || "",
          modules: Array.isArray(modules) ? modules : [],
          settings: {
            headerStyle: settings.headerStyle || "default",
            footerStyle: settings.footerStyle || "default",
            backgroundColor: settings.backgroundColor || "#ffffff",
            textColor: settings.textColor || "#1f2937",
          },
        });
      } catch (e: any) {
        setError(e?.message || "Failed to load page");
      }
    };
    load();
  }, [id, token]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: page.settings.backgroundColor,
        color: page.settings.textColor,
      }}
    >
      <div>
        {page.modules
          .sort((a, b) => a.order - b.order)
          .map((module) => (
            <div
              key={module.id}
              className={getModuleLayoutClass(module.layout)}
            >
              <ModuleRenderer module={module} />
            </div>
          ))}
      </div>
    </div>
  );
}

function getModuleLayoutClass(layout: string) {
  switch (layout) {
    case "full":
      return "w-full";
    case "narrow":
      return "container mx-auto px-6 max-w-4xl";
    default:
      return "container mx-auto px-6";
  }
}

function ModuleRenderer({ module }: { module: PageModule }) {
  switch (module.type) {
    case "hero":
      return (
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-6">{module.content.title}</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {module.content.subtitle}
            </p>
            {module.content.buttonText && (
              <a
                href={module.content.buttonLink || "#"}
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {module.content.buttonText}
              </a>
            )}
          </div>
        </div>
      );
    case "text":
      return (
        <div className="py-16">
          <div className={`text-${module.content.alignment || "left"}`}>
            <h2 className="text-3xl font-bold mb-6">{module.content.title}</h2>
            <div className="text-lg leading-relaxed whitespace-pre-wrap">
              {module.content.content}
            </div>
          </div>
        </div>
      );
    case "image":
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Gallery</h2>
          <div
            className={`grid ${
              module.content.layout === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            } gap-6`}
          >
            {module.content.images?.map((img: any, index: number) => (
              <div key={index} className="group">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={img.src || "/placeholder.svg?height=300&width=400"}
                    alt={img.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {img.caption && (
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="py-16">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-gray-600">{module.type} content</p>
          </div>
        </div>
      );
  }
}
