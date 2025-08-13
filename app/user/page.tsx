"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  FileText,
  Settings,
  LogOut,
  Home,
  Calendar,
  Bell,
  Search,
} from "lucide-react";
import Link from "next/link";

interface UserForm {
  id: string;
  title: string;
  type: string;
  description?: string;
  lastAccessed?: string;
}

export default function UserDashboard() {
  const token = process.env.NEXT_PUBLIC_API_BEARER_TOKEN;
  const [userForms, setUserForms] = useState<UserForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      fetchUserForms();
    }
  }, [token]);

  const fetchUserForms = async () => {
    try {
      setLoading(true);
      // Fetch forms that the user can access
      const response = await apiFetch("/tenant/pages", {
        token: token || undefined,
      });

      const formsData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      // Filter forms that are public/user-facing
      const publicForms = formsData.filter(
        (form: any) =>
          form.type === "register" ||
          form.type === "login" ||
          form.type === "contact_us"
      );

      setUserForms(publicForms);
    } catch (error) {
      console.error("Failed to fetch user forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = userForms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return (
      <div className="text-red-600 font-bold p-8 text-center">
        Access denied. Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  User Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Forms
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userForms.length}</div>
              <p className="text-xs text-muted-foreground">
                Forms you can access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Forms completed this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Account Status
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">
                Your account is active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Forms */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchUserForms} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading your forms...</p>
            </div>
          ) : filteredForms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No forms found" : "No forms available"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Check back later for available forms"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{form.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {form.type}
                      </Badge>
                    </div>
                    {form.description && (
                      <p className="text-sm text-gray-600">
                        {form.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Last accessed:</span>
                        <span>
                          {form.lastAccessed
                            ? new Date(form.lastAccessed).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="flex-1" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Fill Form
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
