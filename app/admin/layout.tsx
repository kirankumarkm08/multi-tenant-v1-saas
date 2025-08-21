"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Slider";
import { ThemeProvider } from "@/context/ThemeContext";
import ProfileDropdown from "@/components/admin/Profile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { token, isInitialized } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) {
      router.replace("/admin-login");
    }
  }, [isInitialized, token, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }
  
  if (!token) return null;

  return (
    <ThemeProvider>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main content area */}
        <div className={`flex-1 flex flex-col transition-all duration-300`}>
          
          {/* Header with ProfileDropdown */}
          <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              
              {/* Left side - Mobile menu button + Title */}
              <div className="flex items-center space-x-4">
                {/* Mobile sidebar toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>

                {/* Page title or breadcrumb can go here */}
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                </div>
              </div>

              {/* Right side - Profile dropdown */}
              <div className="flex items-center space-x-4">
                {/* Additional header items can go here (notifications, search, etc.) */}
                
                {/* Profile Dropdown - Perfectly aligned to top right */}
                <ProfileDropdown />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
