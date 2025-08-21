import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Management Website Builder",
  description: "Build and manage your event websites with ease",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <ThemeProvider>
           {children}
          <Toaster />
        </ThemeProvider>
         
        </AuthProvider>
      </body>
    </html>
  );
}
