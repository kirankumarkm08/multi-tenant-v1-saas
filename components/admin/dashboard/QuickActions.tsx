"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  Users,
  UserCog,
  Megaphone,
  Palette,
  Calendar,
  FileText,
} from "lucide-react";

interface PageType {
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  darkColor: string;
}

export function QuickActions() {
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTypes: PageType[] = [
    {
      type: "registration",
      title: "Registration Page",
      description: "User registration with customizable fields",
      icon: Users,
      color: "text-blue-600",
      darkColor: "dark:text-blue-400",
    },
    {
      type: "login",
      title: "Login Page",
      description: "Simple username/password login",
      icon: UserCog,
      color: "text-green-600",
      darkColor: "dark:text-green-400",
    },
    {
      type: "contact",
      title: "Contact Page",
      description: "Contact form for inquiries",
      icon: Megaphone,
      color: "text-purple-600",
      darkColor: "dark:text-purple-400",
    },
    {
      type: "custom",
      title: "Custom Page",
      description: "Drag & drop page builder",
      icon: Palette,
      color: "text-orange-600",
      darkColor: "dark:text-orange-400",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center mb-4">
          <Plus className="w-5 h-5 text-gray-800 dark:text-gray-200 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
            Quick Actions
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Create new pages and manage content quickly
        </p>

        <div className="space-y-3">
          {/* Quick Action Buttons */}
          <Link href="/admin/events/create" className="block">
            <button className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl transition-all duration-200 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Create Event</span>
              </div>
              <Plus className="w-4 h-4" />
            </button>
          </Link>

          <Link href="/admin/pages" className="block">
            <button className="w-full flex items-center justify-between bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl transition-all duration-200 border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                <span className="font-medium">Manage Pages</span>
              </div>
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </Link>

          {/* Create New Page Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
              className="w-full flex items-center justify-between bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                <span>Create New Page</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isPageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isPageDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl z-10 overflow-hidden">
                {pageTypes.map((p) => (
                  <Link
                    key={p.type}
                    href={`/admin/page-builder/${p.type}`}
                    onClick={() => setIsPageDropdownOpen(false)}
                    className="block"
                  >
                    <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <p.icon className={`h-5 w-5 mr-3 ${p.color} ${p.darkColor}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-200">
                          {p.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {p.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
