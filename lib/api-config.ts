export const API_CONFIG = {
  // Default to internal proxy to avoid mixed content on Vercel and keep HTTPS in browser
  // Set NEXT_PUBLIC_API_BASE_URL to a full HTTPS origin (e.g., https://api.yourdomain.com) when available
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  BEARER_TOKEN: process.env.NEXT_PUBLIC_API_BEARER_TOKEN || "",
};

export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  // Ensure endpoint starts with /
  const url = `${API_CONFIG.BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  // Prefer passed token, fallback to config
  // If running in the browser, also try localStorage (set during login)
  const tokenFromStorage =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const token = tokenFromStorage ?? API_CONFIG.BEARER_TOKEN;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || response.statusText);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response.json();
}
