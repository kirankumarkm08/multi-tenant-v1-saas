export const API_CONFIG = {
  BASE_URL: (process.env.NEXT_PUBLIC_API_BASE_URL || "https://165.227.182.17/api").replace(/\/+$/, ""),
  BEARER_TOKEN: process.env.NEXT_PUBLIC_API_BEARER_TOKEN || "",
};

export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  // Ensure endpoint starts with /
  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Prefer passed token, fallback to config
  const token = options.token || API_CONFIG.BEARER_TOKEN;

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
