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
  Plus,
  Globe,
  Users,
  Calendar,
  Ticket,
  Settings,
  Palette,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalPages: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
}

function PageTypeSelector() {
  const [isOpen, setIsOpen] = useState(false);

  const pageTypes = [
    {
      type: "registration",
      title: "Registration Page",
      description: "User registration with customizable fields",
      icon: "📝",
    },
    {
      type: "login",
      title: "Login Page",
      description: "Simple username/password login",
      icon: "🔐",
    },
    {
      type: "contact",
      title: "Contact Page",
      description: "Contact form for inquiries",
      icon: "📞",
    },
    {
      type: "custom",
      title: "Custom Page",
      description: "Drag & drop page builder",
      icon: "🎨",
    },
  ];

  return (
    <div className="col-span-2">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between"
      >
        <span className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Create New Page
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isOpen && (
        <div className="mt-2 border rounded-lg bg-white shadow-lg p-2 space-y-1">
          {pageTypes.map((pageType) => (
            <Link
              key={pageType.type}
              href={`/page-builder/${pageType.type}`}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <span className="text-2xl mr-3">{pageType.icon}</span>
                <div>
                  <div className="font-medium text-sm">{pageType.title}</div>
                  <div className="text-xs text-gray-500">
                    {pageType.description}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { token, isInitialized, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) {
      router.replace("/admin-login");
    }
  }, [isInitialized, token, router]);

  const [stats, setStats] = useState<DashboardStats>({
    totalPages: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const pages = JSON.parse(localStorage.getItem("pages") || "[]");
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");

    setStats({
      totalPages: pages.length,
      totalEvents: events.length,
      totalTicketsSold: tickets.reduce(
        (sum: number, ticket: any) => sum + (ticket.sold || 0),
        0
      ),
      totalRevenue: tickets.reduce(
        (sum: number, ticket: any) => sum + ticket.price * (ticket.sold || 0),
        0
      ),
    });
  }, []);

  if (!isInitialized) {
    return <div className="p-6">Loading...</div>;
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event Website Builder
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your event website and track performance
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tickets Sold
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Page Builder</CardTitle>
              <CardDescription>
                Create and manage your website pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <PageTypeSelector />
              </div>
              <Link href="/pages">
                <Button className="w-full">View All Pages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Module Management</CardTitle>
              <CardDescription>
                Manage events, speakers, tickets, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Events
                  </Button>
                </Link>
                <Link href="/speakers">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Speakers
                  </Button>
                </Link>
                <Link href="/tickets">
                  <Button variant="outline" className="w-full justify-start">
                    <Ticket className="mr-2 h-4 w-4" />
                    Tickets
                  </Button>
                </Link>
                <Link href="/coupons">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Coupons
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Customization</CardTitle>
              <CardDescription>
                Customize your website appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/design">
                <Button className="w-full">
                  <Palette className="mr-2 h-4 w-4" />
                  Customize Design
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/staff">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Staff
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
