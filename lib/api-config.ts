export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
) {
  const isServer = typeof window === "undefined";
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://165.227.182.17/api';
  
  // Use proxy for IP addresses or in development mode to avoid SSL/CORS issues
  const shouldUseProxy = !isServer && (API_URL.includes('165.227.182.17') || process.env.NODE_ENV === 'development');
  const baseUrl = shouldUseProxy ? '/api/proxy' : API_URL;
  
  const url = endpoint.startsWith("/") 
    ? `${baseUrl}${endpoint.replace(/^\/api/, "")}` // Remove /api prefix if present
    : `${baseUrl}/${endpoint}`;

  // Token priority: explicit token > localStorage token > no token
  const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const token = options.token ?? tokenFromStorage;

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
