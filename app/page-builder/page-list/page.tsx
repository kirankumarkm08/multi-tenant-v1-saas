"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-config";
import { Eye, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";

interface LoginPageItem {
  id: string;
  title: string;
  name?: string;
  slug?: string;
  form_type?: string;
  settings?: any;
  created_at?: string;
}

export default function LoginPagesList() {
  const token = process.env.NEXT_PUBLIC_API_BEARER_TOKEN;
  const [pages, setPages] = useState<LoginPageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPages = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resp = await apiFetch("/tenant/pages?type=login", { token });
      const list: any[] = Array.isArray(resp) ? resp : resp?.data || resp || [];
      setPages(
        list.map((p) => ({
          id: String(p.id),
          title:
            p.title || p.settings?.title || p.name || "Untitled Login Page",
          name: p.name,
          slug: p.slug,
          form_type: p.form_type,
          settings: p.settings,
          created_at: p.created_at,
        }))
      );
    } catch (err) {
      console.error("Failed to load login pages:", err);
      alert("Failed to load login pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) =>
      [p.id, p.title, p.name, p.slug].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [pages, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this login page?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/tenant/pages/${id}`, { method: "DELETE", token });
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to delete page:", err);
      alert("Failed to delete page");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Login Pages</h1>
              <Badge variant="secondary">Form Type: login</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={loadPages} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Link href="/page-builder/login">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Login Page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Login Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 mb-4">
              <Input
                placeholder="Search by id, title, name, slug..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Title</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.slug || "login"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/page-builder/registraion?id=${p.id}`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Button>
                          </Link>
                          <Link href={`/preview/login/${p.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" /> Preview
                            </Button>
                          </Link>
                          <Link href={`/login/${p.id}`}>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="mr-2 h-4 w-4" /> Open
                              Live
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingId === p.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500"
                      >
                        {loading ? "Loading..." : "No login pages found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
