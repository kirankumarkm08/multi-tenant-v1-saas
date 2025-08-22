"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X, Home } from "lucide-react";
import { apiFetch } from "@/lib/api-config";

interface NavItem {
  label: string;
  href: string;
  page_type?: string;
}

interface NavbarProps {
  pages?: NavItem[];
}

export default function Navbar({ pages: initialPages }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pages, setPages] = useState<NavItem[]>(initialPages || []);
  const [loading, setLoading] = useState(!initialPages);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const data = await apiFetch("/customer/pages/navigation");
        setPages(data.pages || data || []);
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialPages) {
      fetchNavigation();
    }
  }, [initialPages]);

  const filteredPages = pages.filter((page) => page.page_type === "page");

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Home className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">YourApp</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-2">
            {filteredPages.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="px-4 py-2 space-y-2 md:hidden">
          {filteredPages.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="outline"
                size="sm"
                className="w-full dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
