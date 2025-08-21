"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Shield,
  Activity,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  plan?: string;
  isOnline?: boolean;
}

interface ProfileDropdownProps {
  user?: ProfileUser;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export default function ProfileDropdown({
  user,
  onThemeToggle,
  isDarkMode = false,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Default user data fallback
  const profileUser: ProfileUser = user || {
    id: "1",
    name: "tenant name ",
    email: "tenant@example.com",
    role: "admin",
    // plan: "Pro",
    isOnline: true,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/admin-login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "View Profile",
      href: "/profile",
      description: "Manage your account",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      description: "Account preferences",
    },
    {
      icon: CreditCard,
      label: "Billing",
      href: "/billing",
      description: "Manage subscription",
      badge: profileUser.plan,
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
      description: "Alert preferences",
    },
    {
      icon: Activity,
      label: "Activity Log",
      href: "/activity",
      description: "Recent actions",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/support",
      description: "Get assistance",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <Button
        variant="ghost"
        className="flex items-center space-x-3 p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative">
          <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-600">
            <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
              {getInitials(profileUser.name)}
            </AvatarFallback>
          </Avatar>
          {profileUser.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          )}
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
            {profileUser.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
            {profileUser.role}
          </p>
        </div>
        
        <ChevronDown
          className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown Card */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <CardContent className="p-0">
            {/* Profile Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-gray-200 dark:border-gray-600">
                    <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
                    <AvatarFallback className="bg-blue-500 text-white font-medium">
                      {getInitials(profileUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  {profileUser.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {profileUser.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {profileUser.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-200">
                      {profileUser.role}
                    </Badge>
                    {profileUser.plan && (
                      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                        {profileUser.plan}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={index} href={item.href} onClick={() => setIsOpen(false)}>
                    <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs dark:bg-gray-600 dark:text-gray-200">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle & Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 space-y-1">
              {onThemeToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="w-full justify-start h-9 px-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4 mr-3" />
                  ) : (
                    <Moon className="h-4 w-4 mr-3" />
                  )}
                  <span className="text-sm">
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start h-9 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span className="text-sm">Sign Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
