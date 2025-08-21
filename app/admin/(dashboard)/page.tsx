"use client";

import { useEffect, useMemo, useState } from "react";
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
  Plus,
  Globe,
  Users,
  Calendar,
  Ticket,
  Palette,
  ChevronDown,
  BarChart3,
  UserCog,
  Megaphone,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-config";
import { PagesStats } from "@/components/admin/dashboard/PageStats";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";

type Primitive = string | number | boolean | null | undefined;
type Dict = Record<string, any>;

interface DashboardStats {
  [key: string]: number | string;
}

/* ------------------------ Utilities ------------------------ */

// Try to find the first array of objects in an unknown response shape
function extractArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    // Common wrappers
    const candidates = [
      payload.data,
      payload.result,
      payload.results,
      payload.items,
      payload.pages,
      payload.payload,
      payload.list,
    ].filter(Boolean);

    for (const c of candidates) {
      if (Array.isArray(c)) return c;
      if (c && typeof c === "object") {
        const innerArrays = Object.values(c).filter(Array.isArray) as any[];
        if (innerArrays.length) return innerArrays[0] as any[];
      }
    }

    // Deep scan: first array value encountered
    for (const v of Object.values(payload)) {
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") {
        const found = extractArray(v);
        if (Array.isArray(found)) return found;
      }
    }
  }
  return [];
}

// Nicely format values in grid cells
function fmt(val: any): Primitive {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") return val;
  // try date-ish
  if (typeof val === "string") {
    const maybeDate = Date.parse(val);
    if (!isNaN(maybeDate) && /[T:-]/.test(val)) {
      try {
        return new Date(val).toLocaleString();
      } catch {}
    }
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// Choose icons/colors for known stats keys; fallback to Globe
const STAT_META: Record<
  string,
  { label: string; icon: any; color: string; bg: string; darkColor: string; darkBg: string; prefix?: string }
> = {
  totalPages: {
    label: "Total Pages",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
    darkColor: "dark:text-blue-400",
    darkBg: "dark:bg-blue-900/20",
  },
  totalEvents: {
    label: "Active Events",
    icon: Calendar,
    color: "text-green-600",
    bg: "bg-green-50",
    darkColor: "dark:text-green-400",
    darkBg: "dark:bg-green-900/20",
  },
  totalTicketsSold: {
    label: "Tickets Sold",
    icon: Ticket,
    color: "text-purple-600",
    bg: "bg-purple-50",
    darkColor: "dark:text-purple-400",
    darkBg: "dark:bg-purple-900/20",
  },
  totalRevenue: {
    label: "Revenue",
    icon: DollarSign,
    color: "text-orange-600",
    bg: "bg-orange-50",
    darkColor: "dark:text-orange-400",
    darkBg: "dark:bg-orange-900/20",
    prefix: "$",
  },
};

/* ------------------------ Dynamic UI Blocks ------------------------ */

// A small grid that infers & aligns columns from item fields
function DataGrid({
  items,
  preferred = ["title", "name", "slug", "status", "views", "updatedAt"],
  maxCols = 5,
}: {
  items: Dict[];
  preferred?: string[];
  maxCols?: number;
}) {
  const fields = useMemo(() => {
    if (!items?.length) return [] as string[];

    // Count how often keys appear
    const counts = new Map<string, number>();
    items.slice(0, 50).forEach((it) => {
      Object.keys(it || {}).forEach((k) =>
        counts.set(k, (counts.get(k) || 0) + 1)
      );
    });

    // Sort keys: preferred first (by their order), then by frequency
    const preferredExisting = preferred.filter((k) => counts.has(k));
    const rest = [...counts.keys()].filter((k) => !preferredExisting.includes(k));
    rest.sort((a, b) => (counts.get(b)! - counts.get(a)!));

    return [...preferredExisting, ...rest].slice(0, maxCols);
  }, [items, preferred, maxCols]);

  if (!items?.length) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No data available.</p>;
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Header */}
      <div
        className="grid px-4 py-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50"
        style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0,1fr))` }}
      >
        {fields.map((f) => (
          <div key={f} className="truncate">
            {f.replace(/([A-Z])/g, " $1")}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((row, idx) => (
          <div
            key={idx}
            className="grid px-4 py-3 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            style={{ gridTemplateColumns: `repeat(${fields.length}, minmax(0,1fr))` }}
          >
            {fields.map((f) => {
              const v = row?.[f];
              const isNumber = typeof v === "number";
              return (
                <div
                  key={f}
                  className={`truncate ${isNumber ? "text-right tabular-nums" : ""}`}
                  title={typeof v === "string" ? v : undefined}
                >
                  {fmt(v)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------ Page ------------------------ */

export default function Dashboard() {
  const { token, isInitialized } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats can start with localStorage, then enrich from API if available
  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  const [pages, setPages] = useState<Dict[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isInitialized) return;
    if (!token) router.replace("/admin-login");
  }, [isInitialized, token, router]);

  // Seed stats from localStorage for instant paint
  useEffect(() => {
    try {
      const lsPages = JSON.parse(localStorage.getItem("pages") || "[]");
      const lsEvents = JSON.parse(localStorage.getItem("events") || "[]");
      const lsTickets = JSON.parse(localStorage.getItem("tickets") || "[]");

      setStats((s) => ({
        ...s,
        totalPages: Array.isArray(lsPages) ? lsPages.length : s.totalPages,
        totalEvents: Array.isArray(lsEvents) ? lsEvents.length : s.totalEvents,
        totalTicketsSold: Array.isArray(lsTickets)
          ? lsTickets.reduce((sum: number, t: any) => sum + (t?.sold || 0), 0)
          : s.totalTicketsSold,
        totalRevenue: Array.isArray(lsTickets)
          ? lsTickets.reduce(
              (sum: number, t: any) => sum + (Number(t?.price) || 0) * (t?.sold || 0),
              0
            )
          : s.totalRevenue,
      }));
    } catch {
      // ignore
    }
  }, []);

  // Fetch pages (and possibly API-driven stats) dynamically
  useEffect(() => {
    if (!token) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/tenant/pages", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const arr = extractArray(res);
        setPages(Array.isArray(arr) ? arr : []);

        // If API returns count/sums, merge them into dynamic stats
        const maybeStats: Dict = res?.stats || res?.meta || {};
        const numericStats = Object.fromEntries(
          Object.entries(maybeStats).filter(
            ([, v]) => typeof v === "number" || (typeof v === "string" && v.trim() !== "")
          )
        );

        if (Object.keys(numericStats).length) {
          setStats((s) => ({ ...s, ...numericStats }));
        } else {
          // Otherwise infer totals from pages if fields exist
          setStats((s) => ({
            ...s,
            totalPages: arr?.length ?? s.totalPages,
          }));
        }
      } catch (err: any) {
        console.error("Failed to fetch pages:", err);
        setError(err?.message || "Failed to fetch pages");
        setPages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }
  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Here's what's happening with your event website today.
              </p>
            </div>

            {/* Loading / Error */}
            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Loading pages…
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                {error}
              </p>
            )}

            {/* Dynamic Stats (auto-fit cards, show only available fields) */}
            <PagesStats stats={stats} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Popular Pages → fully dynamic field alignment */}
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-gray-900 dark:text-white">
                    Popular Pages
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Auto-inferred fields from API
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <DataGrid
                    items={pages}
                    preferred={["title", "slug", "status", "views", "updatedAt"]}
                    maxCols={5}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
