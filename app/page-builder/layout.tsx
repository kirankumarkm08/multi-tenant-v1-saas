"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PageBuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
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
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Page Builder</h1>
          </div>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
