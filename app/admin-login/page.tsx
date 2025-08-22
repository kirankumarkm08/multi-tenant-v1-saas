"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { tenantApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const { setToken } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If already authenticated, redirect to /admin
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (typeof window !== "undefined") {
      const reason = localStorage.getItem("auth_redirect_reason");
      if (reason) {
        toast({
          title: "Please sign in",
          description: reason,
        });
        localStorage.removeItem("auth_redirect_reason");
      }
    }

    if (storedToken) {
      router.replace("/admin");
    }
  }, [router, toast]);

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const response = await tenantApi.login({ email, password });

      // Adjust token extraction based on your API response shape
      const token = response.access_token ?? response.data?.access_token;

      if (!token) {
        throw new Error(response.message || "Invalid email or password");
      }

      // Save token in context and localStorage via setToken
      setToken(token);

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Tenant Login</h2>
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1" role="alert">
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2 text-center" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
