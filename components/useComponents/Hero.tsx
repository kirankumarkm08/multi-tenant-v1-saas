"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
      <div className="container mx-auto px-6 lg:px-12 py-20 flex flex-col items-center text-center">
        
        {/* Heading */}
        <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
          Multi-Tenant <span className="text-yellow-300">Platform</span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg lg:text-xl max-w-2xl">
          A secure and scalable SaaS solution with tenant-based architecture. 
          Manage multiple clients from a single platform.
        </p>

        {/* Button */}
        <div className="mt-8">
          <Link href="/admin-log">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 text-lg px-6 py-3 rounded-xl shadow-lg">
              Go to Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
