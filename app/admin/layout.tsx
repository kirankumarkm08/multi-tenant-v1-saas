"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { token, isInitialized, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) {
      router.replace("/admin-login");
    }
  }, [isInitialized, token, router]);

  if (!isInitialized) return <div className="p-6">Loading...</div>;
  if (!token) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Admin</h1>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
