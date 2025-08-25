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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Globe, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";

interface Page {
  id: string;
  name?: string;
  title?: string;
  type?: string;
  page_type?: string;
  slug?: string;
  modules?: any[];
  settings?: {
    title: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export default function PagesPage() {
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await apiFetch("/tenant/pages");
        const pagesData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setPages(pagesData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch pages:", err);
        setError(err.message || "Failed to fetch pages");
        setPages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPages();
  }, [token]);

  const getEditHref = (page: Page) => {
    const rawType = (
      page.page_type ||
      page.type ||
      (page as any)?.form_type ||
      "custom"
    ).toLowerCase();

    switch (rawType) {
      case "login":
        return `/page-builder/login?id=${page.id}`;
      case "contact":
      case "contact_us":
        return `/admin/page-builder/contact?id=${page.id}`;
      case "register":
      case "registration":
        return `/admin/page-builder/registration/edit?id=${page.id}`;
      default:
        return `/page-builder/custom?id=${page.id}`;
    }
  };

  const handleDelete = async (pageId: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      try {
        await apiFetch(`/tenant/pages/${pageId}`, {
          method: "DELETE",
        });
        setPages((prev) => prev.filter((page) => page.id !== pageId));
      } catch (err: any) {
        alert("Failed to delete page: " + (err.message || "Unknown error"));
      }
    }
  };

  const getPageTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case "register":
      case "registration":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "login":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "contact":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "custom":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "standard":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getDisplayType = (page: Page) => {
    return page.page_type || page.type || "custom";
  };

  const getLastUpdated = (page: Page) => {
    const dateStr = page.updated_at || page.updatedAt;
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  if (!token) {
    return (
      <div className="text-red-600 dark:text-red-400 font-bold p-8 text-center">
        API key missing or invalid. Access denied.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-800 dark:text-gray-200">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p>Loading pages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pages Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all your website pages
              </p>
            </div>
            {/* <Link href="/page-builder?type=custom" > */}
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create New Page
              </Button>
            {/* </Link> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {pages.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No pages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your website by creating your first page.
              </p>
              <Link href="/page-builder?type=custom">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                All Pages ({pages.length})
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage and edit your website pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Page Name
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Type
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      URL Slug
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Last Updated
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow
                      key={page.id}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {page.title || page.name || "Untitled"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {page.settings?.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPageTypeColor(getDisplayType(page))}>
                          {getDisplayType(page)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200">
                          /{page.slug || "no-slug"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getLastUpdated(page)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={getEditHref(page)}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
