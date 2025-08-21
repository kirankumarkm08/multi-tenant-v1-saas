"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import ProfileDropdown from "./Profile";

// Icons (lucide-react)
import {
  Home,
  Layout,
  FileText,
  Users,
  UserCog,
  Megaphone,
  Palette,
  Calendar,
  Ticket,
  Tag,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  LogOut,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  badge?: string;
  children?: MenuItem[];
};

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "pages",
    "modules",
  ]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      id: "pages",
      label: "Page Builder",
      icon: Layout,
      children: [
        {
          id: "all-pages",
          label: "All Pages",
          icon: FileText,
          href: "/pages",
        },
        {
          id: "new-registration",
          label: "Registration Page",
          icon: Users,
          href: "/page-builder/registration",
        },
        {
          id: "new-login",
          label: "Login Page",
          icon: UserCog,
          href: "/page-builder/login",
        },
        {
          id: "new-contact",
          label: "Contact Page",
          icon: Megaphone,
          href: "/page-builder/contact",
        },
      ],
    },
    {
      id: "modules",
      label: "Event Management",
      icon: Calendar,
      children: [
        { id: "events", label: "Events", icon: Calendar, href: "/events" },
        { id: "speakers", label: "Speakers", icon: Users, href: "/speakers" },
        { id: "tickets", label: "Tickets", icon: Ticket, href: "/tickets" },
        { id: "coupons", label: "Coupons", icon: Tag, href: "/coupons" },
      ],
    },
    {
      id: "design",
      label: "Design",
      icon: Palette,
      href: "/design",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/analytics",
      badge: "New",
    },
    {
      id: "staff",
      label: "Staff Management",
      icon: UserCog,
      href: "/staff",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemExpanded = (itemId: string) => expandedItems.includes(itemId);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isItemExpanded(item.id);
    const isActive = item.href && pathname === item.href;

    return (
      <div key={item.id} className="w-full">
        {item.href ? (
          <Link href={`${item.href}`}>
            <div
              className={`
                flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200
                ${depth > 0 ? "ml-4 text-sm" : "text-sm font-medium"}
                ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-500"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                }
                ${!isOpen && depth === 0 ? "justify-center px-2" : ""}
              `}
            >
              <item.icon
                className={`h-5 w-5 ${
                  !isOpen && depth === 0 ? "" : "mr-3"
                } flex-shrink-0`}
              />
              {(isOpen || depth > 0) && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-2 text-xs dark:bg-gray-700 dark:text-gray-300"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </Link>
        ) : (
          <button
            onClick={() => hasChildren && toggleExpanded(item.id)}
            className={`
              flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200
              ${depth > 0 ? "ml-4 text-sm" : "text-sm font-medium"}
              text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white
              ${!isOpen && depth === 0 ? "justify-center px-2" : ""}
            `}
          >
            <item.icon
              className={`h-5 w-5 ${
                !isOpen && depth === 0 ? "" : "mr-3"
              } flex-shrink-0`}
            />
            {(isOpen || depth > 0) && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs dark:bg-gray-700 dark:text-gray-300"
                  >
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <ChevronRight
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                )}
              </>
            )}
          </button>
        )}

        {hasChildren && isExpanded && (isOpen || depth > 0) && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-lg z-50 transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700
          ${isOpen ? "w-72" : "w-16"}
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Event Builder
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Panel
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? (
                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => renderMenuItem(item))}
          <button
            onClick={toggleTheme}
            className="p-1.5 ml-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </nav>
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        
          <button
            onClick={logout}
            className={`
              flex items-center w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200
              text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 text-sm font-medium
              ${!isOpen ? "justify-center px-2" : ""}
            `}
          >
            <LogOut
              className={`h-5 w-5 ${!isOpen ? "" : "mr-3"} flex-shrink-0`}
            />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </div>
    </>
  );
}
